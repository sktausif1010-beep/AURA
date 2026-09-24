import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock3,
  FileText,
  Globe,
  MessageSquare,
  Loader2
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function InvestigationHistory({
  setPage,
  setReport
}) {
  const [investigations, setInvestigations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  const [typeFilter, setTypeFilter] =
    useState("ALL");

  const [pageNumber, setPageNumber] =
    useState(1);

  const ITEMS_PER_PAGE = 10;

  // ==================================================
  // AUTH
  // ==================================================

  function getToken() {
    return localStorage.getItem(
      "aura_token"
    );
  }

  function handleUnauthorized() {
    localStorage.removeItem(
      "aura_token"
    );

    localStorage.removeItem(
      "aura_user"
    );

    localStorage.removeItem(
      "aura_session"
    );

    setPage("login");
  }

  // ==================================================
  // LOAD HISTORY
  // ==================================================

  async function loadHistory(
    showRefresh = false
  ) {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/investigations`,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${token}`
          }
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
          "Could not load investigation history."
        );
      }

      const records =
        Array.isArray(
          data.investigations
        )
          ? data.investigations
          : [];

      setInvestigations(records);

    } catch (err) {
      console.error(
        "History loading error:",
        err
      );

      setError(
        err.message ||
        "Could not load investigation history."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // ==================================================
  // NORMALIZE
  // ==================================================

  function getRisk(item) {
    return String(
      item.riskLevel ||
      item.risk_level ||
      "UNKNOWN"
    ).toUpperCase();
  }

  function getType(item) {
    return String(
      item.inputType ||
      item.input_type ||
      "text"
    ).toLowerCase();
  }

  function getInput(item) {
    return (
      item.input ||
      item.originalInput ||
      ""
    );
  }

  function getSummary(item) {
    return (
      item.summary ||
      item.recommendation ||
      "No summary available."
    );
  }

  // ==================================================
  // FILTER
  // ==================================================

  const filteredInvestigations =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return investigations.filter(
        (item) => {
          const risk =
            getRisk(item);

          const type =
            getType(item);

          const input =
            getInput(item)
              .toLowerCase();

          const summary =
            getSummary(item)
              .toLowerCase();

          const matchesSearch =
            !query ||
            input.includes(query) ||
            summary.includes(query);

          const matchesRisk =
            riskFilter === "ALL" ||
            risk === riskFilter;

          const matchesType =
            typeFilter === "ALL" ||
            type === typeFilter;

          return (
            matchesSearch &&
            matchesRisk &&
            matchesType
          );
        }
      );
    }, [
      investigations,
      search,
      riskFilter,
      typeFilter
    ]);

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredInvestigations.length /
          ITEMS_PER_PAGE
      )
    );

  const safePage =
    Math.min(
      pageNumber,
      totalPages
    );

  const paginatedInvestigations =
    filteredInvestigations.slice(
      (safePage - 1) *
        ITEMS_PER_PAGE,

      safePage *
        ITEMS_PER_PAGE
    );

  // ==================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ==================================================

  useEffect(() => {
    setPageNumber(1);
  }, [
    search,
    riskFilter,
    typeFilter
  ]);

  // ==================================================
  // OPEN REPORT
  // ==================================================

  async function openInvestigation(item) {
    const token = getToken();

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const id =
        item._id ||
        item.id;

      if (!id) {
        setReport(item);
        setPage("result");
        return;
      }

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
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Could not open investigation."
        );
      }

      setReport(
        data.investigation ||
        item
      );

      setPage("result");

    } catch (err) {
      console.error(
        "Could not open investigation:",
        err
      );

      // Fallback to already loaded record
      setReport(item);
      setPage("result");
    }
  }

  // ==================================================
  // RISK ICON
  // ==================================================

  function RiskIcon({ risk }) {
    if (risk === "HIGH") {
      return (
        <ShieldAlert
          size={17}
        />
      );
    }

    if (risk === "MEDIUM") {
      return (
        <AlertTriangle
          size={17}
        />
      );
    }

    if (risk === "LOW") {
      return (
        <ShieldCheck
          size={17}
        />
      );
    }

    return (
      <Clock3
        size={17}
      />
    );
  }

  // ==================================================
  // TYPE ICON
  // ==================================================

  function TypeIcon({ type }) {
    if (type === "url") {
      return (
        <Globe size={15} />
      );
    }

    if (type === "document") {
      return (
        <FileText size={15} />
      );
    }

    return (
      <MessageSquare
        size={15}
      />
    );
  }

  // ==================================================
  // DATE
  // ==================================================

  function formatDate(date) {
    if (!date) {
      return "Unknown date";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "Unknown date";
    }

    return parsed.toLocaleString(
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

  // ==================================================
  // RISK CLASS
  // ==================================================

  function riskClass(risk) {
    return `history-risk history-risk-${risk.toLowerCase()}`;
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="history-page">

        <div className="history-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading investigation history...
          </span>

        </div>

      </div>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="history-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="history-header">

        <div>

          <div className="page-eyebrow">
            AURA WORKSPACE
          </div>

          <h1>
            Investigation History
          </h1>

          <p>
            Review investigations created
            by your AURA workspace.
          </p>

        </div>

        <div className="history-header-actions">

          <button
            className="secondary-button"
            onClick={() =>
              loadHistory(true)
            }
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2
                size={15}
                className="spin"
              />
            ) : (
              <RefreshCw
                size={15}
              />
            )}

            Refresh
          </button>

          <button
            className="investigate-button"
            onClick={() =>
              setPage("investigate")
            }
          >
            <Search size={15} />
            New Investigation
          </button>

        </div>

      </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {/* ==================================================
          STATS
          ================================================== */}

      <div className="history-stats">

        <div className="history-stat">

          <span>
            TOTAL
          </span>

          <strong>
            {investigations.length}
          </strong>

        </div>

        <div className="history-stat">

          <span>
            HIGH RISK
          </span>

          <strong>
            {
              investigations.filter(
                (item) =>
                  getRisk(item) ===
                  "HIGH"
              ).length
            }
          </strong>

        </div>

        <div className="history-stat">

          <span>
            MEDIUM RISK
          </span>

          <strong>
            {
              investigations.filter(
                (item) =>
                  getRisk(item) ===
                  "MEDIUM"
              ).length
            }
          </strong>

        </div>

        <div className="history-stat">

          <span>
            LOW RISK
          </span>

          <strong>
            {
              investigations.filter(
                (item) =>
                  getRisk(item) ===
                  "LOW"
              ).length
            }
          </strong>

        </div>

      </div>

      {/* ==================================================
          FILTER BAR
          ================================================== */}

      <div className="history-toolbar">

        <div className="history-search">

          <Search
            size={16}
          />

          <input
            type="text"
            placeholder="Search investigations..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <div className="history-filter">

          <Filter
            size={15}
          />

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

        <div className="history-filter">

          <Filter
            size={15}
          />

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Types
            </option>

            <option value="text">
              Message
            </option>

            <option value="url">
              Website
            </option>

            <option value="document">
              Document
            </option>

          </select>

        </div>

      </div>

      {/* ==================================================
          RESULTS
          ================================================== */}

      {paginatedInvestigations.length ===
      0 ? (
        <div className="history-empty">

          <div className="history-empty-icon">
            <Search size={22} />
          </div>

          <h2>
            No investigations found
          </h2>

          <p>
            {investigations.length === 0
              ? "Your investigation history will appear here after you run your first investigation."
              : "Try changing your search or filters."}
          </p>

          {investigations.length ===
            0 && (
            <button
              className="investigate-button"
              onClick={() =>
                setPage("investigate")
              }
            >
              <Search size={15} />
              Start Investigation
            </button>
          )}

        </div>
      ) : (
        <div className="history-list">

          {/* TABLE HEADER */}

          <div className="history-list-header">

            <span>
              INVESTIGATION
            </span>

            <span>
              TYPE
            </span>

            <span>
              RISK
            </span>

            <span>
              SCORE
            </span>

            <span>
              DATE
            </span>

            <span />

          </div>

          {/* ROWS */}

          {paginatedInvestigations.map(
            (item, index) => {

              const risk =
                getRisk(item);

              const type =
                getType(item);

              const score =
                Number(
                  item.riskScore ??
                  item.risk_score ??
                  0
                );

              return (
                <button
                  className="history-row"
                  key={
                    item._id ||
                    item.id ||
                    index
                  }
                  onClick={() =>
                    openInvestigation(
                      item
                    )
                  }
                >

                  {/* INPUT */}

                  <div className="history-input">

                    <div className="history-input-icon">
                      <TypeIcon
                        type={type}
                      />
                    </div>

                    <div>

                      <strong>
                        {getInput(
                          item
                        ) ||
                          "Untitled investigation"}
                      </strong>

                      <span>
                        {getSummary(
                          item
                        )}
                      </span>

                    </div>

                  </div>

                  {/* TYPE */}

                  <div className="history-type">

                    <TypeIcon
                      type={type}
                    />

                    <span>
                      {type ===
                      "document"
                        ? "Document"
                        : type ===
                            "url"
                          ? "Website"
                          : "Message"}
                    </span>

                  </div>

                  {/* RISK */}

                  <div>
                    <span
                      className={riskClass(
                        risk
                      )}
                    >
                      <RiskIcon
                        risk={risk}
                      />

                      {risk}
                    </span>
                  </div>

                  {/* SCORE */}

                  <div className="history-score">

                    <strong>
                      {score}
                    </strong>

                    <span>
                      /100
                    </span>

                  </div>

                  {/* DATE */}

                  <div className="history-date">
                    {formatDate(
                      item.createdAt
                    )}
                  </div>

                  {/* OPEN */}

                  <div className="history-open">
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

      {/* ==================================================
          PAGINATION
          ================================================== */}

      {filteredInvestigations.length >
        ITEMS_PER_PAGE && (
        <div className="history-pagination">

          <button
            className="secondary-button"
            disabled={
              safePage <= 1
            }
            onClick={() =>
              setPageNumber(
                (current) =>
                  Math.max(
                    1,
                    current - 1
                  )
              )
            }
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <div className="history-page-number">

            <span>
              Page
            </span>

            <strong>
              {safePage}
            </strong>

            <span>
              of
            </span>

            <strong>
              {totalPages}
            </strong>

          </div>

          <button
            className="secondary-button"
            disabled={
              safePage >=
              totalPages
            }
            onClick={() =>
              setPageNumber(
                (current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
              )
            }
          >
            Next
            <ChevronRight
              size={14}
            />
          </button>

        </div>
      )}

    </div>
  );
}