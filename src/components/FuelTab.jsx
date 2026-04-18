import { useState, useRef, useCallback, useEffect } from "react";
import { MacroSummary } from "./shared";
import { PRESET_FOODS } from "../data";
import { todayKey, scaleFood, parseServingSize } from "../utils";
import { getStyles } from "../styles";

export default function FuelTab({
  foodLog, setFoodLog, customFoods, setCustomFoods, macroGoals, setMacroGoals,
  backfillDay, setBackfillDay, theme: t, showFoodModal, setShowFoodModal,
}) {
  const S = getStyles(t);
  const todayFood = foodLog[todayKey()] || [];
  const totals = todayFood.reduce((a, f) => ({
    calories: a.calories + f.calories, protein: a.protein + f.protein,
    carbs: a.carbs + f.carbs, fat: a.fat + f.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Food modal state
  const [foodSearch, setFoodSearch] = useState("");
  const [usdaResults, setUsdaResults] = useState([]);
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [servingFood, setServingFood] = useState(null);
  const [servingQty, setServingQty] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualMacros, setManualMacros] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [editFood, setEditFood] = useState(null);
  const [editFoodForm, setEditFoodForm] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "" });
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [goalsForm, setGoalsForm] = useState({ ...macroGoals });

  // Scanner state
  const [scanState, setScanState] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanHint, setScanHint] = useState("Point camera at barcode...");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);

  // USDA search debounce
  const searchTimer = useRef(null);
  useEffect(() => {
    if (foodSearch.length < 3) { setUsdaResults([]); return; }
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(async () => {
      setUsdaLoading(true);
      try {
        const res = await fetch(`/api/foodsearch?query=${encodeURIComponent(foodSearch)}`);
        const data = await res.json();
        if (data.foods) setUsdaResults(data.foods.slice(0, 15));
        else setUsdaResults([]);
      } catch { setUsdaResults([]); }
      setUsdaLoading(false);
    }, 400);
    return () => clearTimeout(searchTimer.current);
  }, [foodSearch]);

  // Cleanup scanner on close
  const stopScanner = useCallback(() => {
    try {
      if (typeof readerRef.current === "number") cancelAnimationFrame(readerRef.current);
      else readerRef.current?.reset();
      readerRef.current = null;
    } catch {}
    try { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; } catch {}
  }, []);

  const closeModal = () => {
    setShowFoodModal(false); setScanState("idle"); setScanResult(null); stopScanner();
    setFoodSearch(""); setManualBarcode(""); setBackfillDay(null); setUsdaResults([]);
    setShowManualEntry(false);
  };

  const startScanner = async () => {
    setScanState("scanning"); setScanResult(null); setScanHint("Point camera at barcode...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      if ("BarcodeDetector" in window) {
        const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"] });
        const scan = async () => {
          if (!streamRef.current) return;
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) { setScanHint("✓ Barcode detected!"); stopScanner(); fetchBarcode(barcodes[0].rawValue); return; }
          } catch {}
          readerRef.current = requestAnimationFrame(scan);
        };
        readerRef.current = requestAnimationFrame(scan);
      } else {
        const ZXing = window.ZXing;
        if (!ZXing) { setScanHint("Scanner not ready. Use manual entry."); return; }
        const reader = new ZXing.BrowserMultiFormatReader(new Map());
        readerRef.current = reader;
        reader.decodeFromStream(stream, videoRef.current, (result) => {
          if (result) { setScanHint("✓ Barcode detected!"); stopScanner(); fetchBarcode(result.getText()); }
        });
      }
    } catch { setScanState("error"); setScanHint("Camera access denied."); }
  };

  const fetchBarcode = async (code) => {
    setScanState("loading");
    try {
      const res = await fetch(`/api/fatsecret?barcode=${code}`);
      const data = await res.json();
      if (res.ok && data.name) {
        setScanResult({ name: data.name, calories: data.calories, protein: data.protein, carbs: data.carbs, fat: data.fat,
          servingSize: data.servingSize, servingUnit: data.servingUnit,
          _actualServingLabel: data.servingDescription || `${data.servingSize}${data.servingUnit}`,
        });
        setScanState("result"); return;
      }
    } catch {}
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const n = data.product.nutriments;
        const parsed = parseServingSize(data.product.serving_size || "");
        setScanResult({
          name: data.product.product_name || "Scanned Product",
          calories: Math.round(n["energy-kcal_100g"] || 0), protein: parseFloat((n["proteins_100g"] || 0).toFixed(1)),
          carbs: parseFloat((n["carbohydrates_100g"] || 0).toFixed(1)), fat: parseFloat((n["fat_100g"] || 0).toFixed(1)),
          servingSize: parsed.size, servingUnit: parsed.unit,
          _actualServingLabel: data.product.serving_size || "100g",
        });
        setScanState("result");
      } else setScanState("notfound");
    } catch { setScanState("error"); }
  };

  const addFood = (food, targetDate = null) => {
    if ((food.calories === 0 || food.calories === "0") && (food.protein === 0 || food.protein === "0")) {
      setManualMacros({ name: food.name, calories: "", protein: "", carbs: "", fat: "" });
      setShowManualEntry(true); return;
    }
    setServingFood({ ...food, _targetDate: targetDate });
    setServingQty(String(food.servingSize || 100));
    setServingUnit(food.servingUnit || "g");
  };

  const confirmServing = (saveToMyFoods = false) => {
    if (!servingFood) return;
    const qty = parseFloat(servingQty) || 1;
    const scaled = scaleFood(servingFood, qty, servingUnit);
    if (saveToMyFoods) {
      setCustomFoods(prev => [...prev.filter(f => f.name !== servingFood.name), { ...servingFood, _custom: true, _targetDate: undefined }]);
    }
    const key = servingFood._targetDate || backfillDay || todayKey();
    setFoodLog(prev => ({ ...prev, [key]: [...(prev[key] || []), scaled] }));
    setServingFood(null); closeModal();
  };

  const addManualFood = (saveToMyFoods = false) => {
    if (!manualMacros.name) return;
    const entry = {
      name: manualMacros.name, calories: parseInt(manualMacros.calories) || 0,
      protein: parseInt(manualMacros.protein) || 0, carbs: parseInt(manualMacros.carbs) || 0,
      fat: parseInt(manualMacros.fat) || 0, servingSize: 100, servingUnit: "g", id: Date.now(),
    };
    if (saveToMyFoods) setCustomFoods(prev => [...prev.filter(f => f.name !== entry.name), { ...entry, _custom: true }]);
    const key = backfillDay || todayKey();
    setFoodLog(prev => ({ ...prev, [key]: [...(prev[key] || []), entry] }));
    setShowManualEntry(false); setManualMacros({ name: "", calories: "", protein: "", carbs: "", fat: "" });
    closeModal();
  };

  const removeFood = (id) => {
    const key = todayKey();
    setFoodLog(prev => ({ ...prev, [key]: (prev[key] || []).filter(f => f.id !== id) }));
  };

  const openEditFood = (item, index) => {
    setEditFood({ item, index, dateKey: todayKey() });
    setEditFoodForm({ name: item.name, calories: String(item.calories), protein: String(item.protein), carbs: String(item.carbs), fat: String(item.fat) });
  };

  const saveEditFood = () => {
    if (!editFood) return;
    const { index, dateKey } = editFood;
    const updated = {
      ...editFood.item, name: editFoodForm.name,
      calories: parseInt(editFoodForm.calories) || 0, protein: parseInt(editFoodForm.protein) || 0,
      carbs: parseInt(editFoodForm.carbs) || 0, fat: parseInt(editFoodForm.fat) || 0,
    };
    setFoodLog(prev => { const day = [...(prev[dateKey] || [])]; day[index] = updated; return { ...prev, [dateKey]: day }; });
    setEditFood(null);
  };

  const localResults = [...customFoods.map(f => ({ ...f, _custom: true })), ...PRESET_FOODS]
    .filter(f => f.name.toLowerCase().includes(foodSearch.toLowerCase()));

  return (
    <div className="ani">
      <div style={{ padding: "20px 20px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={S.pageTitle}>Nutrition</div>
            <div style={S.pageSubtitle}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          </div>
          <button onClick={() => { setGoalsForm({ ...macroGoals }); setShowGoalsModal(true); }} className="tap" style={{ ...S.ghostBtn, fontSize: 11 }}>EDIT GOALS</button>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <MacroSummary totals={totals} goals={macroGoals} theme={t} />
        <button onClick={() => setShowFoodModal(true)} className="tap" style={{ ...S.btn, marginBottom: 16 }}>+ Log Food</button>

        {todayFood.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🥗</div>
            <div style={{ color: t.sub }}>No food logged yet.</div>
          </div>
        ) : todayFood.map((food, idx) => (
          <div key={food.id} onClick={() => openEditFood(food, idx)} className="hcard" style={{
            ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: t.text }}>{food.name}</div>
                <div style={{ fontSize: 9, color: t.sub }}>✎</div>
              </div>
              <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ color: t.accent, fontWeight: 700, fontSize: 14 }}>{food.calories}cal</div>
              <button onClick={e => { e.stopPropagation(); removeFood(food.id); }} className="tap" style={{ ...S.circleBtn, width: 26, height: 26, fontSize: 14, color: t.dim }}>×</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── FOOD MODAL ── */}
      {showFoodModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 200, display: "flex", flexDirection: "column", animation: "fadeIn 0.2s ease" }}>
          <div style={{ padding: "20px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <div style={S.pageTitle}>Log Food</div>
              {backfillDay && <div style={{ fontSize: 11, color: t.carbColor, marginTop: 2 }}>Adding to: {new Date(backfillDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>}
            </div>
            <button onClick={closeModal} className="tap" style={S.closeBtn}>×</button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, padding: "0 20px 12px", flexShrink: 0 }}>
            <button onClick={() => { setScanState("idle"); setShowManualEntry(false); startScanner(); }} className="tap" style={{
              flex: 1, padding: "12px 8px", borderRadius: 12, border: `1px solid ${t.accent}30`,
              background: t.accent + "10", color: t.accent, fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>📷 Scan Barcode</button>
            <button onClick={() => { setScanState("idle"); stopScanner(); setShowManualEntry(true); }} className="tap" style={{
              flex: 1, padding: "12px 8px", borderRadius: 12, border: `1px solid ${t.cardBorder}`,
              background: t.card, color: t.sub, fontSize: 12, fontWeight: 700, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>✏️ Manual Entry</button>
          </div>

          {/* Scanner */}
          {scanState === "scanning" && (
            <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", marginBottom: 10, background: "#000", height: 200 }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ height: 200 }} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "75%", height: 80, border: `2px solid ${t.accent}`, borderRadius: 6, position: "relative", overflow: "hidden" }}><div className="scanline" /></div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: t.sub, textAlign: "center", marginBottom: 10 }}>{scanHint}</div>
              <button onClick={() => { stopScanner(); setScanState("idle"); }} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center" }}>CANCEL</button>
            </div>
          )}
          {scanState === "loading" && <div style={{ textAlign: "center", padding: 20, color: t.sub }}>⏳ Looking up product...</div>}
          {scanState === "result" && scanResult && (
            <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
              <div style={{ background: t.proteinColor + "10", border: `1px solid ${t.proteinColor}30`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text, marginBottom: 4 }}>{scanResult.name}</div>
                {scanResult._actualServingLabel && <div style={{ fontSize: 11, color: t.carbColor, marginBottom: 8 }}>Serving: {scanResult._actualServingLabel}</div>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, textAlign: "center" }}>
                  {[{ l: "CALS", v: scanResult.calories, c: t.accent }, { l: "PROTEIN", v: `${scanResult.protein}g`, c: t.proteinColor }, { l: "CARBS", v: `${scanResult.carbs}g`, c: t.carbColor }, { l: "FAT", v: `${scanResult.fat}g`, c: t.fatColor }].map((m, i) => (
                    <div key={i}><div style={{ fontSize: 16, color: m.c, fontWeight: 700 }}>{m.v}</div><div style={{ fontSize: 9, color: t.sub, letterSpacing: "0.1em" }}>{m.l}</div></div>
                  ))}
                </div>
              </div>
              <button onClick={() => addFood(scanResult)} className="tap" style={{ ...S.btn, marginBottom: 8 }}>✓ ADD THIS FOOD</button>
              <button onClick={() => { setScanState("idle"); setManualBarcode(""); setScanResult(null); }} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center" }}>SCAN ANOTHER</button>
            </div>
          )}
          {(scanState === "error" || scanState === "notfound") && (
            <div style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{scanState === "notfound" ? "🔍" : "❌"}</div>
              <div style={{ color: t.sub, marginBottom: 12 }}>{scanState === "notfound" ? "Product not found." : "Something went wrong."}</div>
              <button onClick={() => { setScanState("idle"); setManualBarcode(""); }} className="tap" style={{ ...S.ghostBtn, textAlign: "center" }}>TRY AGAIN</button>
            </div>
          )}

          {/* Manual barcode entry */}
          {scanState === "idle" && !showManualEntry && (
            <div style={{ padding: "0 20px 8px", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ ...S.input, margin: 0, flex: 1 }} placeholder="Or type barcode #..." value={manualBarcode} onChange={e => setManualBarcode(e.target.value)} onKeyDown={e => e.key === "Enter" && manualBarcode && fetchBarcode(manualBarcode)} />
                <button onClick={() => manualBarcode && fetchBarcode(manualBarcode)} className="tap" style={{ ...S.ghostBtn, color: t.accent, borderColor: t.accent + "30", whiteSpace: "nowrap" }}>LOOKUP</button>
              </div>
            </div>
          )}

          {/* Manual entry form */}
          {showManualEntry && (
            <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
              <div style={{ ...S.card, padding: 16, border: `1px solid ${t.accent}30` }}>
                <div style={S.label}>FOOD NAME</div>
                <input style={S.input} placeholder="What did you eat?" value={manualMacros.name} onChange={e => setManualMacros(p => ({ ...p, name: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><div style={S.label}>CALORIES</div><input style={S.input} type="number" placeholder="0" value={manualMacros.calories} onChange={e => setManualMacros(p => ({ ...p, calories: e.target.value }))} /></div>
                  <div><div style={S.label}>PROTEIN (g)</div><input style={S.input} type="number" placeholder="0" value={manualMacros.protein} onChange={e => setManualMacros(p => ({ ...p, protein: e.target.value }))} /></div>
                  <div><div style={S.label}>CARBS (g)</div><input style={S.input} type="number" placeholder="0" value={manualMacros.carbs} onChange={e => setManualMacros(p => ({ ...p, carbs: e.target.value }))} /></div>
                  <div><div style={S.label}>FAT (g)</div><input style={S.input} type="number" placeholder="0" value={manualMacros.fat} onChange={e => setManualMacros(p => ({ ...p, fat: e.target.value }))} /></div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => addManualFood(false)} className="tap" style={{ ...S.btn, flex: 1 }}>ADD</button>
                  <button onClick={() => addManualFood(true)} className="tap" style={{ ...S.ghostBtn, flex: 1, textAlign: "center", color: t.accent, borderColor: t.accent + "30" }}>ADD + SAVE</button>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              background: t.inputBg, border: `1px solid ${t.inputBorder}`, borderRadius: 12,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.dim} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="Search foods or USDA database..."
                style={{ background: "none", border: "none", outline: "none", color: t.text, fontSize: 14, width: "100%", fontFamily: "'DM Sans', sans-serif" }} />
            </div>
          </div>

          {/* Results */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px", paddingBottom: 40 }}>
            {/* USDA results */}
            {usdaLoading && <div style={{ textAlign: "center", padding: 12, color: t.sub, fontSize: 13 }}>Searching USDA database...</div>}
            {usdaResults.length > 0 && (
              <>
                <div style={{ ...S.sectionLabel, color: t.proteinColor }}>USDA DATABASE</div>
                {usdaResults.map((food, i) => {
                  const nutrients = food.foodNutrients || [];
                  const get = (id) => nutrients.find(n => n.nutrientId === id)?.value || 0;
                  const item = {
                    name: food.description || food.lowercaseDescription || "Unknown",
                    calories: Math.round(get(1008)), protein: Math.round(get(1003)),
                    carbs: Math.round(get(1005)), fat: Math.round(get(1004)),
                    servingSize: 100, servingUnit: "g",
                  };
                  return (
                    <div key={i} onClick={() => addFood(item)} className="tap hcard" style={{
                      ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderLeft: `3px solid ${t.proteinColor}`,
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>P:{item.protein}g · C:{item.carbs}g · F:{item.fat}g · per 100g</div>
                      </div>
                      <div style={{ color: t.accent, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{item.calories}cal</div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Local results */}
            <div style={S.sectionLabel}>{foodSearch.length >= 3 && usdaResults.length > 0 ? "LOCAL FOODS" : "COMMON FOODS"}</div>
            {localResults.map((food, i) => (
              <div key={i} onClick={() => addFood(food)} className="tap hcard" style={{
                ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>{food.name}</div>
                    {food._custom && <span style={{ background: t.accent, color: "#fff", fontSize: 8, padding: "2px 5px", borderRadius: 4, fontWeight: 600 }}>MY FOOD</span>}
                  </div>
                  <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
                </div>
                <div style={{ color: t.accent, fontWeight: 700, fontSize: 13 }}>{food.calories}cal</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SERVING MODAL ── */}
      {servingFood && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 300, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Serving Size</div>
            <button onClick={() => setServingFood(null)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{servingFood.name}</div>
          <div style={{ fontSize: 12, color: t.sub, marginBottom: 20 }}>Per 100g: {servingFood.calories}cal · {servingFood.protein}g P · {servingFood.carbs}g C · {servingFood.fat}g F</div>

          <div style={S.label}>QUANTITY</div>
          <input style={S.input} type="number" step="any" value={servingQty} onChange={e => setServingQty(e.target.value)} />

          <div style={S.label}>UNIT</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {["g", "oz", "cups", "tbsp", "tsp", "ml", "piece"].map(u => (
              <button key={u} onClick={() => setServingUnit(u)} className="tap" style={{
                padding: "8px 14px", borderRadius: 10,
                border: `1px solid ${servingUnit === u ? t.accent : t.cardBorder}`,
                background: servingUnit === u ? t.accent + "15" : t.card,
                color: servingUnit === u ? t.accent : t.sub, cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}>{u}</button>
            ))}
          </div>

          {/* Preview */}
          {(() => {
            const qty = parseFloat(servingQty) || 0;
            const preview = scaleFood(servingFood, qty, servingUnit);
            return (
              <div style={{ background: t.accent + "10", border: `1px solid ${t.accent}20`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 10, letterSpacing: "0.15em", color: t.accent, fontWeight: 600, marginBottom: 8 }}>TOTAL</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, textAlign: "center" }}>
                  {[{ l: "CALS", v: preview.calories, c: t.accent }, { l: "P", v: `${preview.protein}g`, c: t.proteinColor }, { l: "C", v: `${preview.carbs}g`, c: t.carbColor }, { l: "F", v: `${preview.fat}g`, c: t.fatColor }].map((m, i) => (
                    <div key={i}><div style={{ fontSize: 18, color: m.c, fontWeight: 700 }}>{m.v}</div><div style={{ fontSize: 9, color: t.sub }}>{m.l}</div></div>
                  ))}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => confirmServing(false)} className="tap" style={{ ...S.btn, flex: 1 }}>✓ ADD</button>
            <button onClick={() => confirmServing(true)} className="tap" style={{ ...S.ghostBtn, flex: 1, textAlign: "center", color: t.accent, borderColor: t.accent + "30" }}>ADD + SAVE</button>
          </div>
        </div>
      )}

      {/* ── EDIT FOOD MODAL ── */}
      {editFood && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 400, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Edit Food</div>
            <button onClick={() => setEditFood(null)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={S.label}>NAME</div>
          <input style={S.input} value={editFoodForm.name} onChange={e => setEditFoodForm(p => ({ ...p, name: e.target.value }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={S.label}>CALORIES</div><input style={S.input} type="number" value={editFoodForm.calories} onChange={e => setEditFoodForm(p => ({ ...p, calories: e.target.value }))} /></div>
            <div><div style={S.label}>PROTEIN (g)</div><input style={S.input} type="number" value={editFoodForm.protein} onChange={e => setEditFoodForm(p => ({ ...p, protein: e.target.value }))} /></div>
            <div><div style={S.label}>CARBS (g)</div><input style={S.input} type="number" value={editFoodForm.carbs} onChange={e => setEditFoodForm(p => ({ ...p, carbs: e.target.value }))} /></div>
            <div><div style={S.label}>FAT (g)</div><input style={S.input} type="number" value={editFoodForm.fat} onChange={e => setEditFoodForm(p => ({ ...p, fat: e.target.value }))} /></div>
          </div>
          <button onClick={saveEditFood} className="tap" style={{ ...S.btn, marginTop: 8 }}>✓ SAVE CHANGES</button>
          <button onClick={() => setEditFood(null)} className="tap" style={{ ...S.ghostBtn, width: "100%", textAlign: "center", marginTop: 8 }}>CANCEL</button>
        </div>
      )}

      {/* ── GOALS MODAL ── */}
      {showGoalsModal && (
        <div style={{ position: "fixed", inset: 0, background: t.overlay, zIndex: 400, display: "flex", flexDirection: "column", padding: 20, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={S.pageTitle}>Macro Goals</div>
            <button onClick={() => setShowGoalsModal(false)} className="tap" style={S.closeBtn}>×</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div><div style={S.label}>CALORIES</div><input style={S.input} type="number" value={goalsForm.calories} onChange={e => setGoalsForm(p => ({ ...p, calories: parseInt(e.target.value) || 0 }))} /></div>
            <div><div style={S.label}>PROTEIN (g)</div><input style={S.input} type="number" value={goalsForm.protein} onChange={e => setGoalsForm(p => ({ ...p, protein: parseInt(e.target.value) || 0 }))} /></div>
            <div><div style={S.label}>CARBS (g)</div><input style={S.input} type="number" value={goalsForm.carbs} onChange={e => setGoalsForm(p => ({ ...p, carbs: parseInt(e.target.value) || 0 }))} /></div>
            <div><div style={S.label}>FAT (g)</div><input style={S.input} type="number" value={goalsForm.fat} onChange={e => setGoalsForm(p => ({ ...p, fat: parseInt(e.target.value) || 0 }))} /></div>
          </div>
          <button onClick={() => { setMacroGoals({ ...goalsForm }); setShowGoalsModal(false); }} className="tap" style={{ ...S.btn, marginTop: 8 }}>✓ SAVE GOALS</button>
        </div>
      )}
    </div>
  );
}
