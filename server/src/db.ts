import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      process TEXT NOT NULL,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS plants (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      company_code TEXT NOT NULL REFERENCES companies(code),
      currency TEXT NOT NULL DEFAULT 'INR',
      mc_rate NUMERIC NOT NULL DEFAULT 0,
      lab_rate NUMERIC NOT NULL DEFAULT 0,
      pwr_rate NUMERIC NOT NULL DEFAULT 0,
      ovh_rate NUMERIC NOT NULL DEFAULT 0,
      fuel_rate NUMERIC NOT NULL DEFAULT 0,
      scr_pct NUMERIC NOT NULL DEFAULT 0,
      yield_pct NUMERIC NOT NULL DEFAULT 0,
      melting_loss NUMERIC NOT NULL DEFAULT 0.03,
      overhead_ms NUMERIC NOT NULL DEFAULT 0,
      overhead_ss NUMERIC NOT NULL DEFAULT 0,
      labour NUMERIC NOT NULL DEFAULT 0,
      consumables_ms NUMERIC NOT NULL DEFAULT 0,
      consumables_ss NUMERIC NOT NULL DEFAULT 0,
      power NUMERIC NOT NULL DEFAULT 0,
      fuel NUMERIC NOT NULL DEFAULT 0,
      margin NUMERIC NOT NULL DEFAULT 0,
      avg_std_mld_wt NUMERIC NOT NULL DEFAULT 27,
      shell_ms NUMERIC NOT NULL DEFAULT 0,
      shell_ss NUMERIC NOT NULL DEFAULT 0,
      pattern_wax NUMERIC NOT NULL DEFAULT 0,
      riser_wax NUMERIC NOT NULL DEFAULT 0,
      water_sol_wax NUMERIC NOT NULL DEFAULT 0,
      ceramic_core NUMERIC NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS estimations (
      id SERIAL PRIMARY KEY,
      rfq_no TEXT UNIQUE NOT NULL,
      item_code TEXT NOT NULL,
      die_code TEXT,
      plant_code TEXT NOT NULL REFERENCES plants(code),
      company_code TEXT NOT NULL REFERENCES companies(code),
      customer TEXT NOT NULL,
      customer_type TEXT,
      material_type TEXT NOT NULL DEFAULT 'MS',
      supply_condition TEXT,
      part_description TEXT,
      drw_no TEXT,
      material TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      current_version INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS estimation_versions (
      id SERIAL PRIMARY KEY,
      estimation_id INTEGER NOT NULL REFERENCES estimations(id) ON DELETE CASCADE,
      version_no INTEGER NOT NULL,
      label TEXT NOT NULL DEFAULT 'Draft',
      created_by TEXT NOT NULL DEFAULT 'System',
      price NUMERIC,
      data JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(estimation_id, version_no)
    );

    CREATE TABLE IF NOT EXISTS rfq_pipeline (
      id SERIAL PRIMARY KEY,
      rfq_no TEXT UNIQUE NOT NULL,
      estimation_id INTEGER REFERENCES estimations(id),
      item TEXT NOT NULL,
      company_code TEXT NOT NULL REFERENCES companies(code),
      plant_code TEXT NOT NULL REFERENCES plants(code),
      customer TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'rfq',
      amount_display TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      object TEXT NOT NULL,
      details TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_estimations_plant ON estimations(plant_code);
    CREATE INDEX IF NOT EXISTS idx_estimations_status ON estimations(status);
    CREATE INDEX IF NOT EXISTS idx_versions_estimation ON estimation_versions(estimation_id);
    CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON rfq_pipeline(stage);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp DESC);
  `);
}
