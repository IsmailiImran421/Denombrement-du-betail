import { useState } from "react";
import "./App.css";
import ComiteManager from "./components/ComiteManager";
import MembreManager from "./components/MembreManager";
import PvManager from "./components/PvManager";
import AdminRegionalDashboard from "./components/AdminRegionalDashboard";
import AdminLocalDashboard from "./components/AdminLocalDashboard";
import MoqaddedDashboard from "./components/MoqaddedDashboard";
import EleveurDashboard from "./components/EleveurDashboard";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";

/* ─── Barre de navigation commune ─── */
function Sidebar({ page, setPage, pvMenuOpen, setPvMenuOpen, user }) {
  const isAdminLocal = user?.role === "admin_local";
  const isAdminRegional = user?.role === "admin_regional";
  const isMoqaddem = user?.role === "moqaddem";
  const isComite = user?.role === "comite";
  const isEleveur = user?.role === "eleveur";

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <img
          src="/Coat_of_arms_of_Morocco.svg"
          alt="Royaume"
          className="sidebar-brand-img"
        />
        <span className="sidebar-brand-text">Province d'Errachidia</span>
      </div>
      <hr className="sidebar-divider" />

      {/* ADMIN RÉGIONAL */}
      {isAdminRegional && (
        <>
          <div className="sidebar-heading">Administration</div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${page === "dashboard_regional" ? "active" : ""}`}
            >
              <button
                className="nav-link"
                onClick={() => setPage("dashboard_regional")}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Tableau de bord</span>
              </button>
            </li>
            <li
              className={`nav-item ${page === "admin_locaux" ? "active" : ""}`}
            >
              <button
                className="nav-link"
                onClick={() => setPage("admin_locaux")}
              >
                <i className="fas fa-user-shield"></i>
                <span>Admins Locaux</span>
              </button>
            </li>
          </ul>
          <div className="sidebar-heading" style={{ marginTop: "10px" }}>
            PVs Région
          </div>
          <ul className="nav-menu">
            <li className={`nav-item ${page === "pvs_region" ? "active" : ""}`}>
              <button
                className="nav-link"
                onClick={() => setPage("pvs_region")}
              >
                <i className="fas fa-clipboard-check"></i>
                <span>Procès-verbaux</span>
              </button>
            </li>
          </ul>
        </>
      )}

      {/* ADMIN LOCAL */}
      {isAdminLocal && (
        <>
          <div className="sidebar-heading">Administration</div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${page === "dashboard_local" ? "active" : ""}`}
            >
              <button
                className="nav-link"
                onClick={() => setPage("dashboard_local")}
              >
                <i className="fas fa-tachometer-alt"></i>
                <span>Tableau de bord</span>
              </button>
            </li>
            <li className={`nav-item ${page === "membres" ? "active" : ""}`}>
              <button className="nav-link" onClick={() => setPage("membres")}>
                <i className="fas fa-users"></i>
                <span>Membres</span>
              </button>
            </li>
            <li className={`nav-item ${page === "comites" ? "active" : ""}`}>
              <button className="nav-link" onClick={() => setPage("comites")}>
                <i className="fas fa-layer-group"></i>
                <span>Comités</span>
              </button>
            </li>
          </ul>
          <div className="sidebar-heading" style={{ marginTop: "10px" }}>
            Procès-verbaux
          </div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${page.startsWith("pv_") ? "active" : ""}`}
            >
              <div
                className="nav-link"
                onClick={() => setPvMenuOpen(!pvMenuOpen)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <i className="fas fa-file-alt"></i>
                  <span>PV</span>
                </div>
                <i
                  className={`fas fa-chevron-${pvMenuOpen ? "down" : "right"}`}
                  style={{ fontSize: "0.8rem" }}
                ></i>
              </div>
              {pvMenuOpen && (
                <div className="sidebar-submenu">
                  <h6 className="sidebar-submenu-header">Types de PV :</h6>
                  {["collection", "bouclage"].map((type) => (
                    <button
                      key={type}
                      className={`sidebar-submenu-item ${page === `pv_${type}` ? "active" : ""}`}
                      onClick={() => setPage(`pv_${type}`)}
                    >
                      PV {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </>
      )}

      {/* COMITE */}
      {isComite && (
        <>
          <div className="sidebar-heading">Mes tâches</div>
          <ul className="nav-menu">
            {user?.role_comite && (
              <li
                className={`nav-item ${page.startsWith("pv_") ? "active" : ""}`}
              >
                <button
                  className="nav-link"
                  onClick={() => setPage(`pv_${user.role_comite}`)}
                >
                  <i className="fas fa-file-alt"></i>
                  <span>
                    PV{" "}
                    {user.role_comite.charAt(0).toUpperCase() +
                      user.role_comite.slice(1)}
                  </span>
                </button>
              </li>
            )}
          </ul>
        </>
      )}

      {/* MOQADDEM */}
      {isMoqaddem && (
        <>
          <div className="sidebar-heading">Mes tâches</div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${page === "inscription" ? "active" : ""}`}
            >
              <button
                className="nav-link"
                onClick={() => setPage("inscription")}
              >
                <i className="fas fa-user-plus"></i>
                <span>Inscription éleveurs</span>
              </button>
            </li>
          </ul>
        </>
      )}

      {isEleveur && (
        <>
          <div className="sidebar-heading">Mon compte</div>
          <ul className="nav-menu">
            <li
              className={`nav-item ${page === "dashboard_eleveur" ? "active" : ""}`}
            >
              <button
                className="nav-link"
                onClick={() => setPage("dashboard_eleveur")}
              >
                <i className="fas fa-chart-line"></i>
                <span>Mon tableau de bord</span>
              </button>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
}

/* ─── Topbar commune ─── */
function Topbar({ page, user, region, logout }) {
  const titles = {
    dashboard_regional: "Tableau de bord Régional",
    admin_locaux: "Gestion des Admins Locaux",
    pvs_region: "PVs de la Région",
    dashboard_local: "Tableau de bord Local",
    membres: "Gestion des Membres",
    comites: "Gestion des Comités",
    pv_inscription: "PV d'Inscription",
    pv_collection: "PV de Collection",
    pv_bouclage: "PV de Bouclage",
    inscription: "Inscription des Éleveurs",
  };

  const roleLabels = {
    admin_regional: "Admin Régional",
    admin_local: "Admin Local",
    moqaddem: "Moqaddem",
    eleveur: "Éleveur",
  };

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1 className="h3 mb-0 text-gray-800">
          {titles[page] || "Système de Dénombrement"}
        </h1>
      </div>
      <div
        className="topbar-right"
        style={{ display: "flex", alignItems: "center", gap: "15px" }}
      >
        <div style={{ textAlign: "right", fontSize: "0.85rem" }}>
          <strong style={{ display: "block", color: "#5a5c69" }}>
            {user.nom}
          </strong>
          <span style={{ color: "#858796" }}>
            {roleLabels[user.role] || user.role}
          </span>
          {region && (
            <span
              style={{
                color: "#4e73df",
                display: "block",
                fontWeight: "bold",
                fontSize: "0.78rem",
              }}
            >
              {region}
            </span>
          )}
        </div>
        <button
          onClick={logout}
          className="button button-danger button-small"
          style={{ borderRadius: "5px" }}
        >
          <i className="fas fa-sign-out-alt" style={{ marginRight: "6px" }}></i>
          Déconnexion
        </button>
      </div>
    </header>
  );
}

/* ─── App principal ─── */
function App() {
  const { user, logout, loading, region } = useAuth();

  // Page par défaut selon le rôle
  const defaultPage = () => {
    if (!user) return "";
    if (user.role === "admin_regional") return "dashboard_regional";
    if (user.role === "admin_local") return "dashboard_local";
    if (user.role === "moqaddem") return "inscription";
    if (user.role === "comite") return `pv_${user.role_comite}`;
    if (user.role === "eleveur") return "dashboard_eleveur";
    return "membres";
  };

  const [page, setPage] = useState(defaultPage);
  const [pvMenuOpen, setPvMenuOpen] = useState(false);
  const isMoqaddem = user?.role === "moqaddem";
  const isComite = user?.role === "comite";
  const isEleveur = user?.role === "eleveur";

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg,#4e73df,#224abe)",
          color: "#fff",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <i
          className="fas fa-spinner fa-spin"
          style={{ fontSize: "2.5rem" }}
        ></i>
        <span style={{ fontSize: "1.1rem" }}>Chargement en cours…</span>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="dashboard-container">
      <Sidebar
        page={page}
        setPage={setPage}
        pvMenuOpen={pvMenuOpen}
        setPvMenuOpen={setPvMenuOpen}
        user={user}
      />

      <div className="main-wrapper">
        <Topbar page={page} user={user} region={region} logout={logout} />

        <main className="main-content">
          <div className="page-content">
            {/* ── Admin Régional ── */}
            {page === "dashboard_regional" && <AdminRegionalDashboard />}
            {page === "admin_locaux" && (
              <AdminRegionalDashboard initialTab="admins" />
            )}
            {page === "pvs_region" && (
              <AdminRegionalDashboard initialTab="pvs" />
            )}

            {/* ── Admin Local ── */}
            {page === "dashboard_local" && <AdminLocalDashboard />}
            {page === "membres" && <MembreManager />}
            {page === "comites" && <ComiteManager />}
            {page === "pv_inscription" && isMoqaddem && (
              <PvManager type="inscription" user={user} />
            )}
            {page === "pv_inscription" && !isMoqaddem && (
              <div style={{ padding: "30px", color: "#dc2626" }}>
                Accès refusé : seuls les moqaddems peuvent effectuer les
                inscriptions.
              </div>
            )}
            {page === "pv_collection" && !isComite && (
              <PvManager type="collection" user={user} />
            )}
            {page === "pv_bouclage" && !isComite && (
              <PvManager type="bouclage" user={user} />
            )}

            {/* ── Comité ── */}
            {page === `pv_${user?.role_comite}` && isComite && (
              <PvManager type={user.role_comite} user={user} />
            )}

            {/* ── Éleveur ── */}
            {page === "dashboard_eleveur" && isEleveur && <EleveurDashboard />}

            {/* ── Moqaddem ── */}
            {page === "inscription" && <MoqaddedDashboard />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
