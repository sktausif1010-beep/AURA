const jwt = require("jsonwebtoken");

/*
=====================================================
AURA AUTHENTICATION MIDDLEWARE
=====================================================

Purpose:
- Validate Bearer JWT
- Verify JWT_SECRET
- Extract authenticated user ID
- Attach user information to req.user
- Protect private API routes

Expected Authorization header:

Authorization: Bearer <token>
=====================================================
*/

function authMiddleware(req, res, next) {
  try {
    /*
    =================================================
    CHECK JWT SECRET
    =================================================
    */

    if (!process.env.JWT_SECRET) {
      console.error(
        "AUTH ERROR: JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication service is not configured."
      });
    }

    /*
    =================================================
    GET AUTHORIZATION HEADER
    =================================================
    */

    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required."
      });
    }

    /*
    =================================================
    VALIDATE BEARER FORMAT
    =================================================
    */

    if (
      typeof authHeader !== "string" ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format."
      });
    }

    /*
    =================================================
    EXTRACT TOKEN
    =================================================
    */

    const token =
      authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token missing."
      });
    }

    /*
    =================================================
    VERIFY JWT
    =================================================
    */

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    /*
    =================================================
    VALIDATE USER ID
    =================================================

    Your authRoutes.js creates JWTs using:

    {
      userId: user._id.toString(),
      role: user.role
    }
    */

    if (
      !decoded ||
      !decoded.userId
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }

    /*
    =================================================
    ATTACH AUTHENTICATED USER
    =================================================
    */

    req.user = {
      id: String(decoded.userId),
      role:
        decoded.role || "user"
    };

    /*
    =================================================
    CONTINUE REQUEST
    =================================================
    */

    next();

  } catch (error) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      error.message
    );

    /*
    =================================================
    JWT ERROR TYPES
    =================================================
    */

    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token has expired."
      });
    }

    if (
      error.name ===
      "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authentication token."
      });
    }

    /*
    =================================================
    GENERIC AUTH ERROR
    =================================================
    */

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired authentication token."
    });
  }
}

module.exports =
  authMiddleware;