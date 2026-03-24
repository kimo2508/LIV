export default async function handler(req, res) {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "No query provided" });

  try {
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${process.env.USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Branded,SR%20Legacy,Survey%20(FNDDS)&pageSize=10&sortBy=score&sortOrder=desc`,
      { headers: { "Content-Type": "application/json" } }
    );

    const data = await response.json();
    const foods = data.foods || [];

    const results = foods.map((food) => {
      const nutrients = food.foodNutrients || [];

      const get = (name) => {
        const n = nutrients.find(n =>
          n.nutrientName?.toLowerCase().includes(name.toLowerCase())
        );
        return parseFloat((n?.value || 0).toFixed(1));
      };

      const calories = Math.round(
        nutrients.find(n =>
          n.nutrientName === "Energy" && n.unitName === "KCAL"
        )?.value ||
        nutrients.find(n =>
          n.nutrientName?.toLowerCase().includes("energy")
        )?.value || 0
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
    }).filter(f => f.name && f.calories > 0);

    return res.status(200).json({ results });

  } catch (err) {
    console.error("USDA search error:", err);
    return res.status(500).json({ error: "server_error", message: err.message });
  }
}
