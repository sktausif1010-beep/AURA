const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

async function analyzeDocument(file) {
  const actions = [];
  const findings = [];

  actions.push("AURA received document");

  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  actions.push(`Detected document type: ${extension}`);

  let extractedText = "";

  try {
    // TXT
    if (extension === ".txt") {
      extractedText = fs.readFileSync(
        file.path,
        "utf8"
      );

      actions.push("Extracted text from TXT document");
    }

    // DOCX
    else if (extension === ".docx") {
      const result = await mammoth.extractRawText({
        path: file.path
      });

      extractedText = result.value;

      actions.push("Extracted text from DOCX document");

      if (result.messages?.length) {
        actions.push(
          `DOCX parser returned ${result.messages.length} warning(s)`
        );
      }
    }

    // PDF
    else if (extension === ".pdf") {
      const buffer = fs.readFileSync(file.path);

      const result = await pdfParse(buffer);

      extractedText = result.text;

      actions.push("Extracted text from PDF document");
    }

    else {
      return {
        success: false,
        findings: [
          {
            type: "RISK",
            severity: "HIGH",
            message:
              "Unsupported document format."
          }
        ],
        actions
      };
    }

    // Clean text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .trim();

    if (!extractedText) {
      findings.push({
        type: "WARNING",
        severity: "MEDIUM",
        message:
          "AURA could not extract readable text from this document."
      });
    }

    // Payment detection
    const lowerText =
      extractedText.toLowerCase();

    const paymentWords = [
      "registration fee",
      "processing fee",
      "application fee",
      "pay now",
      "payment",
      "upi",
      "bank transfer",
      "registration charge",
      "pay ₹",
      "pay rs",
      "fee required"
    ];

    const paymentDetected =
      paymentWords.some(word =>
        lowerText.includes(word)
      );

    if (paymentDetected) {
      findings.push({
        type: "RISK",
        severity: "HIGH",
        message:
          "The document contains payment-related language."
      });

      actions.push(
        "Detected payment-related language"
      );
    }

    // Urgency detection
    const urgencyWords = [
      "immediately",
      "urgent",
      "act now",
      "limited time",
      "within 24 hours",
      "last chance",
      "hurry"
    ];

    const urgencyDetected =
      urgencyWords.some(word =>
        lowerText.includes(word)
      );

    if (urgencyDetected) {
      findings.push({
        type: "WARNING",
        severity: "MEDIUM",
        message:
          "The document contains urgency or pressure-based language."
      });

      actions.push(
        "Detected urgency language"
      );
    }

    // Sensitive information
    const sensitiveWords = [
      "otp",
      "password",
      "bank account",
      "credit card",
      "debit card",
      "aadhaar",
      "pan card",
      "cvv"
    ];

    const sensitiveDetected =
      sensitiveWords.some(word =>
        lowerText.includes(word)
      );

    if (sensitiveDetected) {
      findings.push({
        type: "WARNING",
        severity: "HIGH",
        message:
          "The document appears to request sensitive information."
      });

      actions.push(
        "Detected sensitive-information request"
      );
    }

    // URL extraction
    const rawUrls =
      extractedText.match(
        /https?:\/\/[^\s<>"]+/gi
      ) || [];
    
    const urls = [
      ...new Set(
        rawUrls
          .map(url =>
            url
              .trim()
              .replace(/[.,;:!?'"')\]}]+$/g, "")
          )
          .filter(url => {
            try {
              const parsed = new URL(url);
    
              return (
                parsed.protocol === "http:" ||
                parsed.protocol === "https:"
              );
            } catch {
              return false;
            }
          })
      )
    ];

    if (urls.length > 0) {
      actions.push(
        `Extracted ${urls.length} URL(s) from document`
      );
    }

    actions.push(
      "Document investigation completed"
    );

    return {
      success: true,

      fileName: file.originalname,

      fileType: extension,

      fileSize: file.size,

      extractedText,

      urls,

      findings,

      actions
    };

  } catch (error) {

    console.error(
      "Document analysis error:",
      error.message
    );

    return {
      success: false,

      findings: [
        {
          type: "WARNING",
          severity: "MEDIUM",
          message:
            "AURA failed to extract information from this document."
        }
      ],

      actions: [
        ...actions,
        "Document extraction failed"
      ],

      error: error.message
    };

  } finally {

    // Delete uploaded file after analysis
    try {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "Could not delete temporary file:",
        error.message
      );
    }
  }
}

module.exports = {
  analyzeDocument
};