// ===== UDL Product Costing — sample data extracted from Excel =====
// All values verified against Estimation_Template_Final 3.xlsx

window.UDL_DATA = {
  // ===== MASTER: Plant overheads =====
  master: {
    Nasik: {
      overhead:    { MS: 1621.88, SS: 1696.12 }, // per mould
      labour:      488,                          // per mould
      consumables: { MS: 645.02,  SS: 706.98 },  // per mould
      power:       26,                           // per kg
      fuel:        0,                            // per mould
      meltingLoss: 0.03,
      margin:      0,
      avgStdMldWt: 27,
      shellRate:   { MS: 42, SS: 45 },
      patternWax:  81.79,
      riserWax:    13.88,
      waterSolWax: 70,
      ceramicCore: 400,
    },
    Mn: {
      overhead:    { MS: 389,  SS: 389 },
      labour:      537,
      consumables: { MS: 319,  SS: 319 },
      power:       24,
      fuel:        0,
      meltingLoss: 0.03,
      margin:      0,
      avgStdMldWt: 23,
      shellRate:   { MS: 39, SS: 39 },
      patternWax:  81.81,
      riserWax:    13.82,
      waterSolWax: 70,
      ceramicCore: 400,
    }
  },

  // ===== Material density (Drop Downs A:B) =====
  density: { MS: 7.86, SS: 7.86, Aluminium: 2.7, Wax: 1.05, Copper: 8.9 },

  // ===== Riser type → weight (Drop Downs J:K) =====
  riserWeights: {
    'Star Riser': 4.021, '3V Full': 1.8, '6T': 1.9, '5T spl+1': 1.8,
    '5T-spl New': 2.405, '26E190 Riser': 2.405, '5T SPL Modified': 2.004,
    '29N01': 2.004, '1X117 MOD': 2.405, 'V5': 1.807, 'Y SHAPE RISER': 2,
    'Star Riser New': 2.335, '8T': 1.4, 'New Riser': 1.2, '26E59 RISER': 1.7,
    'NA': 0, 'V5 Long': 1.8, '22F40 MODIFIED': 2.16, '7T': 1.3
  },

  // ===== Machine Type rates (Master A37:B45) =====
  machineRates: { HMC: 1000, VMC: 650, MAKINO: 600, LMW: 180, ACE: 180, 'AMS VMC': 480 },
  machineNameToType: {
    'EC 300': 'HMC', 'EC 400 - 1': 'HMC', 'EC 400 - 2': 'HMC',
    'VF 2 - 1': 'VMC', 'VF 2 - 2': 'VMC', 'VF 2 - 3': 'VMC', 'VF 2 - 4': 'VMC', 'VF 2 - 5': 'VMC', 'VF 4 - 1': 'VMC',
    'MAKINO 01': 'MAKINO', 'MAKINO 02': 'MAKINO', 'MAKINO 03': 'MAKINO',
    'LMW 01': 'LMW', 'LMW 02': 'LMW',
    'ACE SUPER JOBBER': 'ACE', 'ACE JR 300-1': 'ACE', 'ACE JR 300-2': 'ACE',
    'VMC 350 - 1': 'AMS VMC', 'VMC 350 - 2': 'AMS VMC', 'VMC 350 - 3': 'AMS VMC', 'VMC 400 - 1': 'AMS VMC'
  },

  // ===== Exchange Rates =====
  exchange: { INR: 1, USD: 82.46, GBP: 91, EUR: 81.22 },

  // ===== Dropdown lists (verbatim from Drop Downs sheet) =====
  dropdowns: {
    materialType:     ['MS','SS','Aluminium','Wax','Copper'],
    customerType:     ['Existing','Prospective'],
    yesNo:            ['Yes','No'],
    additionalHT:     ['Induction Hardening','Hardening & Tempering','Carburising','Hardening','Nitriding'],
    supplyCondition:  ['Machined','UnMachined','Semi Finished'],
    surfaceTreatment: ['Pickling','Passivation','Bath Nitrating','Electroplating','Oiling','Sand Blast','SS.TUMBLAST & OILING','Pickling & Passivation'],
    heatTreatment:    ['Annealing','Hardening','Normalising','Solution Annealing','Tempering','Case Carburising & Tempering','Austempering','Normalising & Tempering','Normalising, Case Carburizing','Solution Annealing, Homogeniza','As cast','Quenched & Tempered','Normalising, Hardening & Tempe'],
    inspection:       ['UDL','Third Party','Outsource'],
    riser:            ['Star Riser','3V Full','6T','5T spl+1','5T-spl New','26E190 Riser','5T SPL Modified','29N01','1X117 MOD','V5','Y SHAPE RISER','Star Riser New','8T','New Riser','26E59 RISER','NA','V5 Long','22F40 MODIFIED','7T'],
    geography:        ['Domestic','Export'],
    metalCode:        ['C','Si','Cr','Mn','P','S','Ni','Cu','Mo','N','Ti'],
    plant:            ['Nasik','Mn'],
    ihos:             ['IH','OS'],
    chargeType:       ['Virgin','Return'],
    machiningOps:     ['Casting Machining','Casting Drilling','Casting Milling','Casting Tapping','Casting Deburing','Induction Hardening','Outsource'],
    machineType:      ['EC 300','EC 400 - 1','EC 400 - 2','VF 2 - 1','VF 2 - 2','VF 2 - 3','VF 2 - 4','VF 2 - 5','VF 4 - 1','MAKINO 01','MAKINO 02','MAKINO 03','LMW 01','LMW 02','ACE SUPER JOBBER','ACE JR 300-1','ACE JR 300-2','VMC 350 - 1','VMC 350 - 2','VMC 350 - 3','VMC 400 - 1'],
    postFoundryOps:   ['Mould Fettling','Mould Finishing','Casting Fettling','Casting Sandblasting','Casting Rework','Casting Pickling','Casting Passivation','Casting Setting','Casting Heat Treatment','Casting Induction Hardening','Casting Packing','Feed machining','Normalized OS','Hardening Tempering OS','Heat punching','Casting pressure testing'],
    uomOp:            ['MD','NO','KG'],
    currency:         ['INR','USD','GBP','EUR'],
    composition:      ['C','Si','Mn','P','S','Cr','Mo','Ni','Ti'],
    mech:             ['UTS','0.2% PS/YS','% Elong','Impact','R.A.','Angle Of Bend'],
  },

  // ===== Tests =====
  tests: ['Chemical Analysis','Tensile Test','Impact Test','Bend Test','Metallography','IGCT','LP/DP','Magnetic Particle','Radiography','Any other'],

  // ===== SAMPLE ESTIMATION (Item 30D — verbatim from Excel) =====
  sample: {
    salesEntry: {
      itemCode: '30D', dieCode: '30D', plant: 'Nasik', date: '16.09.2024',
      quotationNo: 'UDL/Q/2024-0931', customerType: 'Existing', domExp: 'Domestic',
      customerName: 'DISCOM', supplyCondition: 'Machined',
      partDescription: 'Down pipe Inlet casting', materialType: 'MS',
      drwNo: '82909101', material: 'ASTM A 732 2Q', uom: 'Nos', batchQty: 250000,
      compMin: { C:0.25, Si:0.20, Mn:0.70, P:0,    S:0,    Cr:0,   Mo:0,    Ni:0,   Ti:0 },
      compMax: { C:0.35, Si:1.00, Mn:1.00, P:0.045,S:0.045,Cr:0.5, Mo:0.25, Ni:0.5, Ti:0 },
      mechMin: { UTS:'', '0.2% PS/YS':'', '% Elong':'', Impact:'', 'R.A.':'', 'Angle Of Bend':'' },
      mechMax: { UTS:'', '0.2% PS/YS':'', '% Elong':'', Impact:'', 'R.A.':'', 'Angle Of Bend':'' },
      heatTreatment: 'Quenched & Tempered', surfaceTreatment: 'Oiling',
      hardness: '', additionalHT: '', inspection: 'UDL', additionalHardness: '',
      noPerMould: 10, riserType: '1X117 MOD',
      compWaxWt: 0.104, compMetalWt: 0.78, riserMetalWtManual: 16,
      targetPrice: 900, currency: 'INR',
      tooling: { mainDie: 150000, cavities: '1 cavities', settingFix: 50000,
                 riserFeedDie: 0, ceramicCoreDie: 0, machiningFix: 100000,
                 machiningGauges: 80000, specialTooling: 50000 }
    },
    // Charge metals (Return charge — verbatim)
    chargeReturn: [
      { code:'Si',  metal:'Fe Si',         rate:117,  qty:0.30 },
      { code:'Cr',  metal:'Fe Cr 0.3%',    rate:268,  qty:0.75 },
      { code:'Mo',  metal:'Fe molly',      rate:2900, qty:0    },
      { code:'Mn',  metal:'Pu Mn',         rate:177,  qty:0.80 },
      { code:'Ni',  metal:'Pu Ni',         rate:1550, qty:0    },
      { code:'C',   metal:'Acti. Carbon',  rate:103,  qty:0.10 },
      { code:'',    metal:'FeNb',          rate:3100, qty:0    },
      { code:'',    metal:'Nitrided Cr.',  rate:272,  qty:0    },
      { code:'',    metal:'MSLC',          rate:45,   qty:53   },
      { code:'',    metal:'FeTi',          rate:168,  qty:0    },
      { code:'',    metal:'C24 Return',    rate:56,   qty:45.05},
      { code:'',    metal:'',              rate:0,    qty:0    }
    ],
    chargeVirgin: Array.from({length:12}, ()=>({code:'',metal:'',rate:0,qty:0})),
    // Post-foundry ops
    postFoundry: [
      { op:'Mould Fettling',  rate:200, ihos:'OS', cycle:'', uom:'MD' },
      { op:'Mould Finishing', rate:200, ihos:'OS', cycle:'', uom:'MD' },
      { op:'Casting Setting', rate:10,  ihos:'OS', cycle:'', uom:'NO' },
      { op:'Casting Fettling',rate:5,   ihos:'OS', cycle:'', uom:'NO' },
      { op:'Feed machining',  rate:10,  ihos:'OS', cycle:'', uom:'NO' },
      { op:'Heat punching',   rate:4,   ihos:'OS', cycle:'', uom:'NO' },
    ],
    // Machining ops
    machining: [
      { op:'Casting Machining', cycle:'', machine:'VF 2 - 1', amount:0, complexity:'', addon:110 }
    ],
    // Tests applicability
    testApplicability: {
      'Chemical Analysis':{appl:'Yes',sample:1,bulk:1,rate:0},
      'Tensile Test':     {appl:'Yes',sample:1,bulk:1,rate:0},
      'Impact Test':      {appl:'No', sample:'',bulk:'',rate:0},
      'Bend Test':        {appl:'No', sample:'',bulk:'',rate:0},
      'Metallography':    {appl:'No', sample:'',bulk:'',rate:0},
      'IGCT':             {appl:'Yes',sample:'',bulk:'',rate:0},
      'LP/DP':            {appl:'No', sample:'',bulk:'',rate:0},
      'Magnetic Particle':{appl:'No', sample:'',bulk:'',rate:0},
      'Radiography':      {appl:'No', sample:'',bulk:'',rate:0},
      'Any other':        {appl:'No', sample:'',bulk:'',rate:0}
    },
  },

  // ===== Other estimations for history list =====
  history: [
    { id:'EST-2024-0931', itemCode:'30D',  customer:'DISCOM',           plant:'Nasik', mat:'MS', date:'16.09.2024', qty:250000, target:900,   quoted:804.69, status:'submitted' },
    { id:'EST-2024-0928', itemCode:'77B',  customer:'Bharat Forge',     plant:'Nasik', mat:'SS', date:'12.09.2024', qty:50000,  target:1450,  quoted:1390.20,status:'approved' },
    { id:'EST-2024-0922', itemCode:'12X',  customer:'Tata Motors',      plant:'Mn',    mat:'MS', date:'05.09.2024', qty:120000, target:560,   quoted:572.40, status:'draft'    },
    { id:'EST-2024-0917', itemCode:'KH-9', customer:'L&T Defence',      plant:'Nasik', mat:'SS', date:'29.08.2024', qty:8000,   target:3200,  quoted:3050.00,status:'approved' },
    { id:'EST-2024-0904', itemCode:'A-44', customer:'Cummins India',    plant:'Mn',    mat:'MS', date:'15.08.2024', qty:40000,  target:880,   quoted:920.10, status:'lost'     },
  ],
};
