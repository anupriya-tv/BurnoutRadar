import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://upgraded-giggle-x5xrjr4p5446fpx9r-5000.app.github.dev/";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [topRisk, setTopRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/dashboard/stats`).then((r) => r.json()),
      fetch(`${API}/employees?risk_level=High`).then((r) => r.json()),
    ]).then(([statsData, riskData]) => {
      setStats(statsData);
      setTopRisk(riskData.slice(0, 5));
      setLoading(false);
    });
  }, []);

  if (loading) return <p style={S.loading}>Loading dashboard...</p>;

  return (
    <div>
      <h1 style={S.h1}>Company Overview</h1>
      <p style={S.sub}>Burnout risk across your workforce — updated in real time</p>

      {/* ── Stat Cards ── */}
      <div style={S.statRow}>
        <StatCard label="Total Employees" value={stats.total_employees} color="#8fb8e8" />
        <StatCard label="High Risk 🔴" value={stats.high_risk} color="#f3a8bd" />
        <StatCard label="Medium Risk 🟡" value={stats.medium_risk} color="#f0b585" />
        <StatCard label="Low Risk 🟢" value={stats.low_risk} color="#7fcfa0" />
        <StatCard label="High Risk %" value={`${stats.high_risk_pct}%`} color="#f3a8bd" />
      </div>

      {/* ── Department Heatmap ── */}
      <div style={S.section}>
        <h2 style={S.h2}>Burnout by Department</h2>
        <div style={S.deptGrid}>
          {stats.department_stats
            .sort((a, b) => b.avg_burnout_score - a.avg_burnout_score)
            .map((d) => (
              <div key={d.department} style={S.deptCard}>
                <div style={S.deptName}>{d.department}</div>
                <div style={{ ...S.deptScore, color: scoreColor(d.avg_burnout_score) }}>
                  {d.avg_burnout_score}
                </div>
                <div style={S.deptCount}>{d.employee_count} employees</div>
                <div style={S.bar}>
                  <div
                    style={{
                      ...S.barFill,
                      width: `${d.avg_burnout_score}%`,
                      background: scoreColor(d.avg_burnout_score),
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ── Top At-Risk Employees ── */}
      <div style={S.section}>
        <h2 style={S.h2}>Top At-Risk Employees</h2>
        <div style={S.table}>
          <div style={S.tableHead}>
            <span>Name</span>
            <span>Department</span>
            <span>Role</span>
            <span>Score</span>
            <span>Risk</span>
            <span></span>
          </div>
          {topRisk.map((e) => (
            <div key={e.id} style={S.tableRow}>
              <span style={S.empName}>{e.name}</span>
              <span style={S.cell}>{e.department}</span>
              <span style={S.cell}>{e.role}</span>
              <span style={{ ...S.cell, color: scoreColor(e.burnout_score), fontWeight: 600 }}>
                {e.burnout_score}
              </span>
              <span>
                <RiskBadge level={e.risk_level} />
              </span>
              <button style={S.viewBtn} onClick={() => navigate(`/employees/${e.id}`)}>
                View →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={S.statCard}>
      <div style={{ ...S.statValue, color }}>{value}</div>
      <div style={S.statLabel}>{label}</div>
    </div>
  );
}

function RiskBadge({ level }) {
  const colors = {
    High: { bg: "#3a1620", color: "#f3a8bd", border: "1px solid #5c2436" },
    Medium: { bg: "#3a2818", color: "#f0b585", border: "1px solid #5c3a22" },
    Low: { bg: "#16201c", color: "#7fcfa0", border: "1px solid #244a35" },
  };
  const c = colors[level] || colors.Low;
  return (
    <span style={{ background: c.bg, color: c.color, border: c.border, padding: "3px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 600 }}>
      {level}
    </span>
  );
}

function scoreColor(score) {
  if (score >= 70) return "#f3a8bd";
  if (score >= 40) return "#f0b585";
  return "#7fcfa0";
}

const NAVY_CARD = "#0f1d36";
const LINE = "#1c2538";

const S = {
  loading: { color: "#8089a0", padding: "40px" },
  h1: { fontSize: "28px", fontWeight: 600, color: "#f5f1ee", margin: "0 0 8px" },
  sub: { color: "#8089a0", fontSize: "14px", marginBottom: "32px" },
  h2: { fontSize: "16px", fontWeight: 600, color: "#E8B4B8", marginBottom: "16px" },
  section: { marginTop: "40px" },

  statRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  statCard: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "20px 24px", minWidth: "140px", flex: 1 },
  statValue: { fontSize: "32px", fontWeight: 700, marginBottom: "6px" },
  statLabel: { fontSize: "12px", color: "#8089a0", textTransform: "uppercase", letterSpacing: "0.5px" },

  deptGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" },
  deptCard: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "16px" },
  deptName: { fontSize: "13px", color: "#dfe2ea", fontWeight: 600, marginBottom: "8px" },
  deptScore: { fontSize: "28px", fontWeight: 700, marginBottom: "4px" },
  deptCount: { fontSize: "11px", color: "#8089a0", marginBottom: "10px" },
  bar: { height: "4px", background: LINE, borderRadius: "2px" },
  barFill: { height: "4px", borderRadius: "2px", transition: "width 0.3s ease" },

  table: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1fr 0.5fr", padding: "12px 20px", borderBottom: `1px solid ${LINE}`, fontSize: "11px", color: "#8089a0", textTransform: "uppercase", letterSpacing: "0.5px" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1fr 0.5fr", padding: "14px 20px", borderBottom: `1px solid ${LINE}`, alignItems: "center" },
  empName: { fontSize: "14px", fontWeight: 600, color: "#f0ecec" },
  cell: { fontSize: "13px", color: "#8089a0" },
  viewBtn: { background: "transparent", border: `1px solid ${LINE}`, color: "#E8B4B8", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
};