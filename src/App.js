import{useState,useEffect,useCallback}from"react";
import{dbLoad,dbSave}from"./supabase";
const fmt=(n,d=2)=>(Number(n)||0).toFixed(d);
const fmtUSD=n=>"$"+fmt(n);
const today=()=>new Date().toISOString().split("T")[0];
const uid=()=>Math.random().toString(36).slice(2,8).toUpperCase();
const daysAgo=d=>!d?999:Math.floor((new Date()-new Date(d))/86400000);
const P=[{id:"P001",name:"Atlantic Salmon Whole",caseQty:40,costPerLb:4.85,pricePerLb:7.50,zone:"Cooler"},{id:"P002",name:"Atlantic Salmon Fillet",caseQty:10,costPerLb:9.20,pricePerLb:13.50,zone:"Cooler"},{id:"P003",name:"Salmon Trim",caseQty:10,costPerLb:3.10,pricePerLb:5.00,zone:"Cooler"},{id:"P004",name:"Shrimp 16/20",caseQty:10,costPerLb:8.40,pricePerLb:12.00,zone:"Frozen"},{id:"P005",name:"Cod Fillet",caseQty:25,costPerLb:5.60,pricePerLb:8.75,zone:"Cooler"},{id:"P006",name:"Tuna Loin YF#1",caseQty:20,costPerLb:11.50,pricePerLb:17.00,zone:"Cooler"},{id:"P007",name:"Lobster Tail 6oz",caseQty:24,costPerLb:22.00,pricePerLb:32.00,zone:"Frozen"},{id:"P008",name:"Scallops 10/20",caseQty:10,costPerLb:14.20,pricePerLb:20.00,zone:"Cooler"}];
const IV=[{id:"I1",productId:"P001",qtyLbs:320,qtyCases:8,lot:"L001",expDate:"2026-06-15"},{id:"I2",productId:"P002",qtyLbs:140,qtyCases:14,lot:"L002",expDate:"2026-06-18"},{id:"I3",productId:"P003",qtyLbs:60,qtyCases:6,lot:"L003",expDate:"2026-06-18"},{id:"I4",productId:"P004",qtyLbs:200,qtyCases:20,lot:"L004",expDate:"2026-12-15"},{id:"I5",productId:"P005",qtyLbs:175,qtyCases:7,lot:"L005",expDate:"2026-06-12"},{id:"I6",productId:"P006",qtyLbs:80,qtyCases:4,lot:"L006",expDate:"2026-06-10"},{id:"I7",productId:"P007",qtyLbs:144,qtyCases:6,lot:"L007",expDate:"2026-11-10"},{id:"I8",productId:"P008",qtyLbs:90,qtyCases:9,lot:"L008",expDate:"2026-06-08"}];
const RP=[{id:"R001",name:"Manager",role:"manager",color:"#2e8b57"},{id:"R002",name:"Rep 1",role:"rep",color:"#4a9eda"},{id:"R003",name:"Rep 2",role:"rep",color:"#d4800a"}];
const CU=[{id:"C001",name:"Harbor View Restaurant",contact:"Mike Chen",phone:"617-555-0101",creditLimit:15000,balance:4200,repId:"R002",lastOrderDate:"2026-05-25"},{id:"C002",name:"Blue Ocean Bistro",contact:"Sarah Lamb",phone:"617-555-0102",creditLimit:8000,balance:1100,repId:"R002",lastOrderDate:"2026-05-10"},{id:"C003",name:"Fishermans Wharf Grille",contact:"Tom Reyes",phone:"508-555-0103",creditLimit:20000,balance:7800,repId:"R003",lastOrderDate:"2026-05-28"},{id:"C004",name:"Neptune Seafood Market",contact:"Dana Price",phone:"781-555-0104",creditLimit:25000,balance:2300,repId:"R003",lastOrderDate:"2026-05-20"},{id:"C005",name:"Coastal Kitchen",contact:"Jess Moore",phone:"508-555-0105",creditLimit:5000,balance:890,repId:"R002",lastOrderDate:"2026-04-30"}];
const OR=[{id:"ORD-001",customerId:"C001",repId:"R002",date:"2026-05-25",status:"Invoiced",lines:[{productId:"P002",qty:20,price:13.50},{productId:"P008",qty:10,price:20.00}]},{id:"ORD-002",customerId:"C003",repId:"R003",date:"2026-05-28",status:"Pending",lines:[{productId:"P001",qty:80,price:7.50},{productId:"P004",qty:20,price:12.00}]},{id:"ORD-003",customerId:"C002",repId:"R002",date:"2026-05-10",status:"Invoiced",lines:[{productId:"P005",qty:25,price:8.75},{productId:"P006",qty:10,price:17.00}]}];
const VN=[{id:"V001",name:"Atlantic Seafood Co",contact:"Bill Murray",phone:"207-555-0201",terms:"Net 30",balance:12400,dueDate:"2026-06-05"},{id:"V002",name:"Gulf Shrimp Distributors",contact:"Ray Tanner",phone:"985-555-0202",terms:"Net 15",balance:4800,dueDate:"2026-06-02"},{id:"V003",name:"Pacific Tuna Inc",contact:"Kenji Mori",phone:"310-555-0203",terms:"Net 30",balance:8900,dueDate:"2026-06-18"}];
const CSS=`*{box-sizing:border-box;margin:0;padding:0;}body{background:#0f1117;color:#e8e6e0;font-family:'DM Mono','Courier New',monospace;}input,select{font-family:inherit;background:#1a1d26;border:1px solid #2a2d3a;color:#e8e6e0;padding:8px 12px;border-radius:4px;outline:none;width:100%;}input:focus,select:focus{border-color:#2e8b57;}button{cursor:pointer;font-family:inherit;}.btn{padding:8px 16px;border:none;border-radius:4px;font-size:12px;text-transform:uppercase;letter-spacing:0.05em;}.bp{background:#2e8b57;color:#fff;}.bg{background:transparent;color:#8a9bb0;border:1px solid #2a2d3a;}.card{background:#1a1d26;border:1px solid #2a2d3a;border-radius:6px;padding:20px;}table{width:100%;border-collapse:collapse;font-size:12px;}th{text-align:left;padding:8px 12px;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6b80;border-bottom:1px solid #2a2d3a;}td{padding:10px 12px;border-bottom:1px solid #1e2130;}tr:hover td{background:#1e2230;}.ov{position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}.mod{background:#1a1d26;border:1px solid #2e8b57;border-radius:8px;padding:28px;min-width:380px;max-width:90vw;max-height:90vh;overflow-y:auto;}.lbl{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#5a6b80;margin-bottom:6px;display:block;}.fld{margin-bottom:16px;}.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}.sc{background:#1a1d26;border:1px solid #2a2d3a;border-radius:6px;padding:20px;}.pg{padding:28px;overflow-y:auto;flex:1;height:100%;}.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:8px;}.tt{font-family:'Bebas Neue',cursive;font-size:26px;letter-spacing:0.05em;margin-bottom:16px;}.tg{display:inline-block;padding:2px 8px;border-radius:3px;font-size:10px;text-transform:uppercase;font-weight:500;}`;

export default function App(){
  const[nav,setNav]=useState("dash");
  const[rep,setRep]=useState(RP[0]);
  const[loading,setLoading]=useState(true);
  const[products,setProducts]=useState([]);
  const[inventory,setInventory]=useState([]);
  const[orders,setOrders]=useState([]);
  const[customers,setCustomers]=useState([]);
  const[vendors,setVendors]=useState([]);

  useEffect(()=>{
    (async()=>{
      try{
        const[p,iv,o,c,v]=await Promise.all([dbLoad("products"),dbLoad("inventory"),dbLoad("orders"),dbLoad("customers"),dbLoad("alerts")]);
        if(!p.length){await dbSave("products",P);setProducts(P);}else setProducts(p);
        if(!iv.length){await dbSave("inventory",IV);setInventory(IV);}else setInventory(iv);
        if(!o.length){await dbSave("orders",OR);setOrders(OR);}else setOrders(o);
        if(!c.length){await dbSave("customers",CU);setCustomers(CU);}else setCustomers(c);
        if(!v.length){await dbSave("alerts",VN);setVendors(VN);}else setVendors(v);
      }catch(e){setProducts(P);setInventory(IV);setOrders(OR);setCustomers(CU);setVendors(VN);}
      setLoading(false);
    })();
  },[]);

  const sync=useCallback((t,d)=>dbSave(t,d),[]);
  const ss=(set,t)=>v=>set(prev=>{const next=typeof v==="function"?v(prev):v;sync(t,next);return next;});
  const gp=id=>products.find(x=>x.id===id);
  const gi=id=>inventory.find(x=>x.productId===id)||{qtyLbs:0,qtyCases:0};

  const alerts=[];
  customers.forEach(c=>{
    const d=daysAgo(c.lastOrderDate);
    if(d>=14)alerts.push({level:d>=21?"red":"yellow",name:c.name,contact:c.contact,phone:c.phone,msg:"No order in "+d+" days",repId:c.repId});
    const u=c.creditLimit>0?c.balance/c.creditLimit:0;
    if(u>=0.85)alerts.push({level:"red",name:c.name,contact:c.contact,phone:c.phone,msg:"Credit at "+Math.round(u*100)+"%",repId:c.repId});
  });
  vendors.forEach(v=>{
    const d=Math.ceil((new Date(v.dueDate)-new Date())/86400000);
    if(d<=7)alerts.push({level:d<=3?"red":"yellow",name:v.name,contact:v.contact,phone:v.phone,msg:"Payment "+fmtUSD(v.balance)+" due in "+d+" days"});
  });

  const myAlerts=rep.role==="manager"?alerts:alerts.filter(a=>!a.repId||a.repId===rep.id);

  const sp={products,setProducts:ss(setProducts,"products"),inventory,setInventory:ss(setInventory,"inventory"),orders,setOrders:ss(setOrders,"orders"),customers,setCustomers:ss(setCustomers,"customers"),vendors,setVendors:ss(setVendors,"alerts"),gp,gi,rep,alerts,myAlerts,reps:RP};

  if(loading)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#0f1117",flexDirection:"column",gap:16}}><style>{CSS}</style><link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Bebas+Neue&display=swap" rel="stylesheet"/><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:36,color:"#2e8b57"}}>JV FOODS HOMEBASE</div><div style={{color:"#5a6b80",fontSize:12}}>Connecting...</div></div>);

  const navItems=[{id:"dash",l:"Dashboard"},{id:"alerts",l:"Alerts"+(myAlerts.length?" ("+myAlerts.length+")":"")},{id:"accounts",l:"My Accounts"},{id:"inv",l:"Inventory"},{id:"orders",l:"Orders"},{id:"customers",l:"Customers"},{id:"vendors",l:"Vendors"},{id:"reports",l:"Reports"}];

  return(
    <div style={{display:"flex",height:"100vh",background:"#0f1117",color:"#e8e6e0",overflow:"hidden"}}>
      <style>{CSS}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400&family=Bebas+Neue&display=swap" rel="stylesheet"/>
      <div style={{width:200,background:"#13151e",borderRight:"1px solid #2a2d3a",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{padding:"20px 16px",borderBottom:"1px solid #2a2d3a"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:20,color:"#2e8b57"}}>JV FOODS</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:13,color:"#4a9eda"}}>HOMEBASE</div>
        </div>
        <div style={{padding:"10px 12px",borderBottom:"1px solid #2a2d3a"}}>
          <div className="lbl">Logged in as</div>
          <select value={rep.id} onChange={e=>setRep(RP.find(r=>r.id===e.target.value))} style={{fontSize:11,padding:"6px 8px"}}>
            {RP.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <nav style={{flex:1,padding:"8px 0"}}>
          {navItems.map(item=>(
            <button key={item.id} onClick={()=>setNav(item.id)} style={{width:"100%",display:"flex",alignItems:"center",padding:"9px 16px",background:nav===item.id?"#1a2e20":"transparent",color:nav===item.id?"#2e8b57":item.id==="alerts"&&myAlerts.length?"#d4800a":"#8a9bb0",border:"none",borderLeft:nav===item.id?"2px solid #2e8b57":"2px solid transparent",fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"left"}}>{item.l}</button>
          ))}
        </nav>
        <div style={{padding:"12px 16px",borderTop:"1px solid #2a2d3a",fontSize:10,color:"#2e8b57"}}>● Live — JV Foods</div>
      </div>
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {nav==="dash"&&<Dash {...sp}/>}
        {nav==="alerts"&&<Alerts {...sp}/>}
        {nav==="accounts"&&<Accounts {...sp}/>}
        {nav==="inv"&&<Inv {...sp}/>}
        {nav==="orders"&&<Orders {...sp}/>}
        {nav==="customers"&&<Custs {...sp}/>}
        {nav==="vendors"&&<Vends {...sp}/>}
        {nav==="reports"&&<Repts {...sp}/>}
      </div>
    </div>
  );
}

function Dash({products,inventory,orders,customers,vendors,myAlerts,gi}){
  const tc=inventory.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?i.qtyLbs*p.costPerLb:0);},0);
  const tr=inventory.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?i.qtyLbs*p.pricePerLb:0);},0);
  const pend=orders.filter(o=>o.status==="Pending");
  const tar=customers.reduce((s,c)=>s+(c.balance||0),0);
  const tap=vendors.reduce((s,v)=>s+(v.balance||0),0);
  return(
    <div className="pg">
      <div className="tt">Operations Dashboard</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
        {[{l:"Inventory @ Cost",v:fmtUSD(tc),a:"#2e8b57"},{l:"Inventory @ Retail",v:fmtUSD(tr),a:"#4a9eda"},{l:"Pending Orders",v:pend.length,a:"#d4800a"},{l:"Total A/R",v:fmtUSD(tar),a:"#9b59b6"},{l:"Total A/P",v:fmtUSD(tap),a:"#c0392b"}].map(k=>(
          <div key={k.l} className="sc" style={{borderTop:"3px solid "+k.a}}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:k.a}}>{k.v}</div>
            <div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase",marginTop:4}}>{k.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        <div className="card">
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,marginBottom:12}}>Active Alerts</div>
          {myAlerts.length===0&&<div style={{color:"#5a6b80",fontSize:12}}>All clear</div>}
          {myAlerts.slice(0,5).map((a,i)=>(
            <div key={i} style={{background:a.level==="red"?"#2d0d0d":"#2d1a00",borderLeft:"3px solid "+(a.level==="red"?"#c0392b":"#d4800a"),padding:"10px 14px",borderRadius:"0 4px 4px 0",marginBottom:8,fontSize:12}}>
              <span style={{color:a.level==="red"?"#c0392b":"#d4800a",fontWeight:600}}>{a.name}</span> — {a.msg}
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,marginBottom:12}}>Pending Orders</div>
          {pend.length===0&&<div style={{color:"#5a6b80",fontSize:12}}>All clear</div>}
          <table><thead><tr><th>Order</th><th>Customer</th><th>Total</th></tr></thead>
            <tbody>{pend.map(o=>{const c=customers.find(x=>x.id===o.customerId);return(<tr key={o.id}><td style={{color:"#4a9eda"}}>{o.id}</td><td>{c?.name}</td><td>{fmtUSD(o.lines.reduce((s,l)=>s+l.qty*l.price,0))}</td></tr>);})}</tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,marginBottom:12}}>Inventory Snapshot</div>
        <table><thead><tr><th>Product</th><th>Zone</th><th>On Hand</th><th>Cost/lb</th><th>Margin</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>{products.map(p=>{const inv=gi(p.id);const m=p.pricePerLb>0?((p.pricePerLb-p.costPerLb)/p.pricePerLb*100):0;const low=inv.qtyLbs<p.caseQty*2;const days=inv.expDate?Math.ceil((new Date(inv.expDate)-new Date())/86400000):999;return(<tr key={p.id}><td style={{fontWeight:500}}>{p.name}</td><td style={{color:p.zone==="Frozen"?"#4a9eda":"#2e8b57",fontSize:11}}>{p.zone}</td><td style={{color:low?"#d4800a":"#e8e6e0"}}>{fmt(inv.qtyLbs)} lbs</td><td>{fmtUSD(p.costPerLb)}</td><td style={{color:m>30?"#2e8b57":m>15?"#d4800a":"#c0392b"}}>{fmt(m)}%</td><td style={{color:days<=7?"#c0392b":days<=14?"#d4800a":"#5a6b80",fontSize:11}}>{inv.expDate||"—"}</td><td style={{color:low?"#d4800a":"#2e8b57",fontSize:11}}>{low?"LOW":"OK"}</td></tr>);})}</tbody>
        </table>
      </div>
    </div>
  );
}

function Alerts({myAlerts}){
  return(
    <div className="pg">
      <div className="tt">Alert Center</div>
      <div style={{color:"#5a6b80",fontSize:11,marginBottom:24}}>{myAlerts.length} active alerts</div>
      {myAlerts.length===0&&<div className="card" style={{textAlign:"center",padding:60}}><div style={{fontSize:40,marginBottom:12}}>✅</div><div style={{color:"#2e8b57",fontFamily:"'Bebas Neue',cursive",fontSize:22}}>All Clear</div></div>}
      {myAlerts.map((a,i)=>(
        <div key={i} style={{background:a.level==="red"?"#2d0d0d":"#2d1a00",border:"1px solid "+(a.level==="red"?"#c0392b":"#d4800a"),borderRadius:6,padding:"14px 18px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontWeight:600,color:"#e8e6e0",marginBottom:4}}>{a.name}</div>
            <div style={{color:a.level==="red"?"#c0392b":"#d4800a",fontSize:12}}>{a.msg}</div>
            {a.contact&&<div style={{color:"#5a6b80",fontSize:11,marginTop:4}}>{a.contact} · {a.phone}</div>}
          </div>
          <span style={{color:a.level==="red"?"#c0392b":"#d4800a",fontSize:10,textTransform:"uppercase",fontWeight:600}}>{a.level==="red"?"URGENT":"WARNING"}</span>
        </div>
      ))}
    </div>
  );
}

function Accounts({customers,orders,rep,reps}){
  const[selRep,setSelRep]=useState(rep.id);
  const rc=customers.filter(c=>selRep==="all"?true:c.repId===selRep);
  const dormant=rc.filter(c=>daysAgo(c.lastOrderDate)>=14).length;
  const rev=rc.reduce((s,c)=>{const co=orders.filter(o=>o.customerId===c.id);return s+co.reduce((ss,o)=>ss+o.lines.reduce((sss,l)=>sss+l.qty*l.price,0),0);},0);
  return(
    <div className="pg">
      <div className="sh">
        <div className="tt" style={{marginBottom:0}}>{rep.role==="manager"?"All Accounts":rep.name+"'s Accounts"}</div>
        {rep.role==="manager"&&<select value={selRep} onChange={e=>setSelRep(e.target.value)} style={{fontSize:12,width:"auto"}}><option value="all">All Reps</option>{reps.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        <div className="sc" style={{borderTop:"3px solid #2e8b57"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28}}>{rc.length}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Accounts</div></div>
        <div className="sc" style={{borderTop:"3px solid #4a9eda"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28}}>{fmtUSD(rev)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Revenue</div></div>
        <div className="sc" style={{borderTop:"3px solid #d4800a"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:dormant>0?"#d4800a":"#2e8b57"}}>{dormant}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Dormant 14+ days</div></div>
      </div>
      <div className="card">
        <table><thead><tr><th>Customer</th><th>Last Order</th><th>Status</th><th>Balance</th><th>Credit %</th></tr></thead>
          <tbody>{rc.map(c=>{const d=daysAgo(c.lastOrderDate);const sc=d>=21?"#c0392b":d>=14?"#d4800a":"#2e8b57";const sl=d>=21?"COLD":d>=14?"DORMANT":"ACTIVE";const u=c.creditLimit>0?(c.balance/c.creditLimit*100):0;return(<tr key={c.id}><td style={{fontWeight:500}}>{c.name}<br/><span style={{color:"#5a6b80",fontSize:10}}>{c.contact} · {c.phone}</span></td><td style={{fontSize:11}}>{c.lastOrderDate||"Never"}<br/><span style={{color:sc,fontSize:10}}>{d} days ago</span></td><td><span style={{color:sc,fontSize:10,fontWeight:600}}>{sl}</span></td><td style={{color:u>=85?"#c0392b":"#e8e6e0"}}>{fmtUSD(c.balance)}</td><td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:50,height:5,background:"#2a2d3a",borderRadius:2}}><div style={{width:Math.min(u,100)+"%",height:"100%",background:u>=85?"#c0392b":u>=65?"#d4800a":"#2e8b57",borderRadius:2}}></div></div><span style={{fontSize:10}}>{fmt(u,0)}%</span></div></td></tr>);})}</tbody>
        </table>
      </div>
    </div>
  );
}

function Inv({products,setProducts,inventory,setInventory,gi}){
  const[search,setSearch]=useState("");
  const[zone,setZone]=useState("All");
  const[rcv,setRcv]=useState(null);
  const fp=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())&&(zone==="All"||p.zone===zone));
  return(
    <div className="pg">
      <div className="sh">
        <div className="tt" style={{marginBottom:0}}>Inventory</div>
        <div style={{display:"flex",gap:8}}>
          <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:160,fontSize:12}}/>
          <select value={zone} onChange={e=>setZone(e.target.value)} style={{fontSize:12,width:"auto"}}>{["All","Cooler","Frozen","Dry"].map(z=><option key={z}>{z}</option>)}</select>
        </div>
      </div>
      <div className="card">
        <table><thead><tr><th>Product</th><th>Zone</th><th>On Hand</th><th>Cases</th><th>Cost/lb</th><th>Price/lb</th><th>Margin</th><th>Lot</th><th>Expires</th><th></th></tr></thead>
          <tbody>{fp.map(p=>{const inv=gi(p.id);const m=p.pricePerLb>0?((p.pricePerLb-p.costPerLb)/p.pricePerLb*100):0;const low=inv.qtyLbs<p.caseQty*2;const days=inv.expDate?Math.ceil((new Date(inv.expDate)-new Date())/86400000):999;return(<tr key={p.id}><td style={{fontWeight:500}}>{p.name}</td><td style={{color:p.zone==="Frozen"?"#4a9eda":"#2e8b57",fontSize:11}}>{p.zone}</td><td style={{color:low?"#d4800a":"#e8e6e0",fontWeight:500}}>{fmt(inv.qtyLbs)}</td><td style={{color:"#8a9bb0"}}>{inv.qtyCases||0}</td><td>{fmtUSD(p.costPerLb)}</td><td>{fmtUSD(p.pricePerLb)}</td><td style={{color:m>30?"#2e8b57":m>15?"#d4800a":"#c0392b"}}>{fmt(m)}%</td><td style={{fontSize:11,color:"#5a6b80"}}>{inv.lot||"—"}</td><td style={{color:days<=7?"#c0392b":days<=14?"#d4800a":"#8a9bb0",fontSize:11}}>{inv.expDate||"—"}</td><td><button className="btn bg" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setRcv(p)}>Receive</button></td></tr>);})}</tbody>
        </table>
      </div>
      {rcv&&(
        <div className="ov" onClick={()=>setRcv(null)}>
          <div className="mod" onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,marginBottom:16}}>Receive — {rcv.name}</div>
            {(()=>{
              const[f,sf]=useState({cases:"",lbs:"",lot:"",expDate:""});
              return(<>
                <div className="g2">
                  <div className="fld"><label className="lbl">Cases</label><input type="number" value={f.cases} onChange={e=>sf(p=>({...p,cases:e.target.value}))}/></div>
                  <div className="fld"><label className="lbl">Total lbs</label><input type="number" value={f.lbs} onChange={e=>sf(p=>({...p,lbs:e.target.value}))}/></div>
                </div>
                <div className="g2">
                  <div className="fld"><label className="lbl">Lot #</label><input value={f.lot} onChange={e=>sf(p=>({...p,lot:e.target.value}))}/></div>
                  <div className="fld"><label className="lbl">Expiration</label><input type="date" value={f.expDate} onChange={e=>sf(p=>({...p,expDate:e.target.value}))}/></div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button className="btn bg" onClick={()=>setRcv(null)}>Cancel</button>
                  <button className="btn bp" onClick={()=>{if(!f.lbs)return;setInventory(prev=>{const ex=prev.find(i=>i.productId===rcv.id);if(ex)return prev.map(i=>i.productId===rcv.id?{...i,qtyLbs:i.qtyLbs+(+f.lbs),qtyCases:(i.qtyCases||0)+(+f.cases),lot:f.lot,expDate:f.expDate}:i);return[...prev,{id:"I"+uid(),productId:rcv.id,qtyLbs:+f.lbs,qtyCases:+f.cases,lot:f.lot,expDate:f.expDate}];});setRcv(null);}}>Receive</button>
                </div>
              </>);
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function Orders({products,inventory,setInventory,customers,orders,setOrders,setCustomers,rep,reps}){
  const[showNew,setShowNew]=useState(false);
  const[pick,setPick]=useState(null);
  const[filter,setFilter]=useState("All");
  const fl=orders.filter(o=>filter==="All"||o.status===filter);
  return(
    <div className="pg">
      <div className="sh">
        <div className="tt" style={{marginBottom:0}}>Orders</div>
        <div style={{display:"flex",gap:8}}>
          <select value={filter} onChange={e=>setFilter(e.target.value)} style={{fontSize:12,width:"auto"}}>{["All","Pending","Picked","Invoiced"].map(s=><option key={s}>{s}</option>)}</select>
          <button className="btn bp" onClick={()=>setShowNew(true)}>+ New Order</button>
        </div>
      </div>
      <div className="card">
        <table><thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>{fl.map(o=>{const c=customers.find(x=>x.id===o.customerId);const total=o.lines.reduce((s,l)=>s+l.qty*l.price,0);return(<tr key={o.id}><td style={{color:"#4a9eda"}}>{o.id}</td><td style={{fontSize:11,color:"#8a9bb0"}}>{o.date}</td><td style={{fontWeight:500}}>{c?.name}</td><td>{fmtUSD(total)}</td><td style={{color:o.status==="Picked"?"#2e8b57":o.status==="Invoiced"?"#4a9eda":"#d4800a",fontSize:11}}>{o.status}</td><td><div style={{display:"flex",gap:4}}><button className="btn bg" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setPick(o)}>Pick</button>{o.status==="Pending"&&<button className="btn bp" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:"Picked"}:x))}>Mark Picked</button>}{o.status==="Picked"&&<button className="btn bg" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setOrders(prev=>prev.map(x=>x.id===o.id?{...x,status:"Invoiced"}:x))}>Invoice</button>}</div></td></tr>);})}</tbody>
        </table>
      </div>
      {showNew&&(
        <div className="ov" onClick={()=>setShowNew(false)}>
          <div className="mod" style={{minWidth:500}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:22,marginBottom:16}}>New Order</div>
            {(()=>{
              const[cid,setCid]=useState(customers[0]?.id||"");
              const[rid,setRid]=useState(rep.id);
              const[lines,setLines]=useState([{productId:products[0]?.id,qty:"",price:products[0]?.pricePerLb||0}]);
              const total=lines.reduce((s,l)=>s+(+l.qty||0)*(+l.price||0),0);
              return(<>
                <div className="g2">
                  <div className="fld"><label className="lbl">Customer</label><select value={cid} onChange={e=>setCid(e.target.value)}>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="fld"><label className="lbl">Rep</label><select value={rid} onChange={e=>setRid(e.target.value)}>{reps.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
                </div>
                {lines.map((l,i)=>(
                  <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr auto",gap:8,marginBottom:8}}>
                    <select value={l.productId} onChange={e=>{const pr=products.find(x=>x.id===e.target.value);const ls=[...lines];ls[i]={...ls[i],productId:e.target.value,price:pr?.pricePerLb||0};setLines(ls);}}>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="number" placeholder="lbs" value={l.qty} onChange={e=>{const ls=[...lines];ls[i]={...ls[i],qty:e.target.value};setLines(ls);}}/>
                    <input type="number" value={l.price} onChange={e=>{const ls=[...lines];ls[i]={...ls[i],price:e.target.value};setLines(ls);}}/>
                    <button style={{background:"none",border:"none",color:"#c0392b",cursor:"pointer"}} onClick={()=>setLines(lines.filter((_,j)=>j!==i))}>×</button>
                  </div>
                ))}
                <button className="btn bg" style={{fontSize:11,marginBottom:12}} onClick={()=>setLines([...lines,{productId:products[0]?.id,qty:"",price:products[0]?.pricePerLb||0}])}>+ Add Line</button>
                <div style={{textAlign:"right",fontSize:13,marginBottom:16}}>Total: <strong style={{color:"#2e8b57"}}>{fmtUSD(total)}</strong></div>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                  <button className="btn bg" onClick={()=>setShowNew(false)}>Cancel</button>
                  <button className="btn bp" onClick={()=>{setOrders(prev=>[...prev,{id:"ORD-"+uid(),customerId:cid,repId:rid,date:today(),status:"Pending",lines:lines.map(l=>({...l,qty:+l.qty,price:+l.price}))}]);setCustomers(prev=>prev.map(c=>c.id===cid?{...c,lastOrderDate:today()}:c));setShowNew(false);}}>Create Order</button>
                </div>
              </>);
            })()}
          </div>
        </div>
      )}
      {pick&&(
        <div className="ov" onClick={()=>setPick(null)}>
          <div className="mod" style={{fontFamily:"monospace"}} onClick={e=>e.stopPropagation()}>
            <div style={{borderBottom:"2px solid #2e8b57",paddingBottom:14,marginBottom:16}}>
              <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26}}>PICK TICKET — JV FOODS</div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontSize:12}}>
                <div><div style={{color:"#5a6b80"}}>ORDER</div><div style={{color:"#4a9eda",fontSize:16,fontWeight:700}}>{pick.id}</div></div>
                <div style={{textAlign:"right"}}><div style={{color:"#5a6b80"}}>DATE</div><div>{pick.date}</div></div>
              </div>
            </div>
            {(()=>{const c=customers.find(x=>x.id===pick.customerId);return(<div style={{marginBottom:14,fontSize:12}}><div style={{fontWeight:700,fontSize:15}}>{c?.name}</div><div style={{color:"#8a9bb0"}}>{c?.contact} · {c?.phone}</div></div>);})()}
            <table style={{marginBottom:16}}><thead><tr><th style={{background:"#2a2d3a"}}>PRODUCT</th><th style={{background:"#2a2d3a"}}>QTY</th><th style={{background:"#2a2d3a"}}>☐</th></tr></thead>
              <tbody>{pick.lines.map((l,i)=>{const p=products.find(x=>x.id===l.productId);return<tr key={i}><td style={{fontWeight:500}}>{p?.name}</td><td style={{color:"#2e8b57",fontWeight:700}}>{l.qty} lbs</td><td style={{fontSize:18}}>□</td></tr>;})}</tbody>
            </table>
            <div style={{borderTop:"1px solid #2a2d3a",paddingTop:12,display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:16}}>
              <div><div style={{color:"#5a6b80",fontSize:10}}>PICKER SIGNATURE</div><div style={{borderBottom:"1px solid #5a6b80",width:160,marginTop:28}}></div></div>
              <div style={{textAlign:"right"}}><div style={{color:"#5a6b80"}}>TOTAL</div><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#2e8b57"}}>{fmtUSD(pick.lines.reduce((s,l)=>s+l.qty*l.price,0))}</div></div>
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button className="btn bg" onClick={()=>setPick(null)}>Close</button>
              <button className="btn bp" onClick={()=>window.print()}>Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Custs({customers,orders,rep}){
  const[search,setSearch]=useState("");
  const[sel,setSel]=useState(null);
  const fl=customers.filter(c=>(rep.role==="manager"||c.repId===rep.id)&&c.name.toLowerCase().includes(search.toLowerCase()));
  return(
    <div className="pg">
      <div className="sh">
        <div className="tt" style={{marginBottom:0}}>Customers</div>
        <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:200,fontSize:12}}/>
      </div>
      <div className="card">
        <table><thead><tr><th>Customer</th><th>Last Order</th><th>Status</th><th>Balance</th><th>Credit</th><th>Orders</th></tr></thead>
          <tbody>{fl.map(c=>{const d=daysAgo(c.lastOrderDate);const sc=d>=21?"#c0392b":d>=14?"#d4800a":"#2e8b57";const sl=d>=21?"COLD":d>=14?"DORMANT":"ACTIVE";const u=c.creditLimit>0?(c.balance/c.creditLimit*100):0;const co=orders.filter(o=>o.customerId===c.id);return(<tr key={c.id} style={{cursor:"pointer"}} onClick={()=>setSel(c)}><td style={{fontWeight:500}}>{c.name}<br/><span style={{color:"#5a6b80",fontSize:10}}>{c.contact} · {c.phone}</span></td><td style={{fontSize:11}}>{c.lastOrderDate||"Never"}<br/><span style={{color:sc,fontSize:10}}>{d} days ago</span></td><td><span style={{color:sc,fontSize:10,fontWeight:600}}>{sl}</span></td><td>{fmtUSD(c.balance)}</td><td><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:50,height:5,background:"#2a2d3a",borderRadius:2}}><div style={{width:Math.min(u,100)+"%",height:"100%",background:u>=85?"#c0392b":u>=65?"#d4800a":"#2e8b57",borderRadius:2}}></div></div><span style={{fontSize:10}}>{fmt(u,0)}%</span></div></td><td>{co.length}</td></tr>);})}</tbody>
        </table>
      </div>
      {sel&&(
        <div className="ov" onClick={()=>setSel(null)}>
          <div className="mod" style={{minWidth:480}} onClick={e=>e.stopPropagation()}>
            <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,marginBottom:4}}>{sel.name}</div>
            <div style={{color:"#5a6b80",fontSize:11,marginBottom:16}}>{sel.contact} · {sel.phone}</div>
            <div className="g2" style={{marginBottom:16}}>
              <div className="sc"><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24}}>{fmtUSD(sel.balance)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Balance</div></div>
              <div className="sc"><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:24,color:"#2e8b57"}}>{fmtUSD(sel.creditLimit-sel.balance)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Available Credit</div></div>
            </div>
            <table><thead><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{orders.filter(o=>o.customerId===sel.id).map(o=><tr key={o.id}><td style={{color:"#4a9eda"}}>{o.id}</td><td style={{fontSize:11}}>{o.date}</td><td>{fmtUSD(o.lines.reduce((s,l)=>s+l.qty*l.price,0))}</td><td style={{color:o.status==="Invoiced"?"#4a9eda":o.status==="Picked"?"#2e8b57":"#d4800a",fontSize:11}}>{o.status}</td></tr>)}</tbody>
            </table>
            <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}><button className="btn bg" onClick={()=>setSel(null)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Vends({vendors,setVendors}){
  const tap=vendors.reduce((s,v)=>s+(v.balance||0),0);
  return(
    <div className="pg">
      <div className="tt">Vendor Payments</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
        <div className="sc" style={{borderTop:"3px solid #c0392b"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#c0392b"}}>{fmtUSD(tap)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Total A/P</div></div>
        <div className="sc" style={{borderTop:"3px solid #d4800a"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#d4800a"}}>{vendors.filter(v=>{const d=Math.ceil((new Date(v.dueDate)-new Date())/86400000);return d>=0&&d<=7;}).length}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Due This Week</div></div>
        <div className="sc" style={{borderTop:"3px solid #c0392b"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:28,color:"#c0392b"}}>{vendors.filter(v=>new Date(v.dueDate)<new Date()).length}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Overdue</div></div>
      </div>
      <div className="card">
        <table><thead><tr><th>Vendor</th><th>Contact</th><th>Terms</th><th>Balance</th><th>Due Date</th><th>Status</th><th></th></tr></thead>
          <tbody>{vendors.map(v=>{const d=Math.ceil((new Date(v.dueDate)-new Date())/86400000);const ov=d<0;const ds=!ov&&d<=7;return(<tr key={v.id}><td style={{fontWeight:500}}>{v.name}</td><td style={{fontSize:11,color:"#8a9bb0"}}>{v.contact}</td><td style={{color:"#8a9bb0"}}>{v.terms}</td><td style={{color:"#c0392b",fontWeight:600}}>{fmtUSD(v.balance)}</td><td style={{color:ov?"#c0392b":ds?"#d4800a":"#8a9bb0",fontSize:12}}>{v.dueDate}<br/><span style={{fontSize:10}}>{ov?Math.abs(d)+" days overdue":d+" days"}</span></td><td style={{color:ov?"#c0392b":ds?"#d4800a":"#2e8b57",fontSize:11}}>{ov?"OVERDUE":ds?"DUE SOON":"OK"}</td><td><button className="btn bg" style={{padding:"4px 8px",fontSize:10}} onClick={()=>setVendors(prev=>prev.map(x=>x.id===v.id?{...x,balance:0}:x))}>Mark Paid</button></td></tr>);})}</tbody>
        </table>
      </div>
    </div>
  );
}

function Repts({products,inventory,orders,customers,reps}){
  const[tab,setTab]=useState("margin");
  const tc=inventory.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?i.qtyLbs*p.costPerLb:0);},0);
  const tr=inventory.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?i.qtyLbs*p.pricePerLb:0);},0);
  return(
    <div className="pg">
      <div className="tt">Reports</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:20}}>
        <div className="sc" style={{borderTop:"3px solid #2e8b57"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26}}>{fmtUSD(tc)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Inventory @ Cost</div></div>
        <div className="sc" style={{borderTop:"3px solid #4a9eda"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26}}>{fmtUSD(tr)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Inventory @ Retail</div></div>
        <div className="sc" style={{borderTop:"3px solid #9b59b6"}}><div style={{fontFamily:"'Bebas Neue',cursive",fontSize:26}}>{fmtUSD(tr-tc)}</div><div style={{fontSize:10,color:"#5a6b80",textTransform:"uppercase"}}>Potential Margin</div></div>
      </div>
      <div style={{display:"flex",gap:2,marginBottom:20,background:"#13151e",padding:4,borderRadius:6,width:"fit-content"}}>
        {["margin","by rep","sku"].map(t=><button key={t} className="btn" onClick={()=>setTab(t)} style={{background:tab===t?"#2e8b57":"transparent",color:tab===t?"#fff":"#8a9bb0",fontSize:10,textTransform:"uppercase"}}>{t}</button>)}
      </div>
      {tab==="margin"&&<div className="card"><table><thead><tr><th>Product</th><th>Cost/lb</th><th>Price/lb</th><th>Margin %</th><th>On Hand</th><th>Pot. Profit</th></tr></thead><tbody>{products.map(p=>{const inv=inventory.find(i=>i.productId===p.id)||{qtyLbs:0};const m=p.pricePerLb>0?((p.pricePerLb-p.costPerLb)/p.pricePerLb*100):0;return(<tr key={p.id}><td style={{fontWeight:500}}>{p.name}</td><td>{fmtUSD(p.costPerLb)}</td><td>{fmtUSD(p.pricePerLb)}</td><td style={{color:m>30?"#2e8b57":m>15?"#d4800a":"#c0392b"}}>{fmt(m)}%</td><td>{fmt(inv.qtyLbs)} lbs</td><td style={{color:"#2e8b57",fontWeight:600}}>{fmtUSD(inv.qtyLbs*(p.pricePerLb-p.costPerLb))}</td></tr>);})}</tbody></table></div>}
      {tab==="by rep"&&<div className="card"><table><thead><tr><th>Rep</th><th>Accounts</th><th>Dormant</th><th>Revenue</th></tr></thead><tbody>{reps.map(r=>{const rc=customers.filter(c=>c.repId===r.id);const ro=orders.filter(o=>o.repId===r.id);const rev=ro.reduce((s,o)=>s+o.lines.reduce((ss,l)=>ss+l.qty*l.price,0),0);const dorm=rc.filter(c=>daysAgo(c.lastOrderDate)>=14).length;return(<tr key={r.id}><td style={{fontWeight:600,color:r.color}}>{r.name}</td><td>{rc.length}</td><td style={{color:dorm>0?"#d4800a":"#8a9bb0"}}>{dorm}</td><td style={{color:"#2e8b57",fontWeight:600}}>{fmtUSD(rev)}</td></tr>);})}</tbody></table></div>}
      {tab==="sku"&&<div className="card"><table><thead><tr><th>Product</th><th>Margin %</th><th>Times Ordered</th><th>Revenue</th></tr></thead><tbody>{products.map(p=>{const m=p.pricePerLb>0?((p.pricePerLb-p.costPerLb)/p.pricePerLb*100):0;const po=orders.flatMap(o=>o.lines.filter(l=>l.productId===p.id));return(<tr key={p.id}><td style={{fontWeight:500}}>{p.name}</td><td style={{color:m>30?"#2e8b57":m>15?"#d4800a":"#c0392b"}}>{fmt(m)}%</td><td>{po.length}</td><td style={{color:"#2e8b57",fontWeight:600}}>{fmtUSD(po.reduce((s,l)=>s+l.qty*l.price,0))}</td></tr>);})}</tbody></table></div>}
    </div>
  );
}

