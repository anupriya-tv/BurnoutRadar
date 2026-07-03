import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://upgraded-giggle-x5xrjr4p5446fpx9r-5000.app.github.dev";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/employees`)
      .then((r) => r.json())
      .then((data) => {
        setEmployees(data);
        setFiltered(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = employees;
    if (riskFilter !== "All") result = result.filter((e) => e.risk_level === riskFilter);
    if (deptFilter !== "All") result = result.filter((e) => e.department === deptFilter);
    if (search) result = result.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [riskFilter, deptFilter, search, employees]);

  const departments = ["All", ...new Set(employees.map((e) => e.department))];

  if (loading) return <p style={S.loading}>Loading employees...</p>;

  return (
    <div>
      <h1 style={S.h1}>Employee Risk Monitor</h1>
      <p style={S.sub}>{filtered.length} employees shown · sorted by burnout score</p>

      {/* ── Filters ── */}
      <div style={S.filterRow}>
        <input
          style={S.search}
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div style={S.filterGroup}>
          {["All", "High", "Medium", "Low"].map((r) => (
            <button
              key={r}
              onClick={() => setRiskFilter(r)}
              style={{
                ...S.filterBtn,
                ...(riskFilter === r ? S.filterBtnActive : {}),
                ...(r === "High" && riskFilter === r ? { borderColor: "#f3a8bd", color: "#f3a8bd" } : {}),
                ...(r === "Medium" && riskFilter === r ? { borderColor: "#f0b585", color: "#f0b585" } : {}),
                ...(r === "Low" && riskFilter === r ? { borderColor: "#7fcfa0", color: "#7fcfa0" } : {}),
              }}
            >
              {r}
            </button>
          ))}
        </div>
        <select
          style={S.select}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* ── Employee Table ── */}
      <div style={S.table}>
        <div style={S.tableHead}>
          <span>Name</span>
          <span>Department</span>
          <span>Role</span>
          <span>Overtime/wk</span>
          <span>Leave Taken</span>
          <span>Score</span>
          <span>Risk</span>
          <span></span>
        </div>
        {filtered.map((e) => (
          <div key={e.id} style={S.tableRow}>
            <span style={S.empName}>{e.name}</span>
            <span style={S.cell}>{e.department}</span>
            <span style={S.cell}>{e.role}</span>
            <span style={{ ...S.cell, color: e.avg_weekly_overtime_hrs >= 10 ? "#f3a8bd" : "#8089a0" }}>
              {e.avg_weekly_overtime_hrs}h
            </span>
            <span style={{ ...S.cell, color: e.leave_days_taken <= 3 ? "#f3a8bd" : "#8089a0" }}>
              {e.leave_days_taken} days
            </span>
            <span style={{ ...S.cell, color: scoreColor(e.burnout_score), fontWeight: 700 }}>
              {e.burnout_score}
            </span>
            <span><RiskBadge level={e.risk_level} /></span>
            <button style={S.viewBtn} onClick={() => navigate(`/employees/${e.id}`)}>
              View →
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={S.empty}>No employees match your filters.</p>
        )}
      </div>
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
  sub: { color: "#8089a0", fontSize: "14px", marginBottom: "24px" },

  filterRow: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" },
  search: { padding: "9px 14px", borderRadius: "8px", border: `1px solid ${LINE}`, background: NAVY_CARD, color: "#f0ecec", fontSize: "14px", minWidth: "200px" },
  filterGroup: { display: "flex", gap: "6px" },
  filterBtn: { background: "transparent", border: `1px solid ${LINE}`, color: "#8089a0", padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" },
  filterBtnActive: { background: NAVY_CARD, color: "#E8B4B8", borderColor: "#E8B4B8" },
  select: { padding: "9px 14px", borderRadius: "8px", border: `1px solid ${LINE}`, background: NAVY_CARD, color: "#f0ecec", fontSize: "14px" },

  table: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "12px", overflow: "hidden" },
  tableHead: { display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1fr 0.8fr 1fr 0.5fr", padding: "12px 20px", borderBottom: `1px solid ${LINE}`, fontSize: "11px", color: "#8089a0", textTransform: "uppercase", letterSpacing: "0.5px" },
  tableRow: { display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr 1fr 1fr 0.8fr 1fr 0.5fr", padding: "14px 20px", borderBottom: `1px solid ${LINE}`, alignItems: "center" },
  empName: { fontSize: "14px", fontWeight: 600, color: "#f0ecec" },
  cell: { fontSize: "13px", color: "#8089a0" },
  viewBtn: { background: "transparent", border: `1px solid ${LINE}`, color: "#E8B4B8", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" },
  empty: { color: "#8089a0", padding: "30px", textAlign: "center" },
};