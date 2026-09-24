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

export default function Register({
  setPage,
  onRegister
}) {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  async function handleSubmit(e) {

    e.preventDefault();

    setError("");


    /* ================================
       PASSWORD CHECK
    ================================= */

    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              name,
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
          "Unable to create account."
        );

      }


      /*
        Registration is successful.

        The backend currently returns
        the created user but does not
        create a JWT during registration.

        So we send the user to Login.
      */

      setPage("login");

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
              CREATE ACCOUNT
            </div>

            <h1>
              Start with AURA
            </h1>

            <p>
              Create your account and start investigating.
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


            {/* NAME */}

            <div className="auth-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                autoComplete="name"
              />

            </div>


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

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
                autoComplete="new-password"
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="auth-field">

              <label>
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                required
                minLength={6}
                autoComplete="new-password"
              />

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >

              {loading
                ? "Creating account..."
                : "Create Account"
              }

              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          {/* LOGIN */}

          <div className="auth-register">

            <span>
              Already have an account?
            </span>

            <button
              onClick={() =>
                setPage("login")
              }
            >
              Sign in
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