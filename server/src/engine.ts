// Estimation Engine — TypeScript port of the Excel formula engine

export interface PlantMaster {
  overhead_ms: number;
  overhead_ss: number;
  labour: number;
  consumables_ms: number;
  consumables_ss: number;
  power: number;
  fuel: number;
  melting_loss: number;
  margin: number;
  avg_std_mld_wt: number;
  shell_ms: number;
  shell_ss: number;
  pattern_wax: number;
  riser_wax: number;
  water_sol_wax: number;
  ceramic_core: number;
}

export interface ChargeMetal {
  code: string;
  metal: string;
  rate: number;
  qty: number;
}

export interface PostFoundryOp {
  op: string;
  rate: number;
  ihos: string;
  cycle: string;
  uom: string;
}

export interface MachiningOp {
  op: string;
  cycle: number;
  machine: string;
  amount: number;
  complexity: number;
  addon: number;
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

export interface EstimationInput {
  salesEntry: SalesEntry;
  chargeReturn: ChargeMetal[];
  chargeVirgin: ChargeMetal[];
  postFoundry: PostFoundryOp[];
  machining: MachiningOp[];
  tests: Record<string, { appl: string; sample: number | string; bulk: number | string; rate: number }>;
  retAlloyRate?: number;
  htRate?: number;
  machRejPct?: number;
  machOhPct?: number;
}

const DENSITY: Record<string, number> = {
  MS: 7.86, SS: 7.86, Aluminium: 2.7, Wax: 1.05, Copper: 8.9,
};

const RISER_WEIGHTS: Record<string, number> = {
  'Star Riser': 4.021, '3V Full': 1.8, '6T': 1.9, '5T spl+1': 1.8,
  '5T-spl New': 2.405, '26E190 Riser': 2.405, '5T SPL Modified': 2.004,
  '29N01': 2.004, '1X117 MOD': 2.405, 'V5': 1.807, 'Y SHAPE RISER': 2,
  'Star Riser New': 2.335, '8T': 1.4, 'New Riser': 1.2, '26E59 RISER': 1.7,
  'NA': 0, 'V5 Long': 1.8, '22F40 MODIFIED': 2.16, '7T': 1.3,
};

const MACHINE_RATES: Record<string, number> = {
  HMC: 1000, VMC: 650, MAKINO: 600, LMW: 180, ACE: 180, 'AMS VMC': 480,
};

const MACHINE_TYPE_MAP: Record<string, string> = {
  'EC 300': 'HMC', 'EC 400 - 1': 'HMC', 'EC 400 - 2': 'HMC',
  'VF 2 - 1': 'VMC', 'VF 2 - 2': 'VMC', 'VF 2 - 3': 'VMC',
  'VF 2 - 4': 'VMC', 'VF 2 - 5': 'VMC', 'VF 4 - 1': 'VMC',
  'MAKINO 01': 'MAKINO', 'MAKINO 02': 'MAKINO', 'MAKINO 03': 'MAKINO',
  'LMW 01': 'LMW', 'LMW 02': 'LMW',
  'ACE SUPER JOBBER': 'ACE', 'ACE JR 300-1': 'ACE', 'ACE JR 300-2': 'ACE',
  'VMC 350 - 1': 'AMS VMC', 'VMC 350 - 2': 'AMS VMC', 'VMC 350 - 3': 'AMS VMC', 'VMC 400 - 1': 'AMS VMC',
};

const EXCHANGE: Record<string, number> = { INR: 1, USD: 82.46, GBP: 91, EUR: 81.22 };

function chargeRate(rows: ChargeMetal[]): { rate: number; sumQty: number; sumVal: number } {
  let sumQty = 0, sumVal = 0;
  for (const r of rows) {
    const q = Number(r.qty) || 0;
    const rt = Number(r.rate) || 0;
    sumQty += q;
    sumVal += q * rt;
  }
  return { rate: sumQty > 0 ? sumVal / sumQty : 0, sumQty, sumVal };
}

export function compute(input: EstimationInput, master: PlantMaster) {
  const se = input.salesEntry;
  const mat = se.materialType;
  const M = master;
  const densityMetal = DENSITY[mat] ?? 7.86;
  const densityWax = DENSITY['Wax'];

  const virgin = chargeRate(input.chargeVirgin ?? []);
  const ret = chargeRate(input.chargeReturn ?? []);

  const retAlloyRate = Number(input.retAlloyRate) || 0;
  const rateToConsider = retAlloyRate > 0 ? retAlloyRate : ret.rate;

  const composition = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Mo', 'Ni', 'Ti'];
  const compAvg: Record<string, number> = {};
  for (const el of composition) {
    const mn = Number(se.compMin?.[el]) || 0;
    const mx = Number(se.compMax?.[el]) || 0;
    compAvg[el] = (mn + mx) / 2;
  }

  const noPerMould = Number(se.noPerMould) || 0;
  const compMetalWt = Number(se.compMetalWt) || 0;
  const compWaxWt = Number(se.compWaxWt) || 0;
  const riserMetalManual = Number(se.riserMetalWtManual) || 0;
  const riserWtFromTable = RISER_WEIGHTS[se.riserType] ?? 0;

  const feedWtWax = compWaxWt * densityWax / densityMetal;
  const compWtWax = compMetalWt * densityWax / densityMetal;
  const riserWaxQty = riserMetalManual > 0 ? riserMetalManual / densityMetal : riserWtFromTable;
  const riserMetalWt = riserMetalManual > 0 ? riserMetalManual : riserWtFromTable;

  const mouldWtMetal = compMetalWt * noPerMould + riserMetalWt;
  const mouldWtWax = compWtWax * noPerMould + (riserWtFromTable * densityWax / densityMetal);
  const yieldPct = mouldWtMetal > 0 ? (compMetalWt * noPerMould) / mouldWtMetal : 0;

  const scenarios = [
    { id: 'A', rejPct: 0.15 },
    { id: 'B', rejPct: 0.20 },
    { id: 'C', rejPct: 0.25 },
  ].map(s => ({
    ...s,
    goodPerMould: noPerMould * (1 - s.rejPct),
    mouldsReq: noPerMould * (1 - s.rejPct) > 0
      ? Math.ceil((Number(se.batchQty) || 0) / (noPerMould * (1 - s.rejPct)))
      : 0,
  }));

  const patternWaxRate = M.pattern_wax;
  const riserWaxRate = M.riser_wax;
  const waterSolWaxRate = M.water_sol_wax;
  const ceramicCoreRate = M.ceramic_core;

  const patternWaxWt = compWtWax * noPerMould;
  const patternWaxValue = patternWaxWt * patternWaxRate;
  const riserWaxValue = riserWaxQty * riserWaxRate;
  const ceramicCoreQty = 0.15;
  const ceramicCoreValue = ceramicCoreQty * ceramicCoreRate;

  const shellRate = mat === 'SS' ? M.shell_ss : M.shell_ms;
  const shellQty = mouldWtMetal * 0.6;
  const shellCost = shellQty * shellRate;

  const metalRate = rateToConsider * (1 + M.melting_loss);
  const metalCostBase = mouldWtMetal * metalRate;

  const returnWt = mouldWtMetal * (1 - M.melting_loss) - compMetalWt * scenarios[1].goodPerMould;
  const returnCreditValue = returnWt * rateToConsider;
  const metalCostNetWithRC = metalCostBase - returnCreditValue;
  const metalCostNetWithoutRC = metalCostBase;

  const consumables = mat === 'SS' ? M.consumables_ss : M.consumables_ms;
  const consumablesValue = consumables * mouldWtMetal / M.avg_std_mld_wt;
  const htWt = compMetalWt * noPerMould;
  const htRate = Number(input.htRate) || 30;
  const htValue = htWt * htRate;
  const powerValue = M.power * mouldWtMetal;
  const fuelValue = M.fuel * mouldWtMetal / M.avg_std_mld_wt;
  const labourValue = M.labour * mouldWtMetal / M.avg_std_mld_wt;
  const overhead = mat === 'SS' ? M.overhead_ss : M.overhead_ms;
  const overheadValue = overhead * mouldWtMetal / M.avg_std_mld_wt;

  function leakMouldCost(metalNet: number): number {
    return (patternWaxValue + riserWaxValue + ceramicCoreValue + shellCost +
      metalNet + consumablesValue + htValue + powerValue + fuelValue +
      labourValue + overheadValue) * 0.01;
  }

  const totalCostWithRC = patternWaxValue + riserWaxValue + ceramicCoreValue +
    shellCost + metalCostNetWithRC + consumablesValue + htValue + powerValue +
    fuelValue + labourValue + overheadValue + leakMouldCost(metalCostNetWithRC);
  const totalCostWithoutRC = patternWaxValue + riserWaxValue + ceramicCoreValue +
    shellCost + metalCostNetWithoutRC + consumablesValue + htValue + powerValue +
    fuelValue + labourValue + overheadValue + leakMouldCost(metalCostNetWithoutRC);

  const rcPerScenarioWith = scenarios.map(s =>
    noPerMould > 0 ? totalCostWithRC / noPerMould / (1 - s.rejPct) : 0
  );
  const rcPerScenarioWithout = scenarios.map(s =>
    noPerMould > 0 ? totalCostWithoutRC / noPerMould / (1 - s.rejPct) : 0
  );

  function pfPerCast(rate: number, uom: string): number {
    if (uom === 'NO') return rate;
    if (uom === 'MD') return noPerMould > 0 ? rate / noPerMould : 0;
    if (uom === 'KG') return rate * compMetalWt;
    return 0;
  }

  const pfRows = (input.postFoundry ?? []).map(r => ({
    ...r, perCast: pfPerCast(Number(r.rate) || 0, r.uom),
  }));
  const pfTotal = pfRows.reduce((a, r) => a + r.perCast, 0);

  const asCastWith = rcPerScenarioWith.map(rc => rc + pfTotal);
  const asCastWithout = rcPerScenarioWithout.map(rc => rc + pfTotal);

  const machRows = (input.machining ?? []).map(r => {
    const machineType = MACHINE_TYPE_MAP[r.machine] ?? '';
    const ratePerHr = MACHINE_RATES[machineType] ?? 0;
    const cycle = Number(r.cycle) || 0;
    const amount = (cycle / 60) * ratePerHr;
    const cf = Number(r.complexity) || 0;
    const addon = Number(r.addon) || 0;
    const total = (amount * (cf > 0 ? cf : 1)) + addon;
    return { ...r, machineType, ratePerHr, amount, total };
  });
  const machTotal = machRows.reduce((a, r) => a + r.total, 0);
  const machRejPct = Number(input.machRejPct) || 0.03;
  const machOhPct = Number(input.machOhPct) || 0.10;

  function machChargesFor(asCast: number[]): number[] {
    return asCast.map(ac => {
      const rej = ac * machRejPct;
      const oh = (machTotal + rej) * machOhPct;
      return machTotal + rej + oh;
    });
  }

  const machChargesWith = machChargesFor(asCastWith);
  const machChargesWithout = machChargesFor(asCastWithout);

  const finishedWith = asCastWith.map((a, i) => a + machChargesWith[i]);
  const finishedWithout = asCastWithout.map((a, i) => a + machChargesWithout[i]);
  const marginPct = M.margin || 0;
  const marginWith = finishedWith.map(f => f * marginPct / (1 - marginPct));
  const marginWithout = finishedWithout.map(f => f * marginPct / (1 - marginPct));
  const exPriceWith = finishedWith.map((f, i) => f + marginWith[i]);
  const exPriceWithout = finishedWithout.map((f, i) => f + marginWithout[i]);

  const exRate = EXCHANGE[se.currency] ?? 1;
  const exForeignWith = exPriceWith.map(p => p / exRate);
  const exForeignWithout = exPriceWithout.map(p => p / exRate);
  const perKgWith = exPriceWith.map(p => compMetalWt > 0 ? p / compMetalWt : 0);
  const perKgWithout = exPriceWithout.map(p => compMetalWt > 0 ? p / compMetalWt : 0);
  const quotedWith = [...exPriceWith];
  const quotedWithout = [...exPriceWithout];

  const t = se.tooling ?? {};
  const dieTotal = (Number(t.mainDie) || 0) + (Number(t.settingFix) || 0) +
    (Number(t.riserFeedDie) || 0) + (Number(t.ceramicCoreDie) || 0);
  const machTooling = (Number(t.machiningFix) || 0) + (Number(t.machiningGauges) || 0) +
    (Number(t.specialTooling) || 0);

  return {
    compAvg, virgin, ret, rateToConsider, densityMetal, densityWax,
    feedWtWax, compWtWax, riserWaxQty, riserMetalWt, riserWtFromTable,
    mouldWtMetal, mouldWtWax, yieldPct, scenarios,
    costRows: {
      patternWax:   { qty: patternWaxWt,  rate: patternWaxRate,  value: patternWaxValue },
      riserWax:     { qty: riserWaxQty,   rate: riserWaxRate,    value: riserWaxValue },
      ceramicCore:  { qty: ceramicCoreQty,rate: ceramicCoreRate, value: ceramicCoreValue },
      shell:        { qty: shellQty,      rate: shellRate,       value: shellCost },
      metal:        { qty: mouldWtMetal,  rate: metalRate,       valueWith: metalCostNetWithRC, valueWithout: metalCostNetWithoutRC },
      returnCredit: { qty: returnWt,      rate: rateToConsider,  value: returnCreditValue },
      consumables:  { rate: consumables,  value: consumablesValue },
      ht:           { qty: htWt,          rate: htRate,          value: htValue },
      power:        { rate: M.power,      value: powerValue },
      fuel:         { rate: M.fuel,       value: fuelValue },
      labour:       { rate: M.labour,     value: labourValue },
      overhead:     { rate: overhead,     value: overheadValue },
      leakMould:    { withRC: leakMouldCost(metalCostNetWithRC), withoutRC: leakMouldCost(metalCostNetWithoutRC) },
    },
    totalCostWithRC, totalCostWithoutRC,
    rcPerScenarioWith, rcPerScenarioWithout,
    pfRows, pfTotal,
    asCastWith, asCastWithout,
    machRows, machTotal, machChargesWith, machChargesWithout,
    finishedWith, finishedWithout, marginWith, marginWithout,
    exPriceWith, exPriceWithout, exForeignWith, exForeignWithout,
    perKgWith, perKgWithout, quotedWith, quotedWithout,
    tooling: { dieTotal, machTooling, totalDevCost: dieTotal + machTooling },
  };
}

export function fmt(n: number | null | undefined, dp = 2): string {
  if (n === null || n === undefined || isNaN(n)) return '–';
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
