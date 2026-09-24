const mongoose = require("mongoose");

// ==================================================
// CLAIM SCHEMA
// ==================================================

const claimSchema = new mongoose.Schema(
  {
    claim: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      default: "UNKNOWN",
      trim: true
    },

    value: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: [
        "VERIFIED",
        "SUSPICIOUS",
        "UNABLE_TO_VERIFY",
        "NOT_CHECKED"
      ],
      default: "UNABLE_TO_VERIFY"
    },

    reason: {
      type: String,
      default: ""
    }
  },
  {
    _id: false
  }
);

// ==================================================
// TRUST GRAPH NODE
// ==================================================

const trustGraphNodeSchema =
  new mongoose.Schema(
    {
      id: {
        type: String,
        required: true
      },

      type: {
        type: String,
        default: "UNKNOWN"
      },

      label: {
        type: String,
        default: ""
      },

      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    {
      _id: false
    }
  );

// ==================================================
// TRUST GRAPH EDGE
// ==================================================

const trustGraphEdgeSchema =
  new mongoose.Schema(
    {
      id: {
        type: String,
        required: true
      },

      source: {
        type: String,
        required: true
      },

      target: {
        type: String,
        required: true
      },

      type: {
        type: String,
        default: "RELATED_TO"
      },

      label: {
        type: String,
        default: ""
      },

      data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    {
      _id: false
    }
  );

// ==================================================
// TRUST GRAPH
// ==================================================

const trustGraphSchema =
  new mongoose.Schema(
    {
      nodes: {
        type: [trustGraphNodeSchema],
        default: []
      },

      edges: {
        type: [trustGraphEdgeSchema],
        default: []
      }
    },
    {
      _id: false
    }
  );

// ==================================================
// INVESTIGATION SCHEMA
// ==================================================

const investigationSchema =
  new mongoose.Schema(
    {
      // ------------------------------------------------
      // AUTHENTICATED USER
      // ------------------------------------------------

      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
      },

      // ------------------------------------------------
      // ORIGINAL INPUT
      // ------------------------------------------------

      input: {
        type: String,
        required: true,
        trim: true
      },

      inputType: {
        type: String,
        enum: [
          "text",
          "url",
          "document"
        ],
        default: "text"
      },

      // ------------------------------------------------
      // RISK
      // ------------------------------------------------

      riskLevel: {
        type: String,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "UNKNOWN"
        ],
        default: "UNKNOWN"
      },

      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },

      // ------------------------------------------------
      // AI SUMMARY
      // ------------------------------------------------

      summary: {
        type: String,
        default: ""
      },

      findings: {
        type: [String],
        default: []
      },

      // ------------------------------------------------
      // CLAIMS
      // ------------------------------------------------

      claims: {
        type: [claimSchema],
        default: []
      },

      // ------------------------------------------------
      // TRUST GRAPH
      // ------------------------------------------------

      trustGraph: {
        type: trustGraphSchema,
        default: () => ({
          nodes: [],
          edges: []
        })
      },

      // ------------------------------------------------
      // RECOMMENDATION
      // ------------------------------------------------

      recommendation: {
        type: String,
        default: ""
      },

      confidence: {
        type: String,
        enum: [
          "LOW",
          "MEDIUM",
          "HIGH"
        ],
        default: "LOW"
      },

      // ------------------------------------------------
      // AURA AGENT ACTIONS
      // ------------------------------------------------

      agentActions: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
      }
    },

    {
      timestamps: true
    }
  );

// ==================================================
// INDEXES
// ==================================================

// Quickly load a user's latest investigations
investigationSchema.index({
  userId: 1,
  createdAt: -1
});

// Quickly filter by risk
investigationSchema.index({
  userId: 1,
  riskLevel: 1
});

// Quickly filter by input type
investigationSchema.index({
  userId: 1,
  inputType: 1
});

// ==================================================
// MODEL
// ==================================================

module.exports =
  mongoose.model(
    "Investigation",
    investigationSchema
  );