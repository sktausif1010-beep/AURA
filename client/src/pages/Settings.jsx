import {
  User,
  SlidersHorizontal,
  Cpu,
  Database,
  Palette,
  Info,
  Check,
  RotateCcw,
  Shield,
  LogOut
} from "lucide-react";

import { useEffect, useState } from "react";


const tabs = [
  {
    id: "profile",
    label: "Profile",
    icon: User
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: SlidersHorizontal
  },
  {
    id: "model",
    label: "Model",
    icon: Cpu
  },
  {
    id: "database",
    label: "Database",
    icon: Database
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Palette
  },
  {
    id: "about",
    label: "About",
    icon: Info
  }
];


export default function Settings({ onLogout }) {

  const [activeTab, setActiveTab] =
    useState("profile");

  const [name, setName] =
    useState(
      localStorage.getItem(
        "aura_name"
      ) || "Tausif"
    );

  const [email, setEmail] =
    useState(
      localStorage.getItem(
        "aura_email"
      ) || ""
    );

  const [language, setLanguage] =
    useState(
      localStorage.getItem(
        "aura_language"
      ) || "English"
    );

  const [appearance, setAppearance] =
    useState(
      localStorage.getItem(
        "aura_appearance"
      ) || "dark"
    );

  const [saved, setSaved] =
    useState(false);


  /* =========================================
     LOAD APPEARANCE
  ========================================= */

  useEffect(() => {
    document.documentElement.dataset.theme =
      appearance;
  }, [appearance]);


  /* =========================================
     SAVE PROFILE
  ========================================= */

  function saveChanges() {

    localStorage.setItem(
      "aura_name",
      name
    );

    localStorage.setItem(
      "aura_email",
      email
    );

    localStorage.setItem(
      "aura_language",
      language
    );

    localStorage.setItem(
      "aura_appearance",
      appearance
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2200);
  }


  /* =========================================
     RESET
  ========================================= */

  function resetSettings() {

    setName("Tausif");
    setEmail("");
    setLanguage("English");
    setAppearance("dark");

    localStorage.removeItem(
      "aura_name"
    );

    localStorage.removeItem(
      "aura_email"
    );

    localStorage.removeItem(
      "aura_language"
    );

    localStorage.removeItem(
      "aura_appearance"
    );
  }


  return (
    <div className="settings-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="settings-header">

        <div>

          <div className="page-eyebrow">
            <span />
            AURA CONFIGURATION
          </div>

          <h1>
            Settings
          </h1>

          <p>
            Customize AURA for your workflow.
          </p>

        </div>

        <button
          className="settings-save-button"
          onClick={saveChanges}
        >
          {saved ? (
            <>
              <Check size={13} />
              Saved
            </>
          ) : (
            <>
              Save Changes
            </>
          )}
        </button>

      </div>


      {/* =====================================
          TABS
      ===================================== */}

      <div className="settings-tabs">

        {tabs.map((tab) => {

          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              className={
                activeTab === tab.id
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab(tab.id)
              }
            >
              <Icon size={12} />
              {tab.label}
            </button>
          );

        })}

      </div>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="settings-content">

        {/* PROFILE */}

        {activeTab === "profile" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    PROFILE INFORMATION
                  </span>

                  <h2>
                    Your Profile
                  </h2>

                </div>

                <User size={17} />

              </div>


              <div className="settings-form">

                <label>
                  <span>Name</span>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    placeholder="Your name"
                  />
                </label>


                <label>
                  <span>Email</span>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="your@email.com"
                  />
                </label>


                <label>
                  <span>Role</span>

                  <input
                    value="Student"
                    readOnly
                  />
                </label>

              </div>

            </section>


            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    APPLICATION
                  </span>

                  <h2>
                    AURA
                  </h2>

                </div>

                <Shield size={17} />

              </div>


              <div className="aura-application">

                <div className="aura-app-logo">
                  A
                </div>

                <div>

                  <strong>
                    AURA
                  </strong>

                  <span>
                    AI Understanding, Risk &
                    Assurance Agent
                  </span>

                </div>

              </div>


              <div className="settings-info-row">
                <span>Version</span>
                <strong>1.0.0</strong>
              </div>

              <div className="settings-info-row">
                <span>AI Engine</span>
                <strong>
                  Ollama · llama3.2:3b
                </strong>
              </div>

              <div className="settings-info-row">
                <span>Database</span>
                <strong>
                  MongoDB
                </strong>
              </div>

            </section>

          </div>

        )}


        {/* PREFERENCES */}

        {activeTab === "preferences" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    PREFERENCES
                  </span>

                  <h2>
                    Application Preferences
                  </h2>

                </div>

                <SlidersHorizontal size={17} />

              </div>


              <div className="settings-form">

                <label>

                  <span>
                    Language
                  </span>

                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(
                        event.target.value
                      )
                    }
                  >

                    <option>
                      English
                    </option>

                  </select>

                </label>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Investigation confirmation
                  </strong>

                  <span>
                    Show a confirmation before
                    starting an investigation.
                  </span>

                </div>

                <div className="settings-toggle active">
                  <span />
                </div>

              </div>


              <div className="settings-option">

                <div>

                  <strong>
                    Evidence-first analysis
                  </strong>

                  <span>
                    Keep evidence and reasoning
                    visible in investigation results.
                  </span>

                </div>

                <div className="settings-toggle active">
                  <span />
                </div>

              </div>

            </section>

          </div>

        )}


        {/* MODEL */}

        {activeTab === "model" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    AI MODEL
                  </span>

                  <h2>
                    Local Reasoning Engine
                  </h2>

                </div>

                <Cpu size={17} />

              </div>


              <div className="model-card">

                <div className="model-status">
                  <span />
                  LOCAL MODEL
                </div>

                <h3>
                  llama3.2:3b
                </h3>

                <p>
                  AURA currently uses Ollama to
                  perform local AI reasoning.
                  No paid AI API key is required.
                </p>

              </div>


              <div className="settings-info-row">
                <span>Provider</span>
                <strong>Ollama</strong>
              </div>

              <div className="settings-info-row">
                <span>Model</span>
                <strong>
                  llama3.2:3b
                </strong>
              </div>

              <div className="settings-info-row">
                <span>Endpoint</span>
                <strong>
                  localhost:11434
                </strong>
              </div>

              <div className="settings-info-row">
                <span>Mode</span>
                <strong>
                  Local inference
                </strong>
              </div>

            </section>

          </div>

        )}


        {/* DATABASE */}

        {activeTab === "database" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    DATA STORAGE
                  </span>

                  <h2>
                    Database
                  </h2>

                </div>

                <Database size={17} />

              </div>


              <div className="database-status">

                <div className="database-status-dot" />

                <div>

                  <strong>
                    MongoDB Connected
                  </strong>

                  <span>
                    Investigation records are
                    stored in the AURA database.
                  </span>

                </div>

              </div>


              <div className="settings-info-row">
                <span>Database</span>
                <strong>
                  MongoDB
                </strong>
              </div>

              <div className="settings-info-row">
                <span>Storage</span>
                <strong>
                  Investigation records
                </strong>
              </div>

              <div className="settings-info-row">
                <span>Connection</span>
                <strong>
                  Server managed
                </strong>
              </div>

            </section>

          </div>

        )}


        {/* APPEARANCE */}

        {activeTab === "appearance" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    APPEARANCE
                  </span>

                  <h2>
                    Interface Theme
                  </h2>

                </div>

                <Palette size={17} />

              </div>


              <div className="appearance-options">

                <button
                  className={
                    appearance === "light"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setAppearance(
                      "light"
                    )
                  }
                >

                  <div className="theme-preview light-preview">
                    <div />
                  </div>

                  <strong>
                    Light
                  </strong>

                  {appearance ===
                    "light" && (
                    <Check size={12} />
                  )}

                </button>


                <button
                  className={
                    appearance === "dark"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setAppearance(
                      "dark"
                    )
                  }
                >

                  <div className="theme-preview dark-preview">
                    <div />
                  </div>

                  <strong>
                    Dark
                  </strong>

                  {appearance ===
                    "dark" && (
                    <Check size={12} />
                  )}

                </button>


                <button
                  className={
                    appearance === "system"
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setAppearance(
                      "system"
                    )
                  }
                >

                  <div className="theme-preview system-preview">
                    <div />
                  </div>

                  <strong>
                    System
                  </strong>

                  {appearance ===
                    "system" && (
                    <Check size={12} />
                  )}

                </button>

              </div>

            </section>


            <section className="settings-card settings-appearance-message">

              <div className="appearance-mountain">
                ◇
              </div>

              <span>
                AURA
              </span>

              <h2>
                A safer digital world today,
                for a brighter tomorrow.
              </h2>

              <p>
                Before you trust it,
                let AURA investigate it.
              </p>

            </section>

          </div>

        )}


        {/* ABOUT */}

        {activeTab === "about" && (

          <div className="settings-grid">

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>
                    ABOUT AURA
                  </span>

                  <h2>
                    AI Understanding, Risk &
                    Assurance Agent
                  </h2>

                </div>

                <Info size={17} />

              </div>


              <div className="about-content">

                <div className="about-logo">
                  A
                </div>

                <h3>
                  AURA
                </h3>

                <p>
                  Before you trust it,
                  let AURA investigate it.
                </p>

                <span>
                  Version 1.0.0
                </span>

              </div>


              <div className="about-features">

                <div>
                  <Check size={12} />
                  Evidence-driven investigation
                </div>

                <div>
                  <Check size={12} />
                  Local AI reasoning
                </div>

                <div>
                  <Check size={12} />
                  Explainable risk assessment
                </div>

                <div>
                  <Check size={12} />
                  Trust graph visualization
                </div>

              </div>

            </section>

          </div>

        )}

      </div>


      {/* =====================================
          FOOTER ACTIONS
      ===================================== */}

      <div className="settings-footer">

        <div className="settings-footer-actions">

          <button
            className="settings-reset-button"
            onClick={resetSettings}
          >
            <RotateCcw size={12} />
            Reset to Default
          </button>

          <button
            className="settings-logout-button"
            onClick={onLogout}
          >
            <LogOut size={12} />
            Log Out
          </button>

        </div>

        <span>
          Before you trust it, let AURA investigate it.
        </span>

      </div>

    </div>
  );
}