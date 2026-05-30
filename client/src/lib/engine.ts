// Client-side estimation engine — mirrors server engine exactly
import type { EstimationData, Plant } from '../types';

const DENSITY: Record<string, number> = { MS: 7.86, SS: 7.86, Aluminium: 2.7, Wax: 1.05, Copper: 8.9 };
const RISER_WEIGHTS: Record<string, number> = {
  'Star Riser':4.021,'3V Full':1.8,'6T':1.9,'5T spl+1':1.8,'5T-spl New':2.405,
  '26E190 Riser':2.405,'5T SPL Modified':2.004,'29N01':2.004,'1X117 MOD':2.405,
  'V5':1.807,'Y SHAPE RISER':2,'Star Riser New':2.335,'8T':1.4,'New Riser':1.2,
  '26E59 RISER':1.7,'NA':0,'V5 Long':1.8,'22F40 MODIFIED':2.16,'7T':1.3,
};
const MACHINE_RATES: Record<string, number> = { HMC:1000,VMC:650,MAKINO:600,LMW:180,ACE:180,'AMS VMC':480 };
const MACHINE_TYPE_MAP: Record<string, string> = {
  'EC 300':'HMC','EC 400 - 1':'HMC','EC 400 - 2':'HMC',
  'VF 2 - 1':'VMC','VF 2 - 2':'VMC','VF 2 - 3':'VMC','VF 2 - 4':'VMC','VF 2 - 5':'VMC','VF 4 - 1':'VMC',
  'MAKINO 01':'MAKINO','MAKINO 02':'MAKINO','MAKINO 03':'MAKINO',
  'LMW 01':'LMW','LMW 02':'LMW',
  'ACE SUPER JOBBER':'ACE','ACE JR 300-1':'ACE','ACE JR 300-2':'ACE',
  'VMC 350 - 1':'AMS VMC','VMC 350 - 2':'AMS VMC','VMC 350 - 3':'AMS VMC','VMC 400 - 1':'AMS VMC',
};
const EXCHANGE: Record<string, number> = { INR:1, USD:82.46, GBP:91, EUR:81.22 };

function chargeRate(rows: { rate: number; qty: number }[]) {
  let sumQty = 0, sumVal = 0;
  for (const r of rows) {
    const q = Number(r.qty)||0, rt = Number(r.rate)||0;
    sumQty += q; sumVal += q * rt;
  }
  return { rate: sumQty > 0 ? sumVal/sumQty : 0, sumQty, sumVal };
}

export function computeEstimation(input: EstimationData, plant: Plant) {
  const se = input.salesEntry;
  const mat = se.materialType;
  const densityMetal = DENSITY[mat] ?? 7.86;
  const densityWax = DENSITY['Wax'];

  const virgin = chargeRate(input.chargeVirgin ?? []);
  const ret = chargeRate(input.chargeReturn ?? []);
  const rateToConsider = (Number(input.retAlloyRate)||0) > 0 ? Number(input.retAlloyRate) : ret.rate;

  const compAvg: Record<string, number> = {};
  for (const el of ['C','Si','Mn','P','S','Cr','Mo','Ni','Ti']) {
    compAvg[el] = ((Number(se.compMin?.[el])||0) + (Number(se.compMax?.[el])||0)) / 2;
  }

  const noPerMould = Number(se.noPerMould)||0;
  const compMetalWt = Number(se.compMetalWt)||0;
  const compWaxWt = Number(se.compWaxWt)||0;
  const riserMetalManual = Number(se.riserMetalWtManual)||0;
  const riserWtFromTable = RISER_WEIGHTS[se.riserType] ?? 0;
  const riserWaxQty = riserMetalManual > 0 ? riserMetalManual/densityMetal : riserWtFromTable;
  const riserMetalWt = riserMetalManual > 0 ? riserMetalManual : riserWtFromTable;

  const mouldWtMetal = compMetalWt * noPerMould + riserMetalWt;
  const mouldWtWax = compMetalWt * (densityWax/densityMetal) * noPerMould + riserWtFromTable * (densityWax/densityMetal);
  const yieldPct = mouldWtMetal > 0 ? (compMetalWt * noPerMould) / mouldWtMetal : 0;

  const scenarios = [{id:'A',rejPct:0.15},{id:'B',rejPct:0.20},{id:'C',rejPct:0.25}].map(s => ({
    ...s,
    goodPerMould: noPerMould*(1-s.rejPct),
    mouldsReq: noPerMould*(1-s.rejPct) > 0 ? Math.ceil((Number(se.batchQty)||0) / (noPerMould*(1-s.rejPct))) : 0,
  }));

  const M = {
    overhead: mat==='SS' ? Number(plant.overhead_ss) : Number(plant.overhead_ms),
    consumables: mat==='SS' ? Number(plant.consumables_ss) : Number(plant.consumables_ms),
    shellRate: mat==='SS' ? Number(plant.shell_ss) : Number(plant.shell_ms),
    patternWax: Number(plant.pattern_wax), riserWax: Number(plant.riser_wax),
    ceramicCore: Number(plant.ceramic_core), power: Number(plant.power),
    fuel: Number(plant.fuel), labour: Number(plant.labour),
    meltingLoss: Number(plant.melting_loss), margin: Number(plant.margin),
    avgStdMldWt: Number(plant.avg_std_mld_wt),
  };

  const patternWaxWt = compMetalWt * (densityWax/densityMetal) * noPerMould;
  const patternWaxValue = patternWaxWt * M.patternWax;
  const riserWaxValue = riserWaxQty * M.riserWax;
  const ceramicCoreValue = 0.15 * M.ceramicCore;
  const shellCost = mouldWtMetal * 0.6 * M.shellRate;

  const metalRate = rateToConsider * (1 + M.meltingLoss);
  const metalCostBase = mouldWtMetal * metalRate;
  const returnWt = mouldWtMetal*(1-M.meltingLoss) - compMetalWt * scenarios[1].goodPerMould;
  const returnCreditValue = returnWt * rateToConsider;
  const metalCostNetWithRC = metalCostBase - returnCreditValue;
  const metalCostNetWithoutRC = metalCostBase;

  const consumablesValue = M.consumables * mouldWtMetal / M.avgStdMldWt;
  const htRate = Number(input.htRate)||30;
  const htValue = compMetalWt * noPerMould * htRate;
  const powerValue = M.power * mouldWtMetal;
  const fuelValue = M.fuel * mouldWtMetal / M.avgStdMldWt;
  const labourValue = M.labour * mouldWtMetal / M.avgStdMldWt;
  const overheadValue = M.overhead * mouldWtMetal / M.avgStdMldWt;

  const leakFn = (metalNet: number) =>
    (patternWaxValue + riserWaxValue + ceramicCoreValue + shellCost + metalNet +
     consumablesValue + htValue + powerValue + fuelValue + labourValue + overheadValue) * 0.01;

  const totalCostWithRC = patternWaxValue + riserWaxValue + ceramicCoreValue + shellCost +
    metalCostNetWithRC + consumablesValue + htValue + powerValue + fuelValue + labourValue +
    overheadValue + leakFn(metalCostNetWithRC);
  const totalCostWithoutRC = patternWaxValue + riserWaxValue + ceramicCoreValue + shellCost +
    metalCostNetWithoutRC + consumablesValue + htValue + powerValue + fuelValue + labourValue +
    overheadValue + leakFn(metalCostNetWithoutRC);

  const rcPerScenarioWith = scenarios.map(s => noPerMould > 0 ? totalCostWithRC/noPerMould/(1-s.rejPct) : 0);
  const rcPerScenarioWithout = scenarios.map(s => noPerMould > 0 ? totalCostWithoutRC/noPerMould/(1-s.rejPct) : 0);

  const pfRows = (input.postFoundry??[]).map(r => {
    let perCast = 0;
    const rate = Number(r.rate)||0;
    if (r.uom==='NO') perCast = rate;
    else if (r.uom==='MD') perCast = noPerMould > 0 ? rate/noPerMould : 0;
    else if (r.uom==='KG') perCast = rate * compMetalWt;
    return { ...r, perCast };
  });
  const pfTotal = pfRows.reduce((a,r) => a + r.perCast, 0);

  const asCastWith = rcPerScenarioWith.map(rc => rc + pfTotal);
  const asCastWithout = rcPerScenarioWithout.map(rc => rc + pfTotal);

  const machRows = (input.machining??[]).map(r => {
    const machineType = MACHINE_TYPE_MAP[r.machine] ?? '';
    const ratePerHr = MACHINE_RATES[machineType] ?? 0;
    const cycle = Number(r.cycle)||0;
    const amount = (cycle/60)*ratePerHr;
    const cf = Number(r.complexity)||0;
    const addon = Number(r.addon)||0;
    const total = (amount*(cf>0?cf:1)) + addon;
    return { ...r, machineType, ratePerHr, amount, total };
  });
  const machTotal = machRows.reduce((a,r) => a+r.total, 0);
  const machRejPct = 0.03, machOhPct = 0.10;

  const machChargesFor = (asCast: number[]) => asCast.map(ac => {
    const rej = ac*machRejPct;
    const oh = (machTotal+rej)*machOhPct;
    return machTotal + rej + oh;
  });
  const machChargesWith = machChargesFor(asCastWith);
  const machChargesWithout = machChargesFor(asCastWithout);
  const finishedWith = asCastWith.map((a,i) => a+machChargesWith[i]);
  const finishedWithout = asCastWithout.map((a,i) => a+machChargesWithout[i]);
  const marginPct = M.margin||0;
  const marginWith = finishedWith.map(f => f*marginPct/(1-marginPct));
  const marginWithout = finishedWithout.map(f => f*marginPct/(1-marginPct));
  const exPriceWith = finishedWith.map((f,i) => f+marginWith[i]);
  const exPriceWithout = finishedWithout.map((f,i) => f+marginWithout[i]);
  const exRate = EXCHANGE[se.currency] ?? 1;
  const exForeignWith = exPriceWith.map(p => p/exRate);
  const exForeignWithout = exPriceWithout.map(p => p/exRate);
  const perKgWith = exPriceWith.map(p => compMetalWt > 0 ? p/compMetalWt : 0);
  const perKgWithout = exPriceWithout.map(p => compMetalWt > 0 ? p/compMetalWt : 0);

  const t = se.tooling ?? ({} as typeof se.tooling);
  const dieTotal = (Number(t.mainDie)||0)+(Number(t.settingFix)||0)+(Number(t.riserFeedDie)||0)+(Number(t.ceramicCoreDie)||0);
  const machTooling = (Number(t.machiningFix)||0)+(Number(t.machiningGauges)||0)+(Number(t.specialTooling)||0);

  return {
    compAvg, virgin, ret, rateToConsider, densityMetal, densityWax,
    mouldWtMetal, mouldWtWax, yieldPct, scenarios, riserWtFromTable,
    costRows: {
      patternWax: { qty: patternWaxWt, rate: M.patternWax, value: patternWaxValue },
      riserWax: { qty: riserWaxQty, rate: M.riserWax, value: riserWaxValue },
      ceramicCore: { qty: 0.15, rate: M.ceramicCore, value: ceramicCoreValue },
      shell: { qty: mouldWtMetal*0.6, rate: M.shellRate, value: shellCost },
      metal: { qty: mouldWtMetal, rate: metalRate, valueWith: metalCostNetWithRC, valueWithout: metalCostNetWithoutRC },
      returnCredit: { qty: returnWt, rate: rateToConsider, value: returnCreditValue },
      consumables: { rate: M.consumables, value: consumablesValue },
      ht: { qty: compMetalWt*noPerMould, rate: htRate, value: htValue },
      power: { rate: M.power, value: powerValue },
      fuel: { rate: M.fuel, value: fuelValue },
      labour: { rate: M.labour, value: labourValue },
      overhead: { rate: M.overhead, value: overheadValue },
      leakMould: { withRC: leakFn(metalCostNetWithRC), withoutRC: leakFn(metalCostNetWithoutRC) },
    },
    totalCostWithRC, totalCostWithoutRC,
    rcPerScenarioWith, rcPerScenarioWithout,
    pfRows, pfTotal, asCastWith, asCastWithout,
    machRows, machTotal, machChargesWith, machChargesWithout,
    finishedWith, finishedWithout, marginWith, marginWithout,
    exPriceWith, exPriceWithout, exForeignWith, exForeignWithout,
    perKgWith, perKgWithout, quotedWith: exPriceWith, quotedWithout: exPriceWithout,
    tooling: { dieTotal, machTooling, totalDevCost: dieTotal+machTooling },
  };
}
