export function extractPlanJSON(raw: string) {
  try {
    let cleaned = raw.trim();

    // Remove code fences
    cleaned = cleaned.replace(/```json|```/gi, "").trim();

    // Try direct parse first (fast path)
    try {
      return JSON.parse(cleaned);
    } catch {}

    // Extract first valid JSON object using regex (safer)
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");

    const jsonStr = match[0];

    const parsed = JSON.parse(jsonStr);

    return parsed;
  } catch (err) {
    console.error("❌ JSON extraction failed:", err);
    return null;
  }
}
