import { Router } from 'express';
import { z } from 'zod';
import { pool, query, queryOne } from '../db';
import { compute } from '../engine';

const router = Router();

// List all estimations
router.get('/', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT e.*, p.currency, c.color as company_color,
             c.name as company_name,
             (SELECT COUNT(*) FROM estimation_versions v WHERE v.estimation_id = e.id) as version_count
      FROM estimations e
      JOIN plants p ON p.code = e.plant_code
      JOIN companies c ON c.code = e.company_code
      ORDER BY e.updated_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Get single estimation with latest version data
router.get('/:id', async (req, res) => {
  try {
    const est = await queryOne<Record<string, unknown>>(
      `SELECT e.*, p.currency, p.overhead_ms, p.overhead_ss, p.labour, p.consumables_ms,
              p.consumables_ss, p.power, p.fuel, p.melting_loss, p.margin, p.avg_std_mld_wt,
              p.shell_ms, p.shell_ss, p.pattern_wax, p.riser_wax, p.water_sol_wax, p.ceramic_core
       FROM estimations e JOIN plants p ON p.code = e.plant_code
       WHERE e.id = $1`,
      [req.params.id]
    );
    if (!est) return res.status(404).json({ error: 'Not found' });

    const versions = await query(
      `SELECT id, version_no, label, created_by, price, status, notes, created_at
       FROM estimation_versions WHERE estimation_id = $1 ORDER BY version_no`,
      [req.params.id]
    );

    const latestVersion = await queryOne<Record<string, unknown>>(
      `SELECT * FROM estimation_versions WHERE estimation_id = $1
       ORDER BY version_no DESC LIMIT 1`,
      [req.params.id]
    );

    res.json({ ...est, versions, latestVersion });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Create estimation
const CreateSchema = z.object({
  rfqNo: z.string().min(1),
  itemCode: z.string().min(1),
  plantCode: z.string().min(1),
  companyCode: z.string().min(1),
  customer: z.string().min(1),
  materialType: z.string().default('MS'),
  data: z.record(z.unknown()),
});

router.post('/', async (req, res) => {
  try {
    const body = CreateSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const est = await client.query(
        `INSERT INTO estimations (rfq_no, item_code, plant_code, company_code, customer, material_type, status, current_version)
         VALUES ($1,$2,$3,$4,$5,$6,'draft',1) RETURNING *`,
        [body.rfqNo, body.itemCode, body.plantCode, body.companyCode, body.customer, body.materialType]
      );
      const estId = est.rows[0].id;

      await client.query(
        `INSERT INTO estimation_versions (estimation_id, version_no, label, created_by, data, status)
         VALUES ($1, 1, 'Draft', 'System', $2, 'draft')`,
        [estId, JSON.stringify(body.data)]
      );

      await client.query(
        `INSERT INTO audit_log (actor, action, object) VALUES ('System', 'Created estimation', $1)`,
        [`${body.itemCode} · ${body.rfqNo}`]
      );

      await client.query('COMMIT');
      res.status(201).json(est.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// Save new version
router.post('/:id/versions', async (req, res) => {
  try {
    const { label, createdBy, notes, data } = req.body;
    const estId = parseInt(req.params.id);

    const lastVer = await queryOne<{ max: string }>(
      'SELECT MAX(version_no) as max FROM estimation_versions WHERE estimation_id = $1',
      [estId]
    );
    const nextVer = (parseInt(lastVer?.max ?? '0') || 0) + 1;

    // Compute price from data
    const plantRow = await queryOne<Record<string, unknown>>(
      `SELECT p.* FROM estimations e JOIN plants p ON p.code = e.plant_code WHERE e.id = $1`,
      [estId]
    );

    let price: number | null = null;
    if (plantRow && data?.salesEntry) {
      const result = compute(data as Parameters<typeof compute>[0], {
        overhead_ms: Number(plantRow.overhead_ms),
        overhead_ss: Number(plantRow.overhead_ss),
        labour: Number(plantRow.labour),
        consumables_ms: Number(plantRow.consumables_ms),
        consumables_ss: Number(plantRow.consumables_ss),
        power: Number(plantRow.power),
        fuel: Number(plantRow.fuel),
        melting_loss: Number(plantRow.melting_loss),
        margin: Number(plantRow.margin),
        avg_std_mld_wt: Number(plantRow.avg_std_mld_wt),
        shell_ms: Number(plantRow.shell_ms),
        shell_ss: Number(plantRow.shell_ss),
        pattern_wax: Number(plantRow.pattern_wax),
        riser_wax: Number(plantRow.riser_wax),
        water_sol_wax: Number(plantRow.water_sol_wax),
        ceramic_core: Number(plantRow.ceramic_core),
      });
      price = result.quotedWith[1] ?? null;
    }

    const version = await queryOne(
      `INSERT INTO estimation_versions (estimation_id, version_no, label, created_by, price, data, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,'submitted',$7) RETURNING *`,
      [estId, nextVer, label || 'Draft', createdBy || 'System', price, JSON.stringify(data), notes || '']
    );

    await pool.query(
      `UPDATE estimations SET current_version=$1, updated_at=NOW() WHERE id=$2`,
      [nextVer, estId]
    );
    await pool.query(
      `INSERT INTO audit_log (actor, action, object, details) VALUES ($1,'Saved version V'||$2,$3,$4)`,
      [createdBy || 'System', nextVer, `Est #${estId}`, label]
    );

    res.status(201).json(version);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// Get version data
router.get('/:id/versions/:ver', async (req, res) => {
  try {
    const v = await queryOne(
      `SELECT * FROM estimation_versions WHERE estimation_id=$1 AND version_no=$2`,
      [req.params.id, req.params.ver]
    );
    if (!v) return res.status(404).json({ error: 'Not found' });
    res.json(v);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Approve version
router.patch('/:id/versions/:ver/approve', async (req, res) => {
  try {
    const { approver } = req.body;
    await pool.query(
      `UPDATE estimation_versions SET status='approved' WHERE estimation_id=$1 AND version_no=$2`,
      [req.params.id, req.params.ver]
    );
    await pool.query(
      `UPDATE estimations SET status='approved', updated_at=NOW() WHERE id=$1`,
      [req.params.id]
    );
    await pool.query(
      `INSERT INTO audit_log (actor, action, object) VALUES ($1,'Approved V'||$2,$3)`,
      [approver || 'System', req.params.ver, `Est #${req.params.id}`]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

// Compute (client sends data, server runs engine and returns result)
router.post('/compute', async (req, res) => {
  try {
    const { data, plantCode } = req.body;
    const plantRow = await queryOne<Record<string, unknown>>(
      'SELECT * FROM plants WHERE code=$1', [plantCode]
    );
    if (!plantRow) return res.status(404).json({ error: 'Plant not found' });
    const result = compute(data, {
      overhead_ms: Number(plantRow.overhead_ms), overhead_ss: Number(plantRow.overhead_ss),
      labour: Number(plantRow.labour),
      consumables_ms: Number(plantRow.consumables_ms), consumables_ss: Number(plantRow.consumables_ss),
      power: Number(plantRow.power), fuel: Number(plantRow.fuel),
      melting_loss: Number(plantRow.melting_loss), margin: Number(plantRow.margin),
      avg_std_mld_wt: Number(plantRow.avg_std_mld_wt),
      shell_ms: Number(plantRow.shell_ms), shell_ss: Number(plantRow.shell_ss),
      pattern_wax: Number(plantRow.pattern_wax), riser_wax: Number(plantRow.riser_wax),
      water_sol_wax: Number(plantRow.water_sol_wax), ceramic_core: Number(plantRow.ceramic_core),
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
