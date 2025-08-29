import React, { useState } from "react";
import axios from "axios";

interface CommitResponse {
  commitMessage: string;
  alternatives: string[];
  typeLabels: string[];
  prTitle: string;
  prBody: string;
}

const CommitForm: React.FC = () => {
  const [diffContent, setDiffContent] = useState("");
  const [style, setStyle] = useState("CONVENTIONAL");
  const [numAlternatives, setNumAlternatives] = useState(2);
  const [generatePr, setGeneratePr] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CommitResponse | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await axios.post<CommitResponse>(
        "http://localhost:8080/api/commit/generate",
        {
          diffContent,
          style,
          numAlternatives,
          generatePr,
        }
      );
      setResponse(res.data);
    } catch (err: any) {
      setError(err.response?.data?.commitMessage || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      <h1>AI Commit Message Generator</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Paste Git Diff:</label>
          <textarea
            rows={10}
            style={{ width: "100%" }}
            value={diffContent}
            onChange={(e) => setDiffContent(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Style:</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="CONVENTIONAL">Conventional</option>
            <option value="GITMOJI">Gitmoji</option>
            <option value="PLAIN">Plain</option>
          </select>
        </div>
        <div>
          <label>Number of Alternatives:</label>
          <input
            type="number"
            min={1}
            max={5}
            value={numAlternatives}
            onChange={(e) => setNumAlternatives(Number(e.target.value))}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={generatePr}
              onChange={(e) => setGeneratePr(e.target.checked)}
            />
            Generate PR
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Generating..." : "Generate Commit"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {response && (
        <div style={{ marginTop: 20 }}>
          <h2>Primary Commit Message:</h2>
          <p>{response.commitMessage}</p>

          {response.alternatives && response.alternatives.length > 0 && (
            <>
              <h3>Alternatives:</h3>
              <ul>
                {response.alternatives.map((alt, idx) => (
                  <li key={idx}>{alt}</li>
                ))}
              </ul>
            </>
          )}

          {response.typeLabels && response.typeLabels.length > 0 && (
            <>
              <h3>Labels:</h3>
              <p>{response.typeLabels.join(", ")}</p>
            </>
          )}

          {generatePr && (
            <>
              <h3>PR Title:</h3>
              <p>{response.prTitle}</p>
              <h3>PR Body:</h3>
              <pre>{response.prBody}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CommitForm;
