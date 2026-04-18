// ── MACRO RING ───────────────────────────────────────────────────────────
export function MacroRing({ value, target, color, label, unit = "", trackColor = "rgba(255,255,255,0.06)" }) {
  const p = Math.min(100, Math.round((value / target) * 100));
  const r = 26, circ = 2 * Math.PI * r, offset = circ - (circ * p) / 100;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto" }}>
        <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="30" cy="30" r={r} fill="none" stroke={trackColor} strokeWidth="5" />
          <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 13, fontWeight: 700, color,
          fontFamily: "'DM Sans', sans-serif",
        }}>{value}{unit}</div>
      </div>
      <div style={{ fontSize: 9, color: "inherit", opacity: 0.5, letterSpacing: "0.15em", marginTop: 6, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 9, opacity: 0.3 }}>/{target}{unit}</div>
    </div>
  );
}

// ── MACRO SUMMARY BAR ────────────────────────────────────────────────────
export function MacroSummary({ totals, goals, theme: t }) {
  return (
    <div style={{ ...cardStyle(t), padding: "20px 16px", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-around", color: t.text }}>
        <MacroRing value={totals.calories} target={goals.calories} color={t.calColor} label="CALS" trackColor={t.ringTrack} />
        <MacroRing value={totals.protein} target={goals.protein} color={t.proteinColor} label="PROTEIN" unit="g" trackColor={t.ringTrack} />
        <MacroRing value={totals.carbs} target={goals.carbs} color={t.carbColor} label="CARBS" unit="g" trackColor={t.ringTrack} />
        <MacroRing value={totals.fat} target={goals.fat} color={t.fatColor} label="FAT" unit="g" trackColor={t.ringTrack} />
      </div>
    </div>
  );
}

function cardStyle(t) {
  return { background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 16 };
}

// ── WEIGHT CHART ─────────────────────────────────────────────────────────
export function WeightChart({ data, theme: t }) {
  if (!data || data.length < 2) return null;
  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 1, max = Math.max(...weights) + 1;
  const range = max - min || 1;
  const w = 300, h = 120;
  const pad = { top: 10, right: 10, bottom: 20, left: 40 };
  const plotW = w - pad.left - pad.right, plotH = h - pad.top - pad.bottom;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1 || 1)) * plotW,
    y: pad.top + plotH - ((d.weight - min) / range) * plotH,
    weight: d.weight,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points[points.length - 1].x},${pad.top + plotH} L${points[0].x},${pad.top + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={t.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={t.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = pad.top + plotH * (1 - f);
        return (
          <g key={i}>
            <line x1={pad.left} y1={y} x2={w - pad.right} y2={y} stroke={t.faint} strokeWidth="1" />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" fill={t.dim} fontSize="8" fontFamily="DM Sans">
              {(min + range * f).toFixed(0)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#wg)" />
      <path d={line} fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5}
          fill={i === points.length - 1 ? t.accent : t.bg} stroke={t.accent} strokeWidth="1.5" />
      ))}
      {points.length > 0 && (
        <text x={points[points.length - 1].x} y={points[points.length - 1].y - 10}
          textAnchor="middle" fill={t.accent} fontSize="11" fontWeight="700" fontFamily="DM Sans">
          {points[points.length - 1].weight}
        </text>
      )}
    </svg>
  );
}

// ── BOTTOM TAB BAR ───────────────────────────────────────────────────────
const TAB_ICONS = {
  home: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  train: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 6.5L17.5 17.5"/><path d="M2 12h4M18 12h4"/><path d="M4 8v8M20 8v8"/><path d="M7 6v12M17 6v12"/></svg>,
  fuel: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  scale: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3v9l6-3"/></svg>,
  history: (c) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
};

const TABS = [
  { id: "home", label: "Home" },
  { id: "train", label: "Train" },
  { id: "fuel", label: "Fuel" },
  { id: "scale", label: "Scale" },
  { id: "history", label: "History" },
];

export function BottomNav({ tab, setTab, theme: t }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430, background: t.navBg,
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: `1px solid ${t.cardBorder}`,
      padding: "8px 0 env(safe-area-inset-bottom, 8px)",
      display: "flex", justifyContent: "space-around", alignItems: "center", zIndex: 100,
    }}>
      {TABS.map(tb => {
        const active = tab === tb.id || (tab === "settings" && tb.id === "home") || (tab === "active" && tb.id === "train");
        const color = active ? t.accent : t.dim;
        return (
          <button key={tb.id} onClick={() => setTab(tb.id)} className="tap" style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "6px 12px",
            position: "relative",
          }}>
            {active && <div style={{
              position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
              width: 20, height: 3, borderRadius: 2, background: t.accent,
            }} />}
            {TAB_ICONS[tb.id](color)}
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.03em", color,
              fontFamily: "'DM Sans', sans-serif",
            }}>{tb.label}</span>
          </button>
        );
      })}
    </div>
  );
}
