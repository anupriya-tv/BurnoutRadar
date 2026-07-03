import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API = "https://upgraded-giggle-x5xrjr4p5446fpx9r-5000.app.github.dev";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    fetch(`${API}/employees/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setEmployee(data);
        if (data.ai_recommendation) {
          try {
            setRecommendation(JSON.parse(data.ai_recommendation));
          } catch {
            setRecommendation(null);
          }
        }
        setLoading(false);
      });
  }, [id]);

  const generateRecommendation = async () => {
    setGenerating(true);
    const res = await fetch(`${API}/employees/${id}/recommend`, { method: "POST" });
    const data = await res.json();
    try {
      setRecommendation(JSON.parse(data.recommendation));
    } catch {
      setRecommendation({ risk_summary: data.recommendation, immediate_actions: [], avoid: "", timeline: "" });
    }
    setGenerating(false);
  };

  if (loading) return <p style={S.loading}>Loading employee data...</p>;

  const perfDrop = employee.performance_score_previous - employee.performance_score_current;
  const perfDropPct = ((perfDrop / employee.performance_score_previous) * 100).toFixed(1);

  return (
    <div style={S.page}>
      <button style={S.backBtn} onClick={() => navigate("/employees")}>
        ← Back to Employee List
      </button>

      {/* ── Header ── */}
      <div style={S.header}>
        <div style={S.avatar}>{employee.name.charAt(0)}</div>
        <div style={S.headerInfo}>
          <h1 style={S.name}>{employee.name}</h1>
          <p style={S.role}>{employee.role} · {employee.department}</p>
          <p style={S.tenure}>{employee.tenure_months} months at company</p>
        </div>
        <div style={S.scoreWrap}>
          <div style={{ ...S.scoreBig, color: scoreColor(employee.burnout_score) }}>
            {employee.burnout_score}
          </div>
          <div style={S.scoreLabel}>Burnout Score</div>
          <RiskBadge level={employee.risk_level} />
        </div>
      </div>

      {/* ── Signal Cards ── */}
      <h2 style={S.sectionTitle}>Burnout Signals</h2>
      <div style={S.signalGrid}>
        <SignalCard
          label="Avg Weekly Overtime"
          value={`${employee.avg_weekly_overtime_hrs}h`}
          alert={employee.avg_weekly_overtime_hrs >= 10}
          note={employee.avg_weekly_overtime_hrs >= 10 ? "Above safe threshold (10h)" : "Within safe range"}
        />
        <SignalCard
          label="Leave Days Taken (6mo)"
          value={`${employee.leave_days_taken} days`}
          alert={employee.leave_days_taken <= 3}
          note={employee.leave_days_taken <= 3 ? "Critically low — burnout risk" : "Adequate leave taken"}
        />
        <SignalCard
          label="Performance Score"
          value={`${employee.performance_score_current} / 100`}
          alert={perfDrop > 0 && parseFloat(perfDropPct) >= 5}
          note={perfDrop > 0 ? `↓ ${perfDropPct}% drop from ${employee.performance_score_previous}` : "Stable or improving"}
        />
        <SignalCard
          label="Months Since Promotion"
          value={`${employee.months_since_promotion} months`}
          alert={employee.months_since_promotion >= 18}
          note={employee.months_since_promotion >= 18 ? "Overdue for review" : "Recently promoted"}
        />
      </div>

      {/* ── AI Recommendation ── */}
      <div style={S.aiSection}>
        <div style={S.aiHeader}>
          <h2 style={S.sectionTitle}>Manager Recommendation</h2>
          <button
            style={{ ...S.genBtn, ...(generating ? S.genBtnLoading : {}) }}
            onClick={generateRecommendation}
            disabled={generating}
          >
            {generating ? "Generating..." : recommendation ? "Regenerate" : "Generate AI Recommendation"}
          </button>
        </div>

        {recommendation ? (
          <div>
            {/* Risk Summary */}
            <div style={S.recSummary}>
              {recommendation.risk_summary}
            </div>

            {/* Immediate Actions */}
            <div style={S.recBlock}>
              <span style={S.recLabel}>⚡ Immediate Actions This Week</span>
              {recommendation.immediate_actions?.map((action, i) => (
                <div key={i} style={S.recAction}>
                  <span style={S.recNum}>{i + 1}</span>
                  <span style={S.recActionText}>{action}</span>
                </div>
              ))}
            </div>

            {/* Avoid + Timeline */}
            <div style={S.recRow}>
              <div style={S.recAvoidCard}>
                <span style={S.recLabel}>🚫 What to Avoid</span>
                <p style={S.recSubText}>{recommendation.avoid}</p>
              </div>
              <div style={S.recTimelineCard}>
                <span style={S.recLabel}>⏱ Urgency</span>
                <p style={S.recSubText}>{recommendation.timeline}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={S.aiEmpty}>
            Click "Generate AI Recommendation" to get a structured, personalized manager action plan for {employee.name}.
          </div>
        )}
      </div>
    </div>
  );
}

function SignalCard({ label, value, alert, note }) {
  return (
    <div style={{ ...S.signalCard, ...(alert ? S.signalCardAlert : {}) }}>
      <div style={S.signalLabel}>{label}</div>
      <div style={{ ...S.signalValue, color: alert ? "#f3a8bd" : "#7fcfa0" }}>{value}</div>
      <div style={S.signalNote}>{note}</div>
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
    <span style={{ background: c.bg, color: c.color, border: c.border, padding: "4px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 600, marginTop: "8px", display: "inline-block" }}>
      {level} Risk
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
  page: { maxWidth: "900px", margin: "0 auto" },
  loading: { color: "#8089a0", padding: "40px" },
  backBtn: { background: "transparent", border: "none", color: "#8089a0", cursor: "pointer", fontSize: "13px", marginBottom: "24px", padding: 0 },

  header: { display: "flex", alignItems: "center", gap: "24px", background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "16px", padding: "28px", marginBottom: "32px" },
  avatar: { width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #E8B4B8, #C9A9A6)", color: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 700, flexShrink: 0 },
  headerInfo: { flex: 1 },
  name: { fontSize: "24px", fontWeight: 700, color: "#f5f1ee", margin: "0 0 4px" },
  role: { fontSize: "14px", color: "#8089a0", margin: "0 0 4px" },
  tenure: { fontSize: "13px", color: "#5a6580", margin: 0 },
  scoreWrap: { textAlign: "center" },
  scoreBig: { fontSize: "52px", fontWeight: 700, lineHeight: 1 },
  scoreLabel: { fontSize: "11px", color: "#8089a0", textTransform: "uppercase", letterSpacing: "0.5px", margin: "4px 0 8px" },

  sectionTitle: { fontSize: "16px", fontWeight: 600, color: "#E8B4B8", marginBottom: "16px", marginTop: 0 },
  signalGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "32px" },
  signalCard: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "12px", padding: "16px" },
  signalCardAlert: { borderColor: "#5c2436", background: "#0d1828" },
  signalLabel: { fontSize: "11px", color: "#8089a0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" },
  signalValue: { fontSize: "26px", fontWeight: 700, marginBottom: "6px" },
  signalNote: { fontSize: "12px", color: "#6a7593" },

  aiSection: { background: NAVY_CARD, border: `1px solid ${LINE}`, borderRadius: "16px", padding: "24px" },
  aiHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  genBtn: { background: "#E8B4B8", color: "#0a1628", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: 600, fontSize: "13px", cursor: "pointer" },
  genBtnLoading: { opacity: 0.7, cursor: "default" },

  recSummary: { fontSize: "14px", color: "#dfe2ea", lineHeight: "1.7", padding: "14px 16px", background: "#0a1424", borderRadius: "8px", borderLeft: "3px solid #E8B4B8", marginBottom: "20px" },

  recBlock: { marginBottom: "20px" },
  recLabel: { fontSize: "11px", color: "#E8B4B8", textTransform: "uppercase", letterSpacing: "0.6px", fontWeight: 600, marginBottom: "12px", display: "block" },
  recAction: { display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "10px" },
  recNum: { background: "#1c2c4a", color: "#E8B4B8", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0, marginTop: "1px" },
  recActionText: { fontSize: "14px", color: "#dfe2ea", lineHeight: "1.6" },

  recRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  recAvoidCard: { background: "#1a1020", border: "1px solid #3a2030", borderRadius: "10px", padding: "16px" },
  recTimelineCard: { background: "#0f1a2a", border: "1px solid #1c3050", borderRadius: "10px", padding: "16px" },
  recSubText: { fontSize: "13px", color: "#9a8a92", margin: "8px 0 0", lineHeight: "1.6" },

  aiEmpty: { color: "#5a6580", fontSize: "14px", fontStyle: "italic", textAlign: "center", padding: "30px 0" },
};