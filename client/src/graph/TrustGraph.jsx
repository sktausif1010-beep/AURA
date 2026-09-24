import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Position,
  Handle,
  MarkerType,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./TrustGraph.css";

/* =========================================================
   HELPERS
========================================================= */

function formatText(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(status) {
  if (!status) return "";

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getNodeStyle(node = {}) {
  const type = node.type;
  const status = node.status;
  const strength = node.strength;

  if (type === "claim") {
    switch (status) {
      case "SUSPICIOUS":
        return "trust-node claim suspicious";

      case "UNABLE_TO_VERIFY":
        return "trust-node claim unverified";

      case "VERIFIED":
        return "trust-node claim verified";

      default:
        return "trust-node claim";
    }
  }

  if (type === "source") {
    return "trust-node source";
  }

  if (type === "evidence") {
    switch (strength) {
      case "HIGH":
        return "trust-node evidence high";

      case "MEDIUM":
        return "trust-node evidence medium";

      default:
        return "trust-node evidence low";
    }
  }

  return "trust-node";
}

/* =========================================================
   CLAIM NODE
========================================================= */

function ClaimNode({ data }) {
  const node = data?.node || {};

  return (
    <div
      className={getNodeStyle(node)}
      title={node.label || "Claim"}
    >
      <Handle
        id="claim-source"
        type="source"
        position={Position.Right}
        className="trust-handle"
      />

      <div className="node-top-row">
        <div className="node-category">
          CLAIM
        </div>

        {node.status && (
          <span className="node-mini-status">
            {formatStatus(node.status)}
          </span>
        )}
      </div>

      <div className="node-label">
        {node.label || "Unnamed claim"}
      </div>

      {node.detail && (
        <div className="node-detail">
          {node.detail}
        </div>
      )}

      {node.status && (
        <div className="node-status">
          <span className="status-indicator" />
          <span>{formatStatus(node.status)}</span>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   EVIDENCE NODE
========================================================= */

function EvidenceNode({ data }) {
  const node = data?.node || {};

  return (
    <div
      className={getNodeStyle(node)}
      title={node.label || "Evidence"}
    >
      <Handle
        id="evidence-target"
        type="target"
        position={Position.Left}
        className="trust-handle"
      />

      <Handle
        id="evidence-source"
        type="source"
        position={Position.Right}
        className="trust-handle"
      />

      <div className="node-top-row">
        <div className="node-category">
          EVIDENCE
        </div>

        {node.strength && (
          <span className="node-mini-status">
            {node.strength}
          </span>
        )}
      </div>

      <div className="node-label">
        {node.label || "Unnamed evidence"}
      </div>

      {node.detail && (
        <div className="node-detail">
          {node.detail}
        </div>
      )}

      {node.strength && (
        <div className="node-strength">
          <span />
          {node.strength} STRENGTH
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SOURCE NODE
========================================================= */

function SourceNode({ data }) {
  const node = data?.node || {};

  return (
    <div
      className={getNodeStyle(node)}
      title={node.label || "Source"}
    >
      <Handle
        id="source-target"
        type="target"
        position={Position.Left}
        className="trust-handle"
      />

      <div className="node-top-row">
        <div className="node-category">
          SOURCE
        </div>

        <span className="node-source-icon">
          ↗
        </span>
      </div>

      <div className="node-label">
        {node.label || "Unnamed source"}
      </div>

      {node.detail && (
        <div className="node-detail">
          {node.detail}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   REACT FLOW NODE TYPES
========================================================= */

const nodeTypes = {
  claim: ClaimNode,
  evidence: EvidenceNode,
  source: SourceNode,
};

/* =========================================================
   NODE CREATION
========================================================= */

function createNodes(graph) {
  if (!graph?.nodes?.length) {
    return [];
  }

  const claims = graph.nodes.filter(
    (node) => node.type === "claim"
  );

  const evidence = graph.nodes.filter(
    (node) => node.type === "evidence"
  );

  const sources = graph.nodes.filter(
    (node) => node.type === "source"
  );

  const claimNodes = claims.map((node, index) => ({
    id: String(node.id),

    type: "claim",

    position: {
      x: 40,
      y: index * 165 + 55,
    },

    data: {
      node,
    },
  }));

  const evidenceNodes = evidence.map((node, index) => ({
    id: String(node.id),

    type: "evidence",

    position: {
      x: 400,
      y: index * 135 + 45,
    },

    data: {
      node,
    },
  }));

  const sourceNodes = sources.map((node, index) => ({
    id: String(node.id),

    type: "source",

    position: {
      x: 800,
      y: index * 175 + 70,
    },

    data: {
      node,
    },
  }));

  return [
    ...claimNodes,
    ...evidenceNodes,
    ...sourceNodes,
  ];
}

/* =========================================================
   EDGE CREATION
========================================================= */

function createEdges(graph) {
  if (!graph?.edges?.length) {
    return [];
  }

  return graph.edges
    .filter(
      (edge) =>
        edge?.source &&
        edge?.target
    )
    .map((edge) => {
      const relationship =
        edge.relationship || "RELATED_TO";

      const isSupportedBy =
        relationship === "SUPPORTED_BY";

      const isContradictedBy =
        relationship === "CONTRADICTED_BY";

      return {
        id: String(
          edge.id ||
            `${edge.source}-${edge.target}-${relationship}`
        ),

        source: String(edge.source),

        target: String(edge.target),

        type: "smoothstep",

        animated: isSupportedBy,

        label: formatText(relationship),

        markerEnd: {
          type: MarkerType.ArrowClosed,

          width: 16,

          height: 16,

          color: isContradictedBy
            ? "#FB7185"
            : "#22D3EE",
        },

        style: {
          stroke: isContradictedBy
            ? "#FB7185"
            : isSupportedBy
              ? "#22D3EE"
              : "#475569",

          strokeWidth: isSupportedBy
            ? 2
            : 1.5,

          opacity: isContradictedBy
            ? 0.9
            : 0.75,
        },

        labelStyle: {
          fill: "#CBD5E1",
          fontSize: 10,
          fontWeight: 600,
        },

        labelBgStyle: {
          fill: "#0D141E",
          fillOpacity: 0.96,
        },

        labelBgPadding: [
          6,
          4,
        ],

        labelBgBorderRadius: 5,
      };
    });
}

/* =========================================================
   MINIMAP NODE COLORS
========================================================= */

function getMiniMapColor(node) {
  const graphNode = node?.data?.node;

  if (!graphNode) {
    return "#475569";
  }

  if (
    graphNode.type === "claim"
  ) {
    if (
      graphNode.status ===
      "SUSPICIOUS"
    ) {
      return "#FB7185";
    }

    if (
      graphNode.status ===
      "UNABLE_TO_VERIFY"
    ) {
      return "#FBBF24";
    }

    if (
      graphNode.status ===
      "VERIFIED"
    ) {
      return "#34D399";
    }

    return "#60A5FA";
  }

  if (
    graphNode.type === "source"
  ) {
    return "#22D3EE";
  }

  if (
    graphNode.strength === "HIGH"
  ) {
    return "#22D3EE";
  }

  if (
    graphNode.strength === "MEDIUM"
  ) {
    return "#818CF8";
  }

  return "#64748B";
}

/* =========================================================
   STAT ITEM
========================================================= */

function TrustStat({
  value,
  label,
  type,
}) {
  return (
    <div
      className={`trust-stat trust-stat-${type}`}
    >
      <strong>{value}</strong>

      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   INSPECTOR
========================================================= */

function NodeInspector({
  node,
  onClose,
}) {
  if (!node) {
    return null;
  }

  return (
    <aside
      className="node-inspector"
      aria-label="Node details"
    >
      <div className="inspector-header">
        <div>
          <span className="inspector-kicker">
            SELECTED NODE
          </span>

          <h3>
            {node.label ||
              "Unnamed node"}
          </h3>
        </div>

        <button
          type="button"
          className="inspector-close"
          onClick={onClose}
          aria-label="Close node inspector"
        >
          ×
        </button>
      </div>

      <div className="inspector-type">
        {formatText(node.type)}
      </div>

      <div className="inspector-content">
        <div className="inspector-row">
          <span>Node type</span>

          <strong>
            {formatText(node.type)}
          </strong>
        </div>

        {node.status && (
          <div className="inspector-row">
            <span>Status</span>

            <strong>
              {formatStatus(
                node.status
              )}
            </strong>
          </div>
        )}

        {node.strength && (
          <div className="inspector-row">
            <span>Evidence strength</span>

            <strong>
              {node.strength}
            </strong>
          </div>
        )}

        {node.id && (
          <div className="inspector-row">
            <span>Node ID</span>

            <strong className="inspector-id">
              {node.id}
            </strong>
          </div>
        )}
      </div>

      {node.detail && (
        <div className="inspector-detail">
          <span>DETAILS</span>

          <p>
            {node.detail}
          </p>
        </div>
      )}

      {node.type === "source" && (
        <div className="inspector-source-note">
          <span className="inspector-source-dot" />

          External investigation source
        </div>
      )}
    </aside>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyTrustGraph() {
  return (
    <section className="trust-empty">
      <div className="trust-empty-orbit">
        <div className="trust-empty-symbol">
          ◇
        </div>
      </div>

      <div className="trust-empty-content">
        <span>
          TRUST INTELLIGENCE
        </span>

        <h3>
          No investigation graph yet
        </h3>

        <p>
          Run an investigation to generate
          relationships between claims,
          evidence, and sources.
        </p>
      </div>
    </section>
  );
}

/* =========================================================
   TRUST GRAPH
========================================================= */

export default function TrustGraph({
  graph,
}) {
  const [
    selectedNode,
    setSelectedNode,
  ] = useState(null);

  const nodes = useMemo(
    () => createNodes(graph),
    [graph]
  );

  const edges = useMemo(
    () => createEdges(graph),
    [graph]
  );

  const claimCount =
    graph?.nodes?.filter(
      (node) =>
        node.type === "claim"
    ).length || 0;

  const evidenceCount =
    graph?.nodes?.filter(
      (node) =>
        node.type === "evidence"
    ).length || 0;

  const sourceCount =
    graph?.nodes?.filter(
      (node) =>
        node.type === "source"
    ).length || 0;

  const suspiciousCount =
    graph?.nodes?.filter(
      (node) =>
        node.type === "claim" &&
        node.status ===
          "SUSPICIOUS"
    ).length || 0;

  if (!nodes.length) {
    return (
      <EmptyTrustGraph />
    );
  }

  return (
    <section
      className="trust-graph-section"
      aria-label="AURA Trust Graph"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="trust-header">
        <div className="trust-title">
          <div className="trust-eyebrow">
            <span className="pulse-dot" />

            AURA EVIDENCE NETWORK
          </div>

          <h2>
            Trust Graph
          </h2>

          <p>
            Trace how AURA connects claims,
            evidence, and investigation sources.
          </p>
        </div>

        <div className="trust-stats">
          <TrustStat
            value={claimCount}
            label="Claims"
            type="claims"
          />

          <TrustStat
            value={evidenceCount}
            label="Evidence"
            type="evidence"
          />

          <TrustStat
            value={sourceCount}
            label="Sources"
            type="sources"
          />

          {suspiciousCount > 0 && (
            <TrustStat
              value={suspiciousCount}
              label="Flagged"
              type="flagged"
            />
          )}
        </div>
      </header>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <div className="trust-toolbar">
        <div className="trust-legend">
          <span>
            <i className="legend-dot suspicious" />
            Suspicious
          </span>

          <span>
            <i className="legend-dot unverified" />
            Unverified
          </span>

          <span>
            <i className="legend-dot verified" />
            Verified
          </span>

          <span>
            <i className="legend-dot source" />
            Source
          </span>

          <span>
            <i className="legend-line" />
            Relationship
          </span>
        </div>

        <div className="graph-hint">
          <span className="graph-hint-icon">
            ⌖
          </span>

          Click a node to inspect
        </div>
      </div>

      {/* =================================================
          GRAPH CANVAS
      ================================================= */}

      <div className="trust-canvas">
        <div
          className="graph-columns"
          aria-hidden="true"
        >
          <span>CLAIMS</span>
          <span>EVIDENCE</span>
          <span>SOURCES</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            maxZoom: 1.1,
          }}
          minZoom={0.3}
          maxZoom={1.8}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          zoomOnScroll
          panOnScroll
          selectionOnDrag={false}
          onNodeClick={(_, node) => {
            setSelectedNode(
              node?.data?.node || null
            );
          }}
          onPaneClick={() => {
            setSelectedNode(null);
          }}
        >
          <Background
            gap={28}
            size={1}
            color="#1B2735"
          />

          <Controls
            showInteractive={false}
            position="bottom-left"
          />

          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor={getMiniMapColor}
            nodeStrokeColor="#334155"
            maskColor="rgba(6, 9, 15, 0.84)"
          />
        </ReactFlow>

        {/* =================================================
            INSPECTOR
        ================================================= */}

        <NodeInspector
          node={selectedNode}
          onClose={() =>
            setSelectedNode(null)
          }
        />
      </div>

      {/* =================================================
          GRAPH FOOTER
      ================================================= */}

      <footer className="trust-footer">
        <div>
          <span className="trust-footer-indicator" />

          Investigation graph active
        </div>

        <span>
          {nodes.length} nodes
          {" · "}
          {edges.length} relationships
        </span>
      </footer>
    </section>
  );
}