import { Router } from 'express';
import { query } from '../db';

const router = Router();

router.get('/dashboard', async (_req, res) => {
  try {
    const [openRfqs] = await query<{ count: string }>('SELECT COUNT(*) as count FROM rfq_pipeline WHERE stage != $1', ['qte']);
    const [totalEst] = await query<{ count: string }>('SELECT COUNT(*) as count FROM estimations');
    const [approved] = await query<{ count: string }>(`SELECT COUNT(*) as count FROM estimations WHERE status='approved'`);
    const byCompany = await query<{ company_code: string; count: string }>(
      `SELECT company_code, COUNT(*) as count FROM estimations GROUP BY company_code ORDER BY company_code`
    );
    const byStage = await query<{ stage: string; count: string }>(
      `SELECT stage, COUNT(*) as count FROM rfq_pipeline GROUP BY stage ORDER BY stage`
    );
    const byStatus = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) as count FROM estimations GROUP BY status ORDER BY status`
    );

    res.json({
      openRfqs: parseInt(openRfqs?.count ?? '0'),
      totalEstimations: parseInt(totalEst?.count ?? '0'),
      approvedCount: parseInt(approved?.count ?? '0'),
      winRate: totalEst?.count && approved?.count
        ? Math.round(parseInt(approved.count) / parseInt(totalEst.count) * 100)
        : 0,
      byCompany,
      byStage,
      byStatus,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get('/plant-comparison', async (req, res) => {
  try {
    const plants = await query(
      `SELECT * FROM plants WHERE code = ANY($1::text[])`,
      [['Nasik', 'Aurangabad', 'Pune', 'Coventry']]
    );
    res.json(plants);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
