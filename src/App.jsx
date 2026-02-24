import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useSupabaseData } from "./useSupabaseData";
import AuthScreen from "./AuthScreen";

const TABS = [
  { id: "overview", label: "Overview", icon: "◈" },
  { id: "finances", label: "Finances", icon: "₦" },
  { id: "health", label: "Health", icon: "🫀" },
  { id: "sleep", label: "Sleep", icon: "🌙" },
  { id: "reading", label: "Reading", icon: "📚" },
];

const EXPENSE_CATEGORIES = [
  "Food & Dining", "Transport", "Entertainment", "Shopping",
  "Bills & Utilities", "Health", "Travel", "Other",
];
const DEBT_TYPES = ["Loan", "Credit Card", "Mortgage", "Personal Debt", "Business Debt", "Other"];
const MEAL_TYPES = [
  { id: "breakfast", label: "Breakfast", icon: "🌅", color: "#fb923c", suggested: "07:00" },
  { id: "lunch",     label: "Lunch",     icon: "☀️",  color: "#facc15", suggested: "13:00" },
  { id: "dinner",    label: "Dinner",    icon: "🌆",  color: "#a78bfa", suggested: "19:00" },
  { id: "snack",     label: "Snack",     icon: "🍎",  color: "#4ade80", suggested: "16:00" },
];
const BOOK_COLORS = ["#c9a96e", "#4ade80", "#60a5fa", "#f472b6", "#fb923c", "#a78bfa"];
const STATUSES = ["Reading", "Completed", "Want to Read", "Abandoned"];

function today() { return new Date().toISOString().split("T")[0]; }
function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}
const fmt = (n) => {
  const num = parseFloat(n) || 0;
  if (num >= 1_000_000) return `₦${(num/1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `₦${(num/1_000).toFixed(1)}k`;
  return `₦${num.toLocaleString()}`;
};
const fmtFull = (n) => `₦${(parseFloat(n)||0).toLocaleString()}`;

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Still checking session
  if (session === undefined) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0a0c", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ color:"#444", fontFamily:"'DM Sans',sans-serif", fontSize:14 }}>Loading…</div>
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <LifestyleTracker session={session} />;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function LifestyleTracker({ session }) {
  const [activeTab, setActiveTab] = useState("overview");
  const userId = session.user.id;
  const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "You";

  const {
    loading, syncing,
    finances, setFinances,
    health,   setHealth,
    sleep,    setSleep,
    reading,  setReading,
  } = useSupabaseData(userId);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0a0a0c", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>◈</div>
          <div style={{ color:"#444", fontSize:14 }}>Loading your data…</div>
        </div>
      </div>
    );
  }

  const sharedProps = { finances, setFinances, health, setHealth, sleep, setSleep, reading, setReading };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a0c", color:"#e8e4dc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#0a0a0c;}
        .app{font-family:'DM Sans',sans-serif;}
        .serif{font-family:'Playfair Display',serif;}
        input,select,textarea{background:#16161a;border:1px solid #252529;color:#e8e4dc;border-radius:8px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border-color 0.2s;}
        input:focus,select:focus,textarea:focus{border-color:#c9a96e;}
        input::placeholder{color:#3a3a42;}
        select option{background:#16161a;}
        .btn-primary{background:#c9a96e;color:#0a0a0c;border:none;padding:10px 20px;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:opacity 0.2s;letter-spacing:0.3px;}
        .btn-primary:hover{opacity:0.85;}
        .btn-ghost{background:transparent;color:#555;border:1px solid #252529;padding:6px 12px;border-radius:6px;font-size:12px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .btn-ghost:hover{border-color:#ff6b6b;color:#ff6b6b;}
        .card{background:#111115;border:1px solid #1c1c22;border-radius:14px;padding:20px;}
        .label{font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#555;margin-bottom:6px;display:block;}
        .stat-value{font-family:'Playfair Display',serif;font-size:26px;color:#c9a96e;}
        .entry-row{display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid #16161a;}
        .entry-row:last-child{border-bottom:none;}
        .tag{background:#1c1c22;border-radius:20px;padding:3px 10px;font-size:11px;color:#666;white-space:nowrap;}
        .tab-btn{background:none;border:none;cursor:pointer;padding:9px 18px;border-radius:10px;font-family:'DM Sans',sans-serif;font-size:14px;transition:all 0.2s;display:flex;align-items:center;gap:7px;white-space:nowrap;}
        .tab-btn.active{background:#c9a96e;color:#0a0a0c;font-weight:600;}
        .tab-btn:not(.active){color:#555;}
        .tab-btn:not(.active):hover{color:#aaa;background:#16161a;}
        .form-grid{display:grid;gap:12px;}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .section-title{font-family:'Playfair Display',serif;font-size:18px;color:#e8e4dc;margin-bottom:4px;}
        .section-sub{font-size:13px;color:#444;margin-bottom:16px;}
        .progress-bar{height:6px;background:#1c1c22;border-radius:3px;overflow:hidden;margin-top:8px;}
        .progress-fill{height:100%;border-radius:3px;transition:width 0.5s ease;}
        .book-card{background:#111115;border:1px solid #1c1c22;border-radius:10px;padding:14px 16px;display:flex;align-items:flex-start;gap:14px;}
        .book-spine{width:4px;height:44px;border-radius:2px;flex-shrink:0;margin-top:2px;}
        .empty-state{text-align:center;padding:36px 20px;color:#333;font-size:14px;}
        .overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .debt-card{background:#111115;border:1px solid #1c1c22;border-radius:10px;padding:16px;}
        .net-worth-bar{height:8px;border-radius:4px;overflow:hidden;display:flex;gap:2px;}
        @media(max-width:600px){.overview-grid{grid-template-columns:1fr;}.form-row{grid-template-columns:1fr;}}
      `}</style>

      <div className="app" style={{ maxWidth:780, margin:"0 auto", padding:"0 16px 60px" }}>
        {/* Header */}
        <div style={{ padding:"28px 0 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
            <div>
              <p className="label" style={{ marginBottom:6 }}>Welcome back, {username}</p>
              <h1 className="serif" style={{ fontSize:32, fontWeight:700, color:"#e8e4dc", lineHeight:1.1 }}>
                Lifestyle <span style={{ color:"#c9a96e" }}>Tracker</span>
              </h1>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
              <p style={{ color:"#333", fontSize:12 }}>
                {new Date().toLocaleDateString("en-NG",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                {syncing && <span style={{ fontSize:11, color:"#555" }}>saving…</span>}
                <button onClick={handleSignOut} style={{
                  background:"transparent", border:"1px solid #252529", color:"#555",
                  padding:"5px 12px", borderRadius:6, fontSize:12, cursor:"pointer",
                  fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s"
                }}
                  onMouseOver={e=>e.target.style.color="#f87171"}
                  onMouseOut={e=>e.target.style.color="#555"}
                >Sign out</button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:4, marginBottom:24, overflowX:"auto", paddingBottom:12, borderBottom:"1px solid #16161a" }}>
          {TABS.map(t => (
            <button key={t.id} className={`tab-btn ${activeTab===t.id?"active":""}`} onClick={()=>setActiveTab(t.id)}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab==="overview"  && <OverviewPanel  {...sharedProps} setActiveTab={setActiveTab} />}
        {activeTab==="finances"  && <FinancesPanel  finances={finances} setFinances={setFinances} />}
        {activeTab==="health"    && <HealthPanel    health={health}     setHealth={setHealth} />}
        {activeTab==="sleep"     && <SleepPanel     sleep={sleep}       setSleep={setSleep} />}
        {activeTab==="reading"   && <ReadingPanel   reading={reading}   setReading={setReading} />}
      </div>
    </div>
  );
}
// ─── OVERVIEW ─────────────────────────────────────────────────────────────────

function OverviewPanel({ finances, health, sleep, reading, setActiveTab }) {
  const savings = parseFloat(finances.savings) || 0;
  const investments = parseFloat(finances.investments) || 0;
  const totalDebt = (finances.debts || []).reduce((s, d) => s + (parseFloat(d.remaining) || parseFloat(d.amount) || 0), 0);
  const totalExpenses = (finances.expenses || []).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const netWorth = savings + investments - totalDebt;
  const assets = savings + investments;
  const assetsPct = (assets + totalDebt) > 0 ? Math.round((assets / (assets + totalDebt)) * 100) : 0;

  const latestHealth = (health.entries || []).find(e => e.entryType === "vitals" || !e.entryType);
  const todayMealsOv = (health.entries || []).filter(e => e.entryType === "meal" && e.date === today());
  const todayCaloriesOv = todayMealsOv.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);
  const mealsLoggedToday = todayMealsOv.length;

  const sleepEntries7 = (sleep.entries || []).slice(0, 7).filter(e => e.duration);
  const avgSleep = sleepEntries7.length
    ? (sleepEntries7.reduce((s, e) => s + parseFloat(e.duration), 0) / sleepEntries7.length).toFixed(1)
    : null;
  const avgSleepQuality = sleepEntries7.length
    ? (sleepEntries7.reduce((s, e) => s + parseInt(e.quality), 0) / sleepEntries7.length).toFixed(1)
    : null;

  const booksReading = (reading.books || []).filter(b => b.status === "Reading").length;
  const booksCompleted = (reading.books || []).filter(b => b.status === "Completed").length;
  const qualityColor = (q) => { const n = parseFloat(q); return n >= 4 ? "#4ade80" : n >= 3 ? "#facc15" : "#f87171"; };

  const insights = [];
  if (avgSleep && parseFloat(avgSleep) < 7) insights.push({ type: "warn", text: `Averaging ${avgSleep}h sleep — below the 7h goal` });
  if (avgSleep && parseFloat(avgSleep) >= 7) insights.push({ type: "good", text: `Great sleep average: ${avgSleep}h over 7 nights` });
  if (latestHealth?.water && parseFloat(latestHealth.water) >= 2) insights.push({ type: "good", text: `Hitting water goals — ${latestHealth.water}L logged` });
  if (latestHealth?.water && parseFloat(latestHealth.water) < 1.5) insights.push({ type: "warn", text: `Water intake low — only ${latestHealth.water}L logged` });
  if (mealsLoggedToday > 0) insights.push({ type: "info", text: `${mealsLoggedToday} meal${mealsLoggedToday > 1 ? "s" : ""} logged today${todayCaloriesOv > 0 ? ` · ${todayCaloriesOv} cal` : ""}` });
  if (totalDebt > 0 && totalDebt > savings) insights.push({ type: "warn", text: "Total debt exceeds savings" });
  if (netWorth > 0 && totalDebt === 0) insights.push({ type: "good", text: "Debt-free! Your net worth is fully backed by assets" });
  if (booksReading > 0) insights.push({ type: "info", text: `Currently reading ${booksReading} book${booksReading > 1 ? "s" : ""}` });

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Net worth hero */}
      <div className="card" style={{ background: "linear-gradient(135deg, #111115 0%, #14141c 100%)", borderColor: "#c9a96e22" }}>
        <span className="label">Net Worth</span>
        <div className="serif" style={{ fontSize: 42, color: netWorth >= 0 ? "#c9a96e" : "#f87171", marginBottom: 6, lineHeight: 1 }}>
          {netWorth < 0 ? "−" : ""}{fmt(Math.abs(netWorth))}
        </div>
        <div style={{ fontSize: 13, color: "#444", marginBottom: 16 }}>
          Assets {fmt(assets)} · Debts {fmt(totalDebt)} · Expenses {fmt(totalExpenses)}
        </div>
        {(assets + totalDebt) > 0 && (
          <div>
            <div className="net-worth-bar">
              <div style={{ width: `${assetsPct}%`, background: "linear-gradient(90deg, #4ade80, #86efac)", minWidth: assetsPct > 0 ? 6 : 0 }} />
              <div style={{ width: `${100 - assetsPct}%`, background: "linear-gradient(90deg, #f87171, #fca5a5)", minWidth: (100 - assetsPct) > 0 ? 6 : 0 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginTop: 5 }}>
              <span style={{ color: "#4ade80" }}>▪ Assets {assetsPct}%</span>
              <span style={{ color: "#f87171" }}>▪ Debts {100 - assetsPct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* 2x2 grid */}
      <div className="overview-grid">
        <div className="card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("finances")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "#777" }}>💰 Finances</span>
            <span style={{ fontSize: 11, color: "#333" }}>open →</span>
          </div>
          {[
            { label: "Savings", value: fmt(savings), color: "#4ade80" },
            { label: "Investments", value: fmt(investments), color: "#60a5fa" },
            { label: "Expenses", value: fmt(totalExpenses), color: "#f97316" },
            { label: "Debts", value: fmt(totalDebt), color: "#f87171" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
              <span className="serif" style={{ color: s.color, fontSize: 17 }}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("health")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "#777" }}>🫀 Health</span>
            <span style={{ fontSize: 11, color: "#333" }}>open →</span>
          </div>
          {latestHealth || mealsLoggedToday > 0 ? (
            [
              { label: "Weight", value: latestHealth?.weight ? `${latestHealth.weight} kg` : "—", color: "#4ade80" },
              { label: "Blood Pressure", value: latestHealth?.bpSys ? `${latestHealth.bpSys}/${latestHealth.bpDia}` : "—", color: "#f472b6" },
              { label: "Water", value: latestHealth?.water ? `${latestHealth.water}L` : "—", color: "#60a5fa" },
              { label: "Meals Today", value: mealsLoggedToday > 0 ? `${mealsLoggedToday} logged` : "—", color: "#fb923c" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
                <span className="serif" style={{ color: s.color, fontSize: 17 }}>{s.value}</span>
              </div>
            ))
          ) : <div className="empty-state" style={{ padding: "20px 0" }}>No data yet</div>}
        </div>

        <div className="card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("sleep")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "#777" }}>🌙 Sleep</span>
            <span style={{ fontSize: 11, color: "#333" }}>open →</span>
          </div>
          {avgSleep ? (
            <>
              {[
                { label: "Avg Duration", value: `${avgSleep}h`, color: parseFloat(avgSleep) >= 7 ? "#4ade80" : "#f97316" },
                { label: "Avg Quality", value: `${avgSleepQuality}/5`, color: qualityColor(avgSleepQuality) },
                { label: "Nights Logged", value: sleep.entries.length, color: "#c9a96e" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
                  <span className="serif" style={{ color: s.color, fontSize: 17 }}>{s.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 11, color: "#333", marginBottom: 4 }}>7-night avg vs 9h ceiling</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${Math.min((parseFloat(avgSleep) / 9) * 100, 100)}%`,
                    background: parseFloat(avgSleep) >= 7 ? "linear-gradient(90deg,#4ade80,#86efac)" : "linear-gradient(90deg,#f97316,#fbbf24)"
                  }} />
                </div>
              </div>
            </>
          ) : <div className="empty-state" style={{ padding: "20px 0" }}>No data yet</div>}
        </div>

        <div className="card" style={{ cursor: "pointer" }} onClick={() => setActiveTab("reading")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: "#777" }}>📚 Reading</span>
            <span style={{ fontSize: 11, color: "#333" }}>open →</span>
          </div>
          {[
            { label: "Reading Now", value: booksReading, color: "#60a5fa" },
            { label: "Completed", value: booksCompleted, color: "#4ade80" },
            { label: "Total Library", value: (reading.books || []).length, color: "#c9a96e" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#555" }}>{s.label}</span>
              <span className="serif" style={{ color: s.color, fontSize: 17 }}>{s.value}</span>
            </div>
          ))}
          {(reading.books || []).filter(b => b.status === "Reading" && b.pages).slice(0, 1).map(b => {
            const pct = Math.round((parseInt(b.currentPage || 0) / parseInt(b.pages)) * 100);
            return (
              <div key={b.id} style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: "#444", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  Now: {b.title}
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: "#c9a96e" }} />
                </div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>{pct}% complete</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card">
          <p className="section-title" style={{ marginBottom: 12 }}>Insights</p>
          <div style={{ display: "grid", gap: 8 }}>
            {insights.map((ins, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 8,
                background: ins.type === "good" ? "#0a1a0a" : ins.type === "warn" ? "#1a130a" : "#0a0f1a",
                border: `1px solid ${ins.type === "good" ? "#1a341a" : ins.type === "warn" ? "#342210" : "#101830"}`
              }}>
                <span>{ins.type === "good" ? "✓" : ins.type === "warn" ? "⚠" : "ℹ"}</span>
                <span style={{ fontSize: 13, color: ins.type === "good" ? "#4ade80" : ins.type === "warn" ? "#facc15" : "#60a5fa" }}>
                  {ins.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: 12 }}>Recent Activity</p>
        {(() => {
          const items = [
            ...(finances.expenses || []).slice(0, 2).map(e => ({ date: e.date, text: `Expense: ${e.note || e.category}`, value: `−${fmtFull(e.amount)}`, color: "#f97316" })),
            ...(health.entries || []).filter(e => e.entryType === "vitals" || !e.entryType).slice(0, 1).map(e => ({ date: e.date, text: `Vitals logged${e.weight ? ` · ${e.weight}kg` : ""}`, value: "🫀", color: "#f472b6" })),
            ...(health.entries || []).filter(e => e.entryType === "meal").slice(0, 1).map(e => ({ date: e.date, text: `Meal: ${e.foods}`, value: e.calories ? `${e.calories} cal` : "🍽️", color: "#fb923c" })),
            ...(sleep.entries || []).slice(0, 1).map(e => ({ date: e.date, text: `Sleep: ${e.duration}h recorded`, value: `Q ${e.quality}/5`, color: "#a78bfa" })),
          ].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 6);
          if (!items.length) return <div className="empty-state">Start logging to see your activity here</div>;
          return items.map((item, i) => (
            <div className="entry-row" key={i}>
              <div>
                <div style={{ fontSize: 13, color: "#ccc" }}>{item.text}</div>
                <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{item.date}</div>
              </div>
              <span style={{ fontSize: 13, color: item.color }}>{item.value}</span>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

// ─── FINANCES ────────────────────────────────────────────────────────────────

function FinancesPanel({ finances, setFinances }) {
  const [expForm, setExpForm] = useState({ amount: "", category: EXPENSE_CATEGORIES[0], note: "", date: today() });
  const [debtForm, setDebtForm] = useState({ name: "", type: DEBT_TYPES[0], amount: "", remaining: "", interestRate: "", dueDate: "", note: "" });
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [editSavings, setEditSavings] = useState(false);
  const [editInv, setEditInv] = useState(false);
  const [tempSav, setTempSav] = useState(finances.savings);
  const [tempInv, setTempInv] = useState(finances.investments);
  const [subTab, setSubTab] = useState("expenses");

  const totalExpenses = finances.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalDebt = (finances.debts || []).reduce((s, d) => s + (parseFloat(d.remaining) || parseFloat(d.amount) || 0), 0);
  const netWorth = (parseFloat(finances.savings) || 0) + (parseFloat(finances.investments) || 0) - totalDebt;

  const addExpense = () => {
    if (!expForm.amount) return;
    setFinances(f => ({ ...f, expenses: [{ ...expForm, id: Date.now() }, ...f.expenses] }));
    setExpForm(v => ({ ...v, amount: "", note: "" }));
  };

  const addDebt = () => {
    if (!debtForm.name || !debtForm.amount) return;
    setFinances(f => ({ ...f, debts: [{ ...debtForm, id: Date.now(), remaining: debtForm.remaining || debtForm.amount }, ...(f.debts || [])] }));
    setDebtForm({ name: "", type: DEBT_TYPES[0], amount: "", remaining: "", interestRate: "", dueDate: "", note: "" });
    setShowDebtForm(false);
  };

  const updateDebtRemaining = (id, remaining) =>
    setFinances(f => ({ ...f, debts: f.debts.map(d => d.id === id ? { ...d, remaining } : d) }));

  const removeDebt = (id) => setFinances(f => ({ ...f, debts: f.debts.filter(d => d.id !== id) }));
  const removeExpense = (id) => setFinances(f => ({ ...f, expenses: f.expenses.filter(e => e.id !== id) }));

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    total: finances.expenses.filter(e => e.category === cat).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Top stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Savings", value: finances.savings, isEdit: editSavings, setEdit: setEditSavings, temp: tempSav, setTemp: setTempSav, key: "savings", color: "#4ade80" },
          { label: "Investments", value: finances.investments, isEdit: editInv, setEdit: setEditInv, temp: tempInv, setTemp: setTempInv, key: "investments", color: "#60a5fa" },
        ].map(item => (
          <div key={item.label} className="card" style={{ textAlign: "center" }}>
            <span className="label">{item.label}</span>
            {item.isEdit ? (
              <div>
                <input type="number" value={item.temp} onChange={e => item.setTemp(e.target.value)} style={{ textAlign: "center", marginBottom: 8 }} />
                <button className="btn-primary" style={{ width: "100%", fontSize: 12, padding: "7px" }} onClick={() => {
                  setFinances(f => ({ ...f, [item.key]: item.temp }));
                  item.setEdit(false);
                }}>Save</button>
              </div>
            ) : (
              <div>
                <div className="stat-value" style={{ color: item.color, fontSize: 19 }}>{fmt(item.value)}</div>
                <button className="btn-ghost" style={{ marginTop: 8, width: "100%", fontSize: 11 }} onClick={() => item.setEdit(true)}>Edit</button>
              </div>
            )}
          </div>
        ))}
        <div className="card" style={{ textAlign: "center" }}>
          <span className="label">Net Worth</span>
          <div className="stat-value" style={{ color: netWorth >= 0 ? "#c9a96e" : "#f87171", fontSize: 19 }}>
            {netWorth < 0 ? "−" : ""}{fmt(Math.abs(netWorth))}
          </div>
          <div style={{ fontSize: 11, color: "#444", marginTop: 8 }}>Assets − Debts</div>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #16161a", paddingBottom: 12 }}>
        {["expenses", "debts"].map(t => (
          <button key={t} onClick={() => setSubTab(t)} style={{
            background: subTab === t ? "#1c1c22" : "transparent",
            border: subTab === t ? "1px solid #2a2a32" : "1px solid transparent",
            color: subTab === t ? "#e8e4dc" : "#555",
            padding: "7px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            fontWeight: subTab === t ? 500 : 400, textTransform: "capitalize",
            display: "flex", alignItems: "center", gap: 6
          }}>
            {t}
            {t === "debts" && (finances.debts || []).length > 0 && (
              <span style={{ background: "#f87171", color: "#0a0a0c", borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
                {(finances.debts || []).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {subTab === "expenses" && (
        <>
          <div className="card">
            <p className="section-title">Log Expense</p>
            <p className="section-sub">Track where your money goes</p>
            <div className="form-grid">
              <div className="form-row">
                <div><span className="label">Amount (₦)</span>
                  <input type="number" placeholder="0" value={expForm.amount}
                    onChange={e => setExpForm(v => ({ ...v, amount: e.target.value }))} /></div>
                <div><span className="label">Date</span>
                  <input type="date" value={expForm.date}
                    onChange={e => setExpForm(v => ({ ...v, date: e.target.value }))} /></div>
              </div>
              <div><span className="label">Category</span>
                <select value={expForm.category} onChange={e => setExpForm(v => ({ ...v, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select></div>
              <div><span className="label">Note (optional)</span>
                <input type="text" placeholder="What was it for?" value={expForm.note}
                  onChange={e => setExpForm(v => ({ ...v, note: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && addExpense()} /></div>
              <button className="btn-primary" onClick={addExpense}>Add Expense</button>
            </div>
          </div>

          {byCategory.length > 0 && (
            <div className="card">
              <p className="section-title">Spending Breakdown</p>
              <p className="section-sub">Total: {fmtFull(totalExpenses)}</p>
              {byCategory.map(({ cat, total }) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: "#aaa" }}>{cat}</span>
                    <span style={{ color: "#c9a96e" }}>{fmtFull(total)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${Math.min((total / totalExpenses) * 100, 100)}%`,
                      background: "linear-gradient(90deg, #c9a96e, #e8c97a)"
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <p className="section-title">All Expenses</p>
            <p className="section-sub">{finances.expenses.length} entries logged</p>
            {finances.expenses.length === 0 ? <div className="empty-state">No expenses logged yet</div>
              : finances.expenses.slice(0, 30).map(e => (
                <div className="entry-row" key={e.id}>
                  <div>
                    <div style={{ fontSize: 14, color: "#ddd" }}>{e.note || e.category}</div>
                    <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{e.date} · <span className="tag">{e.category}</span></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#f97316", fontWeight: 500 }}>−{fmtFull(e.amount)}</span>
                    <button className="btn-ghost" onClick={() => removeExpense(e.id)}>✕</button>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {subTab === "debts" && (
        <>
          {(finances.debts || []).length > 0 && (
            <div className="card" style={{ background: "#110a0a", borderColor: "#2a1212" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span className="label">Total Outstanding Debt</span>
                  <div className="stat-value" style={{ color: "#f87171", fontSize: 30 }}>{fmtFull(totalDebt)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="label">Active debts</span>
                  <div className="serif" style={{ color: "#f87171", fontSize: 26 }}>{(finances.debts || []).length}</div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showDebtForm ? 16 : 0 }}>
              <div>
                <p className="section-title">Debt Tracker</p>
                {!showDebtForm && <p className="section-sub" style={{ marginBottom: 0 }}>Loans, credit cards & other obligations</p>}
              </div>
              <button className="btn-primary" onClick={() => setShowDebtForm(v => !v)}>
                {showDebtForm ? "Cancel" : "+ Add Debt"}
              </button>
            </div>
            {showDebtForm && (
              <div className="form-grid">
                <div className="form-row">
                  <div><span className="label">Debt Name *</span>
                    <input type="text" placeholder="e.g. GTBank Loan" value={debtForm.name}
                      onChange={e => setDebtForm(v => ({ ...v, name: e.target.value }))} /></div>
                  <div><span className="label">Type</span>
                    <select value={debtForm.type} onChange={e => setDebtForm(v => ({ ...v, type: e.target.value }))}>
                      {DEBT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select></div>
                </div>
                <div className="form-row">
                  <div><span className="label">Original Amount (₦) *</span>
                    <input type="number" placeholder="500000" value={debtForm.amount}
                      onChange={e => setDebtForm(v => ({ ...v, amount: e.target.value }))} /></div>
                  <div><span className="label">Remaining Balance (₦)</span>
                    <input type="number" placeholder="Leave blank if full amount" value={debtForm.remaining}
                      onChange={e => setDebtForm(v => ({ ...v, remaining: e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div><span className="label">Interest Rate (% p.a.)</span>
                    <input type="number" step="0.1" placeholder="15" value={debtForm.interestRate}
                      onChange={e => setDebtForm(v => ({ ...v, interestRate: e.target.value }))} /></div>
                  <div><span className="label">Due / Payoff Date</span>
                    <input type="date" value={debtForm.dueDate}
                      onChange={e => setDebtForm(v => ({ ...v, dueDate: e.target.value }))} /></div>
                </div>
                <div><span className="label">Notes</span>
                  <input type="text" placeholder="Lender, monthly payment amount, etc." value={debtForm.note}
                    onChange={e => setDebtForm(v => ({ ...v, note: e.target.value }))} /></div>
                <button className="btn-primary" onClick={addDebt}>Add Debt</button>
              </div>
            )}
          </div>

          {(finances.debts || []).length === 0 ? (
            <div className="card"><div className="empty-state">No debts logged — stay debt-free! 🎉</div></div>
          ) : (finances.debts || []).map(d => {
            const original = parseFloat(d.amount) || 0;
            const remaining = parseFloat(d.remaining) || original;
            const paid = Math.max(0, original - remaining);
            const pct = original > 0 ? Math.min((paid / original) * 100, 100) : 0;
            const isOverdue = d.dueDate && d.dueDate < today();
            return (
              <div key={d.id} className="debt-card" style={isOverdue ? { borderColor: "#3a1010" } : {}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, color: "#e8e4dc", fontFamily: "'Playfair Display', serif" }}>{d.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <span className="tag">{d.type}</span>
                      {d.interestRate && <span className="tag">{d.interestRate}% p.a.</span>}
                      {d.dueDate && <span className="tag" style={isOverdue ? { color: "#f87171", borderColor: "#3a1010" } : {}}>
                        {isOverdue ? "⚠ Overdue · " : "Due "}{d.dueDate}
                      </span>}
                    </div>
                  </div>
                  <button className="btn-ghost" onClick={() => removeDebt(d.id)}>✕</button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <div>
                    <span className="label" style={{ marginBottom: 2 }}>Remaining</span>
                    <div className="serif" style={{ color: "#f87171", fontSize: 20 }}>{fmtFull(remaining)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="label" style={{ marginBottom: 2 }}>Paid so far</span>
                    <div className="serif" style={{ color: "#4ade80", fontSize: 20 }}>{fmtFull(paid)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>Original: {fmtFull(original)}</div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: "linear-gradient(90deg,#4ade80,#86efac)" }} />
                </div>
                <div style={{ fontSize: 11, color: "#444", marginTop: 4 }}>{pct.toFixed(0)}% repaid</div>
                {d.note && <div style={{ fontSize: 12, color: "#444", marginTop: 10, paddingTop: 10, borderTop: "1px solid #1c1c22" }}>{d.note}</div>}
                <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="number" placeholder="Update remaining balance (₦)"
                    style={{ flex: 1, padding: "6px 10px", fontSize: 12 }}
                    onKeyDown={e => {
                      if (e.key === "Enter" && e.target.value) {
                        updateDebtRemaining(d.id, e.target.value);
                        e.target.value = "";
                      }
                    }} />
                  <span style={{ fontSize: 11, color: "#333", whiteSpace: "nowrap" }}>↵ to update</span>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── HEALTH ───────────────────────────────────────────────────────────────────

function HealthPanel({ health, setHealth }) {
  const [healthSubTab, setHealthSubTab] = useState("vitals");
  const [vitalsForm, setVitalsForm] = useState({ date: today(), weight: "", bpSys: "", bpDia: "", water: "" });
  const [mealForm, setMealForm] = useState({ date: today(), type: "breakfast", time: nowTime(), foods: "", calories: "", notes: "" });
  const [showMealForm, setShowMealForm] = useState(false);

  // separate vitals entries and meal entries
  const vitalsEntries = (health.entries || []).filter(e => e.entryType === "vitals" || !e.entryType);
  const mealEntries   = (health.entries || []).filter(e => e.entryType === "meal");

  const addVitals = () => {
    if (!vitalsForm.weight && !vitalsForm.bpSys && !vitalsForm.water) return;
    setHealth(h => ({ entries: [{ ...vitalsForm, entryType: "vitals", id: Date.now() }, ...(h.entries || [])] }));
    setVitalsForm({ date: today(), weight: "", bpSys: "", bpDia: "", water: "" });
  };

  const addMeal = () => {
    if (!mealForm.foods) return;
    setHealth(h => ({ entries: [{ ...mealForm, entryType: "meal", id: Date.now() }, ...(h.entries || [])] }));
    setMealForm(v => ({ ...v, foods: "", calories: "", notes: "", time: nowTime() }));
    setShowMealForm(false);
  };

  const removeEntry = (id) => setHealth(h => ({ entries: h.entries.filter(x => x.id !== id) }));

  const latestVitals = vitalsEntries[0];
  const avgWeight = vitalsEntries.filter(e => e.weight).length
    ? (vitalsEntries.filter(e => e.weight).reduce((s, e) => s + parseFloat(e.weight), 0) / vitalsEntries.filter(e => e.weight).length).toFixed(1)
    : null;

  // today's meals grouped
  const todayMeals = mealEntries.filter(e => e.date === today());
  const todayCalories = todayMeals.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);
  const todayWater = parseFloat(latestVitals?.date === today() ? latestVitals?.water : 0) || 0;

  // meals by date for history
  const mealDates = [...new Set(mealEntries.map(e => e.date))].sort((a, b) => b.localeCompare(a));

  const mealTypeInfo = (typeId) => MEAL_TYPES.find(m => m.id === typeId) || MEAL_TYPES[0];

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Today's snapshot */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Weight", value: latestVitals?.weight ? `${latestVitals.weight} kg` : "—", color: "#4ade80" },
          { label: "Blood Pressure", value: latestVitals?.bpSys ? `${latestVitals.bpSys}/${latestVitals.bpDia}` : "—", color: "#f472b6" },
          { label: "Water Today", value: todayWater ? `${todayWater}L` : "—", color: "#60a5fa" },
          { label: "Calories Today", value: todayCalories ? `${todayCalories}` : "—", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <span className="label">{s.label}</span>
            <div className="stat-value" style={{ color: s.color, fontSize: 18 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #16161a", paddingBottom: 12 }}>
        {[
          { id: "vitals", label: "Vitals" },
          { id: "meals",  label: `Meals ${mealEntries.length > 0 ? `(${mealEntries.length})` : ""}` },
        ].map(t => (
          <button key={t.id} onClick={() => setHealthSubTab(t.id)} style={{
            background: healthSubTab === t.id ? "#1c1c22" : "transparent",
            border: healthSubTab === t.id ? "1px solid #2a2a32" : "1px solid transparent",
            color: healthSubTab === t.id ? "#e8e4dc" : "#555",
            padding: "7px 16px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
            fontWeight: healthSubTab === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── VITALS ── */}
      {healthSubTab === "vitals" && (
        <>
          <div className="card">
            <p className="section-title">Log Vitals</p>
            <p className="section-sub">Weight, blood pressure & hydration</p>
            <div className="form-grid">
              <div className="form-row">
                <div><span className="label">Date</span><input type="date" value={vitalsForm.date} onChange={e => setVitalsForm(v => ({ ...v, date: e.target.value }))} /></div>
                <div><span className="label">Weight (kg)</span><input type="number" step="0.1" placeholder="70.5" value={vitalsForm.weight} onChange={e => setVitalsForm(v => ({ ...v, weight: e.target.value }))} /></div>
              </div>
              <div className="form-row">
                <div><span className="label">Systolic BP</span><input type="number" placeholder="120" value={vitalsForm.bpSys} onChange={e => setVitalsForm(v => ({ ...v, bpSys: e.target.value }))} /></div>
                <div><span className="label">Diastolic BP</span><input type="number" placeholder="80" value={vitalsForm.bpDia} onChange={e => setVitalsForm(v => ({ ...v, bpDia: e.target.value }))} /></div>
              </div>
              <div><span className="label">Water Intake (L)</span><input type="number" step="0.1" placeholder="2.0" value={vitalsForm.water} onChange={e => setVitalsForm(v => ({ ...v, water: e.target.value }))} /></div>
              <button className="btn-primary" onClick={addVitals}>Save Vitals</button>
            </div>
          </div>

          {/* Water goal */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p className="section-title">Today's Water Goal</p>
              <span style={{ color: "#60a5fa", fontSize: 18, fontFamily: "'Playfair Display', serif" }}>{todayWater} / 2.5 L</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${Math.min((todayWater / 2.5) * 100, 100)}%`, background: "linear-gradient(90deg,#3b82f6,#60a5fa)" }} />
            </div>
            {avgWeight && <p style={{ marginTop: 12, fontSize: 13, color: "#444" }}>Avg weight across all entries: <span style={{ color: "#4ade80" }}>{avgWeight} kg</span></p>}
          </div>

          {/* Vitals history */}
          <div className="card">
            <p className="section-title">Vitals History</p>
            <p className="section-sub">{vitalsEntries.length} entries</p>
            {vitalsEntries.length === 0 ? <div className="empty-state">No vitals logged yet</div>
              : vitalsEntries.slice(0, 20).map(e => (
                <div className="entry-row" key={e.id}>
                  <div>
                    <div style={{ fontSize: 13, color: "#ddd" }}>
                      {[e.weight && `⚖️ ${e.weight}kg`, e.bpSys && `💗 ${e.bpSys}/${e.bpDia}`, e.water && `💧 ${e.water}L`].filter(Boolean).join(" · ")}
                    </div>
                    <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{e.date}</div>
                  </div>
                  <button className="btn-ghost" onClick={() => removeEntry(e.id)}>✕</button>
                </div>
              ))}
          </div>
        </>
      )}

      {/* ── MEALS ── */}
      {healthSubTab === "meals" && (
        <>
          {/* Today's meal grid */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <p className="section-title">Today's Meals</p>
                <p className="section-sub" style={{ marginBottom: 0 }}>
                  {todayCalories > 0 ? `${todayCalories} cal logged today` : "Nothing logged yet today"}
                </p>
              </div>
              <button className="btn-primary" onClick={() => setShowMealForm(v => !v)}>
                {showMealForm ? "Cancel" : "+ Log Meal"}
              </button>
            </div>

            {/* Add meal form */}
            {showMealForm && (
              <div className="form-grid" style={{ borderTop: "1px solid #1c1c22", paddingTop: 16, marginTop: 4 }}>
                <div className="form-row">
                  <div>
                    <span className="label">Meal Type</span>
                    <select value={mealForm.type} onChange={e => setMealForm(v => ({ ...v, type: e.target.value, time: mealTypeInfo(e.target.value).suggested }))}>
                      {MEAL_TYPES.map(m => <option key={m.id} value={m.id}>{m.icon} {m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="label">Time Eaten</span>
                    <input type="time" value={mealForm.time} onChange={e => setMealForm(v => ({ ...v, time: e.target.value }))} />
                  </div>
                </div>
                <div className="form-row">
                  <div>
                    <span className="label">Date</span>
                    <input type="date" value={mealForm.date} onChange={e => setMealForm(v => ({ ...v, date: e.target.value }))} />
                  </div>
                  <div>
                    <span className="label">Calories (optional)</span>
                    <input type="number" placeholder="450" value={mealForm.calories} onChange={e => setMealForm(v => ({ ...v, calories: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <span className="label">Foods eaten *</span>
                  <input type="text" placeholder="e.g. Jollof rice, fried plantain, chicken" value={mealForm.foods}
                    onChange={e => setMealForm(v => ({ ...v, foods: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addMeal()} />
                </div>
                <div>
                  <span className="label">Notes (optional)</span>
                  <input type="text" placeholder="Felt full, ate slowly, restaurant name..." value={mealForm.notes}
                    onChange={e => setMealForm(v => ({ ...v, notes: e.target.value }))} />
                </div>
                <button className="btn-primary" onClick={addMeal}>Save Meal</button>
              </div>
            )}

            {/* Today's meals broken down by type */}
            <div style={{ display: "grid", gap: 10, marginTop: showMealForm ? 16 : 0 }}>
              {MEAL_TYPES.map(mtype => {
                const entries = todayMeals.filter(e => e.type === mtype.id);
                return (
                  <div key={mtype.id} style={{
                    borderRadius: 10, border: `1px solid ${entries.length > 0 ? mtype.color + "33" : "#1c1c22"}`,
                    background: entries.length > 0 ? mtype.color + "08" : "#0d0d10",
                    padding: "12px 14px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: entries.length > 0 ? 10 : 0 }}>
                      <span style={{ fontSize: 16 }}>{mtype.icon}</span>
                      <span style={{ fontSize: 13, color: entries.length > 0 ? mtype.color : "#444", fontWeight: 500 }}>{mtype.label}</span>
                      {entries.length > 0 && (
                        <span style={{ marginLeft: "auto", fontSize: 12, color: "#444" }}>
                          {entries[0]?.time && `@ ${entries[0].time}`}
                          {entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0) > 0 &&
                            ` · ${entries.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0)} cal`}
                        </span>
                      )}
                    </div>
                    {entries.length > 0 ? entries.map(e => (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "6px 0", borderTop: "1px solid #1c1c22" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, color: "#e8e4dc" }}>{e.foods}</div>
                          {e.notes && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{e.notes}</div>}
                        </div>
                        <button className="btn-ghost" style={{ marginLeft: 10, flexShrink: 0 }} onClick={() => removeEntry(e.id)}>✕</button>
                      </div>
                    )) : (
                      <div style={{ fontSize: 12, color: "#2a2a32", fontStyle: "italic" }}>Not logged yet</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calorie tracker */}
          {todayCalories > 0 && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p className="section-title">Calorie Goal</p>
                <span style={{ color: todayCalories > 2000 ? "#f87171" : "#fb923c", fontSize: 18, fontFamily: "'Playfair Display', serif" }}>
                  {todayCalories} / 2000 cal
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{
                  width: `${Math.min((todayCalories / 2000) * 100, 100)}%`,
                  background: todayCalories > 2000
                    ? "linear-gradient(90deg,#f87171,#fca5a5)"
                    : "linear-gradient(90deg,#fb923c,#fbbf24)"
                }} />
              </div>
              <div style={{ fontSize: 12, color: "#444", marginTop: 6 }}>
                {todayCalories > 2000
                  ? `${todayCalories - 2000} cal over goal`
                  : `${2000 - todayCalories} cal remaining`}
              </div>
            </div>
          )}

          {/* Meal history by date */}
          {mealDates.length > 0 && (
            <div className="card">
              <p className="section-title">Meal History</p>
              <p className="section-sub">{mealEntries.length} meals logged</p>
              {mealDates.slice(0, 10).map(date => {
                const dayMeals = mealEntries.filter(e => e.date === date);
                const dayCalories = dayMeals.reduce((s, e) => s + (parseFloat(e.calories) || 0), 0);
                return (
                  <div key={date} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>{date}</span>
                      {dayCalories > 0 && <span style={{ fontSize: 12, color: "#fb923c" }}>{dayCalories} cal</span>}
                    </div>
                    {dayMeals.sort((a, b) => (a.time || "").localeCompare(b.time || "")).map(e => {
                      const mt = mealTypeInfo(e.type);
                      return (
                        <div key={e.id} className="entry-row">
                          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 16, marginTop: 1 }}>{mt.icon}</span>
                            <div>
                              <div style={{ fontSize: 13, color: "#ddd" }}>{e.foods}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 3, flexWrap: "wrap" }}>
                                <span className="tag" style={{ color: mt.color }}>{mt.label}</span>
                                {e.time && <span className="tag">⏰ {e.time}</span>}
                                {e.calories && <span className="tag">🔥 {e.calories} cal</span>}
                              </div>
                              {e.notes && <div style={{ fontSize: 12, color: "#444", marginTop: 3 }}>{e.notes}</div>}
                            </div>
                          </div>
                          <button className="btn-ghost" onClick={() => removeEntry(e.id)}>✕</button>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {mealEntries.length === 0 && (
            <div className="card"><div className="empty-state">No meals logged yet — start tracking what you eat</div></div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SLEEP ────────────────────────────────────────────────────────────────────

function SleepPanel({ sleep, setSleep }) {
  const [form, setForm] = useState({ date: today(), bedtime: "", wakeTime: "", quality: "4", notes: "" });

  const calcDuration = (bed, wake) => {
    if (!bed || !wake) return null;
    const [bh, bm] = bed.split(":").map(Number);
    const [wh, wm] = wake.split(":").map(Number);
    let mins = (wh * 60 + wm) - (bh * 60 + bm);
    if (mins < 0) mins += 1440;
    return (mins / 60).toFixed(1);
  };

  const addEntry = () => {
    if (!form.bedtime || !form.wakeTime) return;
    setSleep(s => ({ entries: [{ ...form, duration: calcDuration(form.bedtime, form.wakeTime), id: Date.now() }, ...s.entries] }));
    setForm({ date: today(), bedtime: "", wakeTime: "", quality: "4", notes: "" });
  };

  const avg7 = sleep.entries.slice(0, 7).filter(e => e.duration);
  const avgDuration = avg7.length ? (avg7.reduce((s, e) => s + parseFloat(e.duration), 0) / avg7.length).toFixed(1) : null;
  const avgQuality = avg7.length ? (avg7.reduce((s, e) => s + parseInt(e.quality), 0) / avg7.length).toFixed(1) : null;
  const qualityColor = (q) => { const n = parseInt(q); return n >= 4 ? "#4ade80" : n >= 3 ? "#facc15" : "#f87171"; };
  const qualityLabel = (q) => ["", "Terrible", "Poor", "Fair", "Good", "Excellent"][parseInt(q)] || "";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {avgDuration && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <span className="label">Avg Sleep (7 nights)</span>
            <div className="stat-value" style={{ color: parseFloat(avgDuration) >= 7 ? "#4ade80" : "#f97316" }}>{avgDuration}h</div>
            <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>Goal: 7–9h</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <span className="label">Avg Quality</span>
            <div className="stat-value" style={{ color: qualityColor(Math.round(parseFloat(avgQuality))) }}>{avgQuality}/5</div>
            <div style={{ fontSize: 11, color: "#333", marginTop: 4 }}>{qualityLabel(Math.round(parseFloat(avgQuality)))}</div>
          </div>
        </div>
      )}
      <div className="card">
        <p className="section-title">Log Sleep</p>
        <p className="section-sub">Record your rest</p>
        <div className="form-grid">
          <div className="form-row">
            <div><span className="label">Date</span><input type="date" value={form.date} onChange={e => setForm(v => ({ ...v, date: e.target.value }))} /></div>
            <div><span className="label">Quality (1–5)</span>
              <select value={form.quality} onChange={e => setForm(v => ({ ...v, quality: e.target.value }))}>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} – {qualityLabel(n)}</option>)}
              </select></div>
          </div>
          <div className="form-row">
            <div><span className="label">Bedtime</span><input type="time" value={form.bedtime} onChange={e => setForm(v => ({ ...v, bedtime: e.target.value }))} /></div>
            <div><span className="label">Wake Time</span><input type="time" value={form.wakeTime} onChange={e => setForm(v => ({ ...v, wakeTime: e.target.value }))} /></div>
          </div>
          {form.bedtime && form.wakeTime && (
            <div style={{ background: "#16161a", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#c9a96e" }}>
              Duration: <strong>{calcDuration(form.bedtime, form.wakeTime)}h</strong>
            </div>
          )}
          <div><span className="label">Notes</span><input type="text" placeholder="Woke up refreshed, vivid dreams..." value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} /></div>
          <button className="btn-primary" onClick={addEntry}>Log Sleep</button>
        </div>
      </div>
      <div className="card">
        <p className="section-title">Sleep History</p>
        <p className="section-sub">{sleep.entries.length} nights logged</p>
        {sleep.entries.length === 0 ? <div className="empty-state">No sleep data yet</div>
          : sleep.entries.slice(0, 20).map(e => (
            <div className="entry-row" key={e.id}>
              <div>
                <div style={{ fontSize: 13, color: qualityColor(e.quality) }}>{"●".repeat(parseInt(e.quality))}{"○".repeat(5 - parseInt(e.quality))}</div>
                <div style={{ fontSize: 13, color: "#ddd", marginTop: 2 }}>🌙 {e.bedtime} → ☀️ {e.wakeTime}{e.duration && <span style={{ color: "#c9a96e", marginLeft: 8 }}>{e.duration}h</span>}</div>
                {e.notes && <div style={{ fontSize: 12, color: "#444", marginTop: 2 }}>{e.notes}</div>}
                <div style={{ fontSize: 11, color: "#333", marginTop: 2 }}>{e.date}</div>
              </div>
              <button className="btn-ghost" onClick={() => setSleep(s => ({ entries: s.entries.filter(x => x.id !== e.id) }))}>✕</button>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── READING ──────────────────────────────────────────────────────────────────

function ReadingPanel({ reading, setReading }) {
  const [form, setForm] = useState({ title: "", author: "", status: "Reading", pages: "", currentPage: "", rating: "0", genre: "", startDate: today(), endDate: "" });
  const [showForm, setShowForm] = useState(false);

  const addBook = () => {
    if (!form.title) return;
    setReading(r => ({ books: [{ ...form, id: Date.now(), color: BOOK_COLORS[r.books.length % BOOK_COLORS.length] }, ...r.books] }));
    setForm({ title: "", author: "", status: "Reading", pages: "", currentPage: "", rating: "0", genre: "", startDate: today(), endDate: "" });
    setShowForm(false);
  };

  const updateBook = (id, changes) => setReading(r => ({ books: r.books.map(b => b.id === id ? { ...b, ...changes } : b) }));
  const removeBook = (id) => setReading(r => ({ books: r.books.filter(b => b.id !== id) }));

  const stats = {
    total: reading.books.length,
    completed: reading.books.filter(b => b.status === "Completed").length,
    reading: reading.books.filter(b => b.status === "Reading").length,
    pages: reading.books.filter(b => b.pages && b.status === "Completed").reduce((s, b) => s + parseInt(b.pages || 0), 0),
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
        {[
          { label: "Total Books", value: stats.total, color: "#c9a96e" },
          { label: "Completed", value: stats.completed, color: "#4ade80" },
          { label: "Reading Now", value: stats.reading, color: "#60a5fa" },
          { label: "Pages Read", value: stats.pages.toLocaleString(), color: "#f472b6" },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <span className="label">{s.label}</span>
            <div className="stat-value" style={{ color: s.color, fontSize: 20 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? 16 : 0 }}>
          <div>
            <p className="section-title">Book Library</p>
            {!showForm && <p className="section-sub" style={{ marginBottom: 0 }}>Track your reading journey</p>}
          </div>
          <button className="btn-primary" onClick={() => setShowForm(v => !v)}>{showForm ? "Cancel" : "+ Add Book"}</button>
        </div>
        {showForm && (
          <div className="form-grid">
            <div className="form-row">
              <div><span className="label">Title *</span><input type="text" placeholder="Book title" value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} /></div>
              <div><span className="label">Author</span><input type="text" placeholder="Author name" value={form.author} onChange={e => setForm(v => ({ ...v, author: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div><span className="label">Status</span>
                <select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select></div>
              <div><span className="label">Genre</span><input type="text" placeholder="Fiction, Non-fiction..." value={form.genre} onChange={e => setForm(v => ({ ...v, genre: e.target.value }))} /></div>
            </div>
            <div className="form-row">
              <div><span className="label">Total Pages</span><input type="number" placeholder="350" value={form.pages} onChange={e => setForm(v => ({ ...v, pages: e.target.value }))} /></div>
              <div><span className="label">Current Page</span><input type="number" placeholder="50" value={form.currentPage} onChange={e => setForm(v => ({ ...v, currentPage: e.target.value }))} /></div>
            </div>
            <div>
              <span className="label">Rating (0–5)</span>
              <div style={{ display: "flex", gap: 8 }}>
                {[0,1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(v => ({ ...v, rating: String(n) }))}
                    style={{ background: parseInt(form.rating) >= n && n > 0 ? "#c9a96e" : "#1c1c22", border: "none", borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: parseInt(form.rating) >= n && n > 0 ? "#0a0a0c" : "#444", fontSize: n === 0 ? 10 : 16 }}>
                    {n === 0 ? "✕" : "★"}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div><span className="label">Start Date</span><input type="date" value={form.startDate} onChange={e => setForm(v => ({ ...v, startDate: e.target.value }))} /></div>
              <div><span className="label">End Date</span><input type="date" value={form.endDate} onChange={e => setForm(v => ({ ...v, endDate: e.target.value }))} /></div>
            </div>
            <button className="btn-primary" onClick={addBook}>Add Book</button>
          </div>
        )}
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {reading.books.length === 0 ? (
          <div className="card"><div className="empty-state">No books added yet. Your library awaits.</div></div>
        ) : reading.books.map(b => {
          const progress = b.pages && b.currentPage ? (parseInt(b.currentPage) / parseInt(b.pages)) * 100 : 0;
          return (
            <div key={b.id} className="book-card">
              <div className="book-spine" style={{ background: b.color }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 15, color: "#e8e4dc", fontFamily: "'Playfair Display', serif" }}>{b.title}</div>
                    {b.author && <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>{b.author}</div>}
                  </div>
                  <button className="btn-ghost" onClick={() => removeBook(b.id)}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                  <select value={b.status} onChange={e => updateBook(b.id, { status: e.target.value })}
                    style={{ width: "auto", padding: "3px 8px", fontSize: 11, borderRadius: 20 }}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  {b.genre && <span className="tag">{b.genre}</span>}
                  {parseInt(b.rating) > 0 && <span style={{ fontSize: 12, color: "#c9a96e" }}>{"★".repeat(parseInt(b.rating))}</span>}
                </div>
                {b.pages && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#444", marginBottom: 4 }}>
                      <span>{b.currentPage || 0} / {b.pages} pages</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%`, background: b.color }} /></div>
                    {b.status === "Reading" && (
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        <input type="number" placeholder="Update page" style={{ flex: 1, padding: "5px 10px", fontSize: 12 }}
                          onKeyDown={e => { if (e.key === "Enter") { updateBook(b.id, { currentPage: e.target.value }); e.target.value = ""; } }} />
                        <span style={{ fontSize: 11, color: "#333", alignSelf: "center" }}>↵</span>
                      </div>
                    )}
                  </div>
                )}
                {b.startDate && <div style={{ fontSize: 11, color: "#333", marginTop: 6 }}>Started: {b.startDate}{b.endDate ? ` · Finished: ${b.endDate}` : ""}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
