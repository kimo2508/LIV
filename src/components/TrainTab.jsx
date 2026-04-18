import { useState, useEffect, useRef } from "react";
import { ALL_EXERCISES, EXERCISE_LIBRARY } from "../data";
import { todayKey, fmtTime, estimateCardioCalories } from "../utils";
import { getStyles } from "../styles";

const GROUPS = ["All", ...Object.keys(EXERCISE_LIBRARY)];

export default function TrainTab({
  workoutLog, setWorkoutLog, customExercises, setCustomExercises,
  restTime, weightGoal, theme: t, tab, setTab,
}) {
  const S = getStyles(t);

  // ── Exercise List State ──
  const [exSearch, setExSearch] = useState("");
  const [exGroup, setExGroup] = useState("All");
  const [showAltFor, setShowAltFor] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", muscleGroup: "Chest", equipment: "", difficulty: "Beginner", alternatives: "" });

  // ── Active Exercise State ──
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsLeft, setRepsLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [isResting, setIsResting] = useState(false);
  const [restCountdown, setRestCountdown] = useState(60);
  const restRef = useRef(null);

  // Cardio
  const [cardioMinutes, setCardioMinutes] = useState("30");
  const [cardioEffort, setCardioEffort] = useState("medium");
  const [cardioRunning, setCardioRunning] = useState(false);
  const [cardioElapsed, setCardioElapsed] = useState(0);
  const cardioRef = useRef(null);

  // Plank
  const [plankSets, setPlankSets] = useState(3);
  const [plankSetDuration, setPlankSetDuration] = useState(60);
  const [plankCurrentSet, setPlankCurrentSet] = useState(1);
  const [plankCountdown, setPlankCountdown] = useState(60);
  const [plankRunning, setPlankRunning] = useState(false);
  const [plankDone, setPlankDone] = useState(false);
  const [plankResting, setPlankResting] = useState(false);
  const [plankRestCountdown, setPlankRestCountdown] = useState(30);
  const plankRef = useRef(null);

  const userWeight = weightGoal?.current || 185;
  const isCardio = (ex) => ex?.muscleGroup === "Cardio";
  const isPlank = (ex) => ex?.name === "Plank";

  // ── TIMERS ──
  useEffect(() => {
    if (isResting && restCountdown > 0) {
      restRef.current = setTimeout(() => setRestCountdown(r => r - 1), 1000);
    } else if (isResting && restCountdown === 0) setIsResting(false);
    return () => clearTimeout(restRef.current);
  }, [isResting, restCountdown]);

  useEffect(() => {
    if (cardioRunning) {
      cardioRef.current = setInterval(() => setCardioElapsed(e => e + 1), 1000);
    } else clearInterval(cardioRef.current);
    return () => clearInterval(cardioRef.current);
  }, [cardioRunning]);

  useEffect(() => {
    if (plankRunning && !plankResting) {
      if (plankCountdown > 0) plankRef.current = setTimeout(() => setPlankCountdown(c => c - 1), 1000);
      else { setPlankRunning(false); setPlankDone(true); }
    }
    return () => clearTimeout(plankRef.current);
  }, [plankRunning, plankCountdown, plankResting]);

  useEffect(() => {
    if (plankResting && plankRestCountdown > 0) {
      plankRef.current = setTimeout(() => setPlankRestCountdown(c => c - 1), 1000);
    } else if (plankResting && plankRestCountdown === 0) setPlankResting(false);
    return () => clearTimeout(plankRef.current);
  }, [plankResting, plankRestCountdown]);

  // ── HANDLERS ──
  const startExercise = (ex) => {
    setActiveExercise({ ...ex, defaultSets: ex.defaultSets || 4, defaultReps: ex.defaultReps || 10 });
    setCurrentSet(1); setRepsLeft(ex.defaultReps || 10); setIsResting(false); setCompletedSets({});
    setCardioMinutes("30"); setCardioEffort("medium"); setCardioRunning(false); setCardioElapsed(0);
    setPlankSets(3); setPlankSetDuration(60); setPlankCurrentSet(1); setPlankCountdown(60);
    setPlankRunning(false); setPlankDone(false); setPlankResting(false); setPlankRestCountdown(30);
    setTab("active");
  };

  const completeSet = () => {
    const newDone = { ...completedSets, [currentSet]: true };
    setCompletedSets(newDone);
    if (currentSet < activeExercise.defaultSets) {
      setIsResting(true); setRestCountdown(restTime);
      setCurrentSet(s => s + 1); setRepsLeft(activeExercise.defaultReps);
    } else {
      const key = todayKey();
      setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key] || []), {
        name: activeExercise.name, sets: activeExercise.defaultSets, reps: activeExercise.defaultReps,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }] }));
      setActiveExercise(null); setIsResting(false); setTab("train");
    }
  };

  const finishEarly = () => {
    const setsCompleted = Object.keys(completedSets).length;
    if (setsCompleted > 0) {
      const key = todayKey();
      setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key] || []), {
        name: activeExercise.name, sets: setsCompleted, reps: activeExercise.defaultReps,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }] }));
    }
    setActiveExercise(null); setIsResting(false); setCompletedSets({}); setCurrentSet(1); setTab("train");
  };

  const saveCardio = () => {
    const mins = cardioRunning ? Math.round(cardioElapsed / 60) : parseInt(cardioMinutes) || 0;
    if (mins === 0) return;
    const cals = estimateCardioCalories(mins, cardioEffort, userWeight);
    const effortLabel = { easy: "Easy", medium: "Moderate", hard: "Hard" }[cardioEffort] || "Moderate";
    const key = todayKey();
    setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key] || []), {
      name: activeExercise.name, sets: 1, reps: mins, isCardio: true,
      duration: mins, effort: effortLabel, caloriesBurned: cals,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }] }));
    setCardioRunning(false); clearInterval(cardioRef.current);
    setActiveExercise(null); setTab("train");
  };

  const savePlank = () => {
    const done = plankCurrentSet - 1 + (plankDone ? 1 : 0);
    if (done > 0) {
      const key = todayKey();
      setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key] || []), {
        name: "Plank", sets: done, reps: plankSetDuration, isPlank: true, holdSeconds: plankSetDuration,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }] }));
    }
    setPlankRunning(false); setPlankResting(false); clearTimeout(plankRef.current);
    setActiveExercise(null); setTab("train");
  };

  const saveCustom = () => {
    setCustomExercises(prev => [...prev, {
      ...customForm, alternatives: customForm.alternatives.split(",").map(s => s.trim()).filter(Boolean),
      defaultSets: 3, defaultReps: 10, custom: true,
    }]);
    setShowCustomForm(false);
    setCustomForm({ name: "", muscleGroup: "Chest", equipment: "", difficulty: "Beginner", alternatives: "" });
  };

  const allExercises = [...ALL_EXERCISES, ...customExercises].filter(ex => {
    const g = exGroup === "All" || ex.muscleGroup === exGroup;
    const s = ex.name.toLowerCase().includes(exSearch.toLowerCase());
    return g && s;
  });

  // ── ACTIVE EXERCISE VIEW ──
  if (tab === "active" && activeExercise) {
    return (
      <div className="ani" style={{ padding: 20 }}>
        <div style={{ ...S.accentCard, marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", color: t.accent, fontWeight: 600, marginBottom: 8 }}>NOW PERFORMING</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 28, letterSpacing: 2, lineHeight: 1.1, marginBottom: 4, color: t.text }}>{activeExercise.name}</div>
          <div style={{ fontSize: 12, color: t.sub, marginBottom: 18 }}>{activeExercise.muscleGroup} · {activeExercise.type}</div>

          {/* ── CARDIO MODE ── */}
          {isCardio(activeExercise) && (
            <div>
              <div style={S.sectionLabel}>EFFORT LEVEL</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[{ id: "easy", l: "EASY", c: t.proteinColor }, { id: "medium", l: "MODERATE", c: t.carbColor }, { id: "hard", l: "HARD", c: t.accent }].map(e => (
                  <button key={e.id} onClick={() => setCardioEffort(e.id)} className="tap" style={{
                    flex: 1, padding: "10px 6px", borderRadius: 10,
                    border: `2px solid ${cardioEffort === e.id ? e.c : t.cardBorder}`,
                    background: cardioEffort === e.id ? e.c + "15" : t.card,
                    color: cardioEffort === e.id ? e.c : t.sub, cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                  }}>{e.l}</button>
                ))}
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                {cardioRunning ? (
                  <>
                    <div style={{ fontSize: 10, color: t.accent, letterSpacing: "0.2em", fontWeight: 600, marginBottom: 8 }} className="pulse">● RECORDING</div>
                    <div style={{ fontSize: 64, color: t.accent, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 4 }}>{fmtTime(cardioElapsed)}</div>
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>Est. {estimateCardioCalories(Math.max(1, Math.round(cardioElapsed / 60)), cardioEffort, userWeight)} cal burned</div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 8 }}>
                      <button onClick={() => setCardioMinutes(m => String(Math.max(1, parseInt(m || 0) - 5)))} className="tap" style={S.circleBtn}>−</button>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 56, color: t.text, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif" }}>{cardioMinutes}</div>
                        <div style={{ fontSize: 12, color: t.sub }}>minutes</div>
                      </div>
                      <button onClick={() => setCardioMinutes(m => String(parseInt(m || 0) + 5))} className="tap" style={S.circleBtn}>+</button>
                    </div>
                    <div style={{ fontSize: 13, color: t.carbColor, marginBottom: 4 }}>≈ {estimateCardioCalories(parseInt(cardioMinutes) || 0, cardioEffort, userWeight)} cal estimated</div>
                  </>
                )}
              </div>
              {!cardioRunning ? (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => { setCardioElapsed(0); setCardioRunning(true); }} className="tap" style={{ ...S.ghostBtn, flex: 1, textAlign: "center", color: t.carbColor, borderColor: t.carbColor + "50" }}>⏱ START TIMER</button>
                  <button onClick={saveCardio} className="tap" style={{ ...S.btn, flex: 1 }}>✓ LOG IT</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <button onClick={() => setCardioRunning(false)} className="tap" style={{ ...S.ghostBtn, flex: 1, textAlign: "center" }}>⏸ PAUSE</button>
                  <button onClick={saveCardio} className="tap" style={{ ...S.btn, flex: 1 }}>✓ FINISH</button>
                </div>
              )}
            </div>
          )}

          {/* ── PLANK MODE ── */}
          {isPlank(activeExercise) && !isCardio(activeExercise) && (
            <div>
              {!plankRunning && plankCurrentSet === 1 && !plankDone && !plankResting && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={S.sectionLabel}>SETS</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <button onClick={() => setPlankSets(s => Math.max(1, s - 1))} className="tap" style={S.circleBtn}>−</button>
                      <div style={{ fontSize: 40, color: t.accent, minWidth: 32, fontFamily: "Bebas Neue, sans-serif" }}>{plankSets}</div>
                      <button onClick={() => setPlankSets(s => s + 1)} className="tap" style={S.circleBtn}>+</button>
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={S.sectionLabel}>SECONDS</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <button onClick={() => setPlankSetDuration(d => Math.max(10, d - 15))} className="tap" style={S.circleBtn}>−</button>
                      <div style={{ fontSize: 40, color: t.accent, minWidth: 48, fontFamily: "Bebas Neue, sans-serif" }}>{plankSetDuration}</div>
                      <button onClick={() => setPlankSetDuration(d => d + 15)} className="tap" style={S.circleBtn}>+</button>
                    </div>
                  </div>
                </div>
              )}
              {/* Progress bar */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {Array.from({ length: plankSets }).map((_, i) => {
                  const done = i + 1 < plankCurrentSet || (i + 1 === plankCurrentSet && plankDone);
                  const active = i + 1 === plankCurrentSet && !plankDone;
                  return <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: done ? t.accent : active ? t.carbColor : t.faint, transition: "background 0.3s" }} />;
                })}
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: t.sub, letterSpacing: "0.2em", fontWeight: 600, marginBottom: 8 }}>
                  {plankResting ? "REST" : `SET ${plankCurrentSet} OF ${plankSets}`}
                </div>
                <div style={{ fontSize: 64, color: plankResting ? t.proteinColor : t.accent, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 4 }}>
                  {plankResting ? plankRestCountdown : plankCountdown}
                </div>
                <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>seconds</div>
              </div>
              {!plankRunning && !plankDone && !plankResting && (
                <button onClick={() => { setPlankCountdown(plankSetDuration); setPlankRunning(true); }} className="tap" style={S.btn}>▶ START SET</button>
              )}
              {plankDone && (
                <button onClick={() => {
                  if (plankCurrentSet < plankSets) {
                    setPlankCurrentSet(s => s + 1); setPlankDone(false); setPlankResting(true); setPlankRestCountdown(30);
                  } else savePlank();
                }} className="tap" style={S.btn}>{plankCurrentSet < plankSets ? "NEXT SET" : "✓ FINISH"}</button>
              )}
              {plankResting && plankRestCountdown === 0 && (
                <button onClick={() => { setPlankResting(false); setPlankCountdown(plankSetDuration); setPlankRunning(true); }} className="tap" style={S.btn}>▶ START SET</button>
              )}
            </div>
          )}

          {/* ── STRENGTH MODE ── */}
          {!isCardio(activeExercise) && !isPlank(activeExercise) && (
            <div>
              {/* Set progress */}
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {Array.from({ length: activeExercise.defaultSets }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: completedSets[i + 1] ? t.accent : i + 1 === currentSet ? t.carbColor : t.faint,
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                {isResting ? (
                  <>
                    <div style={{ fontSize: 10, color: t.proteinColor, letterSpacing: "0.2em", fontWeight: 600, marginBottom: 8 }} className="pulse">REST</div>
                    <div style={{ fontSize: 72, color: t.proteinColor, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 4 }}>{restCountdown}</div>
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>seconds</div>
                    <button onClick={() => setIsResting(false)} className="tap" style={{ ...S.ghostBtn, marginTop: 12, color: t.sub }}>SKIP REST</button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 10, color: t.sub, letterSpacing: "0.2em", fontWeight: 600, marginBottom: 8 }}>
                      SET {currentSet} OF {activeExercise.defaultSets}
                    </div>
                    <div style={{ fontSize: 72, color: t.accent, lineHeight: 1, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 4 }}>{repsLeft}</div>
                    <div style={{ fontSize: 12, color: t.sub, marginTop: 4 }}>reps</div>
                  </>
                )}
              </div>
              {!isResting && <button onClick={completeSet} className="tap" style={{ ...S.btn, marginBottom: 8 }}>✓ COMPLETE SET</button>}
            </div>
          )}
        </div>

        {/* Cancel / Finish Early */}
        <button onClick={() => {
          if (isCardio(activeExercise)) saveCardio();
          else if (isPlank(activeExercise)) savePlank();
          else finishEarly();
        }} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center" }}>
          {Object.keys(completedSets).length > 0 || plankDone ? "FINISH EARLY" : "CANCEL"}
        </button>
      </div>
    );
  }

  // ── EXERCISE LIST VIEW ──
  return (
    <div className="ani">
      <div style={{ padding: "20px 20px 12px" }}>
        <div style={S.pageTitle}>Exercises</div>
        <div style={S.pageSubtitle}>{allExercises.length} exercises available</div>
      </div>

      {/* Search */}
      <div style={{ padding: "0 20px 12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
          background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={exSearch} onChange={e => setExSearch(e.target.value)} placeholder="Search exercises..."
            style={{ background: "none", border: "none", outline: "none", color: t.text, fontSize: 14, width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
        </div>
      </div>

      {/* Group pills */}
      <div style={{ display: "flex", gap: 8, padding: "0 20px 16px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {GROUPS.map(g => (
          <button key={g} onClick={() => setExGroup(g)} className="tap" style={{
            padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer",
            background: exGroup === g ? t.accent : t.faint,
            color: exGroup === g ? "#fff" : t.sub,
            fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
          }}>{g}</button>
        ))}
      </div>

      {/* Add Custom */}
      <div style={{ padding: "0 20px" }}>
        <button onClick={() => setShowCustomForm(!showCustomForm)} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center", marginBottom: 12, color: t.accent, borderColor: t.accent + "30" }}>
          {showCustomForm ? "CANCEL" : "+ ADD CUSTOM EXERCISE"}
        </button>

        {showCustomForm && (
          <div style={{ ...S.accentCard, marginBottom: 16 }}>
            <div style={S.label}>NAME</div>
            <input style={S.input} placeholder="Exercise name" value={customForm.name} onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <div style={S.label}>MUSCLE GROUP</div>
                <select style={{ ...S.input, appearance: "none" }} value={customForm.muscleGroup} onChange={e => setCustomForm(p => ({ ...p, muscleGroup: e.target.value }))}>
                  {Object.keys(EXERCISE_LIBRARY).map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <div style={S.label}>DIFFICULTY</div>
                <select style={{ ...S.input, appearance: "none" }} value={customForm.difficulty} onChange={e => setCustomForm(p => ({ ...p, difficulty: e.target.value }))}>
                  {["Beginner", "Intermediate", "Advanced"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={S.label}>EQUIPMENT</div>
            <input style={S.input} placeholder="e.g. Dumbbells, None" value={customForm.equipment} onChange={e => setCustomForm(p => ({ ...p, equipment: e.target.value }))} />
            <div style={S.label}>ALTERNATIVES (comma separated)</div>
            <input style={S.input} placeholder="e.g. Lunge, Step-Up" value={customForm.alternatives} onChange={e => setCustomForm(p => ({ ...p, alternatives: e.target.value }))} />
            <button onClick={saveCustom} className="tap" style={S.btn} disabled={!customForm.name}>SAVE EXERCISE</button>
          </div>
        )}

        {/* Exercise list */}
        {allExercises.map((ex, i) => (
          <div key={i}>
            <div className="tap hcard" onClick={() => startExercise(ex)} style={{
              ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center",
              cursor: "pointer", borderLeft: `3px solid ${t.accent}`,
            }}>
              <div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: t.text }}>{ex.name}</span>
                  {ex.custom && <span style={{ background: t.accent, color: "#fff", fontSize: 8, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>CUSTOM</span>}
                  {isCardio(ex) && <span style={{ background: t.proteinColor + "20", color: t.proteinColor, fontSize: 8, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>CARDIO</span>}
                  {isPlank(ex) && <span style={{ background: t.carbColor + "20", color: t.carbColor, fontSize: 8, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>TIMED</span>}
                </div>
                <div style={{ fontSize: 11, color: t.sub, marginTop: 3 }}>
                  {ex.muscleGroup} · {ex.equipment} · {ex.difficulty}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {ex.alternatives?.length > 0 && (
                  <button onClick={e => { e.stopPropagation(); setShowAltFor(showAltFor === i ? null : i); }} className="tap" style={{
                    ...S.ghostBtn, padding: "4px 8px", fontSize: 10, letterSpacing: "0.05em",
                  }}>ALT</button>
                )}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: t.accent + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={t.accent}><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
            </div>
            {showAltFor === i && ex.alternatives?.length > 0 && (
              <div style={{ background: t.faint, border: `1px solid ${t.cardBorder}`, borderRadius: 10, padding: "12px 14px", marginTop: -4, marginBottom: 8 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.1em", color: t.accent, fontWeight: 600, marginBottom: 8 }}>🩹 INJURY ALTERNATIVES</div>
                {ex.alternatives.map((alt, j) => (
                  <div key={j} style={{ fontSize: 13, color: t.sub, padding: "5px 0", borderBottom: j < ex.alternatives.length - 1 ? `1px solid ${t.faint}` : "none" }}>→ {alt}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
