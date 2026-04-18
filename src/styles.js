// ── GLOBAL CSS ───────────────────────────────────────────────────────────
export const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
::-webkit-scrollbar { width: 0; height: 0; }
input::placeholder { color: rgba(255,255,255,0.2); }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
@keyframes iconPop { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scanline { 0% { top: 0%; } 100% { top: 100%; } }
.ani { animation: slideUp 0.35s ease forwards; }
.tap:active { transform: scale(0.96); transition: transform 0.1s; }
.hcard { transition: background 0.2s; }
.hcard:active { background: rgba(255,255,255,0.04) !important; }
.pulse { animation: pulse 1s ease-in-out infinite; }
.scanline { position: absolute; left: 0; right: 0; height: 2px; background: #E8503C; animation: scanline 1.5s linear infinite; }
video { object-fit: cover; width: 100%; display: block; }
`;

// ── LIGHT THEME CSS OVERRIDES ────────────────────────────────────────────
export const LIGHT_CSS = `
input::placeholder { color: rgba(0,0,0,0.3) !important; }
.hcard:active { background: rgba(0,0,0,0.03) !important; }
`;

// ── THEME COLORS ─────────────────────────────────────────────────────────
export function getTheme(isDark) {
  const accent = "#E8503C";
  const accentDark = "#C43A28";
  return {
    accent,
    accentDark,
    bg: isDark ? "#0A0A0A" : "#F2F2F7",
    text: isDark ? "#fff" : "#1C1C1E",
    sub: isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.4)",
    dim: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
    faint: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    card: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.8)",
    cardBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    overlay: isDark ? "rgba(0,0,0,0.97)" : "rgba(242,242,247,0.98)",
    navBg: isDark ? "rgba(10,10,10,0.92)" : "rgba(242,242,247,0.92)",
    inputBg: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    inputBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    ringTrack: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    labelColor: isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.35)",
    // Macro colors
    calColor: accent,
    proteinColor: "#3ECFCF",
    carbColor: "#F5C542",
    fatColor: "#E87FCF",
  };
}

// ── REUSABLE STYLE FACTORIES ─────────────────────────────────────────────
export function getStyles(t) {
  return {
    card: {
      background: t.card, border: `1px solid ${t.cardBorder}`,
      borderRadius: 14, padding: 16, marginBottom: 8,
    },
    accentCard: {
      background: `linear-gradient(135deg, ${t.accent}11 0%, ${t.accent}05 100%)`,
      border: `1px solid ${t.accent}20`, borderRadius: 16, padding: "18px 20px",
    },
    btn: {
      width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer",
      background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`, color: "#fff",
      fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em",
    },
    ghostBtn: {
      padding: "10px 16px", borderRadius: 12, cursor: "pointer",
      border: `1px solid ${t.cardBorder}`, background: t.card,
      color: t.sub, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
    },
    input: {
      width: "100%", padding: "12px 16px", background: t.inputBg,
      border: `1px solid ${t.inputBorder}`, borderRadius: 12,
      color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
      outline: "none", marginBottom: 10,
    },
    label: {
      fontSize: 10, letterSpacing: "0.2em", color: t.labelColor,
      marginBottom: 6, fontWeight: 600, display: "block",
    },
    sectionLabel: {
      fontSize: 10, letterSpacing: "0.2em", color: t.labelColor,
      marginBottom: 10, fontWeight: 600,
    },
    pageTitle: {
      fontFamily: "Bebas Neue, sans-serif", fontSize: 28, letterSpacing: 4, color: t.text,
    },
    pageSubtitle: {
      fontSize: 12, color: t.sub, marginTop: 2,
    },
    closeBtn: {
      width: 36, height: 36, borderRadius: 12, border: `1px solid ${t.cardBorder}`,
      background: t.card, cursor: "pointer", color: t.text, fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center",
    },
    circleBtn: {
      width: 36, height: 36, borderRadius: "50%", border: `1px solid ${t.cardBorder}`,
      background: t.card, cursor: "pointer", color: t.text, fontSize: 18,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
    },
  };
}
