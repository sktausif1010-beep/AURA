import {
  Network,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileSearch
} from "lucide-react";

import TrustGraph from "../graph/TrustGraph";

export default function TrustGraphPage({
  report,
  setPage
}) {
  /*
   * AURA may return the investigation data directly
   * or inside a wrapper depending on the backend route.
   *
   * Normalize it here so the UI can handle both.
   */

  const investigation =
    report?.investigation ||
    report?.result ||
    report?.data ||
    report ||
    null;

  const graph =
    investigation?.trustGraph ||
    investigation?.trust_graph ||
    null;

  const nodes = Array.isArray(graph?.nodes)
    ? graph.nodes
    : [];

  const edges = Array.isArray(graph?.edges)
    ? graph.edges
    : [];

  const claims = nodes.filter(
    (node) => node.type === "claim"
  );

  const evidence = nodes.filter(
    (node) => node.type === "evidence"
  );

  const sources = nodes.filter(
    (node) => node.type === "source"
  );

  const suspiciousClaims = claims.filter(
    (node) =>
      String(node.status || "").toUpperCase() ===
      "SUSPICIOUS"
  );


  /*
   * DEBUG INFORMATION
   *
   * Open browser console with F12 if needed.
   */

  console.log(
    "AURA Trust Graph - report:",
    report
  );

  console.log(
    "AURA Trust Graph - investigation:",
    investigation
  );

  console.log(
    "AURA Trust Graph - graph:",
    graph
  );

  console.log(
    "AURA Trust Graph - nodes:",
    nodes
  );

  console.log(
    "AURA Trust Graph - edges:",
    edges
  );


  return (
    <div className="trust-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="trust-page-header">

        <div>

          <div className="page-eyebrow">
            <span />
            AURA EVIDENCE NETWORK
          </div>

          <h1>
            Trust Graph
          </h1>

          <p>
            Visualize how AURA connected claims,
            evidence and investigation sources.
          </p>

        </div>

        <button
          className="trust-back-button"
          onClick={() =>
            setPage(
              report
                ? "result"
                : "dashboard"
            )
          }
        >
          <ArrowLeft size={14} />
          Back
        </button>

      </div>


      {/* =====================================
          GRAPH OVERVIEW
      ===================================== */}

      <div className="trust-overview">

        <div className="trust-overview-card">

          <div className="trust-overview-icon">
            <FileSearch size={17} />
          </div>

          <div>
            <span>CLAIMS</span>
            <strong>
              {claims.length}
            </strong>
          </div>

        </div>


        <div className="trust-overview-card">

          <div className="trust-overview-icon">
            <Network size={17} />
          </div>

          <div>
            <span>EVIDENCE</span>
            <strong>
              {evidence.length}
            </strong>
          </div>

        </div>


        <div className="trust-overview-card">

          <div className="trust-overview-icon">
            <ShieldCheck size={17} />
          </div>

          <div>
            <span>SOURCES</span>
            <strong>
              {sources.length}
            </strong>
          </div>

        </div>


        <div className="trust-overview-card warning">

          <div className="trust-overview-icon">
            <AlertTriangle size={17} />
          </div>

          <div>
            <span>SUSPICIOUS CLAIMS</span>

            <strong>
              {suspiciousClaims.length}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================
          GRAPH
      ===================================== */}

      {nodes.length > 0 ? (

        <TrustGraph
          graph={{
            ...graph,
            nodes,
            edges
          }}
        />

      ) : (

        <div className="trust-page-empty">

          <div className="trust-page-empty-icon">
            <Network size={24} />
          </div>

          <span>
            NO INVESTIGATION GRAPH
          </span>

          <h2>
            Nothing to visualize yet
          </h2>

          <p>
            AURA has not received any trust graph
            nodes for the current investigation.
          </p>

          <button
            onClick={() =>
              setPage("investigate")
            }
          >
            Start Investigation
          </button>

        </div>

      )}


      {/* =====================================
          EXPLANATION
      ===================================== */}

      {nodes.length > 0 && (

        <div className="trust-explanation">

          <div className="trust-explanation-icon">
            <Network size={17} />
          </div>

          <div>

            <span>
              HOW TO READ THIS GRAPH
            </span>

            <p>
              Claims represent statements extracted
              from the submitted input. Evidence
              represents observations AURA used during
              investigation. Sources identify where
              those observations came from.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}