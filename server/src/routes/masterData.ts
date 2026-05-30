import { Router } from 'express';
import { pool, query } from '../db';

const router = Router();

router.get('/companies', async (_req, res) => {
  try {
    const rows = await query(`
      SELECT c.*, json_agg(p.code ORDER BY p.code) as plants
      FROM companies c
      LEFT JOIN plants p ON p.company_code = c.code
      GROUP BY c.id ORDER BY c.code
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/plants', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM plants ORDER BY code');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/plants/:code', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM plants WHERE code=$1', [req.params.code]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.patch('/plants/:code', async (req, res) => {
  try {
    const allowed = [
      'overhead_ms','overhead_ss','labour','consumables_ms','consumables_ss',
      'power','fuel','melting_loss','margin','avg_std_mld_wt',
      'shell_ms','shell_ss','pattern_wax','riser_wax','water_sol_wax','ceramic_core',
    ];
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const [k, v] of Object.entries(req.body)) {
      if (allowed.includes(k)) { sets.push(`${k}=$${i++}`); vals.push(v); }
    }
    if (!sets.length) return res.status(400).json({ error: 'No valid fields' });
    vals.push(req.params.code);
    await pool.query(
      `UPDATE plants SET ${sets.join(',')}, updated_at=NOW() WHERE code=$${i}`,
      vals
    );
    await pool.query(
      `INSERT INTO audit_log (actor, action, object, details) VALUES ('Admin','Updated plant rates',$1,$2)`,
      [req.params.code, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: String(err) });
  }
});

router.get('/audit', async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
