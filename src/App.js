      }}>
        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, marginBottom: 12 }}>Active Alerts</div>
          {myAlerts.length === 0 && <div style={{ color: "#5a6b80", fontSize: 12 }}>All clear</div>}
          {myAlerts.slice(0, 5).map((a, i) => (
            <div key={i} style={{ background: a.level === "red" ? "#2d0d0d" : "#2d1a00", borderLeft: "3px solid " + (a.level === "red" ? "#c0392b" : "#d4800a"), padding: "10px 14px", borderRadius: "0 4px 4px 0", marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: a.level === "red" ? "#c0392b" : "#d4800a", fontWeight: 600 }}>{a.customer?.name || a.vendor?.name}</span> — {a.msg}
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, marginBottom: 12 }}>Pending Orders</div>
          {pending.length === 0 && <div style={{ color: "#5a6b80", fontSize: 12 }}>All clear</div>}
          <table><thead><tr><th>Order</th><th>Customer</th><th>Total</th></tr></thead>
            <tbody>{pending.map(o => { const c = customers.find(x => x.id === o.customerId); return (<tr key={o.id}><td style={{ color: "#4a9eda" }}>{o.id}</td><td>{c?.name}</td><td>{fmtUSD(o.lines.reduce((s, l) => s + l.qty * l.price, 0))}</td></tr>); })}</tbody>
          </table>
        </div>
      </div>
      <div className="card">
        <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, marginBottom: 12 }}>Inventory Snapshot</div>
        <table><thead><tr><th>Product</th><th>Zone</th><th>On Hand</th><th>Cost/lb</th><th>Margin</th><th>Expires</th><th>Status</th></tr></thead>
          <tbody>{products.map(p => { const inv = gi(p.id); const m = p.pricePerLb > 0 ? ((p.pricePerLb - p.costPerLb) / p.pricePerLb * 100) : 0; const low = inv.qtyLbs < p.caseQty * 2; const days = inv.expDate ? Math.ceil((new Date(inv.expDate) - new Date()) / 86400000) : 999; return (<tr key={p.id}><td style={{ fontWeight: 500 }}>{p.name}</td><td><span className={"tag " + (p.zone === "Frozen" ? "tb" : p.zone === "Cooler" ? "tg" : "tgr")}>{p.zone}</span></td><td style={{ color: low ? "#d4800a" : "#e8e6e0" }}>{fmt(inv.qtyLbs)} lbs</td><td>{fmtUSD(p.costPerLb)}</td><td style={{ color: m > 30 ? "#2e8b57" : m > 15 ? "#d4800a" : "#c0392b" }}>{fmt(m)}%</td><td style={{ color: days <= 7 ? "#c0392b" : days <= 14 ? "#d4800a" : "#5a6b80", fontSize: 11 }}>{inv.expDate || "—"}</td><td><span className={"tag " + (low ? "ty" : "tg")}>{low ? "LOW" : "OK"}</span></td></tr>); })}</tbody>
        </table>
      </div>
    </div>
  );
}

function AlertsPage({ myAlerts }) {
  return (
    <div className="pg">
      <div className="tt">Alert Center</div>
      <div style={{ color: "#5a6b80", fontSize: 11, marginBottom: 24 }}>{myAlerts.length} active alerts</div>
      {myAlerts.length === 0 && <div className="card" style={{ textAlign: "center", padding: 60 }}><div style={{ fontSize: 40, marginBottom: 12 }}>✅</div><div style={{ color: "#2e8b57", fontFamily: "'Bebas Neue',cursive", fontSize: 22 }}>All Clear</div></div>}
      {myAlerts.map((a, i) => (
        <div key={i} style={{ background: a.level === "red" ? "#2d0d0d" : "#2d1a00", border: "1px solid " + (a.level === "red" ? "#c0392b" : "#d4800a"), borderRadius: 6, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, color: "#e8e6e0", marginBottom: 4 }}>{a.customer?.name || a.vendor?.name}</div>
            <div style={{ color: a.level === "red" ? "#c0392b" : "#d4800a", fontSize: 12 }}>{a.msg}</div>
            {a.customer && <div style={{ color: "#5a6b80", fontSize: 11, marginTop: 4 }}>{a.customer.contact} · {a.customer.phone}</div>}
          </div>
          <span style={{ color: a.level === "red" ? "#c0392b" : "#d4800a", fontSize: 10, textTransform: "uppercase", fontWeight: 600 }}>{a.level === "red" ? "URGENT" : "WARNING"}</span>
        </div>
      ))}
    </div>
  );
}

function AccountsPage({ customers, orders, rep, gr, reps }) {
  const [selRep, setSelRep] = useState(rep.id);
  const rc = customers.filter(c => selRep === "all" ? true : c.repId === selRep);
  const dormant = rc.filter(c => daysSince(c.lastOrderDate) >= 14).length;
  const rev = rc.reduce((s, c) => { const co = orders.filter(o => o.customerId === c.id); return s + co.reduce((ss, o) => ss + o.lines.reduce((sss, l) => sss + l.qty * l.price, 0), 0); }, 0);
  return (
    <div className="pg">
      <div className="sh">
        <div className="tt" style={{ marginBottom: 0 }}>{rep.role === "manager" ? "All Accounts" : rep.name + "'s Accounts"}</div>
        {rep.role === "manager" && <select value={selRep} onChange={e => setSelRep(
