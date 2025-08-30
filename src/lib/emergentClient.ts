export async function analyzeIepText(text: string) {
  const url = import.meta.env.VITE_EMERGENT_ANALYSIS_URL;
  if (!url) throw new Error("VITE_EMERGENT_ANALYSIS_URL missing");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Emergent analysis failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<any>;
}