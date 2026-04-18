// ── LOCAL STORAGE ────────────────────────────────────────────────────────
export function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}

export function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── DATE HELPERS ─────────────────────────────────────────────────────────
export const todayKey = () => new Date().toISOString().split("T")[0];

export const formatDate = (dateStr, opts = { weekday: "short", month: "short", day: "numeric" }) =>
  new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", opts);

export const fmtTime = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

// ── CALORIE ESTIMATION ───────────────────────────────────────────────────
const CARDIO_MET = { easy: 5, medium: 8, hard: 11 };

export function estimateCardioCalories(minutes, effort, userWeightLbs = 185) {
  const weightKg = userWeightLbs * 0.4536;
  const met = CARDIO_MET[effort] || 8;
  return Math.round(met * weightKg * (minutes / 60));
}

// ── SERVING SIZE PARSER ──────────────────────────────────────────────────
export function parseServingSize(servingSizeStr) {
  if (!servingSizeStr) return { size: 100, unit: "g" };
  const str = servingSizeStr.toLowerCase();
  const match = str.match(/(\d+(?:\.\d+)?)\s*(ml|g|oz|fl oz|cup|tbsp|tsp|l)/);
  if (match) {
    const size = parseFloat(match[1]);
    let unit = match[2];
    if (unit === "fl oz") unit = "oz";
    if (unit === "l") return { size: size * 1000, unit: "ml" };
    return { size, unit };
  }
  return { size: 100, unit: "g" };
}

// ── SERVING SCALE ────────────────────────────────────────────────────────
export const GRAMS_MAP = { g: 1, oz: 28.35, lbs: 453.59, kg: 1000, ml: 1, cups: 240, tbsp: 15, tsp: 5 };

export function scaleFood(food, qty, unit) {
  let scale;
  if (unit === "piece") {
    const baseGrams = (food.servingSize || 100) * (GRAMS_MAP[food.servingUnit || "g"] || 1);
    scale = qty * baseGrams / 100;
  } else {
    const inputGrams = qty * (GRAMS_MAP[unit] || 1);
    scale = inputGrams / 100;
  }
  return {
    name: `${food.name} (${qty}${unit})`,
    calories: Math.round(food.calories * scale),
    protein: Math.round(food.protein * scale),
    carbs: Math.round(food.carbs * scale),
    fat: Math.round(food.fat * scale),
    id: Date.now(),
  };
}

// ── MACRO PERCENT ────────────────────────────────────────────────────────
export const pct = (v, t) => Math.min(100, Math.round((v / t) * 100));

// ── QUOTE OF THE DAY ─────────────────────────────────────────────────────
import { QUOTES } from "./data";
export const getDailyQuote = () => QUOTES[new Date().getDate() % QUOTES.length];
