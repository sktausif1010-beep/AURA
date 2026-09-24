import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Network,
  Search,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  HelpCircle
} from "lucide-react";

export default function InvestigationResult({
  report,
  setPage
}) {
  // ==================================================
  // EMPTY STATE
  // ==================================================

  if (!report) {
    return (
      <div className="result-page">

        <div className="result-empty">

          <div className="result-empty-icon">
            <Search size={24} />
          </div>

          <div className="page-eyebrow">
            AURA INVESTIGATION
          </div>

          <h1>
            No investigation selected
          </h1>

          <p>
            Run an investigation first to
            view the evidence and risk
            assessment.
          </p>

          <button
            className="investigate-button"
            onClick={() =>
              setPage("investigate")
            }
          >
            <Search size={16} />
            New Investigation
          </button>

        </div>

      </div>
    );
  }

  // ==================================================
  // NORMALIZE REPORT
  // ==================================================

  const riskLevel =
    String(
      report.riskLevel ||
      report.risk_level ||
      "UNKNOWN"
    ).toUpperCase();

  const riskScore =
    Number(
      report.riskScore ??
      report.risk_score ??
      0
    );

  const summary =
    report.summary ||
    "AURA did not generate a summary.";

  const findings =
    Array.isArray(report.findings)
      ? report.findings
      : [];

  const claims =
    Array.isArray(report.claims)
      ? report.claims
      : [];

  const evidence =
    Array.isArray(report.evidence)
      ? report.evidence
      : [];

  const actions =
    Array.isArray(report.agentActions)
      ? report.agentActions
      : Array.isArray(report.actions)
        ? report.actions
        : [];

  const trustGraph =
    report.trustGraph ||
    report.trust_graph ||
    {
      nodes: [],
      edges: []
    };

  const recommendation =
    report.recommendation ||
    "Review the available evidence before taking action.";

  const confidence =
    String(
      report.confidence ||
      "LOW"
    ).toUpperCase();

  // ==================================================
  // RISK HELPERS
  // ==================================================

  function getRiskClass() {
    if (riskLevel === "HIGH") {
      return "risk-high";
    }

    if (riskLevel === "MEDIUM") {
      return "risk-medium";
    }

    if (riskLevel === "LOW") {
      return "risk-low";
    }

    return "risk-unknown";
  }

  function getRiskIcon() {
    if (riskLevel === "HIGH") {
      return <ShieldAlert size={25} />;
    }

    if (riskLevel === "MEDIUM") {
      return <AlertTriangle size={25} />;
    }

    if (riskLevel === "LOW") {
      return <ShieldCheck size={25} />;
    }

    return <HelpCircle size={25} />;
  }

  function getClaimIcon(status) {
    const normalized =
      String(
        status || ""
      ).toUpperCase();

    if (
      normalized === "VERIFIED"
    ) {
      return (
        <CheckCircle2
          size={16}
        />
      );
    }

    if (
      normalized === "SUSPICIOUS"
    ) {
      return (
        <XCircle
          size={16}
        />
      );
    }

    return (
      <HelpCircle
        size={16}
      />
    );
  }

  function getClaimClass(status) {
    const normalized =
      String(
        status || ""
      ).toUpperCase();

    if (
      normalized === "VERIFIED"
    ) {
      return "claim-verified";
    }

    if (
      normalized === "SUSPICIOUS"
    ) {
      return "claim-suspicious";
    }

    return "claim-unknown";
  }

  // ==================================================
  // INPUT TYPE
  // ==================================================

  const inputType =
    String(
      report.inputType ||
      "text"
    ).toLowerCase();

  function getInputIcon() {
    if (inputType === "url") {
      return <Globe size={15} />;
    }

    if (inputType === "document") {
      return <FileText size={15} />;
    }

    return <Search size={15} />;
  }

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="result-page">

      {/* ==================================================
          HEADER
          ================================================== */}

      <div className="result-header">

        <button
          className="back-button"
          onClick={() =>
            setPage("investigate")
          }
        >
          <ArrowLeft size={16} />
          New Investigation
        </button>

        <div className="result-header-content">

          <div>
            <div className="page-eyebrow">
              AURA INVESTIGATION REPORT
            </div>

            <h1>
              Investigation Result
            </h1>

            <p>
              Evidence collected and
              analyzed by the AURA agent.
            </p>
          </div>

          <button
            className="graph-button"
            onClick={() =>
              setPage("trust")
            }
          >
            <Network size={16} />
            Open Trust Graph
          </button>

        </div>

      </div>

      {/* ==================================================
          RISK OVERVIEW
          ================================================== */}

      <div className="result-overview">

        <div
          className={`risk-overview ${getRiskClass()}`}
        >

          <div className="risk-overview-icon">
            {getRiskIcon()}
          </div>

          <div className="risk-overview-main">

            <span className="result-section-label">
              AURA RISK ASSESSMENT
            </span>

            <strong>
              {riskLevel}
            </strong>

            <span>
              Risk level
            </span>

          </div>

          <div className="risk-score">

            <span>
              SCORE
            </span>

            <strong>
              {Math.max(
                0,
                Math.min(
                  100,
                  riskScore
                )
              )}
            </strong>

            <small>
              / 100
            </small>

          </div>

        </div>

        <div className="result-meta-card">

          <div className="result-meta-row">

            <span>
              Input type
            </span>

            <strong className="result-input-type">
              {getInputIcon()}
              {inputType}
            </strong>

          </div>

          <div className="result-meta-row">

            <span>
              Confidence
            </span>

            <strong>
              {confidence}
            </strong>

          </div>

          <div className="result-meta-row">

            <span>
              Evidence
            </span>

            <strong>
              {evidence.length}
            </strong>

          </div>

          <div className="result-meta-row">

            <span>
              Claims
            </span>

            <strong>
              {claims.length}
            </strong>

          </div>

        </div>

      </div>

      {/* ==================================================
          SUMMARY
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              AGENT SUMMARY
            </span>

            <h2>
              What AURA found
            </h2>
          </div>

        </div>

        <div className="result-summary">
          {summary}
        </div>

      </section>

      {/* ==================================================
          ORIGINAL INPUT
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              INVESTIGATED INPUT
            </span>

            <h2>
              Submitted content
            </h2>
          </div>

        </div>

        <div className="investigated-input">
          {report.input ||
            report.originalInput ||
            "No input available."}
        </div>

      </section>

      {/* ==================================================
          FINDINGS
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              FINDINGS
            </span>

            <h2>
              Investigation signals
            </h2>
          </div>

          <span className="section-count">
            {findings.length}
          </span>

        </div>

        {findings.length === 0 ? (
          <div className="result-empty-inline">
            No specific findings were
            recorded.
          </div>
        ) : (
          <div className="findings-list">

            {findings.map(
              (finding, index) => (
                <div
                  className="finding-row"
                  key={index}
                >

                  <div className="finding-index">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div className="finding-text">
                    {typeof finding ===
                    "string"
                      ? finding
                      : finding?.message ||
                        finding?.detail ||
                        finding?.description ||
                        JSON.stringify(
                          finding
                        )}
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          CLAIMS
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              CLAIM ANALYSIS
            </span>

            <h2>
              What was checked
            </h2>
          </div>

          <span className="section-count">
            {claims.length}
          </span>

        </div>

        {claims.length === 0 ? (
          <div className="result-empty-inline">
            No structured claims were
            extracted.
          </div>
        ) : (
          <div className="claims-list">

            {claims.map(
              (claim, index) => {

                const status =
                  String(
                    claim.status ||
                    "UNABLE_TO_VERIFY"
                  ).toUpperCase();

                return (
                  <div
                    className="claim-row"
                    key={index}
                  >

                    <div
                      className={`claim-status ${getClaimClass(
                        status
                      )}`}
                    >
                      {getClaimIcon(
                        status
                      )}

                      <span>
                        {status.replace(
                          /_/g,
                          " "
                        )}
                      </span>
                    </div>

                    <div className="claim-content">

                      <strong>
                        {claim.claim ||
                          claim.statement ||
                          claim.text ||
                          "Unknown claim"}
                      </strong>

                      {claim.value && (
                        <span className="claim-value">
                          {claim.value}
                        </span>
                      )}

                      {claim.reason && (
                        <p>
                          {claim.reason}
                        </p>
                      )}

                    </div>

                    <div className="claim-type">
                      {claim.type ||
                        "UNKNOWN"}
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          EVIDENCE
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              EVIDENCE
            </span>

            <h2>
              Investigation evidence
            </h2>
          </div>

          <span className="section-count">
            {evidence.length}
          </span>

        </div>

        {evidence.length === 0 ? (
          <div className="result-empty-inline">
            No structured evidence was
            returned for this investigation.
          </div>
        ) : (
          <div className="evidence-list">

            {evidence.map(
              (item, index) => {

                const strength =
                  String(
                    item.strength ||
                    item.level ||
                    "LOW"
                  ).toUpperCase();

                return (
                  <div
                    className="evidence-row"
                    key={
                      item.id ||
                      item.evidenceId ||
                      index
                    }
                  >

                    <div className="evidence-number">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </div>

                    <div className="evidence-main">

                      <div className="evidence-title-row">

                        <strong>
                          {item.title ||
                            item.name ||
                            `Evidence ${index + 1}`}
                        </strong>

                        <span
                          className={`evidence-strength evidence-${strength.toLowerCase()}`}
                        >
                          {strength}
                        </span>

                      </div>

                      <p>
                        {item.detail ||
                          item.description ||
                          item.message ||
                          "No additional detail."}
                      </p>

                      {item.source && (
                        <span className="evidence-source">
                          Source:{" "}
                          {typeof item.source ===
                          "string"
                            ? item.source
                            : item.source.name ||
                              item.source.label ||
                              "Unknown"}
                        </span>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          RECOMMENDATION
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              AURA RECOMMENDATION
            </span>

            <h2>
              Recommended next action
            </h2>
          </div>

        </div>

        <div
          className={`recommendation-box ${getRiskClass()}`}
        >

          <div className="recommendation-icon">
            {getRiskIcon()}
          </div>

          <div>
            {recommendation}
          </div>

        </div>

      </section>

      {/* ==================================================
          AGENT ACTIVITY
          ================================================== */}

      <section className="result-section">

        <div className="result-section-heading">

          <div>
            <span className="result-section-label">
              AGENT ACTIVITY
            </span>

            <h2>
              Investigation process
            </h2>
          </div>

          <span className="section-count">
            {actions.length}
          </span>

        </div>

        {actions.length === 0 ? (
          <div className="result-empty-inline">
            No agent activity details
            were recorded.
          </div>
        ) : (
          <div className="agent-actions">

            {actions.map(
              (action, index) => {

                const actionText =
                  typeof action ===
                  "string"
                    ? action
                    : action?.action ||
                      action?.message ||
                      action?.description ||
                      JSON.stringify(
                        action
                      );

                return (
                  <div
                    className="agent-action"
                    key={index}
                  >

                    <span className="agent-action-dot" />

                    <span>
                      {actionText}
                    </span>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          TRUST GRAPH CTA
          ================================================== */}

      <section className="trust-graph-cta">

        <div>

          <span className="result-section-label">
            EVIDENCE RELATIONSHIP
          </span>

          <h2>
            Explore the Trust Graph
          </h2>

          <p>
            View how claims, evidence and
            sources are connected.
          </p>

        </div>

        <button
          className="graph-button"
          onClick={() =>
            setPage("trust")
          }
        >
          <Network size={16} />
          Open Trust Graph
          <ExternalLink size={14} />
        </button>

      </section>

    </div>
  );
}