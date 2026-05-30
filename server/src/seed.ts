import { pool, initSchema } from './db';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  await initSchema();
  console.log('Schema ready');

  // Companies
  await pool.query(`
    INSERT INTO companies (code, name, process, color) VALUES
      ('UDL',  'Uni Deritend Limited',       'Investment Casting',      '#d97757'),
      ('UTPL', 'Uni Tritech Limited',         'Forging & Machining',     '#5b8def'),
      ('UAL',  'Uni Abex Limited',            'Heavy Sand Casting',      '#7a9e3f'),
      ('UAML', 'Uni Advanced Materials Ltd',  'Refractory & Alloy',      '#8e6db1'),
      ('TGUK', 'TG UK',                       'Investment Casting (UK)', '#c14b78')
    ON CONFLICT (code) DO NOTHING;
  `);

  // Plants with full rate masters
  await pool.query(`
    INSERT INTO plants (
      code, company_code, currency,
      mc_rate, lab_rate, pwr_rate, ovh_rate, fuel_rate, scr_pct, yield_pct, melting_loss,
      overhead_ms, overhead_ss, labour, consumables_ms, consumables_ss,
      power, fuel, margin, avg_std_mld_wt,
      shell_ms, shell_ss, pattern_wax, riser_wax, water_sol_wax, ceramic_core
    ) VALUES
      ('Nasik',      'UDL',  'INR',  920, 488, 26, 1622, 240, 0.20, 0.62, 0.030,
        1621.88, 1696.12, 488, 645.02, 706.98, 26, 0, 0, 27, 42, 45, 81.79, 13.88, 70, 400),
      ('Aurangabad', 'UDL',  'INR',  880, 462, 24, 1480, 220, 0.18, 0.65, 0.028,
        389, 389, 537, 319, 319, 24, 0, 0, 23, 39, 39, 81.81, 13.82, 70, 400),
      ('Pune',       'UTPL', 'INR', 1240, 612, 31, 1980, 310, 0.12, 0.78, 0.020,
        1800, 1900, 612, 720, 820, 31, 0, 0, 30, 46, 50, 84.00, 14.50, 70, 420),
      ('Solapur',    'UAL',  'INR', 1080, 540, 28, 1810, 280, 0.22, 0.58, 0.035,
        1550, 1620, 540, 680, 740, 28, 0, 0, 26, 40, 44, 80.50, 13.50, 70, 390),
      ('Coventry',   'TGUK', 'GBP',   64,  48,  9,  121,  18, 0.15, 0.71, 0.025,
        95, 102, 48, 38, 42, 9, 0, 0, 25, 6.5, 7.2, 12.50, 2.10, 10, 60)
    ON CONFLICT (code) DO NOTHING;
  `);

  // Sample estimations
  const est1 = await pool.query(`
    INSERT INTO estimations (rfq_no, item_code, die_code, plant_code, company_code, customer,
      customer_type, material_type, supply_condition, part_description, drw_no, material, status, current_version)
    VALUES
      ('UDL/Q/2024-0931', '30D',  '30D',  'Nasik',  'UDL',  'DISCOM',         'Existing', 'MS', 'Machined',   'Down pipe Inlet casting',  '82909101', 'ASTM A 732 2Q', 'submitted', 3),
      ('UDL/Q/2024-0928', '77B',  '77B',  'Nasik',  'UDL',  'Bharat Forge',   'Existing', 'SS', 'Machined',   'Pump casing',               '7890221',  'ASTM A 890 5A', 'approved',  2),
      ('UDL/Q/2024-0922', '12X',  '12X',  'Aurangabad','UDL','Tata Motors',   'Existing', 'MS', 'UnMachined', 'Bracket casting',           '4512001',  'IS 1030 Gr 280','draft',     1),
      ('UDL/Q/2024-0917', 'KH-9', 'KH-9', 'Nasik',  'UDL',  'L&T Defence',   'Existing', 'SS', 'Machined',   'Defence housing',           '9812345',  'ASTM A 743 CA6N','approved', 2),
      ('UTPL/Q/2024-0421','TH-01','TH-01','Pune',   'UTPL', 'BHEL',           'Existing', 'MS', 'Machined',   'Turbo Housing',             '8834501',  'IS 2062 E250',  'submitted', 1),
      ('UAL/Q/2024-0422', 'ML-5', 'ML-5', 'Solapur','UAL',  'Hindustan Zinc', 'Existing', 'MS', 'UnMachined', 'Mill Liner',                '5523100',  'ASTM A 532 I',  'submitted', 1)
    ON CONFLICT (rfq_no) DO NOTHING
    RETURNING id, rfq_no;
  `);

  const sampleData = {
    salesEntry: {
      itemCode: '30D', dieCode: '30D', plant: 'Nasik', date: '16.09.2024',
      quotationNo: 'UDL/Q/2024-0931', customerType: 'Existing', domExp: 'Domestic',
      customerName: 'DISCOM', supplyCondition: 'Machined',
      partDescription: 'Down pipe Inlet casting', materialType: 'MS',
      drwNo: '82909101', material: 'ASTM A 732 2Q', uom: 'Nos', batchQty: 250000,
      compMin: { C:0.25,Si:0.20,Mn:0.70,P:0,S:0,Cr:0,Mo:0,Ni:0,Ti:0 },
      compMax: { C:0.35,Si:1.00,Mn:1.00,P:0.045,S:0.045,Cr:0.5,Mo:0.25,Ni:0.5,Ti:0 },
      mechMin: {}, mechMax: {},
      heatTreatment: 'Quenched & Tempered', surfaceTreatment: 'Oiling',
      hardness: '', additionalHT: '', inspection: 'UDL', additionalHardness: '',
      noPerMould: 10, riserType: '1X117 MOD',
      compWaxWt: 0.104, compMetalWt: 0.78, riserMetalWtManual: 16,
      targetPrice: 900, currency: 'INR',
      tooling: { mainDie:150000, cavities:'1 cavities', settingFix:50000,
                 riserFeedDie:0, ceramicCoreDie:0, machiningFix:100000,
                 machiningGauges:80000, specialTooling:50000 },
    },
    chargeReturn: [
      { code:'Si', metal:'Fe Si',      rate:117,  qty:0.30 },
      { code:'Cr', metal:'Fe Cr 0.3%', rate:268,  qty:0.75 },
      { code:'Mo', metal:'Fe molly',   rate:2900, qty:0    },
      { code:'Mn', metal:'Pu Mn',      rate:177,  qty:0.80 },
      { code:'Ni', metal:'Pu Ni',      rate:1550, qty:0    },
      { code:'C',  metal:'Acti. Carbon',rate:103, qty:0.10 },
      { code:'',   metal:'MSLC',       rate:45,   qty:53   },
      { code:'',   metal:'C24 Return', rate:56,   qty:45.05},
    ],
    chargeVirgin: Array.from({length:6}, () => ({ code:'', metal:'', rate:0, qty:0 })),
    postFoundry: [
      { op:'Mould Fettling',  rate:200, ihos:'OS', cycle:'', uom:'MD' },
      { op:'Mould Finishing', rate:200, ihos:'OS', cycle:'', uom:'MD' },
      { op:'Casting Setting', rate:10,  ihos:'OS', cycle:'', uom:'NO' },
      { op:'Casting Fettling',rate:5,   ihos:'OS', cycle:'', uom:'NO' },
      { op:'Feed machining',  rate:10,  ihos:'OS', cycle:'', uom:'NO' },
    ],
    machining: [{ op:'Casting Machining', cycle:0, machine:'VF 2 - 1', amount:0, complexity:0, addon:110 }],
    tests: {
      'Chemical Analysis': { appl:'Yes', sample:1, bulk:1, rate:0 },
      'Tensile Test':      { appl:'Yes', sample:1, bulk:1, rate:0 },
    },
  };

  // Insert versions for first estimation
  if (est1.rows.length > 0) {
    const firstId = est1.rows[0].id;
    if (firstId) {
      await pool.query(`
        INSERT INTO estimation_versions (estimation_id, version_no, label, created_by, price, data, status, notes)
        VALUES
          ($1, 1, 'RFQ',         'A. Salunke (Sales)',   2840, $2, 'submitted', 'Initial RFQ from customer.'),
          ($1, 2, 'Negotiation', 'R. Tendulkar (Sales)', 2720, $2, 'submitted', 'After 1st commercial round.'),
          ($1, 3, 'Final',       'S. Banerjee (Fin)',    2675, $2, 'approved',  'Approved by Finance head.')
        ON CONFLICT (estimation_id, version_no) DO NOTHING;
      `, [firstId, JSON.stringify(sampleData)]);
    }
  }

  // RFQ Pipeline
  await pool.query(`
    INSERT INTO rfq_pipeline (rfq_no, item, company_code, plant_code, customer, stage, amount_display)
    VALUES
      ('RFQ-26-0418', '30D Impeller',     'UDL',  'Nasik',      'Atlas Copco',    'fin',  '₹ 8.4 L'),
      ('RFQ-26-0421', 'Turbo Housing',    'UTPL', 'Pune',       'BHEL',           'bom',  '₹ 22 L'),
      ('RFQ-26-0422', 'Mill Liner',       'UAL',  'Solapur',    'Hindustan Z',    'est',  '₹ 1.1 Cr'),
      ('RFQ-26-0423', 'Pump Body',        'UDL',  'Aurangabad', 'KSB',            'rfq',  '₹ 6.2 L'),
      ('RFQ-26-0424', 'Refractory Liner', 'UAML', 'Aurangabad', 'Tata Steel',     'apv',  '₹ 18 L'),
      ('RFQ-26-0425', 'Aero Bracket',     'TGUK', 'Coventry',   'Rolls-Royce',    'fin',  '£ 14 k'),
      ('RFQ-26-0419', 'Pump Impeller',    'UDL',  'Nasik',      'Kirloskar',      'qte',  '₹ 11 L')
    ON CONFLICT (rfq_no) DO NOTHING;
  `);

  // Audit log
  await pool.query(`
    INSERT INTO audit_log (timestamp, actor, action, object, details)
    VALUES
      (NOW() - INTERVAL '13 days', 'S. Banerjee',  'Approved V3 final',          '30D Impeller · EST-0931', 'Version locked'),
      (NOW() - INTERVAL '13 days', 'P. Joshi',     'Validated BOM + routing',    '30D Impeller · EST-0931', 'Technical OK'),
      (NOW() - INTERVAL '21 days', 'R. Tendulkar', 'Submitted V2 (negotiation)', '30D Impeller · EST-0931', 'Price revised to 2720'),
      (NOW() - INTERVAL '21 days', 'System',       'SAP refresh — 2,481 items',  'Nasik plant',             'Scheduled sync'),
      (NOW() - INTERVAL '28 days', 'A. Salunke',   'Created V1 (RFQ)',           '30D Impeller · EST-0931', 'New estimation from RFQ')
  `);

  console.log('Seed complete');
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
