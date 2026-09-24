import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Upload,
  RefreshCw,
  FileText,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Documents({
  setPage,
  setReport
}) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  function getToken() {
    return localStorage.getItem("aura_token");
  }

  function logoutToLogin() {
    localStorage.removeItem("aura_token");
    localStorage.removeItem("aura_user");
    localStorage.removeItem("aura_session");
    setPage("login");
  }

  async function loadDocuments(refresh = false) {
    const token = getToken();

    if (!token) {
      logoutToLogin();
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/investigations`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        logoutToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Could not load documents."
        );
      }

      const records =
        Array.isArray(data.investigations)
          ? data.investigations
          : [];

      setDocuments(
        records.filter(
          (item) =>
            String(
              item.inputType ||
              ""
            ).toLowerCase() === "document"
        )
      );
    } catch (err) {
      console.error(
        "Documents loading error:",
        err
      );

      setError(
        err.message ||
        "Could not load documents."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function getRisk(item) {
    return String(
      item.riskLevel ||
      "UNKNOWN"
    ).toUpperCase();
  }

  function getScore(item) {
    return Number(
      item.riskScore ?? 0
    );
  }

  function getName(item) {
    const input =
      item.input ||
      "Untitled document";

    const lines =
      input.split("\n");

    return (
      lines[0]
        .trim()
        .slice(0, 100) ||
      "Untitled document"
    );
  }

  function getSummary(item) {
    return (
      item.summary ||
      item.recommendation ||
      "No summary available."
    );
  }

  const filteredDocuments =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return documents.filter(
        (item) => {
          const risk =
            getRisk(item);

          const text = (
            getName(item) +
            " " +
            getSummary(item)
          ).toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesRisk =
            riskFilter === "ALL" ||
            risk === riskFilter;

          return (
            matchesSearch &&
            matchesRisk
          );
        }
      );
    },
    [
      documents,
      search,
      riskFilter
    ]);

  async function openDocument(item) {
    const token = getToken();

    if (!token) {
      logoutToLogin();
      return;
    }

    const id =
      item._id ||
      item.id;

    if (!id) {
      setReport(item);
      setPage("result");
      return;
    }

    try {
      const response =
        await fetch(
          `${API_URL}/api/investigations/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      const data =
        await response.json();

      if (response.status === 401) {
        logoutToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Could not open document investigation."
        );
      }

      setReport(
        data.investigation ||
        item
      );

      setPage("result");
    } catch (err) {
      console.error(err);

      setReport(item);
      setPage("result");
    }
  }

  function getRiskIcon(risk) {
    if (risk === "HIGH") {
      return <ShieldAlert size={17} />;
    }

    if (risk === "MEDIUM") {
      return <AlertTriangle size={17} />;
    }

    if (risk === "LOW") {
      return <ShieldCheck size={17} />;
    }

    return <FileText size={17} />;
  }

  function formatDate(date) {
    if (!date) {
      return "Unknown";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "Unknown";
    }

    return value.toLocaleString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function getRiskClass(risk) {
    return `document-risk document-risk-${risk.toLowerCase()}`;
  }

  if (loading) {
    return (
      <div className="documents-page">

        <div className="documents-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading documents...
          </span>

        </div>

      </div>
    );
  }

  return (
    <div className="documents-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="documents-header">

        <div>

          <div className="page-eyebrow">
            AURA WORKSPACE
          </div>

          <h1>
            Documents
          </h1>

          <p>
            Documents previously investigated
            by your AURA agent.
          </p>

        </div>

        <div className="documents-header-actions">

          <button
            className="secondary-button"
            onClick={() =>
              loadDocuments(true)
            }
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2
                size={15}
                className="spin"
              />
            ) : (
              <RefreshCw size={15} />
            )}

            Refresh
          </button>

          <button
            className="investigate-button"
            onClick={() =>
              setPage("investigate")
            }
          >
            <Upload size={15} />
            Investigate Document
          </button>

        </div>

      </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (
        <div className="documents-error">
          {error}
        </div>
      )}

      {/* ==================================================
          STATS
          ================================================== */}

      <div className="documents-stats">

        <div className="documents-stat">

          <span>
            DOCUMENTS
          </span>

          <strong>
            {documents.length}
          </strong>

        </div>

        <div className="documents-stat">

          <span>
            HIGH RISK
          </span>

          <strong>
            {
              documents.filter(
                (item) =>
                  getRisk(item) ===
                  "HIGH"
              ).length
            }
          </strong>

        </div>

        <div className="documents-stat">

          <span>
            MEDIUM RISK
          </span>

          <strong>
            {
              documents.filter(
                (item) =>
                  getRisk(item) ===
                  "MEDIUM"
              ).length
            }
          </strong>

        </div>

        <div className="documents-stat">

          <span>
            LOW RISK
          </span>

          <strong>
            {
              documents.filter(
                (item) =>
                  getRisk(item) ===
                  "LOW"
              ).length
            }
          </strong>

        </div>

      </div>

      {/* ==================================================
          FILTERS
          ================================================== */}

      <div className="documents-toolbar">

        <div className="documents-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <div className="documents-filter">

          <select
            value={riskFilter}
            onChange={(event) =>
              setRiskFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Risk Levels
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>

            <option value="UNKNOWN">
              Unknown
            </option>
          </select>

        </div>

      </div>

      {/* ==================================================
          DOCUMENT LIST
          ================================================== */}

      {filteredDocuments.length === 0 ? (
        <div className="documents-empty">

          <div className="documents-empty-icon">
            <FileText size={23} />
          </div>

          <h2>
            No documents found
          </h2>

          <p>
            {documents.length === 0
              ? "Investigated documents will appear here."
              : "Try changing your search or risk filter."}
          </p>

          {documents.length === 0 && (
            <button
              className="investigate-button"
              onClick={() =>
                setPage("investigate")
              }
            >
              <Upload size={15} />
              Investigate Document
            </button>
          )}

        </div>
      ) : (
        <div className="documents-list">

          {filteredDocuments.map(
            (item, index) => {
              const risk =
                getRisk(item);

              const score =
                getScore(item);

              return (
                <button
                  className="document-row"
                  key={
                    item._id ||
                    item.id ||
                    index
                  }
                  onClick={() =>
                    openDocument(item)
                  }
                >

                  <div className="document-icon">
                    <FileText size={20} />
                  </div>

                  <div className="document-main">

                    <strong>
                      {getName(item)}
                    </strong>

                    <p>
                      {getSummary(item)}
                    </p>

                    <div className="document-meta">

                      <span>
                        Investigated{" "}
                        {formatDate(
                          item.createdAt
                        )}
                      </span>

                      <span>
                        {Array.isArray(
                          item.claims
                        )
                          ? item.claims.length
                          : 0}{" "}
                        claims
                      </span>

                      <span>
                        {Array.isArray(
                          item.findings
                        )
                          ? item.findings.length
                          : 0}{" "}
                        findings
                      </span>

                    </div>

                  </div>

                  <div className="document-score">

                    <span>
                      SCORE
                    </span>

                    <strong>
                      {score}
                    </strong>

                    <small>
                      /100
                    </small>

                  </div>

                  <div
                    className={getRiskClass(
                      risk
                    )}
                  >
                    {getRiskIcon(risk)}

                    <span>
                      {risk}
                    </span>
                  </div>

                  <div className="document-open">
                    <ChevronRight
                      size={17}
                    />
                  </div>

                </button>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}