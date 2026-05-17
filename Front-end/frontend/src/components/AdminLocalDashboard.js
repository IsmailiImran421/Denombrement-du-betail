import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function AdminLocalDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("moqaddems");
  const [moqaddems, setMoqaddems] = useState([]);
  const [comites, setComites] = useState([]);
  const [message, setMessage] = useState("");

  const [moqForm, setMoqForm] = useState({ nom: "", email: "", password: "" });
  const [credForm, setCredForm] = useState({ email_comite: "", password_comite: "" });
  const [selectedComite, setSelectedComite] = useState("");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  useEffect(() => {
    fetchMoqaddems();
    fetchComites();
  }, []);

  async function fetchMoqaddems() {
    const res = await fetch(`${API}/users`, { headers });
    const data = await res.json();
    setMoqaddems(Array.isArray(data) ? data : []);
  }

  async function fetchComites() {
    const res = await fetch(`${API}/comites`, { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
    const data = await res.json();
    setComites(Array.isArray(data) ? data : []);
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
        <h2 style={{ color: "#4e73df" }}>
          <i className="fas fa-user-shield" style={{ marginRight: "10px" }}></i>
          Tableau de bord – Admin Local
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
        {[
          { key: "moqaddems", label: "👥 Moqaddems" },
          { key: "comite_creds", label: "🔑 Identifiants Comités" },
        ].map(tab => (
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
        <div style={{
          marginBottom: "15px", padding: "10px", borderRadius: "8px",
          background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2",
          color: message.startsWith("✅") ? "#065f46" : "#dc2626",
        }}>
          {message}
        </div>
      )}

      {/* MOQADDEMS */}
      {activeTab === "moqaddems" && (
        <div>
          <div className="form-card" style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 15px 0", color: "#4e73df" }}>Créer un Moqaddem</h3>
            <form onSubmit={handleCreateMoqaddem}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Nom complet</label>
                  <input type="text" required value={moqForm.nom} onChange={e => setMoqForm({ ...moqForm, nom: e.target.value })} placeholder="Nom Prénom" />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Email</label>
                  <input type="email" required value={moqForm.email} onChange={e => setMoqForm({ ...moqForm, email: e.target.value })} placeholder="moqaddem@domain.ma" />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Mot de passe</label>
                  <input type="password" required minLength={6} value={moqForm.password} onChange={e => setMoqForm({ ...moqForm, password: e.target.value })} placeholder="••••••" />
                </div>
              </div>
              <button type="submit" className="button button-primary">
                <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>Créer le Moqaddem
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
                  {moqaddems.map(m => (
                    <tr key={m.id_utilisateur}>
                      <td><strong>{m.nom}</strong></td>
                      <td>{m.email}</td>
                      <td>
                        <span style={{ background: "#eef2ff", color: "#4e73df", padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600" }}>
                          Moqaddem
                        </span>
                      </td>
                      <td>{new Date(m.created_at).toLocaleDateString("fr-FR")}</td>
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
          <div className="form-card" style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #e2e8f0" }}>
            <h3 style={{ margin: "0 0 5px 0", color: "#4e73df" }}>Assigner des identifiants à un comité</h3>
            <p style={{ color: "#858796", marginTop: 0, marginBottom: "15px", fontSize: "0.9rem" }}>
              Chaque comité peut ainsi se connecter pour accéder à ses tâches spécifiques.
            </p>
            <form onSubmit={handleAssignCredentials}>
              <div className="field-row">
                <label>Sélectionner le comité</label>
                <select value={selectedComite} onChange={e => setSelectedComite(e.target.value)} required>
                  <option value="">-- Choisir un comité --</option>
                  {comites.map(c => (
                    <option key={c.id_comite} value={c.id_comite}>
                      {c.nom_comite} ({c.role}) {c.email_comite ? "– ✅ A déjà un email" : "– ⚠️ Pas encore d'email"}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Email du comité</label>
                  <input
                    type="email" required
                    value={credForm.email_comite}
                    onChange={e => setCredForm({ ...credForm, email_comite: e.target.value })}
                    placeholder="comite@errachidia.ma"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Mot de passe</label>
                  <input
                    type="password" required minLength={6}
                    value={credForm.password_comite}
                    onChange={e => setCredForm({ ...credForm, password_comite: e.target.value })}
                    placeholder="••••••"
                  />
                </div>
              </div>
              <button type="submit" className="button button-primary" style={{ marginTop: "15px" }}>
                <i className="fas fa-key" style={{ marginRight: "8px" }}></i>Assigner les identifiants
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
                {comites.map(c => (
                  <tr key={c.id_comite}>
                    <td><strong>{c.nom_comite}</strong></td>
                    <td>
                      <span style={{
                        background: c.role === "inscription" ? "#eef2ff" : c.role === "collection" ? "#fef9c3" : "#fce7f3",
                        color: c.role === "inscription" ? "#4e73df" : c.role === "collection" ? "#b45309" : "#be185d",
                        padding: "3px 10px", borderRadius: "999px", fontSize: "0.8rem", fontWeight: "600",
                        textTransform: "capitalize"
                      }}>
                        {c.role || "—"}
                      </span>
                    </td>
                    <td>{c.email_comite || <em style={{ color: "#999" }}>Non défini</em>}</td>
                    <td>
                      {c.email_comite
                        ? <span style={{ color: "#1cc88a", fontWeight: "bold" }}>✅ Configuré</span>
                        : <span style={{ color: "#e74a3b", fontWeight: "bold" }}>⚠️ Non configuré</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminLocalDashboard;
