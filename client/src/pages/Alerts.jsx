import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  RefreshCw,
  Search,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Loader2
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";
  
export default function Alerts({
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

  const [filter, setFilter] =
    useState("ALL");

  // ==================================================
  // AUTH
  // ==================================================

  function getToken() {
    return localStorage.getItem(
      "aura_token"
    );
  }

  function goToLogin() {
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
  // LOAD INVESTIGATIONS
  // ==================================================

  async function loadAlerts(
    refresh = false
  ) {
    const token = getToken();

    if (!token) {
      goToLogin();
      return;
    }

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response =
        await fetch(
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
        goToLogin();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Could not load alerts."
        );
      }

      setInvestigations(
        Array.isArray(
          data.investigations
        )
          ? data.investigations
          : []
      );

    } catch (err) {
      console.error(
        "Alerts loading error:",
        err
      );

      setError(
        err.message ||
        "Could not load alerts."
      );

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  // ==================================================
  // HELPERS
  // ==================================================

  function getRisk(item) {
    return String(
      item.riskLevel ||
      "UNKNOWN"
    ).toUpperCase();
  }

  function getInput(item) {
    return (
      item.input ||
      "Investigation"
    );
  }

  function getSummary(item) {
    return (
      item.summary ||
      item.recommendation ||
      "Investigation completed."
    );
  }

  function getScore(item) {
    return Number(
      item.riskScore ?? 0
    );
  }

  function getAlertType(item) {
    const risk =
      getRisk(item);

    if (risk === "HIGH") {
      return "HIGH";
    }

    if (risk === "MEDIUM") {
      return "MEDIUM";
    }

    if (risk === "LOW") {
      return "LOW";
    }

    return "UNKNOWN";
  }

  function getAlertTitle(item) {
    const risk =
      getRisk(item);

    if (risk === "HIGH") {
      return "High-risk investigation";
    }

    if (risk === "MEDIUM") {
      return "Suspicious signals detected";
    }

    if (risk === "LOW") {
      return "Investigation completed";
    }

    return "Investigation requires review";
  }

  function getAlertDescription(item) {
    const risk =
      getRisk(item);

    if (risk === "HIGH") {
      return (
        "AURA identified multiple signals that require careful review before taking action."
      );
    }

    if (risk === "MEDIUM") {
      return (
        "AURA found signals that could not be confidently cleared."
      );
    }

    if (risk === "LOW") {
      return (
        "AURA completed the investigation without identifying major risk signals."
      );
    }

    return (
      "AURA could not establish enough evidence for a clear risk assessment."
    );
  }

  function getIcon(type) {
    if (type === "HIGH") {
      return (
        <ShieldAlert
          size={19}
        />
      );
    }

    if (type === "MEDIUM") {
      return (
        <AlertTriangle
          size={19}
        />
      );
    }

    if (type === "LOW") {
      return (
        <ShieldCheck
          size={19}
        />
      );
    }

    return (
      <Bell
        size={19}
      />
    );
  }

  function getClass(type) {
    return `alert-item alert-${type.toLowerCase()}`;
  }

  function formatDate(date) {
    if (!date) {
      return "Unknown time";
    }

    const value =
      new Date(date);

    if (
      Number.isNaN(
        value.getTime()
      )
    ) {
      return "Unknown time";
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

  // ==================================================
  // ALERT DATA
  // ==================================================

  const alerts = useMemo(() => {
    return investigations
      .map((item) => ({
        ...item,
        alertType:
          getAlertType(item)
      }))
      .sort(
        (a, b) => {
          const dateA =
            new Date(
              a.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b.createdAt || 0
            ).getTime();

          return dateB - dateA;
        }
      );
  }, [investigations]);

  // ==================================================
  // FILTER
  // ==================================================

  const filteredAlerts =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return alerts.filter(
        (item) => {
          const text = (
            getInput(item) +
            " " +
            getSummary(item) +
            " " +
            getAlertTitle(item)
          ).toLowerCase();

          const matchesSearch =
            !query ||
            text.includes(query);

          const matchesFilter =
            filter === "ALL" ||
            item.alertType === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      alerts,
      search,
      filter
    ]);

  // ==================================================
  // OPEN INVESTIGATION
  // ==================================================

  async function openAlert(item) {
    const token = getToken();

    if (!token) {
      goToLogin();
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
        goToLogin();
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
        "Could not open alert:",
        err
      );

      setReport(item);
      setPage("result");
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="alerts-page">

        <div className="alerts-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading alerts...
          </span>

        </div>

      </div>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="alerts-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="alerts-header">

        <div>

          <div className="page-eyebrow">
            AURA WORKSPACE
          </div>

          <h1>
            Alerts
          </h1>

          <p>
            Risk signals generated from
            your investigations.
          </p>

        </div>

        <button
          className="secondary-button"
          onClick={() =>
            loadAlerts(true)
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

      </div>

      {/* ==================================================
          ERROR
          ================================================== */}

      {error && (
        <div className="alerts-error">
          {error}
        </div>
      )}

      {/* ==================================================
          SUMMARY
          ================================================== */}

      <div className="alerts-summary">

        <div className="alerts-summary-card">

          <span>
            TOTAL
          </span>

          <strong>
            {alerts.length}
          </strong>

        </div>

        <div className="alerts-summary-card high">

          <span>
            HIGH
          </span>

          <strong>
            {
              alerts.filter(
                (item) =>
                  item.alertType ===
                  "HIGH"
              ).length
            }
          </strong>

        </div>

        <div className="alerts-summary-card medium">

          <span>
            MEDIUM
          </span>

          <strong>
            {
              alerts.filter(
                (item) =>
                  item.alertType ===
                  "MEDIUM"
              ).length
            }
          </strong>

        </div>

        <div className="alerts-summary-card low">

          <span>
            LOW
          </span>

          <strong>
            {
              alerts.filter(
                (item) =>
                  item.alertType ===
                  "LOW"
              ).length
            }
          </strong>

        </div>

      </div>

      {/* ==================================================
          TOOLBAR
          ================================================== */}

      <div className="alerts-toolbar">

        <div className="alerts-search">

          <Search
            size={16}
          />

          <input
            type="text"
            placeholder="Search alerts..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>

        <div className="alerts-filter">

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value
              )
            }
          >
            <option value="ALL">
              All Alerts
            </option>

            <option value="HIGH">
              High Risk
            </option>

            <option value="MEDIUM">
              Medium Risk
            </option>

            <option value="LOW">
              Low Risk
            </option>

            <option value="UNKNOWN">
              Unknown
            </option>

          </select>

        </div>

      </div>

      {/* ==================================================
          ALERT LIST
          ================================================== */}

      {filteredAlerts.length === 0 ? (
        <div className="alerts-empty">

          <div className="alerts-empty-icon">
            <Bell size={23} />
          </div>

          <h2>
            No alerts found
          </h2>

          <p>
            {alerts.length === 0
              ? "Alerts will appear here after you run investigations."
              : "Try changing your search or filter."}
          </p>

          {alerts.length === 0 && (
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
        <div className="alerts-list">

          {filteredAlerts.map(
            (item, index) => {

              const type =
                item.alertType;

              return (
                <button
                  className={getClass(
                    type
                  )}
                  key={
                    item._id ||
                    item.id ||
                    index
                  }
                  onClick={() =>
                    openAlert(item)
                  }
                >

                  {/* ICON */}

                  <div className="alert-icon">
                    {getIcon(type)}
                  </div>

                  {/* CONTENT */}

                  <div className="alert-content">

                    <div className="alert-top">

                      <strong>
                        {getAlertTitle(
                          item
                        )}
                      </strong>

                      <span>
                        {formatDate(
                          item.createdAt
                        )}
                      </span>

                    </div>

                    <p>
                      {getAlertDescription(
                        item
                      )}
                    </p>

                    <div className="alert-input">

                      <span>
                        Investigation
                      </span>

                      <strong>
                        {getInput(
                          item
                        ).slice(
                          0,
                          120
                        )}

                        {getInput(
                          item
                        ).length > 120
                          ? "..."
                          : ""}
                      </strong>

                    </div>

                  </div>

                  {/* SCORE */}

                  <div className="alert-score">

                    <span>
                      SCORE
                    </span>

                    <strong>
                      {getScore(
                        item
                      )}
                    </strong>

                    <small>
                      /100
                    </small>

                  </div>

                  {/* ARROW */}

                  <ChevronRight
                    size={18}
                    className="alert-arrow"
                  />

                </button>
              );
            }
          )}

        </div>
      )}

    </div>
  );
}