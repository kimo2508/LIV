import { getStyles } from "../styles";

export default function SettingsTab({ theme: t, isDark, setTheme, restTime, setRestTime, macroGoals, weightGoal, setTab }) {
  const S = getStyles(t);

  return (
    <div className="ani">
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setTab("home")} className="tap" style={S.closeBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.sub} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <div style={S.pageTitle}>Settings</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Theme */}
        <div style={S.sectionLabel}>APPEARANCE</div>
        <div style={{ ...S.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 12 }}>Theme</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { id: "dark", label: "DARK", bg: "#0A0A0A", cardBg: "#151515", border: "#1c1c1c" },
              { id: "light", label: "LIGHT", bg: "#F2F2F7", cardBg: "#fff", border: "#e0e0e0" },
            ].map(th => (
              <button key={th.id} onClick={() => setTheme(th.id)} className="tap" style={{
                padding: 0, borderRadius: 12, overflow: "hidden", cursor: "pointer",
                border: `2px solid ${(isDark && th.id === "dark") || (!isDark && th.id === "light") ? t.accent : t.cardBorder}`,
                background: "transparent",
              }}>
                <div style={{ background: th.bg, padding: "10px 10px 6px" }}>
                  <div style={{ background: t.accent, height: 16, borderRadius: 4, marginBottom: 6, width: "60%" }} />
                  <div style={{ background: th.cardBg, border: `1px solid ${th.border}`, height: 24, borderRadius: 6, marginBottom: 4 }} />
                  <div style={{ background: th.cardBg, border: `1px solid ${th.border}`, height: 24, borderRadius: 6 }} />
                </div>
                <div style={{
                  padding: "8px 0", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
                  color: (isDark && th.id === "dark") || (!isDark && th.id === "light") ? t.accent : t.sub,
                  background: isDark ? "#111" : "#fff", textAlign: "center",
                }}>{th.label} {((isDark && th.id === "dark") || (!isDark && th.id === "light")) ? "✓" : ""}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rest Timer */}
        <div style={S.sectionLabel}>WORKOUT</div>
        <div style={{ ...S.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 12 }}>Default Rest Timer</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[30, 60, 90, 120].map(s => (
              <button key={s} onClick={() => setRestTime(s)} className="tap" style={{
                flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
                background: restTime === s ? t.accent : t.faint,
                color: restTime === s ? "#fff" : t.sub,
                fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
              }}>{s}s</button>
            ))}
          </div>
        </div>

        {/* Macro Goals */}
        <div style={S.sectionLabel}>NUTRITION</div>
        <div onClick={() => setTab("fuel")} className="tap hcard" style={{
          ...S.card, borderRadius: 14, padding: 16, marginBottom: 8, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 4 }}>Daily Macro Goals</div>
            <div style={{ fontSize: 12, color: t.sub }}>{macroGoals.calories} cal · {macroGoals.protein}g P · {macroGoals.carbs}g C · {macroGoals.fat}g F</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </div>

        {/* Weight Goals */}
        <div onClick={() => setTab("scale")} className="tap hcard" style={{
          ...S.card, borderRadius: 14, padding: 16, marginBottom: 16, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.accent, marginBottom: 4 }}>Weight Goals</div>
            <div style={{ fontSize: 12, color: t.sub }}>Current: {weightGoal.current || "—"} {weightGoal.unit} · Goal: {weightGoal.goal || "—"} {weightGoal.unit}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </div>

        {/* About */}
        <div style={S.sectionLabel}>ABOUT</div>
        <div style={{ ...S.card, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, background: t.accent, borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <line x1="5" y1="16" x2="22" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="2" />
                <circle cx="22" cy="16" r="2.4" fill="white" />
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 16, letterSpacing: 2, color: t.text }}>LIV</div>
              <div style={{ fontSize: 11, color: t.sub }}>Fuse Apps · by TNT Labs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
