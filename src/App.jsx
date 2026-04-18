import { useState, useEffect } from "react";
import { DEFAULT_MACRO_GOALS, DEFAULT_WEIGHT_GOAL } from "./data";
import { loadLS, saveLS } from "./utils";
import { getTheme, GLOBAL_CSS, LIGHT_CSS } from "./styles";
import { BottomNav } from "./components/shared";
import HomeTab from "./components/HomeTab";
import TrainTab from "./components/TrainTab";
import FuelTab from "./components/FuelTab";
import ScaleTab from "./components/ScaleTab";
import HistoryTab from "./components/HistoryTab";
import SettingsTab from "./components/SettingsTab";

export default function LIV() {
  // ── THEME ──
  const [theme, setTheme] = useState(() => loadLS("liv_theme", "dark"));
  useEffect(() => { saveLS("liv_theme", theme); }, [theme]);
  const isDark = theme === "dark";
  const t = getTheme(isDark);

  // ── NAVIGATION ──
  const [tab, setTab] = useState("home");

  // ── DATA STATE ──
  const [workoutLog, setWorkoutLog] = useState(() => loadLS("liv_workoutLog", {}));
  const [foodLog, setFoodLog] = useState(() => loadLS("liv_foodLog", {}));
  const [customExercises, setCustomExercises] = useState(() => loadLS("liv_customExercises", []));
  const [customFoods, setCustomFoods] = useState(() => loadLS("liv_customFoods", []));
  const [restTime, setRestTime] = useState(() => loadLS("liv_restTime", 60));
  const [macroGoals, setMacroGoals] = useState(() => loadLS("liv_macroGoals", DEFAULT_MACRO_GOALS));
  const [weightLog, setWeightLog] = useState(() => loadLS("liv_weightLog", []));
  const [weightGoal, setWeightGoal] = useState(() => loadLS("liv_weightGoal", DEFAULT_WEIGHT_GOAL));

  // ── CROSS-TAB STATE ──
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [backfillDay, setBackfillDay] = useState(null);

  // ── PERSIST ──
  useEffect(() => { saveLS("liv_workoutLog", workoutLog); }, [workoutLog]);
  useEffect(() => { saveLS("liv_foodLog", foodLog); }, [foodLog]);
  useEffect(() => { saveLS("liv_customExercises", customExercises); }, [customExercises]);
  useEffect(() => { saveLS("liv_customFoods", customFoods); }, [customFoods]);
  useEffect(() => { saveLS("liv_restTime", restTime); }, [restTime]);
  useEffect(() => { saveLS("liv_macroGoals", macroGoals); }, [macroGoals]);
  useEffect(() => { saveLS("liv_weightLog", weightLog); }, [weightLog]);
  useEffect(() => { saveLS("liv_weightGoal", weightGoal); }, [weightGoal]);

  // ── SPLASH ──
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem("fuse_liv_launched_v4"));
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("fuse_liv_launched_v4", "1");
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // ── EDIT WORKOUT (shared across tabs) ──
  const [editWorkout, setEditWorkout] = useState(null);
  const [editWorkoutForm, setEditWorkoutForm] = useState({});

  const openEditWorkout = (item, index, dateKey) => {
    setEditWorkout({ item, index, dateKey });
    if (item.isCardio) setEditWorkoutForm({ duration: String(item.duration), effort: item.effort });
    else if (item.isPlank) setEditWorkoutForm({ sets: String(item.sets), holdSeconds: String(item.holdSeconds) });
    else setEditWorkoutForm({ sets: String(item.sets), reps: String(item.reps) });
  };

  const saveEditWorkout = () => {
    if (!editWorkout) return;
    const { item, index, dateKey } = editWorkout;
    let updated;
    if (item.isCardio) {
      const mins = parseInt(editWorkoutForm.duration) || 1;
      const effortKey = { Easy: "easy", Moderate: "medium", Hard: "hard" }[editWorkoutForm.effort] || "medium";
      const weightKg = (weightGoal.current || 185) * 0.4536;
      const met = { easy: 5, medium: 8, hard: 11 }[effortKey] || 8;
      updated = { ...item, duration: mins, effort: editWorkoutForm.effort, reps: mins, caloriesBurned: Math.round(met * weightKg * (mins / 60)) };
    } else if (item.isPlank) {
      updated = { ...item, sets: parseInt(editWorkoutForm.sets) || 1, holdSeconds: parseInt(editWorkoutForm.holdSeconds) || 30, reps: parseInt(editWorkoutForm.holdSeconds) || 30 };
    } else {
      updated = { ...item, sets: parseInt(editWorkoutForm.sets) || 1, reps: parseInt(editWorkoutForm.reps) || 1 };
    }
    setWorkoutLog(prev => {
      const day = [...(prev[dateKey] || [])];
      day[index] = updated;
      return { ...prev, [dateKey]: day };
    });
    setEditWorkout(null);
  };

  const S = {
    pageTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 20, letterSpacing: 2, color: t.text },
    label: { fontSize: 10, letterSpacing: "0.2em", color: t.labelColor, marginBottom: 6, fontWeight: 600, display: "block" },
    input: { width: "100%", padding: "12px 16px", background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12, color: t.text, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: 10 },
    btn: { width: "100%", padding: 14, borderRadius: 14, border: "none", cursor: "pointer", background: `linear-gradient(135deg, ${t.accent}, ${t.accentDark})`, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif" },
    ghostBtn: { padding: "10px 16px", borderRadius: 12, cursor: "pointer", border: `1px solid ${t.cardBorder}`, background: t.card, color: t.sub, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" },
    closeBtn: { width: 36, height: 36, borderRadius: 12, border: `1px solid ${t.cardBorder}`, background: t.card, cursor: "pointer", color: t.text, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
    circleBtn: { width: 36, height: 36, borderRadius: "50%", border: `1px solid ${t.cardBorder}`, background: t.card, cursor: "pointer", color: t.text, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 },
  };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, color: t.text,
      fontFamily: "'DM Sans', sans-serif", maxWidth: 430, margin: "0 auto",
      position: "relative", overflow: "hidden",
    }}>
      <style>{GLOBAL_CSS}{isDark ? "" : LIGHT_CSS}</style>

      {/* ── SPLASH ── */}
      {showSplash && (
        <div style={{
          position: "fixed", inset: 0, background: "#0A0A0A", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
        }}>
          <div style={{
            width: 72, height: 72, background: t.accent, borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "iconPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
          }}>
            <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
              <line x1="5" y1="16" x2="22" y2="16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="22" cy="16" r="6" stroke="white" strokeWidth="2" />
              <circle cx="22" cy="16" r="2.4" fill="white" />
            </svg>
          </div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 44, letterSpacing: 10, color: "#fff", lineHeight: 1, animation: "fadeUp 0.4s ease 0.7s both" }}>LIV</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.18em", textTransform: "uppercase", animation: "fadeUp 0.4s ease 0.9s both" }}>Fuse Apps · by TNT Labs</div>
        </div>
      )}

      {/* ── CONTENT ── */}
      <div style={{ paddingBottom: 90, minHeight: "100vh" }}>
        {tab === "home" && (
          <HomeTab workoutLog={workoutLog} foodLog={foodLog} macroGoals={macroGoals}
            theme={t} setTab={setTab} setShowFoodModal={setShowFoodModal} />
        )}

        {(tab === "train" || tab === "active") && (
          <TrainTab workoutLog={workoutLog} setWorkoutLog={setWorkoutLog}
            customExercises={customExercises} setCustomExercises={setCustomExercises}
            restTime={restTime} weightGoal={weightGoal}
            theme={t} tab={tab} setTab={setTab} />
        )}

        {tab === "fuel" && (
          <FuelTab foodLog={foodLog} setFoodLog={setFoodLog}
            customFoods={customFoods} setCustomFoods={setCustomFoods}
            macroGoals={macroGoals} setMacroGoals={setMacroGoals}
            backfillDay={backfillDay} setBackfillDay={setBackfillDay}
            theme={t} showFoodModal={showFoodModal} setShowFoodModal={setShowFoodModal} />
        )}

        {tab === "scale" && (
          <ScaleTab weightLog={weightLog} setWeightLog={setWeightLog}
            weightGoal={weightGoal} setWeightGoal={setWeightGoal} theme={t} />
        )}

        {tab === "history" && (
          <HistoryTab workoutLog={workoutLog} setWorkoutLog={setWorkoutLog}
            foodLog={foodLog} setFoodLog={setFoodLog}
            setBackfillDay={setBackfillDay} setShowFoodModal={setShowFoodModal} theme={t} />
        )}

        {tab === "settings" && (
          <SettingsTab theme={t} isDark={isDark} setTheme={setTheme}
            restTime={restTime} setRestTime={setRestTime}
            macroGoals={macroGoals} weightGoal={weightGoal} setTab={setTab} />
        )}
      </div>

      {/* ── EDIT WORKOUT MODAL (global) ── */}
      {editWorkout && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 400, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Edit Workout</div>
            <button onClick={() => setEditWorkout(null)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 }}>{editWorkout.item.name}</div>

          {editWorkout.item.isCardio && (
            <>
              <div style={S.label}>DURATION (min)</div>
              <input style={S.input} type="number" value={editWorkoutForm.duration} onChange={e => setEditWorkoutForm(p => ({ ...p, duration: e.target.value }))} />
              <div style={S.label}>EFFORT</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["Easy", "Moderate", "Hard"].map(e => (
                  <button key={e} onClick={() => setEditWorkoutForm(p => ({ ...p, effort: e }))} className="tap" style={{
                    flex: 1, padding: 10, borderRadius: 10,
                    border: `1px solid ${editWorkoutForm.effort === e ? t.accent : t.cardBorder}`,
                    background: editWorkoutForm.effort === e ? t.accent : t.card,
                    color: editWorkoutForm.effort === e ? "#fff" : t.sub, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  }}>{e}</button>
                ))}
              </div>
            </>
          )}
          {editWorkout.item.isPlank && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={S.label}>SETS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, sets: String(Math.max(1, parseInt(p.sets || 1) - 1)) }))} className="tap" style={S.circleBtn}>−</button>
                  <input style={{ ...S.input, margin: 0, flex: 1, textAlign: "center", fontSize: 24 }} type="number" value={editWorkoutForm.sets} onChange={e => setEditWorkoutForm(p => ({ ...p, sets: e.target.value }))} />
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, sets: String(parseInt(p.sets || 0) + 1) }))} className="tap" style={S.circleBtn}>+</button>
                </div>
              </div>
              <div>
                <div style={S.label}>HOLD (sec)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, holdSeconds: String(Math.max(10, parseInt(p.holdSeconds || 30) - 15)) }))} className="tap" style={S.circleBtn}>−</button>
                  <input style={{ ...S.input, margin: 0, flex: 1, textAlign: "center", fontSize: 24 }} type="number" value={editWorkoutForm.holdSeconds} onChange={e => setEditWorkoutForm(p => ({ ...p, holdSeconds: e.target.value }))} />
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, holdSeconds: String(parseInt(p.holdSeconds || 0) + 15) }))} className="tap" style={S.circleBtn}>+</button>
                </div>
              </div>
            </div>
          )}
          {!editWorkout.item.isCardio && !editWorkout.item.isPlank && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={S.label}>SETS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, sets: String(Math.max(1, parseInt(p.sets || 1) - 1)) }))} className="tap" style={S.circleBtn}>−</button>
                  <input style={{ ...S.input, margin: 0, flex: 1, textAlign: "center", fontSize: 28 }} type="number" value={editWorkoutForm.sets} onChange={e => setEditWorkoutForm(p => ({ ...p, sets: e.target.value }))} />
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, sets: String(parseInt(p.sets || 0) + 1) }))} className="tap" style={S.circleBtn}>+</button>
                </div>
              </div>
              <div>
                <div style={S.label}>REPS</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, reps: String(Math.max(1, parseInt(p.reps || 1) - 1)) }))} className="tap" style={S.circleBtn}>−</button>
                  <input style={{ ...S.input, margin: 0, flex: 1, textAlign: "center", fontSize: 28 }} type="number" value={editWorkoutForm.reps} onChange={e => setEditWorkoutForm(p => ({ ...p, reps: e.target.value }))} />
                  <button onClick={() => setEditWorkoutForm(p => ({ ...p, reps: String(parseInt(p.reps || 0) + 1) }))} className="tap" style={S.circleBtn}>+</button>
                </div>
              </div>
            </div>
          )}
          <button onClick={saveEditWorkout} className="tap" style={S.btn}>✓ SAVE CHANGES</button>
          <button onClick={() => setEditWorkout(null)} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center", marginTop: 8 }}>CANCEL</button>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav tab={tab} setTab={setTab} theme={t} />

      {/* ── FOOTER ── */}
      <div style={{
        borderTop: `1px solid ${t.faint}`, padding: "10px 16px",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        background: t.bg,
      }}>
        <div style={{
          width: 15, height: 15, background: t.bg, border: `1px solid ${t.dim}`,
          borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <line x1="1.5" y1="4.5" x2="6.5" y2="4.5" stroke={t.sub} strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="6.5" cy="4.5" r="1.8" stroke={t.sub} strokeWidth="0.9" />
          </svg>
        </div>
        <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 10, color: t.sub, letterSpacing: "0.08em" }}>Fuse Apps</span>
        <span style={{ fontSize: 10, color: t.dim }}>·</span>
        <span style={{ fontSize: 10, color: t.sub }}>by TNT Labs</span>
      </div>
    </div>
  );
}
