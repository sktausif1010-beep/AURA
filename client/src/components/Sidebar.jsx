import {
  LayoutDashboard,
  Search,
  History,
  Network,
  FileText,
  Bell,
  Settings,
  ChevronRight
} from "lucide-react";

import auraLogo from "../assets/aura-logo.png";
import AgentStatus from "./AgentStatus";

export default function Sidebar({
  page,
  setPage,
  mobileOpen,
  setMobileOpen
}) {

  const navigation = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard
    },
    {
      id: "investigate",
      label: "New Investigation",
      icon: Search
    },
    {
      id: "history",
      label: "History",
      icon: History
    },
    {
      id: "trust",
      label: "Trust Graph",
      icon: Network
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText
    },
    {
      id: "alerts",
      label: "Alerts",
      icon: Bell
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings
    }
  ];


  /* =========================================
     NAVIGATION
  ========================================= */

  const navigate = (id) => {
    setPage(id);
    setMobileOpen(false);
  };


  return (
    <>

      {/* MOBILE OVERLAY */}

      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}


      {/* SIDEBAR */}

      <aside
        className={`aura-sidebar ${
          mobileOpen ? "open" : ""
        }`}
      >


        {/* =====================================
            BRAND
        ===================================== */}

        <div className="sidebar-brand">

          <img
            src={auraLogo}
            alt="AURA"
            className="sidebar-logo-image"
          />

        </div>


        {/* =====================================
            NAVIGATION
        ===================================== */}

        <div className="sidebar-navigation">

          <div className="sidebar-label">
            WORKSPACE
          </div>


          <nav>

            {navigation.map((item) => {

              const Icon = item.icon;

              const active =
                page === item.id;


              return (

                <button
                  key={item.id}
                  className={`sidebar-item ${
                    active ? "active" : ""
                  }`}
                  onClick={() =>
                    navigate(item.id)
                  }
                >

                  {/* ICON */}

                  <span className="sidebar-item-icon">

                    <Icon
                      size={18}
                      strokeWidth={1.8}
                    />

                  </span>


                  {/* TEXT */}

                  <span className="sidebar-item-text">

                    {item.label}

                  </span>


                  {/* ACTIVE ARROW */}

                  {active && (

                    <ChevronRight
                      size={15}
                      className="sidebar-item-arrow"
                    />

                  )}

                </button>

              );

            })}

          </nav>

        </div>


        {/* =====================================
            BOTTOM
        ===================================== */}

        <div className="sidebar-bottom">


          {/* AGENT STATUS */}

          <AgentStatus />


          {/* TAGLINE */}

          <div className="sidebar-tagline">

            <span>
              Before you trust it,
              <br />
              let AURA investigate it.
            </span>

          </div>


          {/* VERSION */}

          <div className="sidebar-version">

            <span>
              AURA
            </span>

            <span>
              v1.0.0
            </span>

          </div>

        </div>

      </aside>

    </>
  );
}