import { useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import auraLogo from "../assets/aura-logo.png";

import "../styles/auth.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login({
  setPage,
  onLogin
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    setLoading(true);


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              email,
              password
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to login."
        );

      }


      /* ================================
         SAVE AUTH SESSION
      ================================= */

      localStorage.setItem(
        "aura_token",
        data.token
      );

      localStorage.setItem(
        "aura_user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "aura_session",
        "true"
      );


      /* ================================
         ENTER AURA
      ================================= */

      onLogin(data.user);

    } catch (error) {

      setError(
        error.message ||
        "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  }


  return (
    <div className="auth-page">

      <div className="auth-background" />


      <div className="auth-container">


        {/* BACK */}

        <button
          className="auth-back"
          onClick={() =>
            setPage("landing")
          }
        >
          <ArrowLeft size={16} />

          Back to AURA
        </button>


        {/* CARD */}

        <div className="auth-card">


          {/* LOGO */}

          <div className="auth-logo-wrapper">

            <img
              src={auraLogo}
              alt="AURA"
              className="auth-logo"
            />

          </div>


          {/* HEADING */}

          <div className="auth-heading">

            <div className="auth-eyebrow">
              SECURE ACCESS
            </div>

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to continue your investigations.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="auth-error">
              {error}
            </div>

          )}


          {/* FORM */}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >


            {/* EMAIL */}

            <div className="auth-field">

              <label>
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                autoComplete="email"
              />

            </div>


            {/* PASSWORD */}

            <div className="auth-field">

              <div className="auth-label-row">

                <label>
                  Password
                </label>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                autoComplete="current-password"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Signing in..."
                : "Sign In"
              }

              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          {/* REGISTER */}

          <div className="auth-register">

            <span>
              Don't have an account?
            </span>

            <button
              onClick={() =>
                setPage("register")
              }
            >
              Create account
            </button>

          </div>


          {/* SECURITY */}

          <div className="auth-security">

            <ShieldCheck size={15} />

            <span>
              Your account is protected by AURA.
            </span>

          </div>

        </div>


        {/* FOOTER */}

        <div className="auth-footer">
          AURA · AI Understanding · Risk · Assurance
        </div>

      </div>

    </div>
  );
}