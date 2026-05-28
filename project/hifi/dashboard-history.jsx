// ===== UDL Hi-Fi · Dashboard + History pages =====

const { useState: useStateD } = React;

window.HiFiDashboard = function HiFiDashboard({ onNavigate }) {
  const computed = window.UDL_ENGINE.compute({
    salesEntry: window.UDL_DATA.sample.salesEntry,
    chargeReturn: window.UDL_DATA.sample.chargeReturn,
    chargeVirgin: window.UDL_DATA.sample.chargeVirgin,
    postFoundry: window.UDL_DATA.sample.postFoundry,
    machining: window.UDL_DATA.sample.machining,
    tests: window.UDL_DATA.sample.testApplicability,
  });
  const c = computed.costRows;
  const total = computed.totalCostWithRC;
  const slices = [
    ['Metal (net)',  c.metal.valueWith,  '#c2410c'],
    ['Shell',        c.shell.value,      '#f59e0b'],
    ['Overhead',     c.overhead.value,   '#3b82f6'],
    ['Consumables',  c.consumables.value,'#10b981'],
    ['Labour',       c.labour.value,     '#8b5cf6'],
    ['Power',        c.power.value,      '#ef4444'],
    ['Wax+Ceramic',  c.patternWax.value+c.riserWax.value+c.ceramicCore.value,'#06b6d4'],
    ['HT',           c.ht.value,         '#84cc16'],
    ['Other',        c.leakMould.withRC, '#a1a1aa'],
  ];
  let acc = 0;
  const Icon = window.Icon;

  return (
    <div>
      <div className="kpi-row">
        <div className="kpi feature">
          <div className="k-label">Estimations YTD</div>
          <div className="k-val">218</div>
          <div className="k-sub"><span className="k-trend up">↑ 12%</span> vs last quarter</div>
        </div>
        <div className="kpi">
          <div className="k-label">Approved Value</div>
          <div className="k-val"><span className="unit">₹</span>4.21<span className="unit"> Cr</span></div>
          <div className="k-sub">63 quotations · ₹66.8L avg</div>
        </div>
        <div className="kpi">
          <div className="k-label">Avg Cycle Time</div>
          <div className="k-val">3.4<span className="unit"> d</span></div>
          <div className="k-sub"><span className="k-trend down">↓ 0.6d</span> draft → submit</div>
        </div>
        <div className="kpi">
          <div className="k-label">Win Rate</div>
          <div className="k-val">41<span className="unit">%</span></div>
          <div className="k-sub">approved / submitted</div>
        </div>
      </div>

      <div className="two-col">
        <div className="chart-card">
          <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:600}}>Cost breakdown · Item 30D</h3>
            <span className="tag" style={{marginLeft:8}}>SAMPLE</span>
            <span className="spacer"/>
            <span className="mono muted">Total ₹{window.fmtN(total)}</span>
          </div>
          <div style={{display:'flex',gap:24,alignItems:'center'}}>
            <svg viewBox="0 0 200 200" width="180" height="180" style={{flexShrink:0}}>
              <circle cx="100" cy="100" r="78" fill="none" stroke="#f4f3ee" strokeWidth="2"/>
              {slices.map(([_,val,color],i)=>{
                const a0 = (acc/total)*Math.PI*2 - Math.PI/2;
                acc += val;
                const a1 = (acc/total)*Math.PI*2 - Math.PI/2;
                const large = (a1-a0) > Math.PI ? 1 : 0;
                const r = 78;
                const x0 = 100+r*Math.cos(a0), y0 = 100+r*Math.sin(a0);
                const x1 = 100+r*Math.cos(a1), y1 = 100+r*Math.sin(a1);
                return <path key={i} d={`M100,100 L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z`} fill={color} stroke="#fff" strokeWidth="2"/>;
              })}
              <circle cx="100" cy="100" r="46" fill="#fff"/>
              <text x="100" y="92" textAnchor="middle" fontSize="10" fill="#a1a1aa" fontFamily="Geist Mono">PER MOULD</text>
              <text x="100" y="110" textAnchor="middle" fontSize="20" fill="#18181b" fontFamily="Instrument Serif" fontWeight="400">₹{window.fmtCompact(total)}</text>
            </svg>
            <div style={{flex:1,display:'flex',flexDirection:'column',gap:6,fontSize:12}}>
              {slices.map(([l,v,col],i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:10,height:10,background:col,borderRadius:2,flexShrink:0}}></span>
                  <span style={{flex:1,color:'#52525b'}}>{l}</span>
                  <span className="mono" style={{color:'#18181b',fontWeight:500}}>₹{window.fmtN(v)}</span>
                  <span className="mono" style={{color:'#a1a1aa',width:42,textAlign:'right'}}>{((v/total)*100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div style={{display:'flex',alignItems:'center',marginBottom:14}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:600}}>Quoted vs Target · last 5 quotes</h3>
            <span className="spacer"/>
            <button className="btn sm ghost" onClick={()=>onNavigate('history')}>View all <Icon name="arrow-right" size={12}/></button>
          </div>
          <svg viewBox="0 0 460 220" width="100%" height="220">
            {[0,1,2,3].map(i=><line key={i} x1="40" y1={20+i*45} x2="450" y2={20+i*45} stroke="#f4f3ee" strokeWidth="1"/>)}
            {[3500,2625,1750,875].map((v,i)=><text key={i} x="34" y={24+i*45} fontSize="10" textAnchor="end" fill="#a1a1aa" fontFamily="Geist Mono">{v.toLocaleString()}</text>)}
            {window.UDL_DATA.history.map((h,i)=>{
              const x = 60+i*78;
              const max = 3500;
              const scaleY = v => 20 + 180 * (1 - v/max);
              return (<g key={h.id}>
                <rect x={x} y={scaleY(h.target)} width="26" height={200-scaleY(h.target)} fill="#e4e4e7" rx="2"/>
                <rect x={x+30} y={scaleY(h.quoted)} width="26" height={200-scaleY(h.quoted)} fill={h.quoted <= h.target ? '#10b981' : '#f59e0b'} rx="2"/>
                <text x={x+28} y="215" fontSize="11" textAnchor="middle" fill="#52525b" fontFamily="Geist Mono">{h.itemCode}</text>
                <text x={x+28} y={scaleY(Math.max(h.target,h.quoted))-6} fontSize="9" textAnchor="middle" fill="#a1a1aa" fontFamily="Geist Mono">{(h.quoted/h.target*100).toFixed(0)}%</text>
              </g>);
            })}
          </svg>
          <div className="chart-legend">
            <span className="lg"><span className="lg-sw" style={{background:'#e4e4e7'}}></span>Target</span>
            <span className="lg"><span className="lg-sw" style={{background:'#10b981'}}></span>Quoted (≤ target)</span>
            <span className="lg"><span className="lg-sw" style={{background:'#f59e0b'}}></span>Quoted (> target)</span>
          </div>
        </div>
      </div>

      <div className="two-col" style={{marginTop:16}}>
        <div className="card">
          <div className="card-head">
            <span className="cell-stripe linked"/>
            <h3>Recent activity</h3>
            <span className="meta">last 24 hours</span>
          </div>
          <div className="card-body" style={{padding:0}}>
            {[
              ['Estimation EST-2024-0931 submitted', 'DISCOM · Item 30D · ₹804.69/pc', '12 min ago', 'submitted'],
              ['Master rate updated', 'Nasik MS Overhead → ₹1621.88', '2 hr ago', 'draft'],
              ['Quote approved', 'Bharat Forge · Item 77B', '5 hr ago', 'approved'],
              ['New estimation cloned', 'EST-2024-0928 → EST-2024-0932', '8 hr ago', 'draft'],
            ].map((r,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',borderBottom:i<3?'1px solid #e4e4e7':'none'}}>
                <span className={`status ${r[3]}`}><span className="dot"/></span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500}}>{r[0]}</div>
                  <div style={{fontSize:11.5,color:'#52525b',fontFamily:'Geist Mono',marginTop:2}}>{r[1]}</div>
                </div>
                <span className="mono" style={{color:'#a1a1aa',fontSize:11}}>{r[2]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <span className="cell-stripe input"/>
            <h3>Quick actions</h3>
          </div>
          <div className="card-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              <button className="btn brand" style={{justifyContent:'flex-start',padding:'14px',height:'auto',flexDirection:'column',alignItems:'flex-start',gap:4}} onClick={()=>onNavigate('salesentry')}>
                <span style={{display:'flex',alignItems:'center',gap:6,fontWeight:600}}><window.Icon name="plus" size={14}/> New Estimation</span>
                <span style={{fontSize:11,fontWeight:400,opacity:0.85}}>Start fresh from Sales Entry</span>
              </button>
              <button className="btn" style={{justifyContent:'flex-start',padding:'14px',height:'auto',flexDirection:'column',alignItems:'flex-start',gap:4}} onClick={()=>onNavigate('estimation')}>
                <span style={{display:'flex',alignItems:'center',gap:6,fontWeight:600}}><window.Icon name="sigma" size={14}/> Open Sample (30D)</span>
                <span style={{fontSize:11,fontWeight:400,color:'#52525b'}}>Pre-filled · DISCOM</span>
              </button>
              <button className="btn" style={{justifyContent:'flex-start',padding:'14px',height:'auto',flexDirection:'column',alignItems:'flex-start',gap:4}} onClick={()=>onNavigate('history')}>
                <span style={{display:'flex',alignItems:'center',gap:6,fontWeight:600}}><window.Icon name="copy" size={14}/> Clone Estimation</span>
                <span style={{fontSize:11,fontWeight:400,color:'#52525b'}}>Reuse existing as template</span>
              </button>
              <button className="btn" style={{justifyContent:'flex-start',padding:'14px',height:'auto',flexDirection:'column',alignItems:'flex-start',gap:4}} onClick={()=>onNavigate('master')}>
                <span style={{display:'flex',alignItems:'center',gap:6,fontWeight:600}}><window.Icon name="database" size={14}/> Master Rates</span>
                <span style={{fontSize:11,fontWeight:400,color:'#52525b'}}>Plant overheads + machines</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.HiFiHistory = function HiFiHistory({ onOpen }) {
  const D = window.UDL_DATA;
  const Icon = window.Icon;
  const [filter, setFilter] = useStateD({plant:'all',status:'all'});
  const rows = D.history.filter(h =>
    (filter.plant === 'all' || h.plant === filter.plant) &&
    (filter.status === 'all' || h.status === filter.status));
  return (
    <div>
      <div className="toolbar">
        <div className="search">
          <Icon name="search" size={14} />
          <input placeholder="Search by item, customer, drw no…"/>
        </div>
        <select className="select" style={{width:140}} value={filter.plant} onChange={e=>setFilter({...filter,plant:e.target.value})}>
          <option value="all">All plants</option><option>Nasik</option><option>Mn</option>
        </select>
        <select className="select" style={{width:140}} value={filter.status} onChange={e=>setFilter({...filter,status:e.target.value})}>
          <option value="all">All status</option><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="approved">Approved</option><option value="lost">Lost</option>
        </select>
        <span className="spacer"/>
        <button className="btn sm"><Icon name="compare" size={12}/> Compare</button>
        <button className="btn sm"><Icon name="copy" size={12}/> Clone</button>
        <button className="btn brand sm"><Icon name="plus" size={12}/> New Estimation</button>
      </div>

      <div className="table-wrap">
        <table className="dtable">
          <thead><tr>
            <th>Estimation ID</th><th>Item</th><th>Customer</th><th>Plant</th><th>Mat</th><th>Date</th>
            <th className="num">Qty</th><th className="num">Target ₹</th><th className="num">Quoted ₹</th><th className="num">Δ%</th><th>Status</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(h => {
              const delta = ((h.quoted-h.target)/h.target*100);
              return (
                <tr key={h.id} style={{cursor:'pointer'}} onClick={()=>onOpen('estimation')}>
                  <td><span className="mono" style={{color:'#18181b',fontWeight:500}}>{h.id}</span></td>
                  <td className="label-cell">{h.itemCode}</td>
                  <td>{h.customer}</td>
                  <td><span className="tag">{h.plant}</span></td>
                  <td><span className="mono">{h.mat}</span></td>
                  <td><span className="mono muted">{h.date}</span></td>
                  <td className="num">{h.qty.toLocaleString('en-IN')}</td>
                  <td className="num">{h.target.toFixed(2)}</td>
                  <td className="num" style={{fontWeight:600}}>{h.quoted.toFixed(2)}</td>
                  <td className="num" style={{color: delta<=0?'#16a34a':'#dc2626'}}>{delta>0?'+':''}{delta.toFixed(1)}%</td>
                  <td><span className={`status ${h.status}`}><span className="dot"/>{h.status}</span></td>
                  <td><button className="btn sm ghost" onClick={(e)=>{e.stopPropagation();onOpen('estimation')}}>Open <Icon name="arrow-right" size={11}/></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:14,display:'flex',alignItems:'center',gap:14,fontSize:12,color:'#52525b'}}>
        <span className="mono">Showing {rows.length} of {D.history.length}</span>
        <span className="spacer"/>
        <button className="btn sm ghost" disabled>← Prev</button>
        <button className="btn sm ghost">Next →</button>
      </div>
    </div>
  );
};
