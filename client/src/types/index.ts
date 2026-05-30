export interface Company {
  id: number;
  code: string;
  name: string;
  process: string;
  color: string;
  plants: string[];
}

export interface Plant {
  id: number;
  code: string;
  company_code: string;
  currency: string;
  mc_rate: number;
  lab_rate: number;
  pwr_rate: number;
  ovh_rate: number;
  scr_pct: number;
  yield_pct: number;
  melting_loss: number;
  overhead_ms: number;
  overhead_ss: number;
  labour: number;
  consumables_ms: number;
  consumables_ss: number;
  power: number;
  fuel: number;
  margin: number;
  avg_std_mld_wt: number;
  shell_ms: number;
  shell_ss: number;
  pattern_wax: number;
  riser_wax: number;
  water_sol_wax: number;
  ceramic_core: number;
  updated_at: string;
}

export interface Estimation {
  id: number;
  rfq_no: string;
  item_code: string;
  die_code: string;
  plant_code: string;
  company_code: string;
  customer: string;
  customer_type: string;
  material_type: string;
  supply_condition: string;
  part_description: string;
  drw_no: string;
  material: string;
  status: 'draft' | 'submitted' | 'approved' | 'lost';
  current_version: number;
  version_count: number;
  currency: string;
  company_color: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface EstimationVersion {
  id: number;
  estimation_id: number;
  version_no: number;
  label: string;
  created_by: string;
  price: number | null;
  data: EstimationData;
  status: string;
  notes: string;
  created_at: string;
}

export interface EstimationData {
  salesEntry: SalesEntry;
  chargeReturn: ChargeMetal[];
  chargeVirgin: ChargeMetal[];
  postFoundry: PostFoundryOp[];
  machining: MachiningOp[];
  tests: Record<string, TestEntry>;
  retAlloyRate?: number;
  htRate?: number;
}

export interface SalesEntry {
  itemCode: string;
  dieCode: string;
  plant: string;
  date: string;
  quotationNo: string;
  customerType: string;
  domExp: string;
  customerName: string;
  supplyCondition: string;
  partDescription: string;
  materialType: string;
  drwNo: string;
  material: string;
  uom: string;
  batchQty: number;
  compMin: Record<string, number>;
  compMax: Record<string, number>;
  mechMin: Record<string, number | string>;
  mechMax: Record<string, number | string>;
  heatTreatment: string;
  surfaceTreatment: string;
  hardness: string;
  additionalHT: string;
  inspection: string;
  additionalHardness: string;
  noPerMould: number;
  riserType: string;
  compWaxWt: number;
  compMetalWt: number;
  riserMetalWtManual: number;
  targetPrice: number;
  currency: string;
  tooling: {
    mainDie: number;
    cavities: string;
    settingFix: number;
    riserFeedDie: number;
    ceramicCoreDie: number;
    machiningFix: number;
    machiningGauges: number;
    specialTooling: number;
  };
}

export interface ChargeMetal {
  code?: string;
  metal?: string;
  material?: string;
  rate: number;
  qty: number;
}

export interface PostFoundryOp {
  op?: string;
  operation?: string;
  rate: number;
  uom: string;
  ihos?: string;
  cycle?: string | number;
}

export interface MachiningOp {
  op?: string;
  operation?: string;
  cycle: number;
  machine: string;
  amount?: number;
  complexity: number;
  addon: number;
}

export interface TestEntry {
  appl: string;
  sample: number | string;
  bulk: number | string;
  rate: number;
}

export interface RfqPipeline {
  id: number;
  rfq_no: string;
  estimation_id: number | null;
  item: string;
  company_code: string;
  plant_code: string;
  customer: string;
  stage: 'rfq' | 'est' | 'bom' | 'fin' | 'apv' | 'qte';
  amount_display: string;
  company_color: string;
  company_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: number;
  timestamp: string;
  actor: string;
  action: string;
  object: string;
  details: string;
}

export interface DashboardStats {
  openRfqs: number;
  totalEstimations: number;
  approvedCount: number;
  winRate: number;
  byCompany: Array<{ company_code: string; count: string }>;
  byStage: Array<{ stage: string; count: string }>;
  byStatus: Array<{ status: string; count: string }>;
}

export const WORKFLOW_STAGES = [
  { k: 'rfq', title: 'RFQ Intake',       owner: 'Sales',       sla: '1 d',    icon: '✉' },
  { k: 'est', title: 'Estimate',         owner: 'Sales / Eng', sla: '2 d',    icon: '∑' },
  { k: 'bom', title: 'Validate BOM',     owner: 'Engineering', sla: '1 d',    icon: '⌬' },
  { k: 'fin', title: 'Validate Costing', owner: 'Finance',     sla: '1 d',    icon: '₹' },
  { k: 'apv', title: 'Approve',          owner: 'CIO / PMO',   sla: '0.5 d',  icon: '✓' },
  { k: 'qte', title: 'Quote',            owner: 'Sales',       sla: 'auto',   icon: '↗' },
] as const;

export const COMPOSITIONS = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Mo', 'Ni', 'Ti'] as const;
export const MECH_PROPS = ['UTS', '0.2% PS/YS', '% Elong', 'Impact', 'R.A.', 'Angle Of Bend'] as const;
export const TESTS = ['Chemical Analysis','Tensile Test','Impact Test','Bend Test','Metallography','IGCT','LP/DP','Magnetic Particle','Radiography','Any other'] as const;

export const DROPDOWNS = {
  materialType:     ['MS','SS','Aluminium','Wax','Copper'],
  customerType:     ['Existing','Prospective'],
  geography:        ['Domestic','Export'],
  supplyCondition:  ['Machined','UnMachined','Semi Finished'],
  surfaceTreatment: ['Pickling','Passivation','Bath Nitrating','Electroplating','Oiling','Sand Blast'],
  heatTreatment:    ['Annealing','Hardening','Normalising','Solution Annealing','Tempering','Case Carburising & Tempering','Austempering','Normalising & Tempering','As cast','Quenched & Tempered','Normalising, Hardening & Tempe'],
  additionalHT:     ['Induction Hardening','Hardening & Tempering','Carburising','Hardening','Nitriding'],
  inspection:       ['UDL','Third Party','Outsource'],
  currency:         ['INR','USD','GBP','EUR'],
  riser:            ['Star Riser','3V Full','6T','5T spl+1','5T-spl New','26E190 Riser','5T SPL Modified','29N01','1X117 MOD','V5','Y SHAPE RISER','Star Riser New','8T','New Riser','26E59 RISER','NA','V5 Long','22F40 MODIFIED','7T'],
  postFoundryOps:   ['Mould Fettling','Mould Finishing','Casting Fettling','Casting Sandblasting','Casting Rework','Casting Pickling','Casting Passivation','Casting Setting','Casting Heat Treatment','Casting Packing','Feed machining','Heat punching'],
  machiningOps:     ['Casting Machining','Casting Drilling','Casting Milling','Casting Tapping','Casting Deburing','Induction Hardening','Outsource'],
  machineType:      ['EC 300','EC 400 - 1','EC 400 - 2','VF 2 - 1','VF 2 - 2','VF 2 - 3','VF 2 - 4','VF 2 - 5','VF 4 - 1','MAKINO 01','MAKINO 02','MAKINO 03','LMW 01','LMW 02','ACE SUPER JOBBER','ACE JR 300-1','ACE JR 300-2','VMC 350 - 1','VMC 350 - 2','VMC 350 - 3','VMC 400 - 1'],
  uomOp:            ['MD','NO','KG'],
};

export function fmt(n: number | null | undefined, dp = 2): string {
  if (n === null || n === undefined || isNaN(Number(n))) return '–';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}

export function fmtInt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(Number(n))) return '–';
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function fmtPct(n: number | null | undefined, dp = 1): string {
  if (n === null || n === undefined || isNaN(Number(n))) return '–';
  return (Number(n) * 100).toFixed(dp) + '%';
}

export const DEFAULT_SALES_ENTRY: SalesEntry = {
  itemCode: '', dieCode: '', plant: 'Nasik', date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
  quotationNo: '', customerType: 'Existing', domExp: 'Domestic', customerName: '',
  supplyCondition: 'Machined', partDescription: '', materialType: 'MS',
  drwNo: '', material: '', uom: 'Nos', batchQty: 1000,
  compMin: { C:0,Si:0,Mn:0,P:0,S:0,Cr:0,Mo:0,Ni:0,Ti:0 },
  compMax: { C:0,Si:0,Mn:0,P:0,S:0,Cr:0,Mo:0,Ni:0,Ti:0 },
  mechMin: {}, mechMax: {},
  heatTreatment: '', surfaceTreatment: '', hardness: '',
  additionalHT: '', inspection: 'UDL', additionalHardness: '',
  noPerMould: 10, riserType: 'NA',
  compWaxWt: 0, compMetalWt: 0, riserMetalWtManual: 0,
  targetPrice: 0, currency: 'INR',
  tooling: { mainDie:0, cavities:'', settingFix:0, riserFeedDie:0, ceramicCoreDie:0, machiningFix:0, machiningGauges:0, specialTooling:0 },
};
