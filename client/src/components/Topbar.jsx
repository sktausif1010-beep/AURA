import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Command
} from "lucide-react";

export default function Topbar({
  page,
  setMobileOpen
}) {
  const titles = {
    dashboard: "Dashboard",
    investigate: "New Investigation",
    history: "Investigation History",
    trust: "Trust Graph",
    documents: "Documents",
    alerts: "Alerts",
    settings: "Settings"
  };

  return (
    <header className="aura-topbar">

      {/* MOBILE MENU */}

      <button
        className="mobile-menu"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={19} />
      </button>

      {/* SEARCH */}

      <div className="topbar-search">

        <Search size={16} />

        <input
          type="text"
          placeholder="Search investigations..."
        />

        <div className="search-key">
          <Command size={10} />
          <span>K</span>
        </div>

      </div>

      {/* CURRENT PAGE */}

      <div className="topbar-title">
        <span>{titles[page] || "AURA"}</span>
      </div>

      {/* RIGHT */}

      <div className="topbar-right">

        <button
          className="topbar-button"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="notification-indicator" />
        </button>

        <div className="topbar-separator" />

        <button className="topbar-profile">

          <div className="profile-avatar">
            T
          </div>

          <div className="profile-details">
            <strong>Tausif</strong>
            <span>Student</span>
          </div>

          <ChevronDown size={14} />

        </button>

      </div>

    </header>
  );
}