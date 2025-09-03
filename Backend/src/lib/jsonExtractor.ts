export function extractPlanJSON(raw: string) {
  try {
    // Step 1: Remove code fences like ```json ... ```
    let cleaned = raw
      .trim()
      .replace(/```json|```/g, "")
      .trim();

    // Step 2: Find the first `{` and last `}` (in case model adds extra text)
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}") + 1;
    if (start === -1 || end === -1) {
      throw new Error("No JSON object found in string");
    }

    cleaned = cleaned.slice(start, end);

    // Step 3: Parse JSON safely
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to extract JSON:", err);
    return null;
  }
}
