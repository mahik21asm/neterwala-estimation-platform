import { Router } from 'express';
import { pool, query } from '../db';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT r.*, c.color as company_color, c.name as company_name
      FROM rfq_pipeline r
      JOIN companies c ON c.code = r.company_code
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch('/:id/stage', async (req, res) => {
  try {
    const { stage, actor } = req.body;
    const validStages = ['rfq', 'est', 'bom', 'fin', 'apv', 'qte'];
    if (!validStages.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });

    await pool.query(
      `UPDATE rfq_pipeline SET stage=$1, updated_at=NOW() WHERE id=$2`,
      [stage, req.params.id]
    );
    await pool.query(
      `INSERT INTO audit_log (actor, action, object, details) VALUES ($1,'Advanced to stage '||$2,'RFQ #'||$3,$4)`,
      [actor || 'System', stage, req.params.id, `Stage advanced to ${stage}`]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const { rfqNo, item, companyCode, plantCode, customer, amountDisplay } = req.body;
    const result = await pool.query(
      `INSERT INTO rfq_pipeline (rfq_no, item, company_code, plant_code, customer, amount_display, stage)
       VALUES ($1,$2,$3,$4,$5,$6,'rfq') RETURNING *`,
      [rfqNo, item, companyCode, plantCode, customer, amountDisplay || '']
    );
    await pool.query(
      `INSERT INTO audit_log (actor, action, object) VALUES ('System','New RFQ created',$1)`,
      [`${rfqNo} · ${item}`]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

export default router;
