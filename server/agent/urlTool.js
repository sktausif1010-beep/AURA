const axios = require("axios");
const cheerio = require("cheerio");
const dns = require("dns").promises;
const net = require("net");

function isPrivateIP(ip) {
  if (!net.isIP(ip)) return false;

  // IPv4 private/local ranges
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;

  const parts = ip.split(".").map(Number);

  if (
    parts.length === 4 &&
    parts[0] === 172 &&
    parts[1] >= 16 &&
    parts[1] <= 31
  ) {
    return true;
  }

  // IPv6 local/private
  if (
    ip === "::1" ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    ip.startsWith("fe80")
  ) {
    return true;
  }

  return false;
}

async function resolveDomain(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);

    return {
      success: true,
      addresses,
      privateAddress: addresses.some(isPrivateIP)
    };
  } catch (error) {
    return {
      success: false,
      addresses: [],
      privateAddress: false,
      error: error.message
    };
  }
}

async function analyzeUrl(url) {
  const actions = [];
  const findings = [];

  actions.push("AURA received website investigation");

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      success: false,
      findings: [
        {
          type: "RISK",
          severity: "HIGH",
          message: "The submitted URL is not valid."
        }
      ],
      actions: ["URL validation failed"]
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      success: false,
      findings: [
        {
          type: "RISK",
          severity: "HIGH",
          message: "Only HTTP and HTTPS websites are supported."
        }
      ],
      actions: ["Blocked unsupported URL protocol"]
    };
  }

  const hostname = parsedUrl.hostname;

  actions.push(`Analyzing domain: ${hostname}`);

  // DNS investigation
  const dnsResult = await resolveDomain(hostname);

  if (!dnsResult.success) {
    findings.push({
      type: "WARNING",
      severity: "MEDIUM",
      message: "AURA could not resolve the website domain."
    });

    actions.push("DNS resolution failed");

    return {
      success: false,
      url,
      hostname,
      findings,
      actions
    };
  }

  actions.push("DNS resolution completed");

  if (dnsResult.privateAddress) {
    return {
      success: false,
      url,
      hostname,
      findings: [
        {
          type: "RISK",
          severity: "HIGH",
          message: "The domain resolves to a private or local IP address."
        }
      ],
      actions: [
        ...actions,
        "Blocked potentially unsafe private network destination"
      ]
    };
  }

  // Website request
  let response;

  try {
    response = await axios.get(url, {
      timeout: 10000,

      // We deliberately don't blindly follow redirects.
      maxRedirects: 0,

      headers: {
        "User-Agent": "Mozilla/5.0 AURA-Security-Agent"
      },

      validateStatus: () => true
    });

    actions.push(`Received HTTP status ${response.status}`);
  } catch (error) {
    findings.push({
      type: "WARNING",
      severity: "MEDIUM",
      message: "AURA could not connect to the submitted website."
    });

    actions.push("Website connection failed");

    return {
      success: false,
      url,
      hostname,
      findings,
      actions,
      error: error.message
    };
  }

  // Redirect detection
  const redirectLocation = response.headers.location;

  if (
    response.status >= 300 &&
    response.status < 400 &&
    redirectLocation
  ) {
    findings.push({
      type: "WARNING",
      severity: "MEDIUM",
      message: `Website redirects visitors to another location: ${redirectLocation}`
    });

    actions.push("Detected HTTP redirect");
  }

  const html =
    typeof response.data === "string"
      ? response.data
      : "";

  const $ = cheerio.load(html);

  const title = $("title").text().trim();

  const description =
    $('meta[name="description"]').attr("content") || "";

  const bodyText = $("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();

  actions.push("Extracted website content");

  // Forms
  const forms = $("form").length;

  const passwordFields = $('input[type="password"]').length;

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

  const lowerBody = bodyText.toLowerCase();

  const paymentDetected = paymentWords.some(word =>
    lowerBody.includes(word)
  );

  if (paymentDetected) {
    findings.push({
      type: "RISK",
      severity: "HIGH",
      message: "The website contains payment-related language."
    });

    actions.push("Detected payment-related language");
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

  const sensitiveDetected = sensitiveWords.some(word =>
    lowerBody.includes(word)
  );

  if (sensitiveDetected || passwordFields > 0) {
    findings.push({
      type: "WARNING",
      severity: "HIGH",
      message:
        "The website appears to request sensitive personal or authentication information."
    });

    actions.push("Detected sensitive-information signals");
  }

  if (forms > 0) {
    actions.push(`Detected ${forms} form(s) on website`);
  }

  if (passwordFields > 0) {
    actions.push(
      `Detected ${passwordFields} password field(s)`
    );
  }

  // Urgency
  const urgencyWords = [
    "immediately",
    "urgent",
    "act now",
    "limited time",
    "within 24 hours",
    "last chance",
    "hurry"
  ];

  const urgencyDetected = urgencyWords.some(word =>
    lowerBody.includes(word)
  );

  if (urgencyDetected) {
    findings.push({
      type: "WARNING",
      severity: "MEDIUM",
      message:
        "The website uses urgency or pressure-based language."
    });

    actions.push("Detected urgency language");
  }

  // External links
  const externalDomains = new Set();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) return;

    try {
      const link = new URL(href, url);

      if (
        link.hostname &&
        link.hostname !== hostname
      ) {
        externalDomains.add(link.hostname);
      }
    } catch {
      // Ignore malformed links
    }
  });

  if (externalDomains.size > 0) {
    actions.push(
      `Detected ${externalDomains.size} external domain(s)`
    );
  }

  actions.push("Website investigation completed");

  return {
    success: true,

    url,

    hostname,

    protocol: parsedUrl.protocol,

    statusCode: response.status,

    title,

    description,

    dns: {
      addresses: dnsResult.addresses
    },

    redirect: redirectLocation || null,

    forms,

    passwordFields,

    externalDomains: [...externalDomains].slice(0, 20),

    findings,

    actions
  };
}

module.exports = {
  analyzeUrl
};