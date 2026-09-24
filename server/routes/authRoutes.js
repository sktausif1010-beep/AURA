const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

/*
=====================================================
AURA AUTH ROUTES
=====================================================

Routes:

POST /api/auth/register
POST /api/auth/login

Authentication:
JWT

Password:
bcryptjs

Token lifetime:
7 days
=====================================================
*/


/*
=====================================================
REGISTER
POST /api/auth/register
=====================================================
*/

router.post(
  "/register",
  async (req, res) => {

    try {

      const {
        name,
        email,
        password
      } = req.body || {};

      /*
      ================================================
      VALIDATION
      ================================================
      */

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name, email and password are required."
        });
      }

      /*
      ================================================
      NORMALIZE INPUT
      ================================================
      */

      const cleanName =
        String(name).trim();

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const cleanPassword =
        String(password);

      /*
      ================================================
      BASIC VALIDATION
      ================================================
      */

      if (
        cleanName.length < 2
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain at least 2 characters."
        });
      }

      if (
        !normalizedEmail.includes("@")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a valid email address."
        });
      }

      if (
        cleanPassword.length < 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters."
        });
      }

      /*
      ================================================
      CHECK JWT SECRET
      ================================================
      */

      if (!process.env.JWT_SECRET) {
        console.error(
          "REGISTER ERROR: JWT_SECRET is not configured."
        );

        return res.status(500).json({
          success: false,
          message:
            "Authentication service is not configured."
        });
      }

      /*
      ================================================
      CHECK EXISTING USER
      ================================================
      */

      const existingUser =
        await User.findOne({
          email: normalizedEmail
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists."
        });
      }

      /*
      ================================================
      HASH PASSWORD
      ================================================
      */

      const salt =
        await bcrypt.genSalt(12);

      const hashedPassword =
        await bcrypt.hash(
          cleanPassword,
          salt
        );

      /*
      ================================================
      CREATE USER
      ================================================
      */

      const user =
        await User.create({

          name: cleanName,

          email:
            normalizedEmail,

          password:
            hashedPassword,

          role: "user"

        });

      /*
      ================================================
      RESPONSE
      ================================================
      */

      return res.status(201).json({

        success: true,

        message:
          "Account created successfully.",

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role

        }

      });

    } catch (error) {

      console.error(
        "REGISTER ERROR:",
        error
      );

      /*
      ================================================
      MONGOOSE DUPLICATE KEY
      ================================================
      */

      if (
        error.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "An account with this email already exists."
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Unable to create account."
      });
    }
  }
);


/*
=====================================================
LOGIN
POST /api/auth/login
=====================================================
*/

router.post(
  "/login",
  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body || {};

      /*
      ================================================
      VALIDATION
      ================================================
      */

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required."
        });
      }

      /*
      ================================================
      NORMALIZE EMAIL
      ================================================
      */

      const normalizedEmail =
        String(email)
          .trim()
          .toLowerCase();

      const cleanPassword =
        String(password);

      /*
      ================================================
      CHECK JWT SECRET
      ================================================
      */

      if (!process.env.JWT_SECRET) {

        console.error(
          "LOGIN ERROR: JWT_SECRET is not configured."
        );

        return res.status(500).json({
          success: false,
          message:
            "Authentication service is not configured."
        });
      }

      /*
      ================================================
      FIND USER
      ================================================
      */

      const user =
        await User.findOne({
          email:
            normalizedEmail
        });

      /*
      ================================================
      INVALID USER
      ================================================
      */

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password."
        });
      }

      /*
      ================================================
      VERIFY PASSWORD
      ================================================
      */

      const passwordValid =
        await bcrypt.compare(
          cleanPassword,
          user.password
        );

      if (!passwordValid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password."
        });
      }

      /*
      ================================================
      CREATE JWT
      ================================================
      */

      const token =
        jwt.sign(

          {
            userId:
              user._id.toString(),

            role:
              user.role || "user"
          },

          process.env.JWT_SECRET,

          {
            expiresIn:
              "7d"
          }

        );

      /*
      ================================================
      RESPONSE
      ================================================
      */

      return res.json({

        success: true,

        message:
          "Login successful.",

        token,

        user: {

          id:
            user._id,

          name:
            user.name,

          email:
            user.email,

          role:
            user.role

        }

      });

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to login."
      });
    }
  }
);


/*
=====================================================
EXPORT
=====================================================
*/

module.exports =
  router;