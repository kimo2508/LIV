export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "No query provided" });

  try {
    // Step 1: Get OAuth token
    const tokenRes = await fetch("https://oauth.fatsecret.com/connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.FATSECRET_CLIENT_ID,
        client_secret: process.env.FATSECRET_CLIENT_SECRET,
        scope: "basic",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(500).json({ error: "Auth failed" });
    }

    // Step 2: Search for foods by name
    const searchRes = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json&max_results=10&page_number=0`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const searchData = await searchRes.json();
    const foods = searchData?.foods?.food;

    if (!foods) return res.status(200).json({ results: [], raw: searchData });

    const foodArray = Array.isArray(foods) ? foods : [foods];

    const results = foodArray.map((food) => {
      // FatSecret food_description examples:
      // "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0.00g | Protein: 31.02g"
      // "Per 1 burger - Calories: 550 kcal | Fat: 30g | Carbs: 45g | Protein: 25g"
      const desc = food.food_description || "";

      // Case-insensitive, handles space before kcal/g
      const calMatch = desc.match(/Calories:\s*([\d.]+)/i);
      const fatMatch = desc.match(/Fat:\s*([\d.]+)/i);
      const carbMatch = desc.match(/Carbs:\s*([\d.]+)/i);
      const protMatch = desc.match(/Protein:\s*([\d.]+)/i);

      const cal = parseFloat(calMatch?.[1] || 0);
      const fat = parseFloat(fatMatch?.[1] || 0);
      const carbs = parseFloat(carbMatch?.[1] || 0);
      const protein = parseFloat(protMatch?.[1] || 0);

      // Extract the serving info from "Per X serving" part
      const servingMatch = desc.match(/^Per\s+(.+?)\s+-/i);
      const serving = servingMatch?.[1] || "serving";

      return {
        name: food.food_name,
        brand: food.brand_name || null,
        serving,
        calories: Math.round(cal),
        protein: parseFloat(protein.toFixed(1)),
        carbs: parseFloat(carbs.toFixed(1)),
        fat: parseFloat(fat.toFixed(1)),
        servingSize: 100,
        servingUnit: "g",
        _fromSearch: true,
      };
    });

    // Only remove items with no nutritional data at all AND no name
    const filtered = results.filter(f => f.name);

    return res.status(200).json({ results: filtered });

  } catch (err) {
    console.error("FatSecret search error:", err);
    return res.status(500).json({ error: "server_error", message: err.message });
  }
}
