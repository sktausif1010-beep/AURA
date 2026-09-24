function buildTrustGraph(evidenceEngine) {
  const nodes = [];
  const edges = [];

  if (!evidenceEngine) {
    return {
      nodes: [],
      edges: []
    };
  }

  const claims =
    evidenceEngine.claims || [];

  const evidence =
    evidenceEngine.evidence || [];

  // ------------------------------------------------
  // CLAIM NODES
  // ------------------------------------------------

  for (const claim of claims) {
    nodes.push({
      id: claim.id,
      type: "claim",
      label: claim.claim,
      status: claim.status,
      reason: claim.reason
    });
  }

  // ------------------------------------------------
  // EVIDENCE NODES
  // ------------------------------------------------

  for (const item of evidence) {
    nodes.push({
      id: item.id,
      type: "evidence",
      label: item.title,
      detail: item.detail,
      source: item.source,
      strength: item.strength
    });
  }

  // ------------------------------------------------
  // CLAIM → EVIDENCE RELATIONSHIPS
  // ------------------------------------------------

  for (const claim of claims) {

    for (const evidenceId of
      claim.supportingEvidence || []) {

      edges.push({
        id:
          `${claim.id}-${evidenceId}`,

        source:
          claim.id,

        target:
          evidenceId,

        relationship:
          "SUPPORTED_BY"
      });
    }
  }

  // ------------------------------------------------
  // GROUP NODES BY SOURCE
  // ------------------------------------------------

  const sources = [
    ...new Set(
      evidence.map(
        item => item.source
      )
    )
  ];

  for (const source of sources) {

    const sourceId =
      `SOURCE-${source}`;

    nodes.push({
      id: sourceId,
      type: "source",
      label: formatSourceName(source)
    });

    for (const item of evidence) {

      if (item.source === source) {

        edges.push({
          id:
            `${sourceId}-${item.id}`,

          source:
            item.id,

          target:
            sourceId,

          relationship:
            "FROM_SOURCE"
        });
      }
    }
  }

  return {
    nodes,
    edges
  };
}


// ------------------------------------------------
// Format source names for the UI
// ------------------------------------------------

function formatSourceName(source) {

  const names = {
    DOCUMENT:
      "Submitted Document",

    DOCUMENT_ANALYSIS:
      "Document Analysis",

    URL_ANALYSIS:
      "Website Investigation"
  };

  return (
    names[source] ||
    source
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, char =>
        char.toUpperCase()
      )
  );
}


module.exports = {
  buildTrustGraph
};