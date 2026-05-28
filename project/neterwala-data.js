// ===== Neterwala Group Product Estimation Platform — extended data =====
// Adds companies, plants, processes, scenarios, versions, workflow, roles
// Sits next to data.js — does not modify it.

window.NW_DATA = {
  companies: [
    { code: 'UDL',  name: 'Uni Deritend Limited',         color: '#d97757', process: 'Investment Casting',         plants: ['Nasik','Aurangabad'] },
    { code: 'UTPL', name: 'Uni Tritech Limited',          color: '#5b8def', process: 'Forging & Machining',        plants: ['Pune'] },
    { code: 'UAL',  name: 'Uni Abex Limited',             color: '#7a9e3f', process: 'Heavy Sand Casting',         plants: ['Pune','Solapur'] },
    { code: 'UAML', name: 'Uni Advanced Materials Ltd',   color: '#8e6db1', process: 'Refractory & Alloy',         plants: ['Aurangabad'] },
    { code: 'TGUK', name: 'TG UK',                        color: '#c14b78', process: 'Investment Casting (UK)',    plants: ['Coventry'] },
  ],

  // Per-plant rate masters. Same product, different cost outputs.
  plants: {
    Nasik:       { co:'UDL',  ccy:'INR', mc: 920,  lab: 488,  pwr: 26,  ovh: 1622, fuel: 240, scr: 0.20, yld: 0.62, ml: 0.030, currency:'₹' },
    Aurangabad:  { co:'UDL',  ccy:'INR', mc: 880,  lab: 462,  pwr: 24,  ovh: 1480, fuel: 220, scr: 0.18, yld: 0.65, ml: 0.028, currency:'₹' },
    Pune:        { co:'UTPL', ccy:'INR', mc:1240,  lab: 612,  pwr: 31,  ovh: 1980, fuel: 310, scr: 0.12, yld: 0.78, ml: 0.020, currency:'₹' },
    Solapur:     { co:'UAL',  ccy:'INR', mc:1080,  lab: 540,  pwr: 28,  ovh: 1810, fuel: 280, scr: 0.22, yld: 0.58, ml: 0.035, currency:'₹' },
    Coventry:    { co:'TGUK', ccy:'GBP', mc:  64,  lab:  48,  pwr:  9,  ovh:  121, fuel:  18, scr: 0.15, yld: 0.71, ml: 0.025, currency:'£' },
  },

  // Process catalog (configurable, no-code)
  processes: [
    { code:'IC',  name:'Investment Casting', stages:['Wax pattern','Shell build','Dewax','Melting','Pouring','Knockout','Heat treatment','Machining','Inspection'] },
    { code:'FG',  name:'Forging',            stages:['Billet cut','Heating','Forging press','Trimming','Heat treatment','Machining','Inspection'] },
    { code:'SC',  name:'Sand Casting',       stages:['Pattern','Moulding','Melting','Pouring','Shake-out','Fettling','Heat treatment','Machining','Inspection'] },
    { code:'RF',  name:'Refractory Processing', stages:['Batch prep','Mixing','Forming','Curing','Firing','QA'] },
  ],

  // Standardized cost structure (lines that always show, plant-driven amounts)
  costStructure: [
    { k:'rm',    label:'Raw material (alloy/grade)' },
    { k:'bo',    label:'Bought-out components' },
    { k:'lab',   label:'Labour' },
    { k:'mc',    label:'Machine cost' },
    { k:'en',    label:'Energy / utilities' },
    { k:'cons',  label:'Consumables' },
    { k:'ovhF',  label:'Overheads — fixed' },
    { k:'ovhV',  label:'Overheads — variable' },
    { k:'scr',   label:'Scrap & rejection' },
    { k:'rw',    label:'Rework' },
    { k:'log',   label:'Logistics (optional)' },
  ],

  // Versioning
  versions: [
    { id:'V1', label:'RFQ',         date:'02 May 2026', by:'A. Salunke (Sales)',   price:2840, status:'submitted', note:'Initial RFQ from customer.' },
    { id:'V2', label:'Negotiation', date:'09 May 2026', by:'R. Tendulkar (Sales)', price:2720, status:'submitted', note:'After 1st commercial round.' },
    { id:'V3', label:'Final',       date:'17 May 2026', by:'S. Banerjee (Fin)',    price:2675, status:'approved',  note:'Approved by Finance head.' },
  ],

  // Scenarios (what-if simulations)
  scenarios: [
    { id:'baseline',  label:'Baseline',                vars:'as-quoted',           dP:0,    dM:0,    dY:0,    note:'Plant: Nasik · MS · 20% rej.' },
    { id:'matUp',     label:'Material +8%',            vars:'Ni 4.0 ↑',            dP:+8.0, dM:+5.4, dY:0,    note:'Alloy price spike scenario.' },
    { id:'yldUp',     label:'Yield +5pp',              vars:'62 → 67%',            dP:-4.2, dM:-4.2, dY:+5,   note:'Process improvement target.' },
    { id:'plantPune', label:'Shift to Pune (UTPL)',    vars:'forge vs cast',       dP:-11.3,dM:0,    dY:+16,  note:'Process change — capability check needed.' },
    { id:'plantCov',  label:'Shift to Coventry (TGUK)',vars:'£→₹ @ 105',           dP:+22.5,dM:0,    dY:+9,   note:'Export customer · UK lead time.' },
  ],

  // Workflow stages (RFQ → Estimate → Validate → Approve → Quote)
  workflowStages: [
    { k:'rfq',   title:'RFQ Intake',       owner:'Sales',       sla:'1 d', icon:'✉' },
    { k:'est',   title:'Estimate',         owner:'Sales / Eng', sla:'2 d', icon:'∑' },
    { k:'bom',   title:'Validate BOM/Route', owner:'Engineering', sla:'1 d', icon:'⌬' },
    { k:'fin',   title:'Validate Costing', owner:'Finance',     sla:'1 d', icon:'₹' },
    { k:'apv',   title:'Approve',          owner:'CIO / PMO',   sla:'0.5 d', icon:'✓' },
    { k:'qte',   title:'Quote to customer',owner:'Sales',       sla:'auto', icon:'↗' },
  ],

  // Sample RFQ pipeline rows
  pipeline: [
    { id:'RFQ-26-0418', item:'30D Impeller',   co:'UDL',  plant:'Nasik',      customer:'Atlas Copco', stage:'fin',  age:'2 d',   amt:'₹ 8.4 L' },
    { id:'RFQ-26-0421', item:'Turbo Housing',  co:'UTPL', plant:'Pune',       customer:'BHEL',        stage:'bom',  age:'4 d',   amt:'₹ 22 L'  },
    { id:'RFQ-26-0422', item:'Mill Liner',     co:'UAL',  plant:'Solapur',    customer:'Hindustan Z', stage:'est',  age:'1 d',   amt:'₹ 1.1 Cr'},
    { id:'RFQ-26-0423', item:'Pump Body',      co:'UDL',  plant:'Aurangabad', customer:'KSB',         stage:'rfq',  age:'<1 d',  amt:'₹ 6.2 L' },
    { id:'RFQ-26-0424', item:'Refractory Liner',co:'UAML',plant:'Aurangabad', customer:'Tata Steel',  stage:'apv',  age:'5 d',   amt:'₹ 18 L'  },
    { id:'RFQ-26-0425', item:'Aero Bracket',   co:'TGUK', plant:'Coventry',   customer:'Rolls-Royce', stage:'fin',  age:'3 d',   amt:'£ 14 k'  },
    { id:'RFQ-26-0419', item:'Pump Impeller',  co:'UDL',  plant:'Nasik',      customer:'Kirloskar',   stage:'qte',  age:'done',  amt:'₹ 11 L'  },
  ],

  // Roles & responsibilities
  roles: [
    { role:'Sales',        who:'A. Salunke',   resp:'Create estimation', perms:'Create RFQ · Edit Sales Entry · Submit', color:'#fff59d' },
    { role:'Engineering',  who:'P. Joshi',     resp:'Validate BOM & routing', perms:'Edit BOM · Edit Routing · Approve technical', color:'#bbdefb' },
    { role:'Finance',      who:'S. Banerjee',  resp:'Validate costing', perms:'View rates · Approve commercial · Lock version', color:'#c8e6c9' },
    { role:'Plant',        who:'R. Patil',     resp:'Maintain rate masters', perms:'Edit plant rates · Upload SAP refresh', color:'#ffcc80' },
    { role:'CIO / PMO',    who:'V. Mehta',     resp:'Platform governance', perms:'All · Audit · Configuration · Role mgmt', color:'#ce93d8' },
  ],

  // Approval log (sample)
  auditLog: [
    { ts:'17 May · 14:22', actor:'S. Banerjee',  action:'Approved V3 final',          item:'30D Impeller' },
    { ts:'17 May · 11:08', actor:'P. Joshi',     action:'Validated BOM + routing',    item:'30D Impeller' },
    { ts:'09 May · 16:55', actor:'R. Tendulkar', action:'Submitted V2 (negotiation)', item:'30D Impeller' },
    { ts:'09 May · 10:11', actor:'System',       action:'SAP refresh — 2,481 items',  item:'Nasik plant' },
    { ts:'02 May · 09:34', actor:'A. Salunke',   action:'Created V1 (RFQ)',           item:'30D Impeller' },
  ],

  // SAP touchpoints
  sap: {
    inbound:  ['Material Master (MM)', 'Bill of Material (BOM)', 'Routing', 'Work Center Rates (KP26)', 'Activity Types', 'Exchange Rates'],
    outbound: ['Cost Estimate (CK11N equiv.)', 'Standard Price Ref.', 'Quotation header → SD'],
    systems:  [
      { sys:'SAP S/4HANA',   role:'Source of truth · masters',  status:'live'    },
      { sys:'Databricks',    role:'Actual vs estimate (future)',status:'planned' },
      { sys:'MES (Plant)',   role:'Actual yield, cycle (future)',status:'planned' },
      { sys:'Agentic RFQ',   role:'Auto-fill from customer PDF',status:'pilot'   },
    ],
  },

  // Dashboard tiles
  groupKpis: [
    { label:'Open RFQs',        val:'47',       sub:'across 5 cos' },
    { label:'Estimations MTD',  val:'132',      sub:'+18% vs Apr'  },
    { label:'Avg cycle',        val:'2.8 d',    sub:'RFQ → quote'  },
    { label:'Win rate',         val:'38%',      sub:'group avg'    },
    { label:'Approved value',   val:'₹ 6.1 Cr', sub:'this quarter' },
    { label:'Plants live',      val:'5 / 5',    sub:'all rate-mastered' },
  ],
};
