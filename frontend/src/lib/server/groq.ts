import "server-only";

/**
 * Groq chat client (OpenAI-compatible endpoint).
 * The LLM only judges and writes. It never invents numbers: callers pass the
 * allowed figures in and check the output with `onlyAllowedNumbers`.
 */

const URL = "https://api.groq.com/openai/v1/chat/completions";
export const groqEnabled = () => !!process.env.GROQ_API_KEY;
/** Preferred model first, then fallbacks. Groq retires models and gates access per account, so a 404 moves to the next one. */
const MODELS = () => [...new Set([process.env.GROQ_MODEL, "openai/gpt-oss-120b", "llama-3.3-70b-versatile", "openai/gpt-oss-20b", "llama-3.1-8b-instant"].filter(Boolean))] as string[];
let working: string | null = null;

export async function groqJson<T>(system: string, user: string, opts: { temperature?: number; maxTokens?: number } = {}): Promise<T | null> {
  if (!groqEnabled()) return null;
  const models = working ? [working] : MODELS();
  let mi = 0;
  for (let attempt = 1; attempt <= 2 + models.length; attempt++) {
    try {
      const res = await fetch(URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: models[mi],
          temperature: opts.temperature ?? 0.4,
          max_tokens: opts.maxTokens ?? 2000,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) {
        if ((res.status === 404 || res.status === 400) && mi < models.length - 1) {
          mi++;
          continue;
        }
        if ((res.status === 429 || res.status >= 500) && attempt === 1) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        console.error("groq error", res.status, (await res.text()).slice(0, 200));
        return null;
      }
      const data = await res.json();
      const text: string = data?.choices?.[0]?.message?.content ?? "";
      working = models[mi];
      return JSON.parse(text) as T;
    } catch (e) {
      console.error("groq failed", e);
      if (attempt >= 2 + models.length) return null;
    }
  }
  return null;
}

/** True when every number in `text` appears in `allowed` (years and small counts excluded). */
export function onlyAllowedNumbers(text: string, allowed: (string | number)[]): boolean {
  const ok = new Set(allowed.map((a) => String(a).replace(/[,$%]/g, "")));
  const found = text.match(/\d[\d,]*(\.\d+)?/g) ?? [];
  return found.every((n) => {
    const clean = n.replace(/,/g, "");
    const v = Number(clean);
    return v <= 10 || ok.has(clean) || ok.has(String(Math.round(v)));
  });
}
