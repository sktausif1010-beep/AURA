import {
  ShieldCheck,
  Network,
  BrainCircuit,
  ArrowRight,
  Search,
  FileSearch,
  Globe2
} from "lucide-react";

import auraLogo from "../assets/aura-logo.png";
import "../styles/landing.css";

export default function Landing({
  setPage
}) {
  return (
    <div className="landing-page">

      {/* BACKGROUND */}

      <div className="landing-grid" />

      <div className="landing-glow landing-glow-one" />
      <div className="landing-glow landing-glow-two" />


      {/* NAVBAR */}

      <header className="landing-navbar">

        <div className="landing-brand">

          <img
            src={auraLogo}
            alt="AURA"
            className="landing-logo"
          />

        </div>


        <div className="landing-nav-actions">

          <button
            className="landing-login-link"
            onClick={() => setPage("login")}
          >
            Login
          </button>

          <button
            className="landing-register-button"
            onClick={() => setPage("register")}
          >
            Get Started
            <ArrowRight size={15} />
          </button>

        </div>

      </header>


      {/* HERO */}

      <main className="landing-main">

        <div className="landing-eyebrow">

          <span className="landing-status-dot" />

          AI-POWERED TRUST INVESTIGATION

        </div>


        <h1>

          Before you trust it,

          <span>
            let AURA investigate it.
          </span>

        </h1>


        <p className="landing-description">

          AURA investigates suspicious messages, websites
          and documents using evidence-driven AI reasoning
          to help you understand what deserves your trust.

        </p>


        <div className="landing-actions">

          <button
            className="landing-primary-button"
            onClick={() => setPage("register")}
          >
            Start Investigating

            <ArrowRight size={17} />

          </button>


          <button
            className="landing-secondary-button"
            onClick={() => setPage("login")}
          >
            Sign In
          </button>

        </div>


        {/* CAPABILITIES */}

        <div className="landing-capabilities">

          <div className="landing-capability">

            <ShieldCheck size={18} />

            <div>
              <strong>Evidence First</strong>
              <span>Investigate before trusting</span>
            </div>

          </div>


          <div className="landing-capability">

            <Network size={18} />

            <div>
              <strong>Trust Graph</strong>
              <span>Connect claims and evidence</span>
            </div>

          </div>


          <div className="landing-capability">

            <BrainCircuit size={18} />

            <div>
              <strong>Local AI</strong>
              <span>Private AI reasoning</span>
            </div>

          </div>

        </div>


        {/* INVESTIGATION FLOW */}

        <section className="landing-flow">

          <div className="landing-flow-header">

            <span>HOW AURA WORKS</span>

            <div>
              Investigation pipeline
            </div>

          </div>


          <div className="landing-flow-grid">

            <div className="landing-flow-card">

              <div className="landing-flow-icon">
                <Search size={18} />
              </div>

              <span>01</span>

              <h3>
                Submit
              </h3>

              <p>
                Give AURA a message, URL or document.
              </p>

            </div>


            <div className="landing-flow-card">

              <div className="landing-flow-icon">
                <Globe2 size={18} />
              </div>

              <span>02</span>

              <h3>
                Investigate
              </h3>

              <p>
                AURA analyzes claims, sources and signals.
              </p>

            </div>


            <div className="landing-flow-card">

              <div className="landing-flow-icon">
                <FileSearch size={18} />
              </div>

              <span>03</span>

              <h3>
                Understand
              </h3>

              <p>
                Review evidence, risk and recommended action.
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="landing-footer">

        <span>
          AURA v1.0.0
        </span>

        <span>
          AI Understanding · Risk · Assurance
        </span>

        <span>
          LOCAL INTELLIGENCE
        </span>

      </footer>

    </div>
  );
}