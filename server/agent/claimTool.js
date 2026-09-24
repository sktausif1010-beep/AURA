function extractClaims(text) {

  const claims = [];

  const lowerText =
    text.toLowerCase();

  // -----------------------------
  // Organization detection
  // -----------------------------

  const organizationPatterns = [
    /\b(TCS)\b/gi,
    /\b(Infosys)\b/gi,
    /\b(Wipro)\b/gi,
    /\b(Accenture)\b/gi,
    /\b(Microsoft)\b/gi,
    /\b(Google)\b/gi,
    /\b(Amazon)\b/gi
  ];

  for (const pattern of organizationPatterns) {

    const matches =
      text.match(pattern);

    if (matches) {

      const organization =
        matches[0];

      claims.push({
        type: "ORGANIZATION",
        value: organization,
        status: "UNABLE_TO_VERIFY",
        reason:
          "Organization name detected in submitted content."
      });

      break;
    }
  }

  // -----------------------------
  // Internship / job claim
  // -----------------------------

  const opportunityWords = [
    "internship",
    "job offer",
    "employment",
    "selected",
    "selection",
    "offer letter",
    "joining"
  ];

  const opportunityDetected =
    opportunityWords.some(word =>
      lowerText.includes(word)
    );

  if (opportunityDetected) {

    claims.push({
      type: "OPPORTUNITY",
      value:
        "Employment or internship opportunity",
      status: "UNABLE_TO_VERIFY",
      reason:
        "The submitted content contains an employment or internship claim."
    });
  }

  // -----------------------------
  // Payment claim
  // -----------------------------

  const paymentPatterns = [
    /₹\s?[\d,]+/i,
    /rs\.?\s?[\d,]+/i,
    /registration fee/i,
    /processing fee/i,
    /application fee/i,
    /pay now/i,
    /payment/i,
    /upi/i
  ];

  const paymentDetected =
    paymentPatterns.some(pattern =>
      pattern.test(text)
    );

  if (paymentDetected) {

    claims.push({
      type: "PAYMENT",
      value:
        "Payment requested",
      status: "SUSPICIOUS",
      reason:
        "The submitted content contains payment-related information."
    });
  }

  // -----------------------------
  // Urgency claim
  // -----------------------------

  const urgencyWords = [
    "immediately",
    "urgent",
    "act now",
    "within 24 hours",
    "last chance",
    "hurry"
  ];

  const urgencyDetected =
    urgencyWords.some(word =>
      lowerText.includes(word)
    );

  if (urgencyDetected) {

    claims.push({
      type: "URGENCY",
      value:
        "Urgency or deadline pressure",
      status: "SUSPICIOUS",
      reason:
        "The content attempts to create time pressure."
    });
  }

  return claims;
}

module.exports = {
  extractClaims
};