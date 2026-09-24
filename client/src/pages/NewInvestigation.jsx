import { useState } from "react";
import {
  ArrowLeft,
  Search,
  Link2,
  FileText,
  ShieldCheck,
  Upload,
  Loader2
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getAuthToken() {
  return localStorage.getItem("aura_token");
}

export default function NewInvestigation({
  setPage,
  setReport,
  setHistory
}) {
  const [mode, setMode] = useState("message");

  const [input, setInput] = useState("");

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // AUTH CHECK
  // ==================================================

  function handleUnauthorized() {
    localStorage.removeItem("aura_token");
    localStorage.removeItem("aura_user");
    localStorage.removeItem("aura_session");

    setPage("login");
  }

  // ==================================================
  // RUN INVESTIGATION
  // ==================================================

  async function investigate() {
    setError("");

    const token = getAuthToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    // ------------------------------------------------
    // MESSAGE
    // ------------------------------------------------

    if (mode === "message") {
      if (!input.trim()) {
        setError(
          "Enter a message or suspicious content to investigate."
        );
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/investigate`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
              input: input.trim()
            })
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            "Investigation failed."
          );
        }

        const report =
          data.result ||
          data.investigation;

        setReport(report);

        if (setHistory) {
          setHistory((previous) => [
            data.investigation || report,
            ...previous
          ]);
        }

        setPage("result");

      } catch (err) {
        console.error(
          "Message investigation error:",
          err
        );

        setError(
          err.message ||
          "Investigation failed."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ------------------------------------------------
    // URL
    // ------------------------------------------------

    if (mode === "url") {
      if (!input.trim()) {
        setError(
          "Enter a URL to investigate."
        );
        return;
      }

      setLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/investigate/url`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
              url: input.trim()
            })
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            "URL investigation failed."
          );
        }

        const report =
          data.result ||
          data.investigation;

        setReport(report);

        if (setHistory) {
          setHistory((previous) => [
            data.investigation || report,
            ...previous
          ]);
        }

        setPage("result");

      } catch (err) {
        console.error(
          "URL investigation error:",
          err
        );

        setError(
          err.message ||
          "URL investigation failed."
        );
      } finally {
        setLoading(false);
      }

      return;
    }

    // ------------------------------------------------
    // DOCUMENT
    // ------------------------------------------------

    if (mode === "document") {
      if (!selectedFile) {
        setError(
          "Select a PDF, DOCX or TXT file first."
        );
        return;
      }

      setLoading(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "document",
          selectedFile
        );

        const response = await fetch(
          `${API_URL}/api/investigate/document`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${token}`
            },

            body: formData
          }
        );

        const data =
          await response.json();

        if (response.status === 401) {
          handleUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
            data.error ||
            "Document investigation failed."
          );
        }

        const report =
          data.result ||
          data.investigation;

        setReport(report);

        if (setHistory) {
          setHistory((previous) => [
            data.investigation || report,
            ...previous
          ]);
        }

        setPage("result");

      } catch (err) {
        console.error(
          "Document investigation error:",
          err
        );

        setError(
          err.message ||
          "Document investigation failed."
        );
      } finally {
        setLoading(false);
      }
    }
  }

  // ==================================================
  // FILE SELECT
  // ==================================================

  function handleFileChange(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSelectedFile(file);
  }

  // ==================================================
  // MODE CHANGE
  // ==================================================

  function changeMode(nextMode) {
    setMode(nextMode);
    setInput("");
    setSelectedFile(null);
    setError("");
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="investigation-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="investigation-header">

        <button
          className="back-button"
          onClick={() => setPage("dashboard")}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div>
          <div className="page-eyebrow">
            AURA INVESTIGATION ENGINE
          </div>

          <h1>
            New Investigation
          </h1>

          <p>
            Submit suspicious content,
            websites or documents for
            evidence-driven analysis.
          </p>
        </div>

      </div>

      {/* ==================================================
          MAIN PANEL
          ================================================== */}

      <div className="investigation-workspace">

        {/* ==================================================
            MODE SELECTOR
            ================================================== */}

        <div className="investigation-tabs">

          <button
            className={
              mode === "message"
                ? "investigation-tab active"
                : "investigation-tab"
            }
            onClick={() =>
              changeMode("message")
            }
          >
            <Search size={17} />

            <span>
              Message
            </span>
          </button>

          <button
            className={
              mode === "url"
                ? "investigation-tab active"
                : "investigation-tab"
            }
            onClick={() =>
              changeMode("url")
            }
          >
            <Link2 size={17} />

            <span>
              Website
            </span>
          </button>

          <button
            className={
              mode === "document"
                ? "investigation-tab active"
                : "investigation-tab"
            }
            onClick={() =>
              changeMode("document")
            }
          >
            <FileText size={17} />

            <span>
              Document
            </span>
          </button>

        </div>

        {/* ==================================================
            INPUT AREA
            ================================================== */}

        <div className="investigation-input-panel">

          {mode === "message" && (
            <>
              <div className="input-label">
                CONTENT TO INVESTIGATE
              </div>

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(
                    event.target.value
                  )
                }
                placeholder="Paste a suspicious message, job offer, email, notification or claim..."
                disabled={loading}
              />

              <div className="input-hint">
                AURA will extract claims,
                identify signals and reason
                over available evidence.
              </div>
            </>
          )}

          {mode === "url" && (
            <>
              <div className="input-label">
                WEBSITE URL
              </div>

              <div className="url-input-wrapper">

                <Link2 size={17} />

                <input
                  type="url"
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  placeholder="https://example.com"
                  disabled={loading}
                />

              </div>

              <div className="input-hint">
                AURA will inspect the website
                structure, metadata, forms,
                security signals and available
                page evidence.
              </div>
            </>
          )}

          {mode === "document" && (
            <>
              <div className="input-label">
                DOCUMENT TO INVESTIGATE
              </div>

              <label
                className={
                  selectedFile
                    ? "document-upload selected"
                    : "document-upload"
                }
              >

                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={
                    handleFileChange
                  }
                  disabled={loading}
                />

                {selectedFile ? (
                  <>
                    <FileText
                      size={28}
                    />

                    <strong>
                      {selectedFile.name}
                    </strong>

                    <span>
                      {(
                        selectedFile.size /
                        1024
                      ).toFixed(1)} KB
                    </span>
                  </>
                ) : (
                  <>
                    <Upload
                      size={28}
                    />

                    <strong>
                      Select a document
                    </strong>

                    <span>
                      PDF, DOCX or TXT
                    </span>
                  </>
                )}

              </label>

              <div className="input-hint">
                AURA will extract the
                document content, inspect
                claims and identify suspicious
                signals.
              </div>
            </>
          )}

        </div>

        {/* ==================================================
            ERROR
            ================================================== */}

        {error && (
          <div className="investigation-error">
            {error}
          </div>
        )}

        {/* ==================================================
            ACTION
            ================================================== */}

        <div className="investigation-actions">

          <div className="investigation-security">

            <ShieldCheck size={17} />

            <span>
              AURA evidence-driven analysis
            </span>

          </div>

          <button
            className="investigate-button"
            onClick={investigate}
            disabled={loading}
          >

            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="spin"
                />

                Investigating...
              </>
            ) : (
              <>
                <Search size={17} />

                Investigate
              </>
            )}

          </button>

        </div>

      </div>

    </div>
  );
}