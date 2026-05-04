export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "No query provided" });

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.error("USDA_API_KEY is missing from environment");
    return res.status(500).json({
      error: "config_error",
      message: "USDA_API_KEY not set on the server"
    });
  }

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&dataType=Branded,SR%20Legacy,Survey%20(FNDDS)&pageSize=10&sortBy=score&sortOrder=desc`;

    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" }
    });

    // Detect non-JSON responses BEFORE parsing so we get a useful error
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
      const body = await response.text();
      console.error(
        `USDA returned ${response.status} (${contentType}): ${body.slice(0, 200)}`
      );
      return res.status(502).json({
        error: "usda_bad_response",
        message: `USDA returned ${response.status}. Check API key.`,
        status: response.status,
      });
    }

    const data = await response.json();
    const foods = data.foods || [];

    const results = foods.map((food) => {
      const nutrients = food.foodNutrients || [];
      const get = (name) => {
        const n = nutrients.find((n) =>
          n.nutrientName?.toLowerCase().includes(name.toLowerCase())
        );
        return parseFloat((n?.value || 0).toFixed(1));
      };
      const calories = Math.round(
        nutrients.find(
          (n) => n.nutrientName === "Energy" && n.unitName === "KCAL"
        )?.value ||
          nutrients.find((n) =>
            n.nutrientName?.toLowerCase().includes("energy")
          )?.value ||
          0
      );
      const servingSize = food.servingSize || 100;
      const servingUnit = (food.servingSizeUnit || "g").toLowerCase();
      return {
        name: food.description,
        brand: food.brandOwner || food.brandName || null,
        calories,
        protein: get("protein"),
        carbs: get("carbohydrate"),
        fat: get("total lipid"),
        servingSize,
        servingUnit,
        _fromSearch: true,
      };
    }).filter((f) => f.name && f.calories > 0);

    return res.status(200).json({ results });
  } catch (err) {
    console.error("USDA search error:", err);
    return res.status(500).json({
      error: "server_error",
      message: err.message
    });
  }
}
