import { useEffect, useMemo, useState } from "react";

import {
  Search,
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  ArrowUpRight,
  Clock3,
  Activity,
  ChevronRight,
  ShieldAlert,
  Loader2
} from "lucide-react";

const API_URL = "http://localhost:5000";

// ==================================================
// STAT CARD
// ==================================================

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  type = "default"
}) {
  return (
    <div
      className={`dashboard-stat-card ${type}`}
    >
      <div className="stat-card-top">

        <div className="stat-card-icon">
          <Icon
            size={16}
            strokeWidth={1.8}
          />
        </div>

        <span className="stat-card-label">
          {label}
        </span>

      </div>

      <div className="stat-card-value">
        {value}
      </div>

      <div className="stat-card-description">
        {description}
      </div>
    </div>
  );
}

// ==================================================
// EMPTY INVESTIGATIONS
// ==================================================

function EmptyInvestigations({
  onStart
}) {
  return (
    <div className="dashboard-empty">

      <div className="dashboard-empty-icon">
        <FileSearch size={22} />
      </div>

      <div>
        <h3>
          No investigations yet
        </h3>

        <p>
          Start your first investigation
          and AURA will build your
          evidence trail here.
        </p>
      </div>

      <button
        className="dashboard-empty-button"
        onClick={onStart}
      >
        <span>
          Start Investigation
        </span>

        <ArrowUpRight size={14} />
      </button>

    </div>
  );
}

// ==================================================
// DASHBOARD
// ==================================================

export default function Dashboard({
  setPage
}) {
  const [investigations, setInvestigations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
  // LOAD REAL DATA
  // ==================================================

  async function loadDashboard() {
    const token =
      getToken();

    if (!token) {
      goToLogin();
      return;
    }

    setLoading(true);
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
          "Could not load dashboard data."
        );
      }

      const records =
        Array.isArray(
          data.investigations
        )
          ? data.investigations
          : [];

      setInvestigations(
        records
      );

    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.message ||
        "Could not load dashboard data."
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==================================================
  // START INVESTIGATION
  // ==================================================

  function startInvestigation() {
    setPage("investigate");
  }

  // ==================================================
  // STATISTICS
  // ==================================================

  const statistics =
    useMemo(() => {
      const total =
        investigations.length;

      const low =
        investigations.filter(
          (item) =>
            String(
              item.riskLevel ||
              "UNKNOWN"
            ).toUpperCase() ===
            "LOW"
        ).length;

      const medium =
        investigations.filter(
          (item) =>
            String(
              item.riskLevel ||
              "UNKNOWN"
            ).toUpperCase() ===
            "MEDIUM"
        ).length;

      const high =
        investigations.filter(
          (item) =>
            String(
              item.riskLevel ||
              "UNKNOWN"
            ).toUpperCase() ===
            "HIGH"
        ).length;

      return {
        total,
        low,
        medium,
        high
      };
    }, [
      investigations
    ]);

  // ==================================================
  // RECENT INVESTIGATIONS
  // ==================================================

  const recentInvestigations =
    useMemo(() => {
      return [...investigations]
        .sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ).getTime() -
            new Date(
              a.createdAt || 0
            ).getTime()
        )
        .slice(0, 5);
    }, [
      investigations
    ]);

  // ==================================================
  // OPEN RESULT
  // ==================================================

  async function openInvestigation(
    item
  ) {
    const token =
      getToken();

    if (!token) {
      goToLogin();
      return;
    }

    const id =
      item._id ||
      item.id;

    if (!id) {
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

      // Store report globally through
      // localStorage temporarily so the
      // existing dashboard can navigate.
      localStorage.setItem(
        "aura_selected_investigation",
        JSON.stringify(
          data.investigation ||
          item
        )
      );

      setPage("result");

      // Notify same-page components if needed
      window.dispatchEvent(
        new Event(
          "aura-investigation-selected"
        )
      );

    } catch (err) {
      console.error(
        "Could not open investigation:",
        err
      );
    }
  }

  // ==================================================
  // FORMAT INPUT
  // ==================================================

  function getInput(item) {
    const input =
      item.input ||
      "Untitled investigation";

    return input.length > 110
      ? `${input.slice(0, 110)}...`
      : input;
  }

  // ==================================================
  // FORMAT DATE
  // ==================================================

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
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  // ==================================================
  // RISK CLASS
  // ==================================================

  function getRiskClass(
    risk
  ) {
    return `recent-risk recent-risk-${risk.toLowerCase()}`;
  }

  // ==================================================
  // RISK ICON
  // ==================================================

  function getRiskIcon(
    risk
  ) {
    if (risk === "HIGH") {
      return (
        <ShieldAlert
          size={15}
        />
      );
    }

    if (risk === "MEDIUM") {
      return (
        <AlertTriangle
          size={15}
        />
      );
    }

    if (risk === "LOW") {
      return (
        <ShieldCheck
          size={15}
        />
      );
    }

    return (
      <Activity
        size={15}
      />
    );
  }

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">

          <Loader2
            size={24}
            className="spin"
          />

          <span>
            Loading AURA intelligence center...
          </span>

        </div>

      </div>
    );
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="dashboard-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <section className="dashboard-header">

        <div className="dashboard-header-copy">

          <div className="dashboard-eyebrow">

            <span className="dashboard-eyebrow-dot" />

            AURA INTELLIGENCE CENTER

          </div>

          <h1>
            Before you trust it,
            <br />

            <span>
              let AURA investigate it.
            </span>
          </h1>

          <p>
            Investigate suspicious messages,
            websites and documents before
            you trust them.
          </p>

        </div>

        <div className="dashboard-header-status">

          <div className="dashboard-status-ring">
            <Activity size={18} />
          </div>

          <div>

            <span>
              AGENT STATUS
            </span>

            <strong>
              Ready
            </strong>

          </div>

        </div>

      </section>

      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* =========================================
          QUICK ACTION
      ========================================= */}

      <section className="dashboard-investigate-card">

        <div className="investigate-card-glow" />

        <div className="investigate-card-content">

          <div className="investigate-card-icon">
            <Search size={22} />
          </div>

          <div>

            <div className="investigate-card-eyebrow">
              NEW INVESTIGATION
            </div>

            <h2>
              Have something you don't trust?
            </h2>

            <p>
              Give it to AURA. We'll investigate
              the claims, evidence and sources
              behind it.
            </p>

          </div>

        </div>

        <button
          className="dashboard-primary-button"
          onClick={
            startInvestigation
          }
        >
          <span>
            Start Investigation
          </span>

          <ArrowUpRight size={16} />
        </button>

      </section>

      {/* =========================================
          STATISTICS
      ========================================= */}

      <section className="dashboard-section">

        <div className="dashboard-section-heading">

          <div>

            <span className="section-kicker">
              OVERVIEW
            </span>

            <h2>
              Investigation Activity
            </h2>

          </div>

          <span className="data-source-label">
            LIVE DATA
          </span>

        </div>

        <div className="dashboard-stat-grid">

          <StatCard
            icon={FileSearch}
            label="TOTAL INVESTIGATIONS"
            value={
              statistics.total
            }
            description={
              statistics.total === 0
                ? "No investigations recorded"
                : `${statistics.total} investigation${
                    statistics.total === 1
                      ? ""
                      : "s"
                  } recorded`
            }
          />

          <StatCard
            icon={ShieldCheck}
            label="LOW RISK"
            value={
              statistics.low
            }
            description={
              statistics.low === 0
                ? "No low-risk results yet"
                : `${statistics.low} low-risk result${
                    statistics.low === 1
                      ? ""
                      : "s"
                  }`
            }
            type="success"
          />

          <StatCard
            icon={AlertTriangle}
            label="SUSPICIOUS"
            value={
              statistics.medium
            }
            description={
              statistics.medium === 0
                ? "No suspicious results yet"
                : `${statistics.medium} medium-risk result${
                    statistics.medium === 1
                      ? ""
                      : "s"
                  }`
            }
            type="warning"
          />

          <StatCard
            icon={ShieldAlert}
            label="HIGH RISK"
            value={
              statistics.high
            }
            description={
              statistics.high === 0
                ? "No high-risk results yet"
                : `${statistics.high} high-risk result${
                    statistics.high === 1
                      ? ""
                      : "s"
                  }`
            }
            type="danger"
          />

        </div>

      </section>

      {/* =========================================
          MAIN GRID
      ========================================= */}

      <section className="dashboard-main-grid">

        {/* =========================================
            RECENT INVESTIGATIONS
        ========================================= */}

        <div className="dashboard-panel recent-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="section-kicker">
                ACTIVITY
              </span>

              <h2>
                Recent Investigations
              </h2>

            </div>

            <button
              className="panel-link"
              onClick={() =>
                setPage("history")
              }
            >
              View all

              <ChevronRight
                size={13}
              />

            </button>

          </div>

          {recentInvestigations.length ===
          0 ? (
            <EmptyInvestigations
              onStart={
                startInvestigation
              }
            />
          ) : (
            <div className="recent-investigation-list">

              {recentInvestigations.map(
                (
                  item,
                  index
                ) => {

                  const risk =
                    String(
                      item.riskLevel ||
                      "UNKNOWN"
                    ).toUpperCase();

                  return (
                    <button
                      className="recent-investigation-row"
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

                      <div className="recent-investigation-icon">

                        <FileSearch
                          size={17}
                        />

                      </div>

                      <div className="recent-investigation-content">

                        <strong>
                          {getInput(
                            item
                          )}
                        </strong>

                        <span>
                          {formatDate(
                            item.createdAt
                          )}
                        </span>

                      </div>

                      <span
                        className={getRiskClass(
                          risk
                        )}
                      >
                        {getRiskIcon(
                          risk
                        )}

                        {risk}
                      </span>

                      <ChevronRight
                        size={16}
                        className="recent-investigation-arrow"
                      />

                    </button>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* =========================================
            AURA CHECKS
        ========================================= */}

        <div className="dashboard-panel checks-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="section-kicker">
                INVESTIGATION ENGINE
              </span>

              <h2>
                What AURA checks
              </h2>

            </div>

          </div>

          <div className="aura-check-list">

            <div className="aura-check-item">

              <div className="check-number">
                01
              </div>

              <div>

                <strong>
                  Claims
                </strong>

                <p>
                  Extracts and identifies
                  important claims.
                </p>

              </div>

            </div>

            <div className="aura-check-item">

              <div className="check-number">
                02
              </div>

              <div>

                <strong>
                  Evidence
                </strong>

                <p>
                  Finds supporting and
                  conflicting signals.
                </p>

              </div>

            </div>

            <div className="aura-check-item">

              <div className="check-number">
                03
              </div>

              <div>

                <strong>
                  Sources
                </strong>

                <p>
                  Connects evidence to
                  its investigation source.
                </p>

              </div>

            </div>

            <div className="aura-check-item">

              <div className="check-number">
                04
              </div>

              <div>

                <strong>
                  Risk
                </strong>

                <p>
                  Produces an explainable
                  risk assessment.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          LOWER INFORMATION ROW
      ========================================= */}

      <section className="dashboard-bottom-grid">

        {/* WORKFLOW */}

        <div className="dashboard-panel workflow-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="section-kicker">
                HOW IT WORKS
              </span>

              <h2>
                AURA investigation flow
              </h2>

            </div>

          </div>

          <div className="dashboard-workflow">

            <div className="workflow-step">

              <span>
                01
              </span>

              <strong>
                Submit
              </strong>

              <p>
                Message, URL or document
              </p>

            </div>

            <div className="workflow-line" />

            <div className="workflow-step">

              <span>
                02
              </span>

              <strong>
                Investigate
              </strong>

              <p>
                AURA examines the input
              </p>

            </div>

            <div className="workflow-line" />

            <div className="workflow-step">

              <span>
                03
              </span>

              <strong>
                Connect
              </strong>

              <p>
                Claims, evidence and sources
              </p>

            </div>

            <div className="workflow-line" />

            <div className="workflow-step">

              <span>
                04
              </span>

              <strong>
                Explain
              </strong>

              <p>
                Risk and next action
              </p>

            </div>

          </div>

        </div>

        {/* SYSTEM CARD */}

        <div className="dashboard-panel system-panel">

          <div className="system-visual">

            <div className="system-orbit orbit-a" />

            <div className="system-orbit orbit-b" />

            <div className="system-core">
              <ShieldCheck
                size={23}
              />
            </div>

          </div>

          <div className="system-content">

            <span className="section-kicker">
              AURA SYSTEM
            </span>

            <h2>
              Investigation ready
            </h2>

            <p>
              Your local AI agent is ready
              to analyze new evidence.
            </p>

            <div className="system-status">

              <span className="system-status-dot" />

              <span>
                Ollama connection
              </span>

              <strong>
                Ready
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <div className="dashboard-footer">

        <div>

          <Clock3 size={13} />

          <span>
            Investigations are stored
            securely in your AURA workspace.
          </span>

        </div>

        <span>
          AURA v1.0.0
        </span>

      </div>

    </div>
  );
}