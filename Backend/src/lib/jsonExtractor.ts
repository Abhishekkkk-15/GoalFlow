export function extractPlanJSON(raw: string) {
  try {
    let cleaned = raw.trim();

    // Remove code fences
    cleaned = cleaned.replace(/```json|```/gi, "").trim();

    // Try direct parse
    try {
      return JSON.parse(cleaned);
    } catch {}

    // Find first valid JSON block using bracket matching
    let start = cleaned.indexOf("{");
    if (start === -1) throw new Error("No JSON start found");

    let stack = 0;
    let end = -1;

    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === "{") stack++;
      if (cleaned[i] === "}") stack--;

      if (stack === 0) {
        end = i;
        break;
      }
    }

    if (end === -1) throw new Error("No valid JSON end found");

    const jsonStr = cleaned.slice(start, end + 1);

    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("❌ JSON extraction failed:", err);
    return null;
  }
}
