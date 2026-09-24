function buildEvidenceEngine({
  claims = [],
  documentResult = null,
  urlResults = [],
  findings = []
}) {
  const evidence = [];

  // ------------------------------------------------
  // 1. Document evidence
  // ------------------------------------------------

  if (documentResult) {
    evidence.push({
      id: "DOC-001",
      source: "DOCUMENT",
      type: "OBSERVATION",
      title: "Document analyzed",
      detail: `AURA analyzed ${documentResult.fileName || "the submitted document"}.`,
      strength: "MEDIUM"
    });

    if (documentResult.fileType) {
      evidence.push({
        id: "DOC-002",
        source: "DOCUMENT",
        type: "OBSERVATION",
        title: "Document format",
        detail: `Document format detected as ${documentResult.fileType}.`,
        strength: "LOW"
      });
    }
  }

  // ------------------------------------------------
  // 2. Findings from document analysis
  // ------------------------------------------------

  for (const finding of findings) {
    if (!finding) continue;

    const severity =
      finding.severity || "MEDIUM";

    evidence.push({
      id: `SIGNAL-${evidence.length + 1}`,
      source: "DOCUMENT_ANALYSIS",
      type: "RISK_SIGNAL",
      title:
        finding.type === "RISK"
          ? "Risk signal detected"
          : "Warning signal detected",
      detail:
        finding.message || String(finding),
      strength:
        severity === "HIGH"
          ? "HIGH"
          : severity === "MEDIUM"
            ? "MEDIUM"
            : "LOW"
    });
  }

  // ------------------------------------------------
  // 3. URL evidence
  // ------------------------------------------------

  urlResults.forEach((urlResult, index) => {

    if (!urlResult) return;

    const prefix = `URL-${index + 1}`;

    evidence.push({
      id: `${prefix}-001`,
      source: "URL_ANALYSIS",
      type: "OBSERVATION",
      title: "Website investigated",
      detail:
        urlResult.url || "URL submitted for investigation",
      strength: "MEDIUM"
    });

    if (urlResult.hostname) {
      evidence.push({
        id: `${prefix}-002`,
        source: "URL_ANALYSIS",
        type: "DOMAIN",
        title: "Domain identified",
        detail:
          urlResult.hostname,
        strength: "LOW"
      });
    }

    if (urlResult.statusCode) {
      evidence.push({
        id: `${prefix}-003`,
        source: "URL_ANALYSIS",
        type: "HTTP",
        title: "HTTP response observed",
        detail:
          `Website returned HTTP ${urlResult.statusCode}.`,
        strength: "LOW"
      });
    }

    if (urlResult.title) {
      evidence.push({
        id: `${prefix}-004`,
        source: "URL_ANALYSIS",
        type: "PAGE_METADATA",
        title: "Page title observed",
        detail:
          urlResult.title,
        strength: "LOW"
      });
    }

    if (
      urlResult.passwordFields &&
      urlResult.passwordFields > 0
    ) {
      evidence.push({
        id: `${prefix}-005`,
        source: "URL_ANALYSIS",
        type: "RISK_SIGNAL",
        title: "Password field detected",
        detail:
          `${urlResult.passwordFields} password field(s) were found.`,
        strength: "HIGH"
      });
    }

    if (
      urlResult.forms &&
      urlResult.forms > 0
    ) {
      evidence.push({
        id: `${prefix}-006`,
        source: "URL_ANALYSIS",
        type: "OBSERVATION",
        title: "Website form detected",
        detail:
          `${urlResult.forms} form(s) were found on the page.`,
        strength: "MEDIUM"
      });
    }

    if (urlResult.redirect) {
      evidence.push({
        id: `${prefix}-007`,
        source: "URL_ANALYSIS",
        type: "REDIRECT",
        title: "Redirect detected",
        detail:
          `The website redirected to ${urlResult.redirect}.`,
        strength: "MEDIUM"
      });
    }

    if (
      urlResult.externalDomains &&
      urlResult.externalDomains.length > 0
    ) {
      evidence.push({
        id: `${prefix}-008`,
        source: "URL_ANALYSIS",
        type: "EXTERNAL_DOMAIN",
        title: "External domains observed",
        detail:
          urlResult.externalDomains.join(", "),
        strength: "LOW"
      });
    }

    // URL-specific findings
    if (
      Array.isArray(urlResult.findings)
    ) {
      urlResult.findings.forEach(
        finding => {

          evidence.push({
            id: `${prefix}-RISK-${evidence.length + 1}`,
            source: "URL_ANALYSIS",
            type: "RISK_SIGNAL",
            title:
              finding.type ||
              "Website finding",
            detail:
              finding.message ||
              String(finding),
            strength:
              finding.severity === "HIGH"
                ? "HIGH"
                : finding.severity === "MEDIUM"
                  ? "MEDIUM"
                  : "LOW"
          });

        }
      );
    }
  });

  // ------------------------------------------------
  // 4. Claims
  // ------------------------------------------------

  const claimEvidence = claims.map(
    (claim, index) => {

      const linkedEvidence =
        findEvidenceForClaim(
          claim,
          evidence
        );

      return {
        id: `CLAIM-${index + 1}`,

        claim:
          claim.value ||
          claim.claim ||
          "Unknown claim",

        type:
          claim.type ||
          "GENERAL",

        status:
          claim.status ||
          "NOT_CHECKED",

        reason:
          claim.reason ||
          "",

        supportingEvidence:
          linkedEvidence
      };
    }
  );

  // ------------------------------------------------
  // 5. Evidence summary
  // ------------------------------------------------

  const highEvidence =
    evidence.filter(
      item => item.strength === "HIGH"
    ).length;

  const mediumEvidence =
    evidence.filter(
      item => item.strength === "MEDIUM"
    ).length;

  const lowEvidence =
    evidence.filter(
      item => item.strength === "LOW"
    ).length;

  return {

    evidence,

    claims: claimEvidence,

    statistics: {
      totalEvidence:
        evidence.length,

      highStrength:
        highEvidence,

      mediumStrength:
        mediumEvidence,

      lowStrength:
        lowEvidence
    }
  };
}


// ------------------------------------------------
// Match claims to relevant evidence
// ------------------------------------------------

function findEvidenceForClaim(
  claim,
  evidence
) {
  const matches = [];

  const type =
    claim.type || "";

  // -----------------------------
  // PAYMENT
  // -----------------------------

  if (type === "PAYMENT") {

    matches.push(
      ...evidence.filter(item =>
        /payment|fee|money|registration|₹|upi/i.test(
          `${item.title} ${item.detail}`
        )
      )
    );
  }

  // -----------------------------
  // URGENCY
  // -----------------------------

  else if (type === "URGENCY") {

    matches.push(
      ...evidence.filter(item =>
        /urgency|pressure|deadline|immediately|urgent|24 hours/i.test(
          `${item.title} ${item.detail}`
        )
      )
    );
  }

  // -----------------------------
  // ORGANIZATION
  // -----------------------------

  else if (
    type === "ORGANIZATION"
  ) {

    const value =
      claim.value || "";

    matches.push(
      ...evidence.filter(item =>
        item.detail
          ?.toLowerCase()
          .includes(
            value.toLowerCase()
          )
      )
    );
  }

  // -----------------------------
  // OPPORTUNITY
  // -----------------------------

  else if (
    type === "OPPORTUNITY"
  ) {

    matches.push(
      ...evidence.filter(item =>
        /internship|employment|job|offer|selection/i.test(
          `${item.title} ${item.detail}`
        )
      )
    );
  }

  return [
    ...new Set(
      matches.map(
        item => item.id
      )
    )
  ];
}

module.exports = {
  buildEvidenceEngine
};