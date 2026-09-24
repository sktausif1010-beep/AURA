const { analyzeUrl } = require("./urlTool");
const { askAI } = require("./aiService");
const { extractClaims } = require("./claimTool");
const { buildEvidenceEngine } = require("./evidenceEngine");
const { buildTrustGraph } = require("./trustGraph");

// ==================================================
// URL EXTRACTION
// ==================================================

function extractUrls(text) {
  const matches =
    String(text || "").match(
      /https?:\/\/[^\s<>"]+/gi
    ) || [];

  const cleaned = matches
    .map((url) => {
      return url
        .trim()
        .replace(
          /[.,;:!?'"')\]}]+$/g,
          ""
        );
    })
    .filter((url) => {
      try {
        const parsed =
          new URL(url);

        return (
          parsed.protocol === "http:" ||
          parsed.protocol === "https:"
        );
      } catch {
        return false;
      }
    });

  return [
    ...new Set(cleaned)
  ];
}


// ==================================================
// NORMALIZE FINDING
// ==================================================

function normalizeFinding(finding) {

  if (
    typeof finding === "string"
  ) {
    return {
      severity: "MEDIUM",
      message: finding
    };
  }

  if (
    !finding ||
    typeof finding !== "object"
  ) {
    return {
      severity: "MEDIUM",
      message:
        "AURA detected an unspecified finding."
    };
  }

  const validSeverities = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];

  const severity =
    validSeverities.includes(
      String(
        finding.severity || ""
      ).toUpperCase()
    )
      ? String(
          finding.severity
        ).toUpperCase()
      : "MEDIUM";

  return {
    severity,

    message:
      finding.message ||
      finding.detail ||
      finding.description ||
      "AURA detected a potential investigation signal."
  };
}


// ==================================================
// NORMALIZE CLAIM
// ==================================================

function normalizeClaim(
  claim,
  fallbackClaim = null
) {

  const validStatuses = [
    "VERIFIED",
    "SUSPICIOUS",
    "UNABLE_TO_VERIFY",
    "NOT_CHECKED"
  ];

  let claimText = "";

  if (
    claim &&
    typeof claim === "object"
  ) {

    claimText =
      claim.claim ||
      claim.text ||
      claim.name ||
      claim.statement ||
      claim.value ||
      "";
  }

  if (
    !claimText &&
    fallbackClaim
  ) {

    if (
      typeof fallbackClaim ===
      "string"
    ) {

      claimText =
        fallbackClaim;

    } else {

      claimText =
        fallbackClaim.claim ||
        fallbackClaim.text ||
        fallbackClaim.name ||
        fallbackClaim.statement ||
        fallbackClaim.value ||
        "";
    }
  }

  if (!claimText) {
    return null;
  }

  let type =
    claim?.type ||
    fallbackClaim?.type ||
    "UNKNOWN";

  type =
    String(type)
      .toUpperCase();

  let status =
    claim?.status ||
    fallbackClaim?.status ||
    "UNABLE_TO_VERIFY";

  status =
    String(status)
      .toUpperCase();

  if (
    !validStatuses.includes(
      status
    )
  ) {
    status =
      "UNABLE_TO_VERIFY";
  }

  const reason =
    claim?.reason ||
    fallbackClaim?.reason ||
    "AURA could not establish sufficient evidence to verify this claim.";

  return {

    claim:
      String(claimText),

    type,

    value:
      claim?.value ??
      fallbackClaim?.value ??
      "",

    status,

    reason:
      String(reason)

  };
}


// ==================================================
// NORMALIZE CLAIM ARRAY
// ==================================================

function normalizeClaims(
  aiClaims,
  extractedClaims
) {

  const normalized = [];

  const sourceClaims =
    Array.isArray(aiClaims)
      ? aiClaims
      : [];

  const fallbackClaims =
    Array.isArray(extractedClaims)
      ? extractedClaims
      : [];

  /*
  --------------------------------------------------
  FIRST: AI CLAIMS
  --------------------------------------------------
  */

  sourceClaims.forEach(
    (aiClaim, index) => {

      const fallbackClaim =
        fallbackClaims[index] ||
        null;

      const normalizedClaim =
        normalizeClaim(
          aiClaim,
          fallbackClaim
        );

      if (normalizedClaim) {
        normalized.push(
          normalizedClaim
        );
      }
    }
  );

  /*
  --------------------------------------------------
  FALLBACK: EXTRACTED CLAIMS
  --------------------------------------------------
  */

  if (
    normalized.length === 0
  ) {

    fallbackClaims.forEach(
      (claim) => {

        const normalizedClaim =
          normalizeClaim(
            claim,
            claim
          );

        if (
          normalizedClaim
        ) {
          normalized.push(
            normalizedClaim
          );
        }
      }
    );
  }

  /*
  --------------------------------------------------
  ADD MISSED EXTRACTED CLAIMS
  --------------------------------------------------
  */

  fallbackClaims.forEach(
    (fallbackClaim) => {

      const normalizedFallback =
        normalizeClaim(
          fallbackClaim,
          fallbackClaim
        );

      if (
        !normalizedFallback
      ) {
        return;
      }

      const exists =
        normalized.some(
          (item) =>
            item.claim
              .toLowerCase() ===
            normalizedFallback.claim
              .toLowerCase()
        );

      if (!exists) {
        normalized.push(
          normalizedFallback
        );
      }
    }
  );

  return normalized;
}


// ==================================================
// AURA AGENT
// ==================================================

async function runAgent(
  input,
  extraEvidence = {},
  documentFindings = []
) {

  const actions = [];
  const findings = [];

  const submittedInput =
    String(input || "").trim();

  console.log(
    "AURA AGENT: investigation started"
  );

  /*
  ==================================================
  STEP 1 — RECEIVE INPUT
  ==================================================
  */

  actions.push(
    "AURA received investigation request"
  );

  console.log(
    `AURA AGENT: input length = ${submittedInput.length}`
  );


  /*
  ==================================================
  STEP 2 — EXTRACT CLAIMS
  ==================================================
  */

  let claims = [];

  console.log(
    "AURA AGENT: extracting claims..."
  );

  try {

    claims =
      extractClaims(
        submittedInput
      );

    if (
      !Array.isArray(claims)
    ) {
      claims = [];
    }

    actions.push(
      `Extracted ${claims.length} investigation claim(s)`
    );

    console.log(
      `AURA AGENT: claims extracted = ${claims.length}`
    );

  } catch (error) {

    console.error(
      "Claim extraction failed:",
      error.message
    );

    actions.push(
      "Claim extraction failed"
    );
  }


  /*
  ==================================================
  STEP 3 — EXTRACT URLS
  ==================================================
  */

  console.log(
    "AURA AGENT: extracting URLs..."
  );

  const uniqueUrls =
    extractUrls(
      submittedInput
    );

  let urlResults = [];

  console.log(
    `AURA AGENT: URLs detected = ${uniqueUrls.length}`
  );

  if (
    uniqueUrls.length > 0
  ) {

    actions.push(
      `Detected ${uniqueUrls.length} URL(s)`
    );


    /*
    ================================================
    STEP 4 — INVESTIGATE URLS
    ================================================
    */

    for (
      const url of uniqueUrls
    ) {

      actions.push(
        `Investigating URL: ${url}`
      );

      console.log(
        `AURA AGENT: investigating URL ${url}`
      );

      try {

        const result =
          await analyzeUrl(
            url
          );

        urlResults.push(
          result
        );

        if (
          Array.isArray(
            result?.findings
          )
        ) {

          findings.push(
            ...result.findings
          );
        }

        actions.push(
          `Completed URL investigation: ${url}`
        );

        console.log(
          `AURA AGENT: URL completed ${url}`
        );

      } catch (error) {

        console.error(
          `URL investigation failed for ${url}:`,
          error.message
        );

        actions.push(
          `URL investigation failed: ${url}`
        );

        urlResults.push({

          success: false,

          url,

          findings: [
            {
              type: "WARNING",
              severity: "MEDIUM",
              message:
                "AURA could not investigate this URL."
            }
          ],

          actions: [
            "URL investigation failed"
          ]

        });
      }
    }

  } else {

    actions.push(
      "No URL detected in submitted content"
    );
  }


  /*
  ==================================================
  STEP 5 — BUILD EVIDENCE
  ==================================================
  */

  console.log(
    "AURA AGENT: building evidence engine..."
  );

  const evidenceEngine =
    buildEvidenceEngine({

      claims,

      documentResult:
        extraEvidence.document ||
        null,

      urlResults,

      findings: [
        ...documentFindings,
        ...findings
      ]

    });

  console.log(
    `AURA AGENT: evidence items = ${evidenceEngine.evidence.length}`
  );


  /*
  ==================================================
  STEP 6 — BUILD TRUST GRAPH
  ==================================================
  */

  console.log(
    "AURA AGENT: building trust graph..."
  );

  const trustGraph =
    buildTrustGraph(
      evidenceEngine
    );

  console.log(
    `AURA AGENT: trust graph = ${trustGraph.nodes.length} nodes / ${trustGraph.edges.length} edges`
  );

  actions.push(
    `Trust graph created with ${trustGraph.nodes.length} node(s) and ${trustGraph.edges.length} relationship(s)`
  );

  actions.push(
    `Evidence engine collected ${evidenceEngine.statistics.totalEvidence} evidence item(s)`
  );

  actions.push(
    `Evidence strength: ${evidenceEngine.statistics.highStrength} high, ${evidenceEngine.statistics.mediumStrength} medium, ${evidenceEngine.statistics.lowStrength} low`
  );


  /*
  ==================================================
  STEP 7 — PREPARE EVIDENCE
  ==================================================
  */

  const evidence = {

    submittedContent:
      submittedInput,

    extractedClaims:
      claims,

    additionalEvidence:
      extraEvidence,

    urlInvestigations:
      urlResults,

    detectedFindings:
      findings,

    evidenceEngine:
      evidenceEngine

  };

  actions.push(
    "Prepared investigation evidence"
  );


  /*
  ==================================================
  STEP 8 — AI REASONING PROMPT
  ==================================================
  */

  const prompt = `
You are AURA, an AI Understanding, Risk & Assurance Agent.

Your job is to investigate potentially suspicious:

- online opportunities
- messages
- websites
- claims
- documents

You are an evidence-driven investigation agent.

IMPORTANT RULES:

1. Do NOT automatically call something a scam.

2. A suspicious signal is NOT proof of fraud.

3. Do NOT invent evidence.

4. Do NOT claim that AURA searched the internet unless
   actual search evidence is present in the supplied evidence.

5. Do NOT claim that an organization is verified simply
   because the organization name exists.

6. A website returning HTTP 200 only proves that the
   website responded. It does NOT prove that the website
   or opportunity is legitimate.

7. Separate:
   - evidence
   - suspicious signals
   - claims
   - unknown information
   - recommendations

8. If evidence is insufficient, use:
   UNABLE_TO_VERIFY

9. If evidence contradicts a claim, use:
   SUSPICIOUS

10. Only use VERIFIED when the supplied evidence actually
    supports the claim.

11. Every claim MUST contain:
    - claim
    - type
    - status
    - reason

12. Do not create empty claim objects.

13. Use only claims supported by the supplied submission
    and evidence.

RISK LEVELS:

LOW
MEDIUM
HIGH
UNKNOWN

RISK SCORE:

0-29   = LOW
30-59  = MEDIUM
60-79  = HIGH
80-100 = HIGH

Do not automatically give 100.

A high score requires strong evidence or multiple
independent risk signals.

Return ONLY valid JSON.

Use exactly this structure:

{
  "riskLevel": "LOW",
  "riskScore": 0,
  "summary": "short explanation",
  "findings": [
    {
      "severity": "LOW",
      "message": "finding"
    }
  ],
  "claims": [
    {
      "claim": "claim extracted from the submission",
      "type": "type of claim",
      "status": "VERIFIED",
      "reason": "short explanation"
    }
  ],
  "recommendation": "what the user should do",
  "confidence": "LOW"
}

EVIDENCE:

${JSON.stringify(
  evidence,
  null,
  2
)}
`;


  /*
  ==================================================
  STEP 9 — AI REASONING
  ==================================================
  */

  actions.push(
    "AI reasoning started"
  );

  console.log(
    "AURA AGENT: ABOUT TO CALL AI SERVICE"
  );

  let aiResponse;

  const aiStart =
    Date.now();

  try {

    aiResponse =
      await askAI(
        prompt
      );

    const aiElapsed =
      (
        (Date.now() - aiStart) /
        1000
      ).toFixed(2);

    console.log(
      `AURA AGENT: AI finished in ${aiElapsed}s`
    );

    actions.push(
      "AI reasoning completed"
    );

  } catch (error) {

    console.error(
      "AI reasoning failed:",
      error.message
    );

    actions.push(
      "AI reasoning failed"
    );

    return {

      riskLevel:
        "UNKNOWN",

      riskScore:
        0,

      summary:
        "AURA could not complete AI reasoning.",

      findings:
        findings.map(
          normalizeFinding
        ),

      claims:
        normalizeClaims(
          [],
          claims
        ),

      recommendation:
        "Try the investigation again and verify important information independently.",

      confidence:
        "LOW",

      actions,

      urlAnalysis:
        urlResults,

      evidence:
        evidenceEngine.evidence,

      evidenceClaims:
        evidenceEngine.claims,

      evidenceStatistics:
        evidenceEngine.statistics,

      trustGraph
    };
  }


  /*
  ==================================================
  STEP 10 — PARSE AI JSON
  ==================================================
  */

  console.log(
    "AURA AGENT: parsing AI response..."
  );

  let aiResult;

  try {

    let cleaned =
      String(
        aiResponse || ""
      )
        .replace(
          /```json/gi,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    const firstBrace =
      cleaned.indexOf(
        "{"
      );

    const lastBrace =
      cleaned.lastIndexOf(
        "}"
      );

    if (
      firstBrace !== -1 &&
      lastBrace !== -1 &&
      lastBrace > firstBrace
    ) {

      cleaned =
        cleaned.substring(
          firstBrace,
          lastBrace + 1
        );
    }

    aiResult =
      JSON.parse(
        cleaned
      );

    if (
      !aiResult ||
      typeof aiResult !==
        "object" ||
      Array.isArray(aiResult)
    ) {
      throw new Error(
        "AI response is not a JSON object."
      );
    }

    console.log(
      "AURA AGENT: AI JSON parsed successfully"
    );

  } catch (error) {

    console.error(
      "AI JSON parsing failed:",
      error.message
    );

    console.error(
      "AURA AGENT: using safe fallback result"
    );

    aiResult = {

      riskLevel:
        "UNKNOWN",

      riskScore:
        0,

      summary:
        "AURA could not confidently structure the AI assessment.",

      findings:
        [],

      claims:
        claims,

      recommendation:
        "Verify the information independently before taking action.",

      confidence:
        "LOW"

    };
  }


  /*
  ==================================================
  STEP 11 — VALIDATE RISK LEVEL
  ==================================================
  */

  const validRiskLevels = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "UNKNOWN"
  ];

  let riskLevel =
    String(
      aiResult?.riskLevel ||
      ""
    ).toUpperCase();

  if (
    !validRiskLevels.includes(
      riskLevel
    )
  ) {
    riskLevel =
      "UNKNOWN";
  }


  /*
  ==================================================
  STEP 12 — VALIDATE RISK SCORE
  ==================================================
  */

  let score =
    Number(
      aiResult?.riskScore
    );

  if (
    !Number.isFinite(score)
  ) {
    score = 0;
  }

  score =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score)
      )
    );


  /*
  ==================================================
  STEP 13 — NORMALIZE FINDINGS
  ==================================================
  */

  const aiFindings =
    Array.isArray(
      aiResult?.findings
    )
      ? aiResult.findings
      : [];

  const normalizedFindings =
    aiFindings.length > 0
      ? aiFindings.map(
          normalizeFinding
        )
      : findings.map(
          normalizeFinding
        );


  /*
  ==================================================
  STEP 14 — NORMALIZE CLAIMS
  ==================================================
  */

  const normalizedClaims =
    normalizeClaims(
      aiResult?.claims,
      claims
    );

  console.log(
    `AURA AGENT: normalized claims = ${normalizedClaims.length}`
  );


  /*
  ==================================================
  STEP 15 — NORMALIZE CONFIDENCE
  ==================================================
  */

  const validConfidence = [
    "LOW",
    "MEDIUM",
    "HIGH"
  ];

  let confidence =
    String(
      aiResult?.confidence ||
      "LOW"
    ).toUpperCase();

  if (
    !validConfidence.includes(
      confidence
    )
  ) {
    confidence =
      "LOW";
  }


  /*
  ==================================================
  STEP 16 — FINAL ACTION
  ==================================================
  */

  actions.push(
    "Investigation completed"
  );

  console.log(
    "AURA AGENT: investigation completed successfully"
  );


  /*
  ==================================================
  STEP 17 — RETURN RESULT
  ==================================================
  */

  return {

    riskLevel,

    riskScore:
      score,

    summary:
      typeof aiResult?.summary ===
        "string" &&
      aiResult.summary.trim()
        ? aiResult.summary.trim()
        : "AURA completed the investigation but could not generate a detailed summary.",

    findings:
      normalizedFindings,

    claims:
      normalizedClaims,

    recommendation:
      typeof aiResult?.recommendation ===
        "string" &&
      aiResult.recommendation.trim()
        ? aiResult.recommendation.trim()
        : "Verify important information independently before taking action.",

    confidence,

    actions,

    urlAnalysis:
      urlResults,

    evidence:
      evidenceEngine.evidence,

    evidenceClaims:
      evidenceEngine.claims,

    evidenceStatistics:
      evidenceEngine.statistics,

    trustGraph

  };
}


// ==================================================
// EXPORTS
// ==================================================

module.exports = {
  runAgent,
  extractUrls
};