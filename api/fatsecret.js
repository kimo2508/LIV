export default async function handler(req, res) {
  const { barcode } = req.query;
  if (!barcode) return res.status(400).json({ error: "No barcode provided" });

  try {
    // Step 1: Get OAuth token using client credentials
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

    // Step 2: Look up the barcode
    const searchRes = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=food.find_id_for_barcode&barcode=${barcode}&format=json`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const searchData = await searchRes.json();
    const foodId = searchData?.food_id?.value;

    if (!foodId) return res.status(404).json({ error: "not_found" });

    // Step 3: Get full nutrition data for that food ID
    const foodRes = await fetch(
      `https://platform.fatsecret.com/rest/server.api?method=food.get.v4&food_id=${foodId}&format=json`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    );

    const foodData = await foodRes.json();
    const food = foodData?.food;
    if (!food) return res.status(404).json({ error: "not_found" });

    // Find the default serving (usually serving_id with the base/100g values)
    const servings = food.servings?.serving;
    const serving = Array.isArray(servings) ? servings[0] : servings;

    return res.status(200).json({
      name: food.food_name,
      calories: Math.round(parseFloat(serving?.calories) || 0),
      protein: parseFloat(parseFloat(serving?.protein || 0).toFixed(1)),
      carbs: parseFloat(parseFloat(serving?.carbohydrate || 0).toFixed(1)),
      fat: parseFloat(parseFloat(serving?.fat || 0).toFixed(1)),
      servingSize: parseFloat(serving?.metric_serving_amount || 100),
      servingUnit: serving?.metric_serving_unit || "g",
      servingDescription: serving?.serving_description || "",
    });

  } catch (err) {
    console.error("FatSecret error:", err);
    return res.status(500).json({ error: "server_error" });
  }
}
