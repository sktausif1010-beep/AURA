// ==================================================
// AURA SERVER
// AI Understanding, Risk & Assurance Agent
// ==================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --------------------------------------------------
// MODELS
// --------------------------------------------------

const Investigation = require("./models/Investigation");

// --------------------------------------------------
// AUTH
// --------------------------------------------------

const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");

// --------------------------------------------------
// AURA AGENT MODULES
// --------------------------------------------------

const { runAgent } = require("./agent/auraAgent");
const { analyzeDocument } = require("./agent/documentTool");
const { analyzeUrl } = require("./agent/urlTool");

// ==================================================
// EXPRESS APP
// ==================================================

const app = express();

// ==================================================
// BASIC CONFIGURATION
// ==================================================

const PORT = Number(process.env.PORT) || 5000;

// ==================================================
// CORS
// ==================================================

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

console.log(
  "AURA SERVER: allowed origins:",
  allowedOrigins
);

app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests without Origin.
      // Useful for health checks and server-to-server calls.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(
        "AURA CORS: blocked origin:",
        origin
      );

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true
  })
);

// ==================================================
// BODY PARSING
// ==================================================

app.use(
  express.json({
    limit: "1mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb"
  })
);

// ==================================================
// AUTHENTICATION ROUTES
// ==================================================

app.use(
  "/api/auth",
  authRoutes
);

// ==================================================
// CURRENT USER
// ==================================================

app.get(
  "/api/auth/me",
  authMiddleware,
  async (req, res) => {

    try {

      return res.json({
        success: true,

        user: {
          id: req.user.id,
          role: req.user.role
        }
      });

    } catch (error) {

      console.error(
        "AUTH ME ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Could not retrieve user."
      });
    }
  }
);

// ==================================================
// UPLOAD DIRECTORY
// ==================================================

const uploadsDirectory =
  path.join(
    __dirname,
    "uploads"
  );

if (
  !fs.existsSync(
    uploadsDirectory
  )
) {

  fs.mkdirSync(
    uploadsDirectory,
    {
      recursive: true
    }
  );

}

console.log(
  "AURA SERVER: upload directory:",
  uploadsDirectory
);

// ==================================================
// MULTER CONFIGURATION
// ==================================================

const upload = multer({

  dest:
    uploadsDirectory,

  limits: {

    fileSize:
      10 * 1024 * 1024,

    files: 1

  },

  fileFilter:
    (req, file, cb) => {

      const allowedTypes = [

        "application/pdf",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "text/plain"

      ];

      if (
        allowedTypes.includes(
          file.mimetype
        )
      ) {

        cb(
          null,
          true
        );

      } else {

        cb(
          new Error(
            "Only PDF, DOCX and TXT files are allowed."
          )
        );

      }
    }

});

// ==================================================
// HELPER FUNCTIONS
// ==================================================

function normalizeFindings(
  findings
) {

  if (
    !Array.isArray(findings)
  ) {
    return [];
  }

  return findings
    .map((finding) => {

      if (
        typeof finding === "string"
      ) {
        return finding;
      }

      if (
        finding &&
        typeof finding === "object"
      ) {

        return (
          finding.message ||
          finding.detail ||
          finding.description ||
          ""
        );

      }

      return "";

    })
    .filter(Boolean);
}

// --------------------------------------------------

function normalizeClaims(
  claims
) {

  if (
    !Array.isArray(claims)
  ) {
    return [];
  }

  const validStatuses = [
    "VERIFIED",
    "SUSPICIOUS",
    "UNABLE_TO_VERIFY",
    "NOT_CHECKED"
  ];

  return claims
    .map((item) => {

      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const claimText =
        item.claim ||
        item.text ||
        item.statement ||
        item.name ||
        item.value;

      if (!claimText) {
        return null;
      }

      let status =
        String(
          item.status ||
          "UNABLE_TO_VERIFY"
        ).toUpperCase();

      if (
        !validStatuses.includes(
          status
        )
      ) {

        status =
          "UNABLE_TO_VERIFY";

      }

      return {

        claim:
          String(claimText),

        type:
          String(
            item.type ||
            "UNKNOWN"
          ).toUpperCase(),

        value:
          item.value ?? "",

        status,

        reason:
          item.reason ||
          "AURA could not establish sufficient evidence to verify this claim."

      };

    })
    .filter(Boolean);
}

// ==================================================
// BUILD INVESTIGATION DATA
// ==================================================

function buildInvestigationData({
  input,
  inputType,
  result,
  agentActions = [],
  userId
}) {

  return {

    // Every investigation belongs
    // to the authenticated user.

    userId,

    input:
      String(
        input || ""
      ).trim(),

    inputType,

    riskLevel:
      result?.riskLevel ||
      "UNKNOWN",

    riskScore:
      Number.isFinite(
        Number(
          result?.riskScore
        )
      )
        ? Number(
            result.riskScore
          )
        : 0,

    summary:
      result?.summary ||
      "",

    findings:
      normalizeFindings(
        result?.findings
      ),

    claims:
      normalizeClaims(
        result?.claims
      ),

    trustGraph:
      result?.trustGraph || {
        nodes: [],
        edges: []
      },

    recommendation:
      result?.recommendation ||
      "",

    confidence:
      result?.confidence ||
      "LOW",

    agentActions:
      Array.isArray(
        agentActions
      )
        ? agentActions
        : []

  };
}

// ==================================================
// SAVE INVESTIGATION
// ==================================================

async function saveInvestigation(
  data
) {

  console.log(
    "AURA SERVER: saving investigation..."
  );

  const start =
    Date.now();

  const investigation =
    await Investigation.create(
      data
    );

  const elapsed =
    (
      (Date.now() - start) /
      1000
    ).toFixed(2);

  console.log(
    `AURA SERVER: investigation saved in ${elapsed}s`
  );

  console.log(
    `AURA SERVER: investigation ID = ${investigation._id}`
  );

  return investigation;
}

// ==================================================
// STANDARD INVESTIGATION RESPONSE
// ==================================================

function investigationResponse(
  res,
  investigationId,
  result,
  extra = {}
) {

  return res.json({

    success: true,

    investigationId,

    result,

    investigation:
      result,

    ...extra

  });
}

// ==================================================
// ROOT ROUTE
// ==================================================

app.get(
  "/",
  (req, res) => {

    return res.json({

      message:
        "AURA Agent API is running 🚀",

      version:
        "1.0.0",

      status:
        "online"

    });

  }
);

// ==================================================
// MONGODB CONNECTION
// ==================================================

async function connectDatabase() {

  if (
    !process.env.MONGODB_URI
  ) {

    throw new Error(
      "MONGODB_URI is missing from environment variables."
    );

  }

  console.log(
    "AURA SERVER: connecting to MongoDB..."
  );

  try {

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        family: 4
      }
    );

    console.log(
      "MongoDB connected successfully ✅"
    );

  } catch (error) {

    console.error(
      "MongoDB connection failed ❌"
    );

    console.error(
      error.message
    );

    throw error;
  }
}

// ==================================================
// MESSAGE INVESTIGATION
// ==================================================

app.post(
  "/api/investigate",
  authMiddleware,

  async (req, res) => {

    console.log(
      "AURA SERVER: message investigation received"
    );

    try {

      const {
        input
      } = req.body;

      // ------------------------------------------
      // VALIDATION
      // ------------------------------------------

      if (
        !input ||
        typeof input !== "string" ||
        !input.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Investigation input is required."

        });

      }

      const cleanInput =
        input.trim();

      console.log(
        `AURA SERVER: input length = ${cleanInput.length}`
      );

      // ------------------------------------------
      // RUN AGENT
      // ------------------------------------------

      const startTime =
        Date.now();

      const result =
        await runAgent(
          cleanInput
        );

      const elapsed =
        (
          (Date.now() - startTime) /
          1000
        ).toFixed(2);

      console.log(
        `AURA SERVER: runAgent completed in ${elapsed}s`
      );

      console.log(
        `AURA SERVER: risk = ${result?.riskLevel}`
      );

      console.log(
        `AURA SERVER: score = ${result?.riskScore}`
      );

      // ------------------------------------------
      // BUILD DATABASE OBJECT
      // ------------------------------------------

      const investigationData =
        buildInvestigationData({

          input:
            cleanInput,

          inputType:
            "text",

          result,

          agentActions:
            result?.actions || [],

          userId:
            req.user.id

        });

      // ------------------------------------------
      // SAVE
      // ------------------------------------------

      const investigation =
        await saveInvestigation(
          investigationData
        );

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return investigationResponse(
        res,
        investigation._id,
        result
      );

    } catch (error) {

      console.error(
        "MESSAGE INVESTIGATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Message investigation failed.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// DIRECT URL INVESTIGATION
// ==================================================

app.post(
  "/api/investigate/url",
  authMiddleware,

  async (req, res) => {

    console.log(
      "AURA SERVER: URL investigation received"
    );

    try {

      const {
        url
      } = req.body;

      // ------------------------------------------
      // VALIDATE URL
      // ------------------------------------------

      if (
        !url ||
        typeof url !== "string" ||
        !url.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "URL is required."

        });

      }

      const cleanUrl =
        url.trim();

      // ------------------------------------------
      // ANALYZE WEBSITE
      // ------------------------------------------

      console.log(
        `AURA SERVER: analyzing URL ${cleanUrl}`
      );

      const urlResult =
        await analyzeUrl(
          cleanUrl
        );

      // ------------------------------------------
      // RUN AURA AGENT
      // ------------------------------------------

      const result =
        await runAgent(

          cleanUrl,

          {
            directUrlAnalysis:
              urlResult
          }

        );

      // ------------------------------------------
      // SAVE
      // ------------------------------------------

      const investigationData =
        buildInvestigationData({

          input:
            cleanUrl,

          inputType:
            "url",

          result,

          agentActions:
            result?.actions || [],

          userId:
            req.user.id

        });

      const investigation =
        await saveInvestigation(
          investigationData
        );

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return investigationResponse(

        res,

        investigation._id,

        result,

        {
          urlAnalysis:
            urlResult
        }

      );

    } catch (error) {

      console.error(
        "URL INVESTIGATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "URL investigation failed.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// DOCUMENT INVESTIGATION
// ==================================================

app.post(
  "/api/investigate/document",

  authMiddleware,

  upload.single("document"),

  async (req, res) => {

    console.log(
      "AURA SERVER: document investigation received"
    );

    try {

      // ------------------------------------------
      // VALIDATE UPLOAD
      // ------------------------------------------

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "No document uploaded."

        });

      }

      console.log(
        `AURA SERVER: document = ${req.file.originalname}`
      );

      console.log(
        `AURA SERVER: size = ${req.file.size} bytes`
      );

      // ------------------------------------------
      // ANALYZE DOCUMENT
      // ------------------------------------------

      const documentResult =
        await analyzeDocument(
          req.file
        );

      if (
        !documentResult?.success
      ) {

        return res.status(400).json(
          documentResult
        );

      }

      // ------------------------------------------
      // RUN AURA AGENT
      // ------------------------------------------

      const result =
        await runAgent(

          documentResult.extractedText,

          {
            document: {

              fileName:
                documentResult.fileName,

              fileType:
                documentResult.fileType,

              fileSize:
                documentResult.fileSize

            }
          },

          documentResult.findings

        );

      // ------------------------------------------
      // COMBINE ACTIONS
      // ------------------------------------------

      const combinedActions = [

        ...(documentResult.actions || []),

        ...(result?.actions || [])

      ];

      // ------------------------------------------
      // BUILD DATABASE OBJECT
      // ------------------------------------------

      const investigationData =
        buildInvestigationData({

          input:
            documentResult.extractedText,

          inputType:
            "document",

          result,

          agentActions:
            combinedActions,

          userId:
            req.user.id

        });

      // ------------------------------------------
      // SAVE
      // ------------------------------------------

      const investigation =
        await saveInvestigation(
          investigationData
        );

      // ------------------------------------------
      // DELETE TEMPORARY FILE
      // ------------------------------------------

      try {

        if (
          req.file.path &&
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

          console.log(
            "AURA SERVER: temporary upload removed."
          );

        }

      } catch (fileError) {

        console.warn(
          "AURA SERVER: could not remove temporary upload:",
          fileError.message
        );

      }

      // ------------------------------------------
      // RESPONSE
      // ------------------------------------------

      return investigationResponse(

        res,

        investigation._id,

        result,

        {

          document: {

            fileName:
              documentResult.fileName,

            fileType:
              documentResult.fileType,

            fileSize:
              documentResult.fileSize,

            urls:
              documentResult.urls,

            findings:
              documentResult.findings

          }

        }

      );

    } catch (error) {

      console.error(
        "DOCUMENT INVESTIGATION ERROR:",
        error
      );

      // Try to remove temporary file
      try {

        if (
          req.file?.path &&
          fs.existsSync(
            req.file.path
          )
        ) {

          fs.unlinkSync(
            req.file.path
          );

        }

      } catch (cleanupError) {

        console.warn(
          "AURA SERVER: upload cleanup failed:",
          cleanupError.message
        );

      }

      return res.status(500).json({

        success: false,

        message:
          "Document investigation failed.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// GET INVESTIGATION BY ID
// ==================================================

app.get(
  "/api/investigations/:id",

  authMiddleware,

  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      console.log(
        `AURA SERVER: loading investigation ${id}`
      );

      // User can ONLY access their own
      // investigation.

      const investigation =
        await Investigation.findOne({

          _id:
            id,

          userId:
            req.user.id

        });

      if (!investigation) {

        return res.status(404).json({

          success: false,

          message:
            "Investigation not found."

        });

      }

      return res.json({

        success: true,

        investigation

      });

    } catch (error) {

      console.error(
        "GET INVESTIGATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Could not load investigation.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// GET INVESTIGATION HISTORY
// ==================================================

app.get(
  "/api/investigations",

  authMiddleware,

  async (req, res) => {

    try {

      console.log(
        "AURA SERVER: loading investigation history..."
      );

      const investigations =
        await Investigation.find({

          userId:
            req.user.id

        })
          .sort({
            createdAt: -1
          })
          .limit(50)
          .lean();

      return res.json({

        success: true,

        investigations

      });

    } catch (error) {

      console.error(
        "GET HISTORY ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Could not load investigation history.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// DELETE INVESTIGATION
// ==================================================

app.delete(
  "/api/investigations/:id",

  authMiddleware,

  async (req, res) => {

    try {

      const {
        id
      } = req.params;

      const deleted =
        await Investigation.findOneAndDelete({

          _id:
            id,

          userId:
            req.user.id

        });

      if (!deleted) {

        return res.status(404).json({

          success: false,

          message:
            "Investigation not found."

        });

      }

      return res.json({

        success: true,

        message:
          "Investigation deleted successfully."

      });

    } catch (error) {

      console.error(
        "DELETE INVESTIGATION ERROR:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Could not delete investigation.",

        error:
          error.message

      });

    }

  }
);

// ==================================================
// HEALTH CHECK
// ==================================================

app.get(
  "/api/health",

  (req, res) => {

    const databaseConnected =
      mongoose.connection.readyState === 1;

    return res.status(
      databaseConnected ? 200 : 503
    ).json({

      success:
        databaseConnected,

      service:
        "AURA Agent API",

      status:
        databaseConnected
          ? "online"
          : "degraded",

      database:
        databaseConnected
          ? "connected"
          : "disconnected",

      authentication:
        process.env.JWT_SECRET
          ? "configured"
          : "missing",

      ai:
        process.env.OLLAMA_URL ||
        "http://localhost:11434",

      timestamp:
        new Date().toISOString()

    });

  }
);

// ==================================================
// 404 HANDLER
// ==================================================

app.use(
  (req, res) => {

    return res.status(404).json({

      success: false,

      message:
        "API route not found.",

      path:
        req.originalUrl

    });

  }
);

// ==================================================
// GLOBAL ERROR HANDLER
// ==================================================

app.use(
  (error, req, res, next) => {

    console.error(
      "AURA SERVER ERROR:",
      error
    );

    // ------------------------------------------
    // MULTER ERROR
    // ------------------------------------------

    if (
      error instanceof
      multer.MulterError
    ) {

      return res.status(400).json({

        success: false,

        message:
          `Upload error: ${error.message}`

      });

    }

    // ------------------------------------------
    // FILE TYPE ERROR
    // ------------------------------------------

    if (
      error.message ===
      "Only PDF, DOCX and TXT files are allowed."
    ) {

      return res.status(400).json({

        success: false,

        message:
          error.message

      });

    }

    // ------------------------------------------
    // CORS ERROR
    // ------------------------------------------

    if (
      error.message ===
      "Not allowed by CORS"
    ) {

      return res.status(403).json({

        success: false,

        message:
          "Request origin is not allowed."

      });

    }

    // ------------------------------------------
    // GENERIC ERROR
    // ------------------------------------------

    return res.status(500).json({

      success: false,

      message:
        "Internal server error.",

      error:
        error.message

    });

  }
);

// ==================================================
// START SERVER
// ==================================================

async function startServer() {

  try {

    // ------------------------------------------
    // ENV VALIDATION
    // ------------------------------------------

    if (
      !process.env.JWT_SECRET
    ) {

      throw new Error(
        "JWT_SECRET is missing from environment variables."
      );

    }

    if (
      !process.env.MONGODB_URI
    ) {

      throw new Error(
        "MONGODB_URI is missing from environment variables."
      );

    }

    // ------------------------------------------
    // DATABASE
    // ------------------------------------------

    await connectDatabase();

    // ------------------------------------------
    // START EXPRESS
    // ------------------------------------------

    app.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          "=========================================="
        );

        console.log(
          "        AURA AGENT API"
        );

        console.log(
          "=========================================="
        );

        console.log(
          `Server: http://localhost:${PORT}`
        );

        console.log(
          `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `AI: ${
            process.env.OLLAMA_URL ||
            "http://localhost:11434"
          }`
        );

        console.log(
          "Status: ONLINE"
        );

        console.log(
          "=========================================="
        );

      }
    );

  } catch (error) {

    console.error(
      "=========================================="
    );

    console.error(
      "AURA SERVER FAILED TO START"
    );

    console.error(
      error.message
    );

    console.error(
      "=========================================="
    );

    process.exit(1);

  }

}

// ==================================================
// START AURA
// ==================================================

startServer();