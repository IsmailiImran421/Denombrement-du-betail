import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function AdminRegionalDashboard({ initialTab = "stats" }) {
  const { token, region } = useAuth();
  const [stats, setStats] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [pvs, setPvs] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [statsRes, adminsRes, pvsRes] = await Promise.all([
        fetch(`${API}/stats/region`, { headers }),
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/pvs/a-valider`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const adminsData = await adminsRes.json();
      const pvsData = await pvsRes.json();
      setStats(statsData);
      setAdmins(adminsData);
      setPvs(Array.isArray(pvsData) ? pvsData : []);
      if (!pvsRes.ok) {
        console.error("Failed to fetch PVs:", pvsData);
      }
    } catch (e) {
      console.error(e);
      setPvs([]);
    }
    setLoading(false);
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API}/users/admin-local`, {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Admin Local créé avec succès !");
      setForm({ nom: "", email: "", password: "" });
      fetchAll();
    } else {
      setMessage("❌ " + (data.message || JSON.stringify(data.errors)));
    }
  }

  async function handleValiderBouclage(id) {
    setMessage("");
    try {
      const res = await fetch(`${API}/pvs/${id}/valider-bouclage`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        fetchAll();
      } else {
        setMessage(
          "❌ " + (data.error || data.message || "Échec de la validation."),
        );
      }
    } catch (e) {
      setMessage("❌ Erreur réseau pendant la validation.");
      console.error(e);
    }
  }

  async function handleValiderCollection(id) {
    setMessage("");
    try {
      const res = await fetch(`${API}/pvs/${id}/valider-collection`, {
        method: "POST",
        headers,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ " + data.message);
        fetchAll();
      } else {
        setMessage(
          "❌ " + (data.error || data.message || "Échec de la validation."),
        );
      }
    } catch (e) {
      setMessage("❌ Erreur réseau pendant la validation.");
      console.error(e);
    }
  }

  if (loading) return <div style={{ padding: "20px" }}>Chargement...</div>;

  return (
    <section className="panel">
      <div className="panel-header" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#4e73df" }}>
          <i
            className="fas fa-globe-africa"
            style={{ marginRight: "10px" }}
          ></i>
          Tableau de bord – Admin Régional
        </h2>
        <p style={{ color: "#858796" }}>
          Région : <strong>{region}</strong>
        </p>
      </div>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2",
            color: message.startsWith("✅") ? "#065f46" : "#991b1b",
            border: message.startsWith("✅")
              ? "1px solid #a7f3d0"
              : "1px solid #fecaca",
          }}
        >
          {message}
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "25px",
          borderBottom: "2px solid #e2e8f0",
          paddingBottom: "10px",
        }}
      >
        {[
          { key: "stats", label: "📊 Statistiques", icon: "fas fa-chart-bar" },
          {
            key: "admins",
            label: "👥 Admins Locaux",
            icon: "fas fa-user-shield",
          },
          {
            key: "pvs",
            label: "📋 PVs à valider",
            icon: "fas fa-clipboard-check",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`button ${activeTab === tab.key ? "button-primary" : "button-secondary"} button-small`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* STATS */}
      {activeTab === "stats" && stats && (
        <div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            {[
              {
                label: "Comités Total",
                value: stats.nb_comites,
                color: "#4e73df",
                icon: "fas fa-layer-group",
              },
              {
                label: "Moqaddem",
                value: stats.nb_moqaddems ?? stats.comites_inscription,
                color: "#1cc88a",
                icon: "fas fa-user-plus",
              },
              {
                label: "Comités Collection",
                value: stats.comites_collection,
                color: "#f6c23e",
                icon: "fas fa-boxes",
              },
              {
                label: "Comités Bouclage",
                value: stats.comites_bouclage,
                color: "#e74a3b",
                icon: "fas fa-tag",
              },
              {
                label: "PVs Inscription",
                value: stats.nb_pvs_inscription,
                color: "#36b9cc",
                icon: "fas fa-file-signature",
              },
              {
                label: "PVs Collection",
                value: stats.nb_pvs_collection,
                color: "#858796",
                icon: "fas fa-file-invoice",
              },
              {
                label: "PVs Bouclage",
                value: stats.nb_pvs_bouclage,
                color: "#5a5c69",
                icon: "fas fa-file-contract",
              },
              {
                label: "Admins Locaux",
                value: stats.nb_admin_locaux,
                color: "#4e73df",
                icon: "fas fa-users-cog",
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderLeft: `4px solid ${s.color}`,
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    color: "#858796",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: "800",
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMINS */}
      {activeTab === "admins" && (
        <div>
          <div
            className="form-card"
            style={{
              background: "#f8fafc",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "25px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#4e73df" }}>
              Créer un Admin Local
            </h3>
            {message && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2",
                  color: message.startsWith("✅") ? "#065f46" : "#dc2626",
                }}
              >
                {message}
              </div>
            )}
            <form
              onSubmit={handleCreateAdmin}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: "12px",
                alignItems: "end",
              }}
            >
              <div className="field-row" style={{ marginBottom: 0 }}>
                <label>Nom</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom complet"
                />
              </div>
              <div className="field-row" style={{ marginBottom: 0 }}>
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@region.ma"
                />
              </div>
              <div className="field-row" style={{ marginBottom: 0 }}>
                <label>Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••"
                />
              </div>
              <button
                type="submit"
                className="button button-primary"
                style={{ height: "44px" }}
              >
                Créer
              </button>
            </form>
          </div>

          <h3 style={{ color: "#5a5c69" }}>Admins Locaux de la région</h3>
          {admins.length === 0 ? (
            <p style={{ color: "#858796" }}>
              Aucun admin local créé pour cette région.
            </p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Région</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((a) => (
                    <tr key={a.id_utilisateur}>
                      <td>
                        <strong>{a.nom}</strong>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.region}</td>
                      <td>
                        {new Date(a.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PVS */}
      {activeTab === "pvs" && (
        <div>
          <h3 style={{ color: "#5a5c69" }}>PVs de la région – {region}</h3>
          {pvs.length === 0 ? (
            <p style={{ color: "#858796" }}>
              Aucun PV trouvé pour cette région.
            </p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Comité</th>
                    <th>Éleveur</th>
                    <th>Collection</th>
                    <th>Bouclage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pvs.map((pv) => (
                    <tr key={pv.id_rapport}>
                      <td>{pv.id_rapport}</td>
                      <td>
                        {new Date(pv.date_generation).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td>{pv.comite?.nom_comite || "N/A"}</td>
                      <td>
                        {pv.eleveur
                          ? `${pv.eleveur.nom} ${pv.eleveur.prenom}`
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          style={{
                            color: pv.pv_collection
                              ? pv.pv_collection.valide
                                ? "#1cc88a"
                                : "#f6c23e"
                              : "#e74a3b",
                            fontWeight: "bold",
                          }}
                        >
                          {pv.pv_collection
                            ? pv.pv_collection.valide
                              ? "✅ Validée"
                              : "⚠️ En attente de validation"
                            : "⏳ En attente"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            color: pv.pv_bouclage ? "#1cc88a" : "#e74a3b",
                            fontWeight: "bold",
                          }}
                        >
                          {pv.pv_bouclage ? "✅ Réalisé" : "⏳ En attente"}
                        </span>
                      </td>
                      <td>
                        {pv.pv_collection && !pv.pv_collection.valide ? (
                          <button
                            className="button button-primary button-small"
                            onClick={() =>
                              handleValiderCollection(pv.id_rapport)
                            }
                          >
                            ✅ Valider la collection
                          </button>
                        ) : pv.pv_collection?.valide &&
                          pv.pv_bouclage &&
                          pv.eleveur &&
                          !pv.eleveur.compte_actif ? (
                          <button
                            className="button button-primary button-small"
                            onClick={() => handleValiderBouclage(pv.id_rapport)}
                          >
                            ✅ Valider le bouclage
                          </button>
                        ) : pv.eleveur?.compte_actif ? (
                          <span
                            style={{
                              color: "#1cc88a",
                              fontWeight: "bold",
                            }}
                          >
                            ✅ Compte activé
                          </span>
                        ) : pv.pv_bouclage ? (
                          <span
                            style={{
                              color: "#f6c23e",
                              fontWeight: "bold",
                            }}
                          >
                            ⏳ En attente de validation
                          </span>
                        ) : (
                          <span
                            style={{
                              color: "#e74a3b",
                              fontWeight: "bold",
                            }}
                          >
                            ⏳ PV incomplet
                          </span>
                        )}
                        <a
                          href={`${API}/pvs/${pv.id_rapport}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-danger button-small"
                          style={{
                            textDecoration: "none",
                            borderRadius: "5px",
                            marginLeft: "8px",
                          }}
                        >
                          📄 PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default AdminRegionalDashboard;
