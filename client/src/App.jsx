import { useState } from "react";

/* =========================================
   PUBLIC PAGES
========================================= */

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

/* =========================================
   LAYOUT
========================================= */

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

/* =========================================
   APP PAGES
========================================= */

import Dashboard from "./pages/Dashboard";
import NewInvestigation from "./pages/NewInvestigation";
import InvestigationResult from "./pages/InvestigationResult";
import TrustGraphPage from "./pages/TrustGraphPage";
import InvestigationHistory from "./pages/InvestigationHistory";
import Documents from "./pages/Documents";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";


export default function App() {

  /* =========================================
     AUTH / PAGE STATE
  ========================================= */

  const [isAuthenticated, setIsAuthenticated] =
    useState(
      localStorage.getItem("aura_session") === "true" &&
      Boolean(localStorage.getItem("aura_token"))
    );

  const [page, setPage] = useState(
    localStorage.getItem("aura_session") === "true" &&
    localStorage.getItem("aura_token")
      ? "dashboard"
      : "landing"
  );


  /* =========================================
     MOBILE SIDEBAR
  ========================================= */

  const [mobileOpen, setMobileOpen] =
    useState(false);


  /* =========================================
     INVESTIGATION STATE
  ========================================= */

  const [report, setReport] =
    useState(null);

  const [history, setHistory] =
    useState([]);


  /* =========================================
     NAVIGATION
  ========================================= */

  function navigateTo(targetPage) {

    setPage(targetPage);

    setMobileOpen(false);
  }


  /* =========================================
     LOGIN
  ========================================= */

  function handleLogin(user) {

    setIsAuthenticated(true);

    setReport(null);

    setPage("dashboard");

    console.log(
      "AURA user logged in:",
      user
    );
  }


  /* =========================================
     REGISTER
  ========================================= */

  function handleRegister(user) {

    /*
      Register currently redirects the user
      to Login, so this function is kept for
      compatibility with Register.jsx.
    */

    console.log(
      "AURA user registered:",
      user
    );

    setPage("login");
  }


  /* =========================================
     LOGOUT
  ========================================= */

  function handleLogout() {

    localStorage.removeItem(
      "aura_token"
    );

    localStorage.removeItem(
      "aura_user"
    );

    localStorage.removeItem(
      "aura_session"
    );

    setIsAuthenticated(false);

    setReport(null);

    setHistory([]);

    setMobileOpen(false);

    setPage("landing");
  }


  /* =========================================
     SET INVESTIGATION REPORT
  ========================================= */

  function openReport(investigation) {

    if (!investigation) {
      return;
    }

    setReport(
      investigation
    );

    setPage("result");
  }


  /* =========================================
     PUBLIC PAGES
  ========================================= */

  if (!isAuthenticated) {

    switch (page) {

      /* ================================
         LOGIN
      ================================= */

      case "login":

        return (
          <Login
            setPage={navigateTo}
            onLogin={handleLogin}
          />
        );


      /* ================================
         REGISTER
      ================================= */

      case "register":

        return (
          <Register
            setPage={navigateTo}
            onRegister={handleRegister}
          />
        );


      /* ================================
         LANDING
      ================================= */

      case "landing":

      default:

        return (
          <Landing
            setPage={navigateTo}
          />
        );
    }
  }


  /* =========================================
     APP PAGE RENDERER
  ========================================= */

  function renderPage() {

    switch (page) {

      /* ================================
         DASHBOARD
      ================================= */

      case "dashboard":

        return (
          <Dashboard
            setPage={navigateTo}
            setReport={openReport}
          />
        );


      /* ================================
         NEW INVESTIGATION
      ================================= */

      case "investigate":

        return (
          <NewInvestigation
            setPage={navigateTo}
            setReport={setReport}
            setHistory={setHistory}
          />
        );


      /* ================================
         RESULT
      ================================= */

      case "result":

        return (
          <InvestigationResult
            report={report}
            setPage={navigateTo}
          />
        );


      /* ================================
         HISTORY
      ================================= */

      case "history":

        return (
          <InvestigationHistory
            setPage={navigateTo}
            setReport={setReport}
          />
        );


      /* ================================
         TRUST GRAPH
      ================================= */

      case "trust":

        return (
          <TrustGraphPage
            report={report}
            setPage={navigateTo}
          />
        );


      /* ================================
         DOCUMENTS
      ================================= */

      case "documents":

        return (
          <Documents
            setPage={navigateTo}
            setReport={setReport}
          />
        );


      /* ================================
         ALERTS
      ================================= */

      case "alerts":

        return (
          <Alerts
            setPage={navigateTo}
            setReport={setReport}
          />
        );


      /* ================================
         SETTINGS
      ================================= */

      case "settings":

        return (
          <Settings
            onLogout={handleLogout}
          />
        );


      /* ================================
         DEFAULT
      ================================= */

      default:

        return (
          <Dashboard
            setPage={navigateTo}
            setReport={openReport}
          />
        );
    }
  }


  /* =========================================
     AUTHENTICATED AURA APPLICATION
  ========================================= */

  return (

    <div className="aura-app">

      <Sidebar
        page={page}
        setPage={navigateTo}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />


      <main className="aura-main">

        <Topbar
          page={page}
          setMobileOpen={setMobileOpen}
        />


        <div className="aura-page">

          {renderPage()}

        </div>

      </main>

    </div>
  );
}