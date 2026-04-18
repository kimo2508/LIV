import { useState } from "react";
import { todayKey, formatDate } from "../utils";
import { getStyles } from "../styles";

export default function HistoryTab({
  workoutLog, setWorkoutLog, foodLog, setFoodLog,
  setBackfillDay, setShowFoodModal, theme: t,
}) {
  const S = getStyles(t);
  const [calMonth, setCalMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDay = new Date(calYear, calMonthIdx, 1).getDay();
  const daysInMonth = new Date(calYear, calMonthIdx + 1, 0).getDate();
  const monthLabel = calMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const workoutDays = Object.keys(workoutLog).filter(d => workoutLog[d]?.length > 0);
  const foodDays = Object.keys(foodLog).filter(d => foodLog[d]?.length > 0);

  const removeWorkout = (index, dateKey) => {
    setWorkoutLog(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter((_, i) => i !== index) }));
  };
  const removeFood = (id, dateKey) => {
    setFoodLog(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter(f => f.id !== id) }));
  };

  return (
    <div className="ani">
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={S.pageTitle}>History</div>
        <div style={S.pageSubtitle}>Your training journey</div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Calendar */}
        <div style={{ ...S.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx - 1, 1))} className="tap" style={S.circleBtn}>‹</button>
            <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 3, color: t.text }}>{monthLabel.toUpperCase()}</div>
            <button onClick={() => setCalMonth(new Date(calYear, calMonthIdx + 1, 1))} className="tap" style={S.circleBtn}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8, textAlign: "center" }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} style={{ fontSize: 10, color: t.sub, padding: "4px 0", fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dk = `${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const hw = workoutDays.includes(dk);
              const hf = foodDays.includes(dk);
              const it = dk === todayKey();
              const tappable = hw || hf;
              return (
                <div key={day} onClick={() => tappable && setSelectedDay(dk)} className={tappable ? "tap" : ""} style={{
                  aspectRatio: "1", borderRadius: 8, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", cursor: tappable ? "pointer" : "default",
                  background: hw ? t.accent : it ? t.faint : "transparent",
                  border: it && !hw ? `1px solid ${t.accent}80` : "1px solid transparent",
                  position: "relative",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: hw ? "#fff" : it ? t.accent : t.sub }}>{day}</span>
                  {(hw || hf) && !hw && <div style={{ position: "absolute", bottom: 3, width: 4, height: 4, borderRadius: "50%", background: t.accent, opacity: 0.8 }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div style={{ ...S.card, padding: "20px 16px", textAlign: "center", borderRadius: 14 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: t.accent, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 }}>
              {workoutDays.filter(d => d.startsWith(`${calYear}-${String(calMonthIdx + 1).padStart(2, "0")}`)).length}
            </div>
            <div style={{ fontSize: 9, color: t.sub, letterSpacing: "0.12em", marginTop: 2 }}>DAYS TRAINED</div>
          </div>
          <div style={{ ...S.card, padding: "20px 16px", textAlign: "center", borderRadius: 14 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: t.proteinColor, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 }}>
              {Object.values(workoutLog).flat().length}
            </div>
            <div style={{ fontSize: 9, color: t.sub, letterSpacing: "0.12em", marginTop: 2 }}>TOTAL EXERCISES</div>
          </div>
        </div>

        {/* Recent Sessions */}
        <div style={S.sectionLabel}>WORKOUT HISTORY</div>
        {workoutDays.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 20px", color: t.sub }}>No workouts logged yet. Get after it! 💪</div>
        ) : [...workoutDays].reverse().slice(0, 10).map(ds => (
          <div key={ds} onClick={() => setSelectedDay(ds)} className="tap hcard" style={{
            ...S.card, cursor: "pointer", borderLeft: `3px solid ${t.accent}`, borderRadius: 12,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{formatDate(ds).toUpperCase()}</div>
              <div style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>{workoutLog[ds].length} exercises</div>
            </div>
            <div style={{ fontSize: 12, color: t.sub }}>
              {workoutLog[ds].map(ex => ex.name).join(" · ")}
            </div>
          </div>
        ))}
      </div>

      {/* ── DAY DETAIL MODAL ── */}
      {selectedDay && (() => {
        const dayWorkout = workoutLog[selectedDay] || [];
        const dayFood = foodLog[selectedDay] || [];
        const totalCals = dayFood.reduce((s, f) => s + f.calories, 0);
        const totalProtein = dayFood.reduce((s, f) => s + f.protein, 0);
        return (
          <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 200, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: t.accent, fontWeight: 600, marginBottom: 4 }}>DAY SUMMARY</div>
                <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 20, letterSpacing: 2, color: t.text }}>
                  {formatDate(selectedDay, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
                </div>
              </div>
              <button onClick={() => setSelectedDay(null)} className="tap" style={S.closeBtn}>×</button>
            </div>

            {dayWorkout.length > 0 && (
              <>
                <div style={S.sectionLabel}>💪 WORKOUT — {dayWorkout.length} EXERCISES</div>
                {dayWorkout.map((ex, i) => (
                  <div key={i} className="hcard" style={{
                    ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center",
                    borderLeft: `3px solid ${ex.isCardio ? t.proteinColor : ex.isPlank ? t.carbColor : t.accent}`,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{ex.name}</div>
                      <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>
                        {ex.isCardio ? `${ex.duration}min · ${ex.effort} · ~${ex.caloriesBurned} cal`
                          : ex.isPlank ? `${ex.sets} sets × ${ex.holdSeconds}s`
                          : `${ex.sets} sets × ${ex.reps} reps`}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontSize: 11, color: t.dim }}>{ex.time}</div>
                      <button onClick={() => removeWorkout(i, selectedDay)} className="tap" style={{ ...S.circleBtn, width: 26, height: 26, fontSize: 14, color: t.dim }}>×</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: dayWorkout.length > 0 ? 16 : 0, marginBottom: 8 }}>
              <div style={{ ...S.sectionLabel, margin: 0 }}>
                🥗 NUTRITION{dayFood.length > 0 ? ` — ${totalCals} CALS · ${totalProtein}G PROTEIN` : ""}
              </div>
              <button onClick={() => { setBackfillDay(selectedDay); setShowFoodModal(true); }} className="tap" style={{
                background: t.accent, border: "none", color: "#fff", padding: "6px 12px", borderRadius: 8,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
              }}>+ ADD</button>
            </div>
            {dayFood.map((food, i) => (
              <div key={i} className="hcard" style={{
                ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{food.name}</div>
                  <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ color: t.accent, fontWeight: 700, fontSize: 14 }}>{food.calories}cal</div>
                  <button onClick={() => removeFood(food.id, selectedDay)} className="tap" style={{ ...S.circleBtn, width: 26, height: 26, fontSize: 14, color: t.dim }}>×</button>
                </div>
              </div>
            ))}
            {dayFood.length === 0 && <div style={{ fontSize: 12, color: t.sub, padding: "8px 0 12px" }}>No food logged for this day.</div>}
            <div style={{ paddingBottom: 40 }} />
          </div>
        );
      })()}
    </div>
  );
}
