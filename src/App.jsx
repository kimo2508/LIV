import { useState, useEffect, useRef, useCallback } from "react";

const QUOTES = [
  { text: "Stay hard. The only way through is through.", author: "David Goggins" },
  { text: "You are not your past. You are what you choose to become.", author: "David Goggins" },
  { text: "Suffering is the true test of life.", author: "David Goggins" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", author: "Joshua 1:9" },
  { text: "I can do all things through Christ who strengthens me.", author: "Philippians 4:13" },
  { text: "The Lord is my strength and my shield.", author: "Psalm 28:7" },
  { text: "Even youths grow tired and weary, but those who hope in the Lord will renew their strength.", author: "Isaiah 40:31" },
  { text: "For God gave us a spirit not of fear but of power and love and self-control.", author: "2 Timothy 1:7" },
  { text: "Champions aren't made in gyms. They're made from something inside them.", author: "Muhammad Ali" },
  { text: "Pain is temporary. Quitting lasts forever.", author: "Lance Armstrong" },
  { text: "Wake up determined. Go to bed satisfied.", author: "Dwayne Johnson" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "If something stands between you and your success, move it. Never be denied.", author: "Dwayne Johnson" },
  { text: "The last three or four reps is what makes the muscle grow.", author: "Arnold Schwarzenegger" },
];

const EXERCISE_LIBRARY = {
  Chest: { icon:"💪", exercises:[
    { name:"Barbell Bench Press", type:"Strength", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Dumbbell Bench Press","Push-Up","Machine Chest Press"] },
    { name:"Dumbbell Bench Press", type:"Strength", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Barbell Bench Press","Push-Up","Cable Fly"] },
    { name:"Incline Bench Press", type:"Strength", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Incline Dumbbell Press","Cable Upper Fly","Smith Machine Incline"] },
    { name:"Push-Up", type:"Bodyweight", equipment:"None", difficulty:"Beginner", alternatives:["Knee Push-Up","Wall Push-Up","Dumbbell Press"] },
    { name:"Cable Fly", type:"Isolation", equipment:"Cable", difficulty:"Beginner", alternatives:["Dumbbell Fly","Pec Deck","Resistance Band Fly"] },
    { name:"Chest Dip", type:"Bodyweight", equipment:"Dip Bar", difficulty:"Intermediate", alternatives:["Bench Dip","Machine Dip","Decline Push-Up"] },
  ]},
  Back: { icon:"🔙", exercises:[
    { name:"Deadlift", type:"Compound", equipment:"Barbell", difficulty:"Advanced", alternatives:["Romanian Deadlift","Trap Bar Deadlift","Dumbbell Deadlift"] },
    { name:"Pull-Up", type:"Bodyweight", equipment:"Pull-Up Bar", difficulty:"Intermediate", alternatives:["Lat Pulldown","Assisted Pull-Up","Resistance Band Pull-Up"] },
    { name:"Barbell Row", type:"Compound", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Dumbbell Row","Cable Row","Machine Row"] },
    { name:"Lat Pulldown", type:"Compound", equipment:"Cable", difficulty:"Beginner", alternatives:["Pull-Up","Resistance Band Pulldown","Dumbbell Pullover"] },
    { name:"Seated Cable Row", type:"Compound", equipment:"Cable", difficulty:"Beginner", alternatives:["Barbell Row","Dumbbell Row","Resistance Band Row"] },
    { name:"Face Pull", type:"Isolation", equipment:"Cable", difficulty:"Beginner", alternatives:["Rear Delt Fly","Band Pull Apart","Dumbbell Rear Delt Fly"] },
  ]},
  Legs: { icon:"🦵", exercises:[
    { name:"Barbell Squat", type:"Compound", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Goblet Squat","Leg Press","Bulgarian Split Squat"] },
    { name:"Romanian Deadlift", type:"Compound", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Dumbbell RDL","Cable Pull-Through","Good Morning"] },
    { name:"Leg Press", type:"Compound", equipment:"Machine", difficulty:"Beginner", alternatives:["Barbell Squat","Goblet Squat","Wall Sit"] },
    { name:"Bulgarian Split Squat", type:"Compound", equipment:"Dumbbells", difficulty:"Intermediate", alternatives:["Reverse Lunge","Step-Up","Single-Leg Leg Press"] },
    { name:"Leg Curl", type:"Isolation", equipment:"Machine", difficulty:"Beginner", alternatives:["Nordic Curl","Swiss Ball Curl","Resistance Band Curl"] },
    { name:"Walking Lunge", type:"Compound", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Stationary Lunge","Reverse Lunge","Step-Up"] },
    { name:"Calf Raise", type:"Isolation", equipment:"Machine", difficulty:"Beginner", alternatives:["Seated Calf Raise","Single-Leg Calf Raise","Jump Rope"] },
    { name:"Hip Thrust", type:"Compound", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Glute Bridge","Cable Kickback","Resistance Band Hip Thrust"] },
  ]},
  Shoulders: { icon:"🏋️", exercises:[
    { name:"Overhead Press", type:"Compound", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Dumbbell Shoulder Press","Arnold Press","Machine Shoulder Press"] },
    { name:"Dumbbell Shoulder Press", type:"Compound", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Barbell OHP","Arnold Press","Pike Push-Up"] },
    { name:"Lateral Raise", type:"Isolation", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Cable Lateral Raise","Machine Lateral Raise","Resistance Band Lateral Raise"] },
    { name:"Arnold Press", type:"Compound", equipment:"Dumbbells", difficulty:"Intermediate", alternatives:["Dumbbell Press","Barbell OHP","Machine Press"] },
    { name:"Rear Delt Fly", type:"Isolation", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Cable Rear Delt Fly","Face Pull","Band Pull Apart"] },
  ]},
  Arms: { icon:"💪", exercises:[
    { name:"Barbell Curl", type:"Isolation", equipment:"Barbell", difficulty:"Beginner", alternatives:["Dumbbell Curl","Cable Curl","Resistance Band Curl"] },
    { name:"Hammer Curl", type:"Isolation", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Rope Curl","Cross-Body Curl","Resistance Band Curl"] },
    { name:"Tricep Pushdown", type:"Isolation", equipment:"Cable", difficulty:"Beginner", alternatives:["Overhead Tricep Extension","Skull Crusher","Dip"] },
    { name:"Skull Crusher", type:"Isolation", equipment:"Barbell", difficulty:"Intermediate", alternatives:["Dumbbell Skull Crusher","Overhead Extension","Tricep Pushdown"] },
    { name:"Overhead Tricep Extension", type:"Isolation", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Cable Overhead Extension","Skull Crusher","Tricep Dip"] },
  ]},
  Core: { icon:"🔥", exercises:[
    { name:"Plank", type:"Isometric", equipment:"None", difficulty:"Beginner", alternatives:["Dead Bug","Hollow Hold","Ab Wheel"] },
    { name:"Hanging Leg Raise", type:"Compound", equipment:"Pull-Up Bar", difficulty:"Intermediate", alternatives:["Lying Leg Raise","Captain's Chair","V-Up"] },
    { name:"Ab Wheel Rollout", type:"Compound", equipment:"Ab Wheel", difficulty:"Intermediate", alternatives:["TRX Fallout","Plank","Dead Bug"] },
    { name:"Russian Twist", type:"Rotation", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Cable Wood Chop","Landmine Rotation","Med Ball Twist"] },
    { name:"Dead Bug", type:"Stability", equipment:"None", difficulty:"Beginner", alternatives:["Bird Dog","Hollow Hold","Plank"] },
  ]},
  Functional: { icon:"⚡", exercises:[
    { name:"Kettlebell Swing", type:"Power", equipment:"Kettlebell", difficulty:"Intermediate", alternatives:["Dumbbell Swing","Cable Pull-Through","Romanian Deadlift"] },
    { name:"Box Jump", type:"Plyometric", equipment:"Box", difficulty:"Intermediate", alternatives:["Step-Up","Jump Squat","Broad Jump"] },
    { name:"Battle Ropes", type:"Cardio", equipment:"Battle Ropes", difficulty:"Beginner", alternatives:["Medicine Ball Slam","Jump Rope","Rowing Machine"] },
    { name:"TRX Row", type:"Compound", equipment:"TRX", difficulty:"Beginner", alternatives:["Inverted Row","Resistance Band Row","Dumbbell Row"] },
    { name:"Farmer's Carry", type:"Loaded Carry", equipment:"Dumbbells", difficulty:"Beginner", alternatives:["Suitcase Carry","Overhead Carry","Trap Bar Carry"] },
    { name:"Med Ball Slam", type:"Power", equipment:"Medicine Ball", difficulty:"Beginner", alternatives:["Dumbbell Slam","Battle Ropes","Box Jump"] },
    { name:"Burpee", type:"Full Body", equipment:"None", difficulty:"Intermediate", alternatives:["Half Burpee","Mountain Climber","Jump Squat"] },
    { name:"Sandbag Clean", type:"Power", equipment:"Sandbag", difficulty:"Intermediate", alternatives:["Dumbbell Clean","Kettlebell Clean","Barbell Power Clean"] },
    { name:"Sled Push", type:"Loaded Carry", equipment:"Sled", difficulty:"Intermediate", alternatives:["Car Push","Prowler Push","Resistance Band Walk"] },
  ]},
  Cardio: { icon:"🏃", exercises:[
    { name:"Running", type:"Cardio", equipment:"None", difficulty:"Beginner", alternatives:["Cycling","Elliptical","Swimming"] },
    { name:"Jump Rope", type:"Cardio", equipment:"Jump Rope", difficulty:"Beginner", alternatives:["High Knees","Box Step","Battle Ropes"] },
    { name:"Rowing Machine", type:"Cardio", equipment:"Machine", difficulty:"Beginner", alternatives:["Battle Ropes","Swimming","Cycling"] },
    { name:"Cycling", type:"Cardio", equipment:"Bike", difficulty:"Beginner", alternatives:["Running","Elliptical","Rowing"] },
    { name:"Stair Climber", type:"Cardio", equipment:"Machine", difficulty:"Beginner", alternatives:["Step-Up","Incline Walk","Box Jump"] },
  ]},
};

const ALL_LIBRARY = Object.entries(EXERCISE_LIBRARY).flatMap(([group, data]) =>
  data.exercises.map(ex => ({ ...ex, muscleGroup: group }))
);

const PRESET_FOODS = [
  // Proteins
  {name:"Chicken Breast",calories:165,protein:31,carbs:0,fat:4,servingSize:100},
  {name:"Ground Beef 93% Lean",calories:152,protein:24,carbs:0,fat:6,servingSize:100},
  {name:"Ground Turkey",calories:149,protein:22,carbs:0,fat:7,servingSize:100},
  {name:"Salmon",calories:208,protein:28,carbs:0,fat:10,servingSize:100},
  {name:"Tuna (canned in water)",calories:109,protein:25,carbs:0,fat:1,servingSize:100},
  {name:"Tilapia",calories:96,protein:20,carbs:0,fat:2,servingSize:100},
  {name:"Shrimp",calories:99,protein:24,carbs:0,fat:1,servingSize:100},
  {name:"Eggs",calories:155,protein:13,carbs:1,fat:11,servingSize:100},
  {name:"Egg Whites",calories:52,protein:11,carbs:1,fat:0,servingSize:100},
  {name:"Bacon",calories:417,protein:28,carbs:1,fat:33,servingSize:100},
  {name:"Pork Tenderloin",calories:143,protein:26,carbs:0,fat:3,servingSize:100},
  {name:"Steak (sirloin)",calories:207,protein:26,carbs:0,fat:11,servingSize:100},
  {name:"Deli Turkey Breast",calories:84,protein:17,carbs:1,fat:1,servingSize:100},
  {name:"Cottage Cheese",calories:98,protein:11,carbs:3,fat:4,servingSize:100},
  {name:"Greek Yogurt (plain)",calories:59,protein:10,carbs:4,fat:0,servingSize:100},
  {name:"Whey Protein Powder",calories:120,protein:24,carbs:3,fat:2,servingSize:100},
  // Dairy
  {name:"Whole Milk",calories:61,protein:3,carbs:5,fat:3,servingSize:100},
  {name:"2% Milk",calories:50,protein:3,carbs:5,fat:2,servingSize:100},
  {name:"Cheddar Cheese",calories:402,protein:25,carbs:1,fat:33,servingSize:100},
  {name:"Mozzarella Cheese",calories:280,protein:22,carbs:2,fat:17,servingSize:100},
  {name:"Butter",calories:717,protein:1,carbs:0,fat:81,servingSize:100},
  // Grains
  {name:"White Rice (cooked)",calories:130,protein:3,carbs:28,fat:0,servingSize:100},
  {name:"Brown Rice (cooked)",calories:112,protein:3,carbs:24,fat:1,servingSize:100},
  {name:"Oats (dry)",calories:389,protein:17,carbs:66,fat:7,servingSize:100},
  {name:"White Bread",calories:265,protein:9,carbs:49,fat:3,servingSize:100},
  {name:"Whole Wheat Bread",calories:247,protein:13,carbs:41,fat:4,servingSize:100},
  {name:"Pasta (cooked)",calories:158,protein:6,carbs:31,fat:1,servingSize:100},
  {name:"Flour Tortilla",calories:312,protein:8,carbs:51,fat:8,servingSize:100},
  {name:"Quinoa (cooked)",calories:120,protein:4,carbs:21,fat:2,servingSize:100},
  {name:"White Potato",calories:77,protein:2,carbs:17,fat:0,servingSize:100},
  {name:"Sweet Potato",calories:86,protein:2,carbs:20,fat:0,servingSize:100},
  // Fruits
  {name:"Banana",calories:89,protein:1,carbs:23,fat:0,servingSize:100},
  {name:"Apple",calories:52,protein:0,carbs:14,fat:0,servingSize:100},
  {name:"Orange",calories:47,protein:1,carbs:12,fat:0,servingSize:100},
  {name:"Strawberries",calories:32,protein:1,carbs:8,fat:0,servingSize:100},
  {name:"Blueberries",calories:57,protein:1,carbs:14,fat:0,servingSize:100},
  {name:"Mango",calories:60,protein:1,carbs:15,fat:0,servingSize:100},
  {name:"Watermelon",calories:30,protein:1,carbs:8,fat:0,servingSize:100},
  {name:"Pineapple",calories:50,protein:1,carbs:13,fat:0,servingSize:100},
  // Vegetables
  {name:"Broccoli",calories:34,protein:3,carbs:7,fat:0,servingSize:100},
  {name:"Spinach",calories:23,protein:3,carbs:4,fat:0,servingSize:100},
  {name:"Asparagus",calories:20,protein:2,carbs:4,fat:0,servingSize:100},
  {name:"Green Beans",calories:31,protein:2,carbs:7,fat:0,servingSize:100},
  {name:"Bell Pepper",calories:31,protein:1,carbs:6,fat:0,servingSize:100},
  {name:"Cucumber",calories:15,protein:1,carbs:4,fat:0,servingSize:100},
  {name:"Tomato",calories:18,protein:1,carbs:4,fat:0,servingSize:100},
  {name:"Carrots",calories:41,protein:1,carbs:10,fat:0,servingSize:100},
  {name:"Mushrooms",calories:22,protein:3,carbs:3,fat:0,servingSize:100},
  {name:"Avocado",calories:160,protein:2,carbs:9,fat:15,servingSize:100},
  // Fats & Nuts
  {name:"Almonds",calories:579,protein:21,carbs:22,fat:50,servingSize:100},
  {name:"Peanut Butter",calories:588,protein:25,carbs:20,fat:50,servingSize:100},
  {name:"Almond Butter",calories:614,protein:21,carbs:19,fat:56,servingSize:100},
  {name:"Olive Oil",calories:884,protein:0,carbs:0,fat:100,servingSize:100},
  {name:"Walnuts",calories:654,protein:15,carbs:14,fat:65,servingSize:100},
  {name:"Cashews",calories:553,protein:18,carbs:30,fat:44,servingSize:100},
  // Legumes
  {name:"Black Beans (cooked)",calories:132,protein:9,carbs:24,fat:1,servingSize:100},
  {name:"Chickpeas (cooked)",calories:164,protein:9,carbs:27,fat:3,servingSize:100},
  {name:"Lentils (cooked)",calories:116,protein:9,carbs:20,fat:0,servingSize:100},
  // Snacks & Other
  {name:"Quest Protein Bar",calories:200,protein:21,carbs:22,fat:9,servingSize:100},
  {name:"Rice Cakes",calories:387,protein:8,carbs:81,fat:3,servingSize:100},
  {name:"Dark Chocolate 70%",calories:598,protein:8,carbs:46,fat:43,servingSize:100},
  {name:"Hummus",calories:166,protein:8,carbs:14,fat:10,servingSize:100},
  {name:"Chipotle Chicken Bowl",calories:490,protein:56,carbs:22,fat:18,servingSize:100},
];

const DAILY_TARGETS = { calories:2200, protein:180, carbs:220, fat:65 };
const todayKey = () => new Date().toISOString().split("T")[0];
const getDailyQuote = () => QUOTES[new Date().getDate() % QUOTES.length];

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
}
function saveLS(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export default function LIV() {
  const [tab, setTab] = useState("home");
  const [workoutLog, setWorkoutLog] = useState(() => loadLS("liv_workoutLog", {}));
  const [foodLog, setFoodLog] = useState(() => loadLS("liv_foodLog", {}));
  const [customExercises, setCustomExercises] = useState(() => loadLS("liv_customExercises", []));
  const [activeExercise, setActiveExercise] = useState(null);
  const [currentSet, setCurrentSet] = useState(1);
  const [repsLeft, setRepsLeft] = useState(0);
  const [completedSets, setCompletedSets] = useState({});
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(() => loadLS("liv_restTime", 60));
  const [restCountdown, setRestCountdown] = useState(60);
  const [calMonth, setCalMonth] = useState(new Date());
  const [exSearch, setExSearch] = useState("");
  const [exGroup, setExGroup] = useState("All");
  const [showAltFor, setShowAltFor] = useState(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name:"", muscleGroup:"Chest", equipment:"", difficulty:"Beginner", alternatives:"" });
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [weightLog, setWeightLog] = useState(() => loadLS("liv_weightLog", []));
  const [weightGoal, setWeightGoal] = useState(() => loadLS("liv_weightGoal", { current:0, goal:0, unit:"lbs", bmr:0, activityLevel:"moderate" }));
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightEntry, setWeightEntry] = useState("");
  const [showWeightGoalModal, setShowWeightGoalModal] = useState(false);
  const [weightGoalForm, setWeightGoalForm] = useState({ current:0, goal:0, unit:"lbs", bmr:0, activityLevel:"moderate" });
  const [backfillDay, setBackfillDay] = useState(null);
  const [customFoods, setCustomFoods] = useState(() => loadLS("liv_customFoods", []));
  const [selectedDay, setSelectedDay] = useState(null);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [macroGoals, setMacroGoals] = useState(() => loadLS("liv_macroGoals", { calories:2040, protein:180, carbs:60, fat:100 }));
  const [goalsForm, setGoalsForm] = useState({ calories:2040, protein:180, carbs:60, fat:100 });
  const [servingFood, setServingFood] = useState(null);
  const [servingQty, setServingQty] = useState("100");
  const [servingUnit, setServingUnit] = useState("g");
  const [manualMacros, setManualMacros] = useState({ name:"", calories:"", protein:"", carbs:"", fat:"" });
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [scanState, setScanState] = useState("idle");
  const [scanResult, setScanResult] = useState(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [scanHint, setScanHint] = useState("Point camera at barcode...");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const restRef = useRef(null);
  const readerRef = useRef(null);

  const quote = getDailyQuote();
  const todayWorkout = workoutLog[todayKey()] || [];
  const todayFood = foodLog[todayKey()] || [];

  useEffect(() => { saveLS("liv_workoutLog", workoutLog); }, [workoutLog]);
  useEffect(() => { saveLS("liv_foodLog", foodLog); }, [foodLog]);
  useEffect(() => { saveLS("liv_customExercises", customExercises); }, [customExercises]);
  useEffect(() => { saveLS("liv_restTime", restTime); }, [restTime]);
  useEffect(() => { saveLS("liv_macroGoals", macroGoals); }, [macroGoals]);
  useEffect(() => { saveLS("liv_weightLog", weightLog); }, [weightLog]);
  useEffect(() => { saveLS("liv_weightGoal", weightGoal); }, [weightGoal]);
  useEffect(() => { saveLS("liv_customFoods", customFoods); }, [customFoods]);

  useEffect(() => {
    if (isResting && restCountdown > 0) {
      restRef.current = setTimeout(() => setRestCountdown(r => r - 1), 1000);
    } else if (isResting && restCountdown === 0) setIsResting(false);
    return () => clearTimeout(restRef.current);
  }, [isResting, restCountdown]);

  useEffect(() => { if (tab !== "nutrition") stopScanner(); }, [tab]);

  const stopScanner = useCallback(() => {
    try { readerRef.current?.reset(); readerRef.current = null; } catch {}
    try { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; } catch {}
  }, []);

  const startScanner = async () => {
    setScanState("scanning");
    setScanResult(null);
    setScanHint("Point camera at barcode...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      // Use ZXing loaded from CDN via window.ZXing
      const ZXing = window.ZXing;
      if (!ZXing) { setScanHint("Scanner not ready. Use manual entry below."); return; }
      const hints = new Map();
      const reader = new ZXing.BrowserMultiFormatReader(hints);
      readerRef.current = reader;
      reader.decodeFromStream(stream, videoRef.current, (result, err) => {
        if (result) {
          const code = result.getText();
          setScanHint("✓ Barcode detected!");
          stopScanner();
          fetchBarcode(code);
        }
      });
    } catch (e) {
      setScanState("error");
      setScanHint("Camera access denied. Please allow camera permissions in Safari.");
    }
  };

  const fetchBarcode = async (code) => {
    setScanState("loading");
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const data = await res.json();
      if (data.status === 1) {
        const n = data.product.nutriments;
        const serving = data.product.serving_size || "per serving";
        setScanResult({
          name: `${data.product.product_name || "Product"} (${serving})`,
          calories: Math.round(n["energy-kcal_serving"] || n["energy-kcal_100g"] || 0),
          protein: Math.round(n.proteins_serving || n.proteins_100g || 0),
          carbs: Math.round(n.carbohydrates_serving || n.carbohydrates_100g || 0),
          fat: Math.round(n.fat_serving || n.fat_100g || 0),
        });
        setScanState("result");
      } else setScanState("notfound");
    } catch { setScanState("error"); }
  };

  const addFood = (food, targetDate=null) => {
    // If food has zeros across the board from scanner, open manual entry instead
    if ((food.calories===0||food.calories==="0") && (food.protein===0||food.protein==="0")) {
      setManualMacros({ name:food.name, calories:"", protein:"", carbs:"", fat:"" });
      setShowManualEntry(true);
      return;
    }
    setServingFood({...food, _targetDate: targetDate});
    setServingQty("100");
    setServingUnit("g");
  };

  const confirmServing = (saveToMyFoods=false) => {
    if (!servingFood) return;
    const qty = parseFloat(servingQty) || 1;
    const base = servingFood.servingSize || 100;
    const unit = servingUnit;
    const gramsMap = { g:1, oz:28.35, lbs:453.59, kg:1000, ml:1, cups:240, tbsp:15, tsp:5, piece:base };
    const grams = qty * (gramsMap[unit] || 1);
    const scale = unit === "piece" ? qty : grams / base;
    const scaled = {
      name: `${servingFood.name} (${qty}${unit})`,
      calories: Math.round(servingFood.calories * scale),
      protein: Math.round(servingFood.protein * scale),
      carbs: Math.round(servingFood.carbs * scale),
      fat: Math.round(servingFood.fat * scale),
      id: Date.now(),
    };
    if (saveToMyFoods) {
      setCustomFoods(prev => [...prev.filter(f=>f.name!==servingFood.name), {...servingFood, _custom:true, _targetDate:undefined}]);
    }
    const key = servingFood._targetDate || backfillDay || todayKey();
    setFoodLog(prev => ({ ...prev, [key]: [...(prev[key]||[]), scaled] }));
    setServingFood(null); setShowFoodModal(false); setScanState("idle"); setScanResult(null);
    setFoodSearch(""); setManualBarcode(""); stopScanner(); setBackfillDay(null);
  };

  const addManualFood = (saveToMyFoods=false) => {
    if (!manualMacros.name) return;
    const entry = {
      name: manualMacros.name,
      calories: parseInt(manualMacros.calories)||0,
      protein: parseInt(manualMacros.protein)||0,
      carbs: parseInt(manualMacros.carbs)||0,
      fat: parseInt(manualMacros.fat)||0,
      servingSize: 100,
      id: Date.now(),
    };
    if (saveToMyFoods) {
      setCustomFoods(prev => [...prev.filter(f=>f.name!==entry.name), {...entry, _custom:true}]);
    }
    const key = backfillDay || todayKey();
    setFoodLog(prev => ({ ...prev, [key]: [...(prev[key]||[]), entry] }));
    setShowManualEntry(false); setManualMacros({ name:"", calories:"", protein:"", carbs:"", fat:"" });
    setShowFoodModal(false); setScanState("idle"); setScanResult(null);
    setFoodSearch(""); setManualBarcode(""); stopScanner(); setBackfillDay(null);
  };

  const removeFood = (id, date=null) => {
    const key = date || todayKey();
    setFoodLog(prev => ({ ...prev, [key]: (prev[key]||[]).filter(f => f.id !== id) }));
  };

  const removeWorkout = (index) => {
    const key = todayKey();
    setWorkoutLog(prev => ({ ...prev, [key]: (prev[key]||[]).filter((_,i) => i !== index) }));
  };

  const startExercise = (ex) => {
    setActiveExercise({ ...ex, defaultSets:ex.defaultSets||4, defaultReps:ex.defaultReps||10 });
    setCurrentSet(1); setRepsLeft(ex.defaultReps||10);
    setIsResting(false); setCompletedSets({}); setTab("active");
  };

  const completeSet = () => {
    const newDone = { ...completedSets, [currentSet]:true };
    setCompletedSets(newDone);
    if (currentSet < activeExercise.defaultSets) {
      setIsResting(true); setRestCountdown(restTime);
      setCurrentSet(s => s+1); setRepsLeft(activeExercise.defaultReps);
    } else {
      const key = todayKey();
      setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key]||[]), {
        name:activeExercise.name, sets:activeExercise.defaultSets, reps:activeExercise.defaultReps,
        time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
      }]}));
      setActiveExercise(null); setIsResting(false); setTab("exercises");
    }
  };

  const finishEarly = () => {
    const setsCompleted = Object.keys(completedSets).length;
    if (setsCompleted === 0) { setActiveExercise(null); setIsResting(false); setCompletedSets({}); setTab("exercises"); return; }
    const key = todayKey();
    setWorkoutLog(prev => ({ ...prev, [key]: [...(prev[key]||[]), {
      name:activeExercise.name, sets:setsCompleted, reps:activeExercise.defaultReps,
      time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),
    }]}));
    setActiveExercise(null); setIsResting(false); setCompletedSets({}); setCurrentSet(1); setTab("exercises");
  };

  const saveCustom = () => {
    setCustomExercises(prev => [...prev, {
      ...customForm,
      alternatives:customForm.alternatives.split(",").map(s=>s.trim()).filter(Boolean),
      defaultSets:3, defaultReps:10, custom:true,
    }]);
    setShowCustomForm(false);
    setCustomForm({ name:"", muscleGroup:"Chest", equipment:"", difficulty:"Beginner", alternatives:"" });
  };

  const totals = todayFood.reduce((a,f) => ({
    calories:a.calories+f.calories, protein:a.protein+f.protein, carbs:a.carbs+f.carbs, fat:a.fat+f.fat,
  }), { calories:0, protein:0, carbs:0, fat:0 });

  const allExercises = [...ALL_LIBRARY, ...customExercises].filter(ex => {
    const g = exGroup==="All" || ex.muscleGroup===exGroup;
    const s = ex.name.toLowerCase().includes(exSearch.toLowerCase());
    return g && s;
  });

  const workoutDays = Object.keys(workoutLog).filter(d => workoutLog[d]?.length > 0);
  const calYear = calMonth.getFullYear();
  const calMonthIdx = calMonth.getMonth();
  const firstDay = new Date(calYear,calMonthIdx,1).getDay();
  const daysInMonth = new Date(calYear,calMonthIdx+1,0).getDate();
  const monthLabel = calMonth.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const pct = (v,t) => Math.min(100,Math.round((v/t)*100));

  const C = {
    app:{ minHeight:"100vh", background:"#080808", fontFamily:"'Bebas Neue',Impact,sans-serif", color:"#fff", maxWidth:480, margin:"0 auto", paddingBottom:80 },
    hdr:{ background:"linear-gradient(135deg,#ff4500 0%,#b83000 100%)", padding:"18px 20px 14px", overflow:"hidden", position:"relative" },
    nav:{ display:"flex", background:"#0e0e0e", borderBottom:"1px solid #181818", overflowX:"auto" },
    nb:(a)=>({ flex:"0 0 auto", padding:"11px 14px", border:"none", cursor:"pointer", fontFamily:"Bebas Neue,sans-serif", fontSize:12, letterSpacing:1.5, whiteSpace:"nowrap", transition:"all 0.2s", background:a?"#ff4500":"transparent", color:a?"#fff":"#555" }),
    sec:{ padding:16 },
    card:{ background:"#111", border:"1px solid #1c1c1c", borderRadius:14, padding:16, marginBottom:12 },
    acard:{ background:"linear-gradient(135deg,#1a0800,#0e0e0e)", border:"2px solid #ff4500", borderRadius:14, padding:20, marginBottom:16 },
    btn:(v="primary")=>({ width:"100%", padding:14, borderRadius:12, border:"none", cursor:"pointer", fontFamily:"Bebas Neue,sans-serif", fontSize:18, letterSpacing:3, background:v==="primary"?"linear-gradient(135deg,#ff4500,#cc2200)":v==="ghost"?"transparent":"#1a1a1a", color:v==="ghost"?"#555":"#fff", border:v==="ghost"?"1px solid #222":"none" }),
    sBtn:{ padding:"7px 14px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"Bebas Neue,sans-serif", fontSize:12, letterSpacing:1 },
    inp:{ width:"100%", padding:"12px 14px", background:"#111", border:"1px solid #2a2a2a", borderRadius:10, color:"#fff", fontFamily:"Barlow,sans-serif", fontSize:15, outline:"none", marginBottom:10 },
    lbl:{ fontFamily:"Barlow,sans-serif", fontSize:11, color:"#666", letterSpacing:2, marginBottom:4, display:"block" },
  };

  return (
    <div style={C.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:#ff4500;border-radius:2px}
        input::placeholder{color:#444} select{appearance:none;background:#111;color:#fff}
        @keyframes su{from{transform:translateY(14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes scanline{0%{top:0%}100%{top:100%}}
        .sl{animation:su 0.3s ease forwards}
        .ec:hover{background:#161616!important;transform:translateX(3px);transition:all 0.2s}
        .fr:hover{background:#161616!important} .pr:active{transform:scale(0.93)}
        .scanline{position:absolute;left:0;right:0;height:2px;background:#ff4500;animation:scanline 1.5s linear infinite}
        video{object-fit:cover;width:100%;display:block}
      `}</style>

      <div style={C.hdr}>
        <div style={{position:"absolute",top:-40,right:-30,width:130,height:130,background:"rgba(255,255,255,0.04)",borderRadius:"50%"}}/>
        <div style={{fontSize:38,letterSpacing:8,lineHeight:1}}>LIV</div>
        <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,opacity:.75,letterSpacing:3,marginTop:2}}>FORGE YOUR BEST SELF</div>
      </div>

      <div style={C.nav}>
        {[{id:"home",l:"🏠 HOME"},{id:"exercises",l:"⚡ EXERCISES"},{id:"log",l:"📋 LOG"},{id:"nutrition",l:"🔥 NUTRITION"},{id:"weight",l:"⚖️ WEIGHT"},{id:"calendar",l:"📅 CALENDAR"}].map(t=>(
          <button key={t.id} style={C.nb(tab===t.id)} onClick={()=>setTab(t.id)} className="pr">{t.l}</button>
        ))}
      </div>

      {tab==="home"&&(
        <div style={C.sec} className="sl">
          <div style={C.acard}>
            <div style={{fontSize:10,color:"#ff4500",letterSpacing:3,fontFamily:"Barlow,sans-serif",marginBottom:10}}>TODAY'S MOTIVATION</div>
            <div style={{fontSize:21,lineHeight:1.25,marginBottom:10,letterSpacing:1}}>"{quote.text}"</div>
            <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#ff6633"}}>— {quote.author}</div>
          </div>
          <div style={C.card}>
            <div style={{fontSize:13,letterSpacing:3,marginBottom:14,color:"#ff4500"}}>TODAY'S SUMMARY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center"}}>
              <div><div style={{fontSize:36}}>{todayWorkout.length}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555",letterSpacing:1}}>EXERCISES</div></div>
              <div><div style={{fontSize:36}}>{todayWorkout.reduce((a,e)=>a+e.sets,0)}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555",letterSpacing:1}}>SETS</div></div>
              <div><div style={{fontSize:36,color:totals.calories>DAILY_TARGETS.calories?"#ff4500":"#fff"}}>{totals.calories}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555",letterSpacing:1}}>CALORIES</div></div>
            </div>
          </div>
          <div style={{fontSize:11,letterSpacing:3,color:"#444",marginBottom:10,fontFamily:"Barlow,sans-serif"}}>QUICK START</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[{l:"START WORKOUT",i:"⚡",a:()=>setTab("exercises")},{l:"LOG FOOD",i:"🥗",a:()=>{setTab("nutrition");setTimeout(()=>setShowFoodModal(true),100);}},{l:"LOG WEIGHT",i:"⚖️",a:()=>{setTab("weight");setTimeout(()=>setShowWeightModal(true),100);}},{l:"WORKOUT LOG",i:"📋",a:()=>setTab("log")}].map((b,i)=>(
              <button key={i} onClick={b.a} className="pr" style={{padding:"18px 10px",borderRadius:12,border:"1px solid #1e1e1e",background:"#111",cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:13,letterSpacing:2,color:"#fff",textAlign:"center"}}>
                <div style={{fontSize:24,marginBottom:6}}>{b.i}</div>{b.l}
              </button>
            ))}
          </div>
        </div>
      )}

      {tab==="active"&&activeExercise&&(
        <div style={C.sec} className="sl">
          <div style={C.acard}>
            <div style={{fontSize:10,letterSpacing:3,color:"#ff4500",fontFamily:"Barlow,sans-serif",marginBottom:8}}>NOW PERFORMING</div>
            <div style={{fontSize:28,letterSpacing:2,lineHeight:1.1,marginBottom:4}}>{activeExercise.name}</div>
            <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#666",marginBottom:18}}>{activeExercise.muscleGroup} · {activeExercise.type}</div>
            <div style={{display:"flex",gap:6,marginBottom:20}}>
              {Array.from({length:activeExercise.defaultSets}).map((_,i)=>(
                <div key={i} style={{flex:1,height:6,borderRadius:3,transition:"background 0.3s",background:completedSets[i+1]?"#ff4500":i+1===currentSet?"#ff8c00":"#222"}}/>
              ))}
            </div>
            {isResting?(
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,color:"#ff4500",letterSpacing:3,fontFamily:"Barlow,sans-serif",marginBottom:10}}>REST TIME</div>
                <div style={{position:"relative",display:"inline-block",marginBottom:10}}>
                  <svg width="120" height="120" style={{transform:"rotate(-90deg)"}}>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#222" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#ff4500" strokeWidth="8" strokeDasharray="283" strokeDashoffset={283-(283*restCountdown/restTime)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:38}}>{restCountdown}s</div>
                </div>
                <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:"#555",marginBottom:14}}>Set {currentSet} of {activeExercise.defaultSets} up next</div>
                <button onClick={()=>setIsResting(false)} style={{...C.sBtn,background:"#222",color:"#888"}}>SKIP REST</button>
              </div>
            ):(
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:12,color:"#888",letterSpacing:3,fontFamily:"Barlow,sans-serif"}}>SET {currentSet} / {activeExercise.defaultSets}</div>
                <div style={{fontSize:76,color:"#ff4500",lineHeight:1,margin:"6px 0"}}>{repsLeft}</div>
                <div style={{fontSize:11,color:"#555",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:16}}>REPS</div>
                <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:20}}>
                  {[{l:"−",a:()=>setRepsLeft(r=>Math.max(0,r-1))},{l:"RST",a:()=>setRepsLeft(activeExercise.defaultReps),sm:true},{l:"+",a:()=>setRepsLeft(r=>r+1)}].map((b,i)=>(
                    <button key={i} onClick={b.a} className="pr" style={{width:50,height:50,borderRadius:"50%",background:"#1a1a1a",border:"2px solid #2a2a2a",color:b.sm?"#666":"#fff",fontSize:b.sm?10:22,cursor:"pointer",fontFamily:b.sm?"Bebas Neue,sans-serif":"Barlow,sans-serif",fontWeight:700,letterSpacing:1}}>{b.l}</button>
                  ))}
                </div>
                <button onClick={completeSet} className="pr" style={C.btn()}>{currentSet<activeExercise.defaultSets?"✓ SET DONE — REST":"✓ FINISH EXERCISE"}</button>
              </div>
            )}
          </div>
          <button onClick={finishEarly} className="pr" style={{...C.btn("ghost"),color:"#ff8c00",border:"1px solid #ff8c00",marginBottom:8}}>
            ✓ FINISH & SAVE ({Object.keys(completedSets).length} SET{Object.keys(completedSets).length!==1?"S":""} COMPLETED)
          </button>
          <button onClick={()=>{setActiveExercise(null);setIsResting(false);setCompletedSets({});setCurrentSet(1);setTab("exercises");}} style={C.btn("ghost")}>← BACK WITHOUT SAVING</button>
          <div style={{...C.card,marginTop:12}}>
            <div style={C.lbl}>REST BETWEEN SETS</div>
            <div style={{display:"flex",gap:8}}>
              {[30,60,90,120].map(s=>(
                <button key={s} onClick={()=>setRestTime(s)} className="pr" style={{...C.sBtn,flex:1,background:restTime===s?"#ff4500":"#1a1a1a",color:restTime===s?"#fff":"#666"}}>{s}s</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="exercises"&&(
        <div style={C.sec} className="sl">
          <input style={C.inp} placeholder="🔍  Search exercises..." value={exSearch} onChange={e=>setExSearch(e.target.value)}/>
          <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,marginBottom:14}}>
            {["All",...Object.keys(EXERCISE_LIBRARY)].map(g=>(
              <button key={g} onClick={()=>setExGroup(g)} className="pr" style={{...C.sBtn,flex:"0 0 auto",background:exGroup===g?"#ff4500":"#1a1a1a",color:exGroup===g?"#fff":"#666"}}>{EXERCISE_LIBRARY[g]?.icon||"🔍"} {g}</button>
            ))}
          </div>
          <button onClick={()=>setShowCustomForm(v=>!v)} className="pr" style={{...C.btn(),marginBottom:12,fontSize:14}}>+ CREATE CUSTOM EXERCISE</button>
          {showCustomForm&&(
            <div style={{...C.card,border:"2px solid #ff4500",marginBottom:16}}>
              <div style={{fontSize:16,letterSpacing:2,color:"#ff4500",marginBottom:12}}>NEW EXERCISE</div>
              <div style={C.lbl}>NAME</div>
              <input style={C.inp} placeholder="Exercise name" value={customForm.name} onChange={e=>setCustomForm(p=>({...p,name:e.target.value}))}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={C.lbl}>MUSCLE GROUP</div><select style={C.inp} value={customForm.muscleGroup} onChange={e=>setCustomForm(p=>({...p,muscleGroup:e.target.value}))}>{Object.keys(EXERCISE_LIBRARY).map(g=><option key={g}>{g}</option>)}</select></div>
                <div><div style={C.lbl}>DIFFICULTY</div><select style={C.inp} value={customForm.difficulty} onChange={e=>setCustomForm(p=>({...p,difficulty:e.target.value}))}>{["Beginner","Intermediate","Advanced"].map(d=><option key={d}>{d}</option>)}</select></div>
              </div>
              <div style={C.lbl}>EQUIPMENT</div>
              <input style={C.inp} placeholder="e.g. Dumbbells, None" value={customForm.equipment} onChange={e=>setCustomForm(p=>({...p,equipment:e.target.value}))}/>
              <div style={C.lbl}>INJURY ALTERNATIVES (comma separated)</div>
              <input style={C.inp} placeholder="e.g. Lunge, Step-Up" value={customForm.alternatives} onChange={e=>setCustomForm(p=>({...p,alternatives:e.target.value}))}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={saveCustom} className="pr" style={{...C.btn(),flex:1,fontSize:14}} disabled={!customForm.name}>SAVE</button>
                <button onClick={()=>setShowCustomForm(false)} className="pr" style={{...C.btn("ghost"),flex:"0 0 80px",fontSize:14}}>CANCEL</button>
              </div>
            </div>
          )}
          <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#444",letterSpacing:2,marginBottom:8}}>{allExercises.length} EXERCISES</div>
          {allExercises.map((ex,i)=>(
            <div key={i}>
              <div className="ec" style={{background:"#111",borderRadius:12,padding:"13px 15px",marginBottom:6,borderLeft:"3px solid #ff4500",cursor:"pointer"}} onClick={()=>startExercise(ex)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <span style={{fontSize:18,letterSpacing:1}}>{ex.name}</span>
                      {ex.custom&&<span style={{background:"#ff4500",color:"#fff",fontSize:8,padding:"2px 6px",borderRadius:4,fontFamily:"Barlow,sans-serif"}}>CUSTOM</span>}
                    </div>
                    <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:3}}>{ex.muscleGroup} · {ex.equipment} · {ex.difficulty}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {ex.alternatives?.length>0&&(<button onClick={e=>{e.stopPropagation();setShowAltFor(showAltFor===i?null:i);}} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",padding:"4px 8px",borderRadius:6,cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:10,letterSpacing:1}}>ALT</button>)}
                    <span style={{color:"#ff4500",fontSize:16}}>▶</span>
                  </div>
                </div>
              </div>
              {showAltFor===i&&ex.alternatives?.length>0&&(
                <div style={{background:"#0e0e0e",border:"1px solid #1e1e1e",borderRadius:10,padding:"12px 14px",marginTop:-4,marginBottom:8}}>
                  <div style={{fontSize:10,letterSpacing:2,color:"#ff4500",fontFamily:"Barlow,sans-serif",marginBottom:8}}>🩹 INJURY ALTERNATIVES</div>
                  {ex.alternatives.map((alt,j)=>(<div key={j} style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:"#aaa",padding:"5px 0",borderBottom:j<ex.alternatives.length-1?"1px solid #1a1a1a":"none"}}>→ {alt}</div>))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==="log"&&(
        <div style={C.sec} className="sl">
          <div style={{fontSize:22,letterSpacing:3,marginBottom:4}}>TODAY'S LOG</div>
          <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",marginBottom:16}}>{new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}</div>
          {todayWorkout.length===0?(
            <div style={{textAlign:"center",padding:"50px 20px"}}><div style={{fontSize:48,marginBottom:12}}>💪</div><div style={{fontFamily:"Barlow,sans-serif",color:"#444"}}>No exercises yet. Head to EXERCISES to get started.</div></div>
          ):(
            <>
              {todayWorkout.map((ex,i)=>(<div key={i} style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:"3px solid #ff4500"}}><div><div style={{fontSize:18,letterSpacing:1}}>{ex.name}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>{ex.sets} sets × {ex.reps} reps</div></div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#444"}}>{ex.time}</div><button onClick={()=>removeWorkout(i)} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#666",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14}}>×</button></div></div>))}
              <div style={{...C.acard,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",textAlign:"center",gap:8}}>
                {[{l:"EXERCISES",v:todayWorkout.length},{l:"TOTAL SETS",v:todayWorkout.reduce((a,e)=>a+e.sets,0)},{l:"TOTAL REPS",v:todayWorkout.reduce((a,e)=>a+(e.sets*e.reps),0)}].map((s,i)=>(<div key={i}><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>{s.l}</div><div style={{fontSize:34}}>{s.v}</div></div>))}
              </div>
            </>
          )}
        </div>
      )}

      {tab==="nutrition"&&(
        <div style={C.sec} className="sl">
          <div style={{fontSize:22,letterSpacing:3,marginBottom:16}}>NUTRITION</div>
          <div style={C.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:13,letterSpacing:2,color:"#ff4500"}}>DAILY TARGETS</div><button onClick={()=>{setGoalsForm({...macroGoals});setShowGoalsModal(true);}} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",padding:"4px 10px",borderRadius:6,cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:11,letterSpacing:1}}>EDIT GOALS</button></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,textAlign:"center"}}>
              {[{l:"CALS",v:totals.calories,t:macroGoals.calories,c:"#ff4500",u:""},{l:"PROTEIN",v:totals.protein,t:macroGoals.protein,c:"#00d4ff",u:"g"},{l:"CARBS",v:totals.carbs,t:macroGoals.carbs,c:"#ffcc00",u:"g"},{l:"FAT",v:totals.fat,t:macroGoals.fat,c:"#ff69b4",u:"g"}].map((m,i)=>{
                const p=pct(m.v,m.t);
                return(<div key={i} style={{position:"relative"}}><svg width="70" height="70" style={{transform:"rotate(-90deg)"}}><circle cx="35" cy="35" r="28" fill="none" stroke="#1a1a1a" strokeWidth="6"/><circle cx="35" cy="35" r="28" fill="none" stroke={m.c} strokeWidth="6" strokeLinecap="round" strokeDasharray="176" strokeDashoffset={176-(176*p/100)} style={{transition:"stroke-dashoffset 0.6s ease"}}/></svg><div style={{position:"absolute",top:0,left:0,right:0,bottom:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:m.c}}>{m.v}{m.u}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:9,color:"#555",letterSpacing:1}}>{m.l}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:9,color:"#333"}}>/{m.t}{m.u}</div></div>);
              })}
            </div>
          </div>
          <button onClick={()=>setShowFoodModal(true)} className="pr" style={{...C.btn(),marginBottom:16}}>+ LOG FOOD</button>
          {todayFood.length===0?(<div style={{textAlign:"center",padding:"40px 20px"}}><div style={{fontSize:40,marginBottom:8}}>🥗</div><div style={{fontFamily:"Barlow,sans-serif",color:"#444"}}>No food logged yet.</div></div>):todayFood.map(food=>(<div key={food.id} className="fr" style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:600}}>{food.name}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div></div><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{color:"#ff4500",fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:700}}>{food.calories}cal</div><button onClick={()=>removeFood(food.id)} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#666",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14}}>×</button></div></div>))}


        </div>
      )}

      {/* FOOD MODALS - global, work from any tab */}
        {showFoodModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:200,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexShrink:0}}>
              <div>
                <div style={{fontSize:22,letterSpacing:3}}>LOG FOOD</div>
                {backfillDay&&<div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#ff8c00",marginTop:2}}>Adding to: {new Date(backfillDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>}
              </div>
              <button onClick={()=>{setShowFoodModal(false);setScanState("idle");setScanResult(null);stopScanner();setBackfillDay(null);}} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
            </div>
            <div style={{marginBottom:12}}/>
            <div style={{...C.card,marginBottom:12,flexShrink:0}}>
              <div style={{fontSize:14,letterSpacing:2,color:"#ff4500",marginBottom:12}}>📷 BARCODE SCANNER</div>
              {scanState==="idle"&&(<><button onClick={startScanner} className="pr" style={{...C.btn(),fontSize:14,marginBottom:10}}>📷 AUTO-SCAN BARCODE</button><div style={{display:"flex",gap:8}}><input style={{...C.inp,margin:0,flex:1}} placeholder="Or type barcode number..." value={manualBarcode} onChange={e=>setManualBarcode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&manualBarcode&&fetchBarcode(manualBarcode)}/><button onClick={()=>manualBarcode&&fetchBarcode(manualBarcode)} className="pr" style={{...C.sBtn,background:"#ff4500",color:"#fff",whiteSpace:"nowrap"}}>SEARCH</button></div></>)}
              {scanState==="scanning"&&(<><div style={{position:"relative",borderRadius:12,overflow:"hidden",marginBottom:10,background:"#000",height:220}}><video ref={videoRef} autoPlay playsInline muted style={{height:220}}/><div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:"75%",height:80,border:"2px solid #ff4500",borderRadius:6,position:"relative",overflow:"hidden"}}><div className="scanline"/></div></div></div><div style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:"#888",textAlign:"center",marginBottom:10}}>{scanHint}</div><button onClick={()=>{stopScanner();setScanState("idle");}} style={{...C.btn("ghost"),fontSize:13}}>CANCEL</button></>)}
              {scanState==="loading"&&(<div style={{textAlign:"center",padding:20,fontFamily:"Barlow,sans-serif",color:"#666"}}><div style={{fontSize:30,marginBottom:8}}>⏳</div>Looking up product...</div>)}
              {scanState==="result"&&scanResult&&(<><div style={{background:"#0d1a0d",border:"1px solid #1a3a1a",borderRadius:10,padding:14,marginBottom:12}}><div style={{fontFamily:"Barlow,sans-serif",fontSize:15,fontWeight:700,color:"#fff",marginBottom:8}}>{scanResult.name}</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,textAlign:"center"}}>{[{l:"CALS",v:scanResult.calories,c:"#ff4500"},{l:"PROTEIN",v:`${scanResult.protein}g`,c:"#00d4ff"},{l:"CARBS",v:`${scanResult.carbs}g`,c:"#ffcc00"},{l:"FAT",v:`${scanResult.fat}g`,c:"#ff69b4"}].map((m,i)=>(<div key={i}><div style={{fontSize:16,color:m.c}}>{m.v}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:9,color:"#555",letterSpacing:1}}>{m.l}</div></div>))}</div></div><button onClick={()=>addFood(scanResult)} className="pr" style={{...C.btn(),fontSize:14,marginBottom:8}}>✓ ADD THIS FOOD</button><button onClick={()=>{setScanState("idle");setManualBarcode("");setScanResult(null);}} style={{...C.btn("ghost"),fontSize:13}}>SCAN ANOTHER</button></>)}
              {(scanState==="error"||scanState==="notfound")&&(<div style={{textAlign:"center",padding:16}}><div style={{fontSize:30,marginBottom:8}}>{scanState==="notfound"?"🔍":"❌"}</div><div style={{fontFamily:"Barlow,sans-serif",color:"#666",marginBottom:12}}>{scanState==="notfound"?"Product not found. Try searching below.":"Something went wrong. Try again."}</div><button onClick={()=>{setScanState("idle");setManualBarcode("");}} style={{...C.btn("ghost"),fontSize:13}}>TRY AGAIN</button></div>)}
            </div>
            <div style={{...C.lbl,flexShrink:0}}>SEARCH FOOD DATABASE</div>
            <input style={{...C.inp,flexShrink:0}} placeholder="Search foods..." value={foodSearch} onChange={e=>setFoodSearch(e.target.value)}/>
            <div style={{paddingBottom:40}}>
              {[...customFoods.map(f=>({...f,_custom:true})), ...PRESET_FOODS].filter(f=>f.name.toLowerCase().includes(foodSearch.toLowerCase())).map((food,i)=>(<div key={i} className="fr" onClick={()=>addFood(food)} style={{...C.card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:600}}>{food.name}</div>{food._custom&&<span style={{background:"#ff4500",color:"#fff",fontSize:8,padding:"2px 5px",borderRadius:4,fontFamily:"Barlow,sans-serif",letterSpacing:1}}>MY FOOD</span>}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div></div><div style={{color:"#ff4500",fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:700}}>{food.calories}cal</div></div>))}
            </div>
          </div>
        )}

        {/* SERVING SIZE MODAL */}
        {servingFood&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,letterSpacing:2}}>SERVING SIZE</div>
              <button onClick={()=>setServingFood(null)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
            </div>
            <div style={{...C.card,marginBottom:16}}>
              <div style={{fontFamily:"Barlow,sans-serif",fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>{servingFood.name}</div>
              <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555"}}>Per 100g: {servingFood.calories} cal · P:{servingFood.protein}g · C:{servingFood.carbs}g · F:{servingFood.fat}g</div>
            </div>
            <div style={C.lbl}>AMOUNT</div>
            <input style={C.inp} type="number" placeholder="e.g. 73" value={servingQty} onChange={e=>setServingQty(e.target.value)}/>
            <div style={C.lbl}>UNIT</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
              {["g","oz","lbs","kg","ml","cups","tbsp","tsp","piece"].map(u=>(
                <button key={u} onClick={()=>setServingUnit(u)} className="pr" style={{padding:"8px 14px",borderRadius:20,border:`1px solid ${servingUnit===u?"#ff4500":"#2a2a2a"}`,background:servingUnit===u?"#ff4500":"#1a1a1a",color:servingUnit===u?"#fff":"#666",cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:13,letterSpacing:1}}>{u}</button>
              ))}
            </div>
            {(()=>{
              const qty=parseFloat(servingQty)||0;
              const base=servingFood.servingSize||100;
              const gramsMap={g:1,oz:28.35,lbs:453.59,kg:1000,ml:1,cups:240,tbsp:15,tsp:5,piece:base};
              const grams=qty*(gramsMap[servingUnit]||1);
              const scale=servingUnit==="piece"?qty:grams/base;
              const p={cal:Math.round(servingFood.calories*scale),pro:Math.round(servingFood.protein*scale),carb:Math.round(servingFood.carbs*scale),fat:Math.round(servingFood.fat*scale)};
              return(
                <div style={{...C.acard,display:"grid",gridTemplateColumns:"repeat(4,1fr)",textAlign:"center",gap:8,marginBottom:20}}>
                  {[{l:"CALS",v:p.cal,c:"#ff4500"},{l:"PROTEIN",v:`${p.pro}g`,c:"#00d4ff"},{l:"CARBS",v:`${p.carb}g`,c:"#ffcc00"},{l:"FAT",v:`${p.fat}g`,c:"#ff69b4"}].map((m,i)=>(
                    <div key={i}><div style={{fontSize:20,color:m.c}}>{m.v}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:9,color:"#555",letterSpacing:1}}>{m.l}</div></div>
                  ))}
                </div>
              );
            })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}><button onClick={()=>confirmServing(false)} className="pr" style={{...C.btn("ghost"),border:"1px solid #ff4500",color:"#ff4500",fontSize:13}}>✓ ADD ONCE</button><button onClick={()=>confirmServing(true)} className="pr" style={{...C.btn(),fontSize:13}}>★ SAVE TO MY FOODS</button></div>
          </div>
        )}

        {/* MANUAL MACRO ENTRY (scanner fallback) */}
        {showManualEntry&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:20,letterSpacing:2}}>ENTER MACROS</div>
              <button onClick={()=>setShowManualEntry(false)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
            </div>
            <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",marginBottom:20}}>Product found but macros were missing. Enter them manually.</div>
            <div style={C.lbl}>PRODUCT NAME</div>
            <input style={C.inp} value={manualMacros.name} onChange={e=>setManualMacros(p=>({...p,name:e.target.value}))}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={C.lbl}>CALORIES</div><input style={C.inp} type="number" placeholder="0" value={manualMacros.calories} onChange={e=>setManualMacros(p=>({...p,calories:e.target.value}))}/></div>
              <div><div style={C.lbl}>PROTEIN (g)</div><input style={C.inp} type="number" placeholder="0" value={manualMacros.protein} onChange={e=>setManualMacros(p=>({...p,protein:e.target.value}))}/></div>
              <div><div style={C.lbl}>CARBS (g)</div><input style={C.inp} type="number" placeholder="0" value={manualMacros.carbs} onChange={e=>setManualMacros(p=>({...p,carbs:e.target.value}))}/></div>
              <div><div style={C.lbl}>FAT (g)</div><input style={C.inp} type="number" placeholder="0" value={manualMacros.fat} onChange={e=>setManualMacros(p=>({...p,fat:e.target.value}))}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}><button onClick={()=>addManualFood(false)} className="pr" style={{...C.btn("ghost"),border:"1px solid #ff4500",color:"#ff4500",fontSize:13}}>✓ ADD ONCE</button><button onClick={()=>addManualFood(true)} className="pr" style={{...C.btn(),fontSize:13}}>★ SAVE TO MY FOODS</button></div>
          </div>
        )}

        {/* EDIT MACRO GOALS MODAL */}
        {showGoalsModal&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:20,letterSpacing:2}}>DAILY GOALS</div>
              <button onClick={()=>setShowGoalsModal(false)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
            </div>
            <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",marginBottom:20}}>Set your daily macro targets. These update your progress rings.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={C.lbl}>CALORIES</div><input style={C.inp} type="number" value={goalsForm.calories} onChange={e=>setGoalsForm(p=>({...p,calories:parseInt(e.target.value)||0}))}/></div>
              <div><div style={C.lbl}>PROTEIN (g)</div><input style={C.inp} type="number" value={goalsForm.protein} onChange={e=>setGoalsForm(p=>({...p,protein:parseInt(e.target.value)||0}))}/></div>
              <div><div style={C.lbl}>CARBS (g)</div><input style={C.inp} type="number" value={goalsForm.carbs} onChange={e=>setGoalsForm(p=>({...p,carbs:parseInt(e.target.value)||0}))}/></div>
              <div><div style={C.lbl}>FAT (g)</div><input style={C.inp} type="number" value={goalsForm.fat} onChange={e=>setGoalsForm(p=>({...p,fat:parseInt(e.target.value)||0}))}/></div>
            </div>
            <button onClick={()=>{setMacroGoals({...goalsForm});setShowGoalsModal(false);}} className="pr" style={{...C.btn(),marginTop:12}}>✓ SAVE GOALS</button>
          </div>
        )}


      {tab==="weight"&&(()=>{
        const wg = weightGoal;
        const activityMultipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
        const tdee = Math.round(wg.bmr * (activityMultipliers[wg.activityLevel]||1.55));
        // Medical/research guidelines: safe deficit 500-1000 cal/day = 0.5-1 lb/week
        const deficit500 = tdee - 500;
        const deficit750 = tdee - 750;
        const deficit1000 = tdee - 1000;
        const lbsToLose = wg.current - wg.goal;
        const weeksAt05 = lbsToLose / 0.5;
        const weeksAt075 = lbsToLose / 0.75;
        const weeksAt1 = lbsToLose / 1.0;
        const addWeeks = (w) => { const d = new Date(); d.setDate(d.getDate() + Math.round(w*7)); return d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}); };
        const latestWeight = weightLog.length > 0 ? weightLog[weightLog.length-1].weight : wg.current;
        const startWeight = weightLog.length > 0 ? weightLog[0].weight : wg.current;
        const totalLost = Math.max(0, startWeight - latestWeight).toFixed(1);
        const toGo = Math.max(0, latestWeight - wg.goal).toFixed(1);
        const pctDone = lbsToLose > 0 ? Math.min(100, Math.round(((wg.current - latestWeight) / lbsToLose) * 100)) : 0;
        // 7-day rolling average
        const last7 = weightLog.slice(-7);
        const avg7 = last7.length > 0 ? (last7.reduce((s,e)=>s+e.weight,0)/last7.length).toFixed(1) : latestWeight;
        return(
        <div style={C.sec} className="sl">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:22,letterSpacing:3}}>WEIGHT</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowWeightModal(true)} className="pr" style={{background:"#ff4500",border:"none",color:"#fff",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:13,letterSpacing:1}}>+ LOG</button>
              <button onClick={()=>{setWeightGoalForm({...wg});setShowWeightGoalModal(true);}} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#888",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:13,letterSpacing:1}}>EDIT GOALS</button>
            </div>
          </div>

          {/* Current stats */}
          <div style={C.acard}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",textAlign:"center",gap:8,marginBottom:16}}>
              <div><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>CURRENT</div><div style={{fontSize:32}}>{latestWeight}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555"}}>{wg.unit}</div></div>
              <div><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>GOAL</div><div style={{fontSize:32}}>{wg.goal}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555"}}>{wg.unit}</div></div>
              <div><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>TO GO</div><div style={{fontSize:32,color:"#ff8c00"}}>{toGo}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555"}}>{wg.unit}</div></div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginBottom:6}}>
              <span>PROGRESS</span><span style={{color:"#ff4500"}}>{pctDone}%</span>
            </div>
            <div style={{background:"#1a1a1a",borderRadius:20,height:10,overflow:"hidden",marginBottom:8}}>
              <div style={{background:"linear-gradient(90deg,#ff4500,#ff8c00)",height:"100%",width:`${pctDone}%`,borderRadius:20,transition:"width 0.6s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontFamily:"Barlow,sans-serif",fontSize:10,color:"#333"}}>
              <span>{wg.current} {wg.unit} start</span><span>{wg.goal} {wg.unit} goal</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            <div style={C.card}><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>TOTAL LOST</div><div style={{fontSize:28}}>{totalLost} <span style={{fontSize:14,color:"#555"}}>{wg.unit}</span></div></div>
            <div style={C.card}><div style={{fontSize:10,color:"#ff4500",letterSpacing:2,fontFamily:"Barlow,sans-serif",marginBottom:4}}>7-DAY AVG</div><div style={{fontSize:28}}>{avg7} <span style={{fontSize:14,color:"#555"}}>{wg.unit}</span></div></div>
          </div>

          {/* Calorie deficit scenarios */}
          <div style={{fontSize:13,letterSpacing:3,color:"#ff4500",marginBottom:10}}>DEFICIT SCENARIOS</div>
          <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#444",marginBottom:12}}>Based on your TDEE of {tdee} cal/day (BMR {wg.bmr} × {wg.activityLevel} activity)</div>
          {[
            {rate:"0.5 lbs/week",deficit:500,cals:deficit500,weeks:weeksAt05,label:"Conservative",color:"#00d4ff",note:"Easiest to sustain, preserves muscle best"},
            {rate:"0.75 lbs/week",deficit:750,cals:deficit750,weeks:weeksAt075,label:"Moderate",color:"#ff8c00",note:"Recommended by most dietitians"},
            {rate:"1.0 lb/week",deficit:1000,cals:deficit1000,weeks:weeksAt1,label:"Aggressive",color:"#ff4500",note:"Max recommended by medical guidelines"},
          ].map((s,i)=>(
            <div key={i} style={{...C.card,borderLeft:`3px solid ${s.color}`,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div>
                  <div style={{fontSize:16,letterSpacing:1,color:s.color}}>{s.label} — {s.rate}</div>
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>{s.note}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,fontWeight:700,color:"#fff"}}>{s.cals} cal/day</div>
                  <div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555"}}>−{s.deficit} deficit</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#0e0e0e",borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555"}}>🎯 GOAL DATE</div>
                <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,fontWeight:700,color:s.color}}>{addWeeks(s.weeks)}</div>
              </div>
            </div>
          ))}

          {/* Weight log history */}
          {weightLog.length > 0 && (<>
            <div style={{fontSize:13,letterSpacing:3,color:"#ff4500",marginBottom:10,marginTop:8}}>WEIGHT HISTORY</div>
            {[...weightLog].reverse().slice(0,14).map((entry,i)=>(
              <div key={i} style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",marginBottom:6}}>
                <div style={{fontFamily:"Barlow,sans-serif",fontSize:13,color:"#888"}}>{new Date(entry.date+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{fontSize:18,letterSpacing:1,color:i<weightLog.length-1&&entry.weight<[...weightLog].reverse()[i+1]?.weight?"#00d4ff":i<weightLog.length-1&&entry.weight>[...weightLog].reverse()[i+1]?.weight?"#ff4444":"#fff"}}>{entry.weight} {wg.unit}</div>
                  <button onClick={()=>setWeightLog(prev=>prev.filter((_,j)=>j!==weightLog.length-1-i))} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#555",width:26,height:26,borderRadius:"50%",cursor:"pointer",fontSize:13}}>×</button>
                </div>
              </div>
            ))}
          </>)}

          {/* Log weight modal */}
          {showWeightModal&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",padding:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                <div style={{fontSize:22,letterSpacing:2}}>LOG WEIGHT</div>
                <button onClick={()=>setShowWeightModal(false)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
              </div>
              <div style={C.lbl}>TODAY'S WEIGHT ({wg.unit})</div>
              <input style={{...C.inp,fontSize:32,textAlign:"center",padding:20}} type="number" step="0.1" placeholder="e.g. 185.5" value={weightEntry} onChange={e=>setWeightEntry(e.target.value)} autoFocus/>
              <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",textAlign:"center",marginBottom:20}}>Log first thing in the morning for most consistent results</div>
              <button onClick={()=>{
                if(!weightEntry) return;
                const entry={date:todayKey(),weight:parseFloat(weightEntry)};
                setWeightLog(prev=>{const filtered=prev.filter(e=>e.date!==todayKey());return[...filtered,entry].sort((a,b)=>a.date.localeCompare(b.date));});
                setWeightGoal(prev=>({...prev,current:parseFloat(weightEntry)}));
                setWeightEntry("");setShowWeightModal(false);
              }} className="pr" style={C.btn()}>✓ SAVE WEIGHT</button>
            </div>
          )}

          {/* Edit weight goals modal */}
          {showWeightGoalModal&&(
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:300,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:20,letterSpacing:2}}>WEIGHT GOALS</div>
                <button onClick={()=>setShowWeightGoalModal(false)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
              </div>
              <div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",marginBottom:20}}>Update your stats to keep predictions accurate.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <div><div style={C.lbl}>CURRENT WEIGHT</div><input style={C.inp} type="number" step="0.1" placeholder="e.g. 185" value={weightGoalForm.current||""} onChange={e=>setWeightGoalForm(p=>({...p,current:parseFloat(e.target.value)||0}))}/></div>
                <div><div style={C.lbl}>GOAL WEIGHT</div><input style={C.inp} type="number" step="0.1" placeholder="e.g. 165" value={weightGoalForm.goal||""} onChange={e=>setWeightGoalForm(p=>({...p,goal:parseFloat(e.target.value)||0}))}/></div>
              </div>
              <div style={C.lbl}>UNIT</div>
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                {["lbs","kg"].map(u=><button key={u} onClick={()=>setWeightGoalForm(p=>({...p,unit:u}))} className="pr" style={{flex:1,padding:10,borderRadius:8,border:`1px solid ${weightGoalForm.unit===u?"#ff4500":"#2a2a2a"}`,background:weightGoalForm.unit===u?"#ff4500":"#1a1a1a",color:"#fff",cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:14,letterSpacing:1}}>{u}</button>)}
              </div>
              <div style={C.lbl}>YOUR BMR (calories/day at rest)</div>
              <input style={C.inp} type="number" placeholder="e.g. 1800" value={weightGoalForm.bmr||""} onChange={e=>setWeightGoalForm(p=>({...p,bmr:parseInt(e.target.value)||0}))}/>
              <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#444",marginBottom:12}}>Use an online BMR calculator or InBody scan result.</div>
              <div style={C.lbl}>ACTIVITY LEVEL</div>
              {[
                {v:"sedentary",l:"Sedentary",d:"Desk job, little exercise"},
                {v:"light",l:"Light",d:"Light exercise 1-3 days/week"},
                {v:"moderate",l:"Moderate",d:"Exercise 3-5 days/week"},
                {v:"active",l:"Active",d:"Hard exercise 6-7 days/week"},
                {v:"veryActive",l:"Very Active",d:"Physical job + training"},
              ].map(a=>(
                <button key={a.v} onClick={()=>setWeightGoalForm(p=>({...p,activityLevel:a.v}))} style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",border:`1px solid ${weightGoalForm.activityLevel===a.v?"#ff4500":"#1c1c1c"}`,marginBottom:6,padding:"10px 14px"}}>
                  <div><div style={{fontFamily:"Bebas Neue,sans-serif",fontSize:14,letterSpacing:1,color:weightGoalForm.activityLevel===a.v?"#ff4500":"#fff"}}>{a.l}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555"}}>{a.d}</div></div>
                  {weightGoalForm.activityLevel===a.v&&<div style={{color:"#ff4500",fontSize:16}}>✓</div>}
                </button>
              ))}
              <button onClick={()=>{setWeightGoal({...weightGoalForm});setShowWeightGoalModal(false);}} className="pr" style={{...C.btn(),marginTop:12}}>✓ SAVE GOALS</button>
            </div>
          )}
        </div>
        );
      })()}

      {tab==="calendar"&&(
        <div style={C.sec} className="sl">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <button onClick={()=>setCalMonth(new Date(calYear,calMonthIdx-1,1))} style={{background:"#1a1a1a",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>‹</button>
            <div style={{fontSize:22,letterSpacing:3}}>{monthLabel.toUpperCase()}</div>
            <button onClick={()=>setCalMonth(new Date(calYear,calMonthIdx+1,1))} style={{background:"#1a1a1a",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>›</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6,textAlign:"center"}}>
            {["S","M","T","W","T","F","S"].map((d,i)=>(<div key={i} style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#444",padding:"4px 0"}}>{d}</div>))}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:24}}>
            {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day=i+1;
              const dk=`${calYear}-${String(calMonthIdx+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const hw=workoutDays.includes(dk); const it=dk===todayKey();
              const hasFood=(foodLog[dk]||[]).length>0;
              const tappable=hw||hasFood;
              return(<div key={day} onClick={()=>tappable&&setSelectedDay(dk)} style={{aspectRatio:"1",borderRadius:8,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:hw?"#ff4500":it?"#1a1a1a":"transparent",border:it?"1px solid #ff4500":"1px solid transparent",position:"relative",cursor:tappable?"pointer":"default"}}><span style={{fontFamily:"Barlow,sans-serif",fontSize:13,fontWeight:600,color:hw?"#fff":it?"#ff4500":"#444"}}>{day}</span>{(hw||hasFood)&&<div style={{position:"absolute",bottom:3,width:4,height:4,borderRadius:"50%",background:hw?"#fff":"#ff4500",opacity:0.8}}/>}</div>);
            })}
          </div>
          <div style={C.card}>
            <div style={{fontSize:13,letterSpacing:3,color:"#ff4500",marginBottom:14}}>MONTHLY STATS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,textAlign:"center"}}>
              <div><div style={{fontSize:40}}>{workoutDays.filter(d=>d.startsWith(`${calYear}-${String(calMonthIdx+1).padStart(2,"0")}`)).length}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555",letterSpacing:1}}>DAYS TRAINED THIS MONTH</div></div>
              <div><div style={{fontSize:40}}>{Object.values(workoutLog).flat().length}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:10,color:"#555",letterSpacing:1}}>TOTAL EXERCISES LOGGED</div></div>
            </div>
          </div>
          <div style={{fontSize:13,letterSpacing:3,color:"#ff4500",marginBottom:12}}>WORKOUT HISTORY</div>
          {workoutDays.length===0?(<div style={{textAlign:"center",padding:"30px 20px",fontFamily:"Barlow,sans-serif",color:"#333"}}>No workouts logged yet. Get after it! 💪</div>):[...workoutDays].reverse().slice(0,10).map(ds=>(<div key={ds} onClick={()=>setSelectedDay(ds)} style={{...C.card,cursor:"pointer",borderLeft:"3px solid #ff4500"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:16,letterSpacing:1}}>{new Date(ds+"T12:00:00").toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}</div><div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#ff4500"}}>{workoutLog[ds].length} exercises</div></div>{workoutLog[ds].map((ex,i)=>(<div key={i} style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#555",padding:"3px 0",borderTop:i>0?"1px solid #1a1a1a":"none"}}>{ex.name} · {ex.sets}×{ex.reps}</div>))}</div>))}

          {selectedDay&&(()=>{
            const dayWorkout=workoutLog[selectedDay]||[];
            const dayFood=foodLog[selectedDay]||[];
            const dayLabel=new Date(selectedDay+"T12:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
            const totalCals=dayFood.reduce((s,f)=>s+f.calories,0);
            const totalProtein=dayFood.reduce((s,f)=>s+f.protein,0);
            return(
              <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.97)",zIndex:200,display:"flex",flexDirection:"column",padding:20,overflowY:"auto"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexShrink:0}}>
                  <div>
                    <div style={{fontSize:11,letterSpacing:3,color:"#ff4500",marginBottom:4}}>DAY SUMMARY</div>
                    <div style={{fontSize:20,letterSpacing:2}}>{dayLabel.toUpperCase()}</div>
                  </div>
                  <button onClick={()=>setSelectedDay(null)} style={{background:"#222",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",cursor:"pointer",fontSize:18}}>×</button>
                </div>

                {dayWorkout.length>0&&(<>
                  <div style={{fontSize:13,letterSpacing:3,color:"#ff4500",marginBottom:12}}>💪 WORKOUT — {dayWorkout.length} EXERCISES</div>
                  {dayWorkout.map((ex,i)=>(
                    <div key={i} style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center",borderLeft:"3px solid #ff4500",marginBottom:8}}>
                      <div>
                        <div style={{fontSize:15,letterSpacing:1}}>{ex.name}</div>
                        <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>{ex.sets} sets × {ex.reps} reps</div>
                      </div>
                      <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#444"}}>{ex.time}</div>
                    </div>
                  ))}
                </>)}

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:dayWorkout.length>0?16:0,marginBottom:8}}>
                  <div style={{fontSize:13,letterSpacing:3,color:"#ff4500"}}>🥗 NUTRITION{dayFood.length>0?` — ${totalCals} CALS · ${totalProtein}G PROTEIN`:""}</div>
                  <button onClick={()=>{setBackfillDay(selectedDay);setShowFoodModal(true);}} style={{background:"#ff4500",border:"none",color:"#fff",padding:"6px 12px",borderRadius:8,cursor:"pointer",fontFamily:"Bebas Neue,sans-serif",fontSize:12,letterSpacing:1}}>+ ADD FOOD</button>
                </div>
                {dayFood.length>0&&dayFood.map((food,i)=>(
                  <div key={i} style={{...C.card,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:600}}>{food.name}</div>
                      <div style={{fontFamily:"Barlow,sans-serif",fontSize:11,color:"#555",marginTop:2}}>P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{color:"#ff4500",fontFamily:"Barlow,sans-serif",fontSize:14,fontWeight:700}}>{food.calories}cal</div>
                      <button onClick={()=>removeFood(food.id,selectedDay)} style={{background:"#1a1a1a",border:"1px solid #2a2a2a",color:"#666",width:28,height:28,borderRadius:"50%",cursor:"pointer",fontSize:14}}>×</button>
                    </div>
                  </div>
                ))}
                {dayFood.length===0&&<div style={{fontFamily:"Barlow,sans-serif",fontSize:12,color:"#444",padding:"8px 0 12px"}}>No food logged for this day.</div>}

                {dayWorkout.length===0&&dayFood.length===0&&(
                  <div style={{textAlign:"center",padding:"20px 20px 40px"}}><div style={{fontSize:48,marginBottom:12}}>📭</div><div style={{fontFamily:"Barlow,sans-serif",color:"#444"}}>Nothing logged for this day.</div></div>
                )}
                <div style={{paddingBottom:40}}/>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
