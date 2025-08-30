import React, { useState } from "react";
import axios from "axios";
import "./CommitForm.css"; // ✅ Import updated CSS

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

  const isGitDiff = (text: string) => {
    const diffPattern =
      /diff --git a\/.+ b\/.+|^@@ -\d+,\d+ \+\d+,\d+ @@|^\+\+\+ b\/.+|^--- a\/.+/m;
    return diffPattern.test(text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResponse(null);

    if (!isGitDiff(diffContent)) {
      setError("⚠️ Please enter a valid git diff.");
      return;
    }

    setLoading(true);
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
      setError(err.response?.data?.commitMessage || "❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div><h1>AI-Powered Git Commit Message Generator</h1>
    <div className="commit-container">
      {/* Left side → Form */}
      <div className="form-section">
        
        <form onSubmit={handleSubmit}>
          <div>
            <label>Paste Git Diff:</label>
            <textarea
              rows={10}
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
          <div className="button-wrapper">
            <button type="submit" disabled={loading}>
              {loading ? "⏳ Generating..." : "🚀 Generate Commit"}
            </button>
          </div>
        </form>
        {error && <div className="error">{error}</div>}
      </div>

      {/* Right side → Response */}
      <div className="response-section">
        {response ? (
          <div className="response">
            <h2>Primary Commit Message:</h2>
            <p>{response.commitMessage}</p>

            {response.alternatives?.length > 0 && (
              <>
                <h3>Alternatives:</h3>
                <ul>
                  {response.alternatives.map((alt, idx) => (
                    <li key={idx}>{alt}</li>
                  ))}
                </ul>
              </>
            )}

            {response.typeLabels?.length > 0 && (
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
        ) : (
          <div className="placeholder">
            <p>💡 Generated commit messages will appear here...</p>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default CommitForm;
