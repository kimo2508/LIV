import { MacroSummary } from "./shared";
import { getDailyQuote, todayKey } from "../utils";
import { getStyles } from "../styles";

export default function HomeTab({ workoutLog, foodLog, macroGoals, theme: t, setTab, setShowFoodModal }) {
  const S = getStyles(t);
  const quote = getDailyQuote();
  const todayWorkout = workoutLog[todayKey()] || [];
  const todayFood = foodLog[todayKey()] || [];
  const totals = todayFood.reduce((a, f) => ({
    calories: a.calories + f.calories, protein: a.protein + f.protein,
    carbs: a.carbs + f.carbs, fat: a.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  return (
    <div className="ani">
      {/* Header */}
      <div style={{
        padding: "20px 20px 24px", position: "relative", overflow: "hidden",
        background: `linear-gradient(160deg, ${t.accent}15 0%, ${t.bg} 60%)`,
      }}>
        <div style={{
          position: "absolute", top: -60, right: -40, width: 180, height: 180,
          background: `radial-gradient(circle, ${t.accent}1F 0%, transparent 70%)`, borderRadius: "50%",
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 36, letterSpacing: 6, lineHeight: 1, color: t.text }}>LIV</div>
            <div style={{ fontSize: 11, color: t.sub, letterSpacing: "0.12em", marginTop: 2 }}>FORGE YOUR BEST SELF</div>
          </div>
          <button onClick={() => setTab("settings")} className="tap" style={S.closeBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Motivation */}
        <div style={{ ...S.accentCard, marginBottom: 16 }}>
          <div style={{ fontSize: 16, lineHeight: 1.4, fontWeight: 500, color: t.text, opacity: 0.85 }}>
            "{quote.text}"
          </div>
          <div style={{ fontSize: 11, color: t.accent, marginTop: 8, fontWeight: 600, letterSpacing: "0.05em" }}>
            — {quote.author}
          </div>
        </div>

        {/* Macros */}
        <div style={S.sectionLabel}>TODAY'S PROGRESS</div>
        <MacroSummary totals={totals} goals={macroGoals} theme={t} />

        {/* Workout Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { v: todayWorkout.length, l: "EXERCISES", color: t.accent },
            { v: todayWorkout.reduce((a, e) => a + (e.isCardio ? 1 : e.sets), 0), l: "TOTAL SETS", color: t.proteinColor },
            { v: todayWorkout.reduce((a, e) => a + (e.caloriesBurned || 0), 0) || "—", l: "CAL BURNED", color: t.carbColor },
          ].map((s, i) => (
            <div key={i} style={{ ...S.card, padding: "16px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 }}>{s.v}</div>
              <div style={{ fontSize: 9, color: t.sub, letterSpacing: "0.12em", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={S.sectionLabel}>QUICK START</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { l: "Start Workout", icon: "⚡", a: () => setTab("train") },
            { l: "Log Food", icon: "🥗", a: () => { setTab("fuel"); setTimeout(() => setShowFoodModal(true), 200); } },
            { l: "Log Weight", icon: "⚖️", a: () => setTab("scale") },
            { l: "View History", icon: "📅", a: () => setTab("history") },
          ].map((b, i) => (
            <button key={i} onClick={b.a} className="tap hcard" style={{
              padding: "20px 14px", borderRadius: 14, border: `1px solid ${t.cardBorder}`,
              background: t.card, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              fontSize: 13, fontWeight: 600, color: t.text, textAlign: "left",
              display: "flex", flexDirection: "column", gap: 8, opacity: 0.7,
            }}>
              <span style={{ fontSize: 24 }}>{b.icon}</span>
              <span>{b.l}</span>
            </button>
          ))}
        </div>

        {/* Today's Log Preview */}
        {todayWorkout.length > 0 && (
          <>
            <div style={S.sectionLabel}>TODAY'S WORKOUT</div>
            {todayWorkout.map((ex, i) => (
              <div key={i} className="hcard" style={{
                ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center",
                borderLeft: `3px solid ${ex.isCardio ? t.proteinColor : ex.isPlank ? t.carbColor : t.accent}`,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>
                    {ex.isCardio ? `${ex.duration}min · ${ex.effort} · ~${ex.caloriesBurned} cal`
                      : ex.isPlank ? `${ex.sets} sets × ${ex.holdSeconds}s hold`
                      : `${ex.sets} sets × ${ex.reps} reps`}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: t.dim }}>{ex.time}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
