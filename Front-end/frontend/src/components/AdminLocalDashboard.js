import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function AdminLocalDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("moqaddems");
  const [moqaddems, setMoqaddems] = useState([]);
  const [comites, setComites] = useState([]);
  const [reclamations, setReclamations] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [message, setMessage] = useState("");

  const [moqForm, setMoqForm] = useState({ nom: "", email: "", password: "" });
  const [credForm, setCredForm] = useState({
    email_comite: "",
    password_comite: "",
  });
  const [selectedComite, setSelectedComite] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    fetchMoqaddems();
    fetchComites();
    fetchReclamations();
  }, []);

  async function fetchMoqaddems() {
    const res = await fetch(`${API}/users`, { headers });
    const data = await res.json();
    setMoqaddems(Array.isArray(data) ? data : []);
  }

  async function fetchComites() {
    const res = await fetch(`${API}/comites`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    const data = await res.json();
    setComites(Array.isArray(data) ? data : []);
  }

  const [responseModal, setResponseModal] = useState({ isOpen: false, reclamation: null, reponse: "", statut: "" });

  async function fetchReclamations() {
    const res = await fetch(`${API}/reclamations/region`, { headers });
    const data = await res.json();
    setReclamations(Array.isArray(data) ? data : []);
  }

  function openResponseModal(reclamation, statut) {
    setResponseModal({ isOpen: true, reclamation, reponse: "", statut });
  }

  async function handleSubmitResponse(e) {
    if (e) e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API}/reclamations/${responseModal.reclamation.id_plainte}/resolve`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            statut: responseModal.statut,
            reponse: responseModal.reponse
        })
      });
      if (res.ok) {
        setMessage(`✅ Réclamation ${responseModal.statut === "resolue" ? "résolue" : "rejetée"} avec succès !`);
        fetchReclamations();
        setResponseModal({ isOpen: false, reclamation: null, reponse: "", statut: "" });
      } else {
        setMessage("❌ Erreur lors du traitement de la réclamation.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Erreur réseau.");
    }
  }

  async function handleCreateMoqaddem(e) {
    e.preventDefault();
    setMessage("");
    const res = await fetch(`${API}/users/moqaddem`, {
      method: "POST",
      headers,
      body: JSON.stringify(moqForm),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Moqaddem créé avec succès !");
      setMoqForm({ nom: "", email: "", password: "" });
      fetchMoqaddems();
    } else {
      setMessage("❌ " + (data.message || JSON.stringify(data.errors)));
    }
  }

  async function handleAssignCredentials(e) {
    e.preventDefault();
    setMessage("");
    if (!selectedComite) {
      setMessage("❌ Veuillez sélectionner un comité.");
      return;
    }
    const res = await fetch(`${API}/comites/${selectedComite}/credentials`, {
      method: "PUT",
      headers,
      body: JSON.stringify(credForm),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Identifiants du comité mis à jour !");
      setCredForm({ email_comite: "", password_comite: "" });
      setSelectedComite("");
      fetchComites();
    } else {
      setMessage("❌ " + (data.message || JSON.stringify(data.errors)));
    }
  }

  return (
    <section className="panel">
      <div className="panel-header" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#047857" }}>
          <i className="fas fa-user-shield" style={{ marginRight: "10px" }}></i>
          Tableau de bord – Admin Local
        </h2>
      </div>

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
          { key: "moqaddems", label: "👥 Moqaddems" },
          { key: "comite_creds", label: "🔑 Identifiants Comités" },
          { key: "reclamations", label: "💬 Réclamations" },
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

      {/* Message */}
      {message && (
        <div
          style={{
            marginBottom: "15px",
            padding: "10px",
            borderRadius: "8px",
            background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2",
            color: message.startsWith("✅") ? "#065f46" : "#dc2626",
          }}
        >
          {message}
        </div>
      )}

      {/* MOQADDEMS */}
      {activeTab === "moqaddems" && (
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
            <h3 style={{ margin: "0 0 15px 0", color: "#047857" }}>
              Créer un Moqaddem
            </h3>
            <form onSubmit={handleCreateMoqaddem}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Nom complet</label>
                  <input
                    type="text"
                    required
                    value={moqForm.nom}
                    onChange={(e) =>
                      setMoqForm({ ...moqForm, nom: e.target.value })
                    }
                    placeholder="Nom Prénom"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    value={moqForm.email}
                    onChange={(e) =>
                      setMoqForm({ ...moqForm, email: e.target.value })
                    }
                    placeholder="moqaddem@domain.ma"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={moqForm.password}
                    onChange={(e) =>
                      setMoqForm({ ...moqForm, password: e.target.value })
                    }
                    placeholder="••••••"
                  />
                </div>
              </div>
              <button type="submit" className="button button-primary">
                <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>
                Créer le Moqaddem
              </button>
            </form>
          </div>

          <h3 style={{ color: "#5a5c69" }}>Liste des Moqaddems</h3>
          {moqaddems.length === 0 ? (
            <p style={{ color: "#858796" }}>Aucun moqaddem créé.</p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {moqaddems.map((m) => (
                    <tr key={m.id_utilisateur}>
                      <td>
                        <strong>{m.nom}</strong>
                      </td>
                      <td>{m.email}</td>
                      <td>
                        <span
                          style={{
                            background: "#d1fae5",
                            color: "#047857",
                            padding: "3px 10px",
                            borderRadius: "999px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                          }}
                        >
                          Moqaddem
                        </span>
                      </td>
                      <td>
                        {new Date(m.created_at).toLocaleDateString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COMITE CREDENTIALS */}
      {activeTab === "comite_creds" && (
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
            <h3 style={{ margin: "0 0 5px 0", color: "#047857" }}>
              Assigner des identifiants à un comité
            </h3>
            <p
              style={{
                color: "#858796",
                marginTop: 0,
                marginBottom: "15px",
                fontSize: "0.9rem",
              }}
            >
              Chaque comité peut ainsi se connecter pour accéder à ses tâches
              spécifiques.
            </p>
            <form onSubmit={handleAssignCredentials}>
              <div className="field-row">
                <label>Sélectionner le comité</label>
                <select
                  value={selectedComite}
                  onChange={(e) => setSelectedComite(e.target.value)}
                  required
                >
                  <option value="">-- Choisir un comité --</option>
                  {comites.map((c) => (
                    <option key={c.id_comite} value={c.id_comite}>
                      {c.nom_comite} ({c.role}){" "}
                      {c.email_comite
                        ? "– ✅ A déjà un email"
                        : "– ⚠️ Pas encore d'email"}
                    </option>
                  ))}
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Email du comité</label>
                  <input
                    type="email"
                    required
                    value={credForm.email_comite}
                    onChange={(e) =>
                      setCredForm({ ...credForm, email_comite: e.target.value })
                    }
                    placeholder="comite@errachidia.ma"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={credForm.password_comite}
                    onChange={(e) =>
                      setCredForm({
                        ...credForm,
                        password_comite: e.target.value,
                      })
                    }
                    placeholder="••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="button button-primary"
                style={{ marginTop: "15px" }}
              >
                <i className="fas fa-key" style={{ marginRight: "8px" }}></i>
                Assigner les identifiants
              </button>
            </form>
          </div>

          <h3 style={{ color: "#5a5c69" }}>État des comités</h3>
          <div className="table-card">
            <table>
              <thead>
                <tr>
                  <th>Comité</th>
                  <th>Rôle</th>
                  <th>Email comité</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {comites.map((c) => (
                  <tr key={c.id_comite}>
                    <td>
                      <strong>{c.nom_comite}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          background:
                            c.role === "inscription"
                              ? "#d1fae5"
                              : c.role === "collection"
                                ? "#fef9c3"
                                : "#fce7f3",
                          color:
                            c.role === "inscription"
                              ? "#047857"
                              : c.role === "collection"
                                ? "#b45309"
                                : "#be185d",
                          padding: "3px 10px",
                          borderRadius: "999px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          textTransform: "capitalize",
                        }}
                      >
                        {c.role || "—"}
                      </span>
                    </td>
                    <td>
                      {c.email_comite || (
                        <em style={{ color: "#999" }}>Non défini</em>
                      )}
                    </td>
                    <td>
                      {c.email_comite ? (
                        <span style={{ color: "#1cc88a", fontWeight: "bold" }}>
                          ✅ Configuré
                        </span>
                      ) : (
                        <span style={{ color: "#e74a3b", fontWeight: "bold" }}>
                          ⚠️ Non configuré
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECLAMATIONS */}
      {activeTab === "reclamations" && (
        <div>
          <h3 style={{ color: "#5a5c69", marginBottom: "15px" }}>Réclamations des Éleveurs</h3>
          {reclamations.length === 0 ? (
            <p style={{ color: "#858796" }}>Aucune réclamation trouvée pour votre région.</p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Éleveur</th>
                    <th>Sujet</th>
                    <th>Description</th>
                    <th>Statut</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reclamations.map((r) => (
                    <tr key={r.id_plainte}>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {new Date(r.date_plainte).toLocaleDateString("fr-FR")}
                      </td>
                      <td>
                        <strong>{r.eleveur ? `${r.eleveur.nom} ${r.eleveur.prenom}` : "Inconnu"}</strong>
                        {r.eleveur && <div style={{ fontSize: "0.8rem", color: "#666" }}>CIN: {r.eleveur.cin}</div>}
                      </td>
                      <td><strong>{r.sujet}</strong></td>
                      <td>
                        <div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "4px" }}>
                          {r.description}
                        </div>
                        <button 
                          onClick={() => setSelectedDescription(r.description)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#047857",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <i className="fas fa-eye"></i> Voir tout
                        </button>
                      </td>
                      <td>
                        {r.statut === "resolue" ? (
                          <span style={{ color: "#1cc88a", fontWeight: "bold" }}>✅ Résolue</span>
                        ) : r.statut === "rejetee" ? (
                          <span style={{ color: "#e74a3b", fontWeight: "bold" }}>❌ Rejetée</span>
                        ) : (
                          <span style={{ color: "#f6c23e", fontWeight: "bold" }}>⚠️ En attente</span>
                        )}
                      </td>
                      <td>
                        {(!r.statut || r.statut === "en_attente") && (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => openResponseModal(r, "resolue")}
                              className="button button-primary button-small"
                              style={{ padding: "4px 8px" }}
                            >
                              <i className="fas fa-check"></i> Résoudre
                            </button>
                            <button
                              onClick={() => openResponseModal(r, "rejetee")}
                              className="button button-danger button-small"
                              style={{ padding: "4px 8px" }}
                            >
                              <i className="fas fa-times"></i> Rejeter
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DESCRIPTION */}
      {selectedDescription && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "20px 24px", borderRadius: "12px", width: "90%", maxWidth: "500px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: "#0f172a" }}>Description complète</h3>
            <div style={{ 
              lineHeight: "1.6", whiteSpace: "pre-wrap", color: "#334155", 
              maxHeight: "300px", overflowY: "auto", background: "#f8fafc", 
              padding: "15px", borderRadius: "8px", border: "1px solid #e2e8f0" 
            }}>
              {selectedDescription}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="button button-secondary" onClick={() => setSelectedDescription(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RESPONSE */}
      {responseModal.isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "20px 24px", borderRadius: "12px", width: "90%", maxWidth: "500px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "15px", color: responseModal.statut === 'resolue' ? "#047857" : "#dc2626" }}>
              {responseModal.statut === 'resolue' ? "Résoudre la réclamation" : "Rejeter la réclamation"}
            </h3>
            <p style={{ color: "#475569", marginBottom: "15px", fontSize: "0.95rem" }}>
              Veuillez fournir une réponse à l'éleveur :
            </p>
            <form onSubmit={handleSubmitResponse}>
              <textarea
                value={responseModal.reponse}
                onChange={(e) => setResponseModal({...responseModal, reponse: e.target.value})}
                required
                style={{
                  width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1",
                  minHeight: "100px", marginBottom: "20px", resize: "vertical"
                }}
                placeholder="Votre réponse détaillée..."
              ></textarea>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="button button-secondary" onClick={() => setResponseModal({ isOpen: false, reclamation: null, reponse: "", statut: "" })}>
                  Annuler
                </button>
                <button type="submit" className={`button ${responseModal.statut === 'resolue' ? 'button-primary' : 'button-danger'}`}>
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminLocalDashboard;
