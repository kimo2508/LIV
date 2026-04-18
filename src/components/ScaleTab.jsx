import { useState } from "react";
import { WeightChart } from "./shared";
import { todayKey, formatDate } from "../utils";
import { getStyles } from "../styles";

export default function ScaleTab({ weightLog, setWeightLog, weightGoal, setWeightGoal, theme: t }) {
  const S = getStyles(t);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightEntry, setWeightEntry] = useState("");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalForm, setGoalForm] = useState({ ...weightGoal });

  const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : weightGoal.current || 0;
  const recentWeek = weightLog.slice(-7);
  const weekDelta = recentWeek.length >= 2 ? (recentWeek[0].weight - recentWeek[recentWeek.length - 1].weight).toFixed(1) : null;

  const saveWeight = () => {
    if (!weightEntry) return;
    const entry = { date: todayKey(), weight: parseFloat(weightEntry) };
    setWeightLog(prev => {
      const filtered = prev.filter(e => e.date !== todayKey());
      return [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
    });
    setWeightGoal(prev => ({ ...prev, current: parseFloat(weightEntry) }));
    setWeightEntry(""); setShowWeightModal(false);
  };

  return (
    <div className="ani">
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={S.pageTitle}>Weight</div>
        <div style={S.pageSubtitle}>Track your progress</div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Current Weight */}
        <div style={{ ...S.accentCard, marginBottom: 16, textAlign: "center" }}>
          <div style={S.sectionLabel}>CURRENT WEIGHT</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 56, letterSpacing: 4, color: t.accent, lineHeight: 1 }}>
            {latestWeight || "—"}
          </div>
          <div style={{ fontSize: 13, color: t.sub, marginTop: 4 }}>{weightGoal.unit}</div>
          {weekDelta && parseFloat(weekDelta) > 0 && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12,
              background: t.proteinColor + "15", border: `1px solid ${t.proteinColor}30`,
              padding: "6px 12px", borderRadius: 20,
            }}>
              <span style={{ color: t.proteinColor, fontSize: 12, fontWeight: 600 }}>↓ {weekDelta} {weightGoal.unit}</span>
              <span style={{ color: t.sub, fontSize: 11 }}>this week</span>
            </div>
          )}
        </div>

        {/* Chart */}
        {recentWeek.length >= 2 && (
          <div style={{ ...S.card, padding: "16px 12px", marginBottom: 16, borderRadius: 16 }}>
            <div style={{ ...S.sectionLabel, paddingLeft: 4 }}>LAST 7 DAYS</div>
            <WeightChart data={recentWeek} theme={t} />
          </div>
        )}

        {/* Log Weight Button */}
        <button onClick={() => setShowWeightModal(true)} className="tap" style={{ ...S.btn, marginBottom: 16 }}>+ Log Today's Weight</button>

        {/* Goal Card */}
        <div onClick={() => { setGoalForm({ ...weightGoal }); setShowGoalModal(true); }} className="tap hcard" style={{
          ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 16, borderRadius: 14,
        }}>
          <div>
            <div style={S.sectionLabel}>GOAL WEIGHT</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>{weightGoal.goal || "—"} <span style={{ fontSize: 12, color: t.sub }}>{weightGoal.unit}</span></div>
          </div>
          <div style={{ fontSize: 11, color: t.sub }}>Edit →</div>
        </div>

        {/* Recent Entries */}
        {weightLog.length > 0 && (
          <>
            <div style={S.sectionLabel}>RECENT ENTRIES</div>
            {[...weightLog].reverse().slice(0, 14).map((entry, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0",
                borderBottom: `1px solid ${t.faint}`,
              }}>
                <div style={{ fontSize: 13, color: t.sub }}>{formatDate(entry.date)}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{entry.weight} {weightGoal.unit}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── LOG WEIGHT MODAL ── */}
      {showWeightModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 300, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Log Weight</div>
            <button onClick={() => setShowWeightModal(false)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={S.label}>TODAY'S WEIGHT ({weightGoal.unit})</div>
          <input style={{ ...S.input, fontSize: 28, textAlign: "center", padding: 16 }} type="number" step="0.1"
            placeholder={latestWeight ? String(latestWeight) : "e.g. 185"} value={weightEntry} onChange={e => setWeightEntry(e.target.value)} autoFocus />
          <button onClick={saveWeight} className="tap" style={S.btn}>✓ SAVE WEIGHT</button>
        </div>
      )}

      {/* ── GOAL MODAL ── */}
      {showGoalModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 300, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Weight Goals</div>
            <button onClick={() => setShowGoalModal(false)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={S.label}>CURRENT WEIGHT</div><input style={S.input} type="number" step="0.1" value={goalForm.current || ""} onChange={e => setGoalForm(p => ({ ...p, current: parseFloat(e.target.value) || 0 }))} /></div>
            <div><div style={S.label}>GOAL WEIGHT</div><input style={S.input} type="number" step="0.1" value={goalForm.goal || ""} onChange={e => setGoalForm(p => ({ ...p, goal: parseFloat(e.target.value) || 0 }))} /></div>
          </div>
          <div style={S.label}>UNIT</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["lbs", "kg"].map(u => (
              <button key={u} onClick={() => setGoalForm(p => ({ ...p, unit: u }))} className="tap" style={{
                flex: 1, padding: 10, borderRadius: 10,
                border: `1px solid ${goalForm.unit === u ? t.accent : t.cardBorder}`,
                background: goalForm.unit === u ? t.accent : t.card,
                color: goalForm.unit === u ? "#fff" : t.sub, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              }}>{u}</button>
            ))}
          </div>
          <div style={S.label}>BMR (calories/day at rest)</div>
          <input style={S.input} type="number" placeholder="e.g. 1800" value={goalForm.bmr || ""} onChange={e => setGoalForm(p => ({ ...p, bmr: parseInt(e.target.value) || 0 }))} />
          <div style={S.label}>ACTIVITY LEVEL</div>
          {[
            { v: "sedentary", l: "Sedentary", d: "Desk job, little exercise" },
            { v: "light", l: "Light", d: "Light exercise 1-3 days/week" },
            { v: "moderate", l: "Moderate", d: "Exercise 3-5 days/week" },
            { v: "active", l: "Active", d: "Hard exercise 6-7 days/week" },
            { v: "veryActive", l: "Very Active", d: "Physical job + training" },
          ].map(a => (
            <button key={a.v} onClick={() => setGoalForm(p => ({ ...p, activityLevel: a.v }))} className="tap" style={{
              ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", border: `1px solid ${goalForm.activityLevel === a.v ? t.accent : t.cardBorder}`, marginBottom: 6, padding: "10px 14px",
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: goalForm.activityLevel === a.v ? t.accent : t.text }}>{a.l}</div>
                <div style={{ fontSize: 11, color: t.sub }}>{a.d}</div>
              </div>
              {goalForm.activityLevel === a.v && <div style={{ color: t.accent, fontSize: 16 }}>✓</div>}
            </button>
          ))}
          <button onClick={() => { setWeightGoal({ ...goalForm }); setShowGoalModal(false); }} className="tap" style={{ ...S.btn, marginTop: 12 }}>✓ SAVE GOALS</button>
        </div>
      )}
    </div>
  );
}
