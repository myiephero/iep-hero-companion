import React, { useRef, useState } from "react";
import { extractPdfText } from "../../lib/analyzer";
import { analyzeIepText } from "../../lib/emergentClient";

export default function IEPReview() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string>("");
  const [result, setResult] = useState<any>(null);

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    const f = inputRef.current?.files?.[0];
    if (!f) return alert("Choose a PDF");
    try {
      setStatus("Extracting PDF…");
      const { text, characters } = await extractPdfText({ file: f });
      setStatus(`Extracted ${characters} chars. Analyzing…`);
      const analysis = await analyzeIepText(text);
      setResult(analysis);
      setStatus("Done.");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <section className="container">
      <form className="card" onSubmit={onUpload}>
        <label htmlFor="pdf">Upload IEP (PDF)</label>
        <input id="pdf" type="file" accept="application/pdf" ref={inputRef} />
        <button type="submit" className="button">Analyze IEP</button>
        <p className="muted">{status}</p>
      </form>
      {result && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h2>Analysis</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </section>
  );
}