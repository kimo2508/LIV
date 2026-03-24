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
      `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json&max_results=8&page_number=0`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );

    const searchData = await searchRes.json();
    const foods = searchData?.foods?.food;

    if (!foods) return res.status(200).json({ results: [] });

    const foodArray = Array.isArray(foods) ? foods : [foods];

    const results = foodArray.map((food) => {
      // FatSecret returns nutrition in the food_description field
      // e.g. "Per 100g - Calories: 165kcal | Fat: 3.57g | Carbs: 0g | Protein: 31.02g"
      const desc = food.food_description || "";
      const cal = parseFloat(desc.match(/Calories:\s*([\d.]+)/)?.[1] || 0);
      const fat = parseFloat(desc.match(/Fat:\s*([\d.]+)/)?.[1] || 0);
      const carbs = parseFloat(desc.match(/Carbs:\s*([\d.]+)/)?.[1] || 0);
      const protein = parseFloat(desc.match(/Protein:\s*([\d.]+)/)?.[1] || 0);

      return {
        name: food.food_name,
        brand: food.brand_name || null,
        calories: Math.round(cal),
        protein: parseFloat(protein.toFixed(1)),
        carbs: parseFloat(carbs.toFixed(1)),
        fat: parseFloat(fat.toFixed(1)),
        servingSize: 100,
        servingUnit: "g",
        _fromSearch: true,
      };
    }).filter(f => f.calories > 0 || f.protein > 0);

    return res.status(200).json({ results });

  } catch (err) {
    console.error("FatSecret search error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
