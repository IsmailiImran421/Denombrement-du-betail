import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import FicheImprimable from "./FicheImprimable";

const API = "http://127.0.0.1:8000/api";

function MoqaddedDashboard() {
  const { token, user } = useAuth();
  const [pvs, setPvs] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("formulaire");
  const [showFiche, setShowFiche] = useState(false);

  const [formData, setFormData] = useState({
    nom_eleveur: "",
    prenom_eleveur: "",
    cin_eleveur: "",
    telephone_eleveur: "",
    adresse_eleveur: "",
    commune_eleveur: "",
  });

  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    }),
    [token],
  );

  useEffect(() => {
    fetch(`${API}/pvs`, { headers })
      .then((r) => r.json())
      .then((data) => setPvs(data || []));
  }, [headers]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (
      !formData.nom_eleveur ||
      !formData.cin_eleveur ||
      !formData.telephone_eleveur
    ) {
      setMessage("Nom, CIN et Téléphone sont obligatoires.");
      return;
    }

    const res = await fetch(`${API}/pvs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...formData,
        id_comite: null,
      }),
    });
    const data = await res.json();
    if (data.error) {
      setMessage("❌ Erreur : " + data.error);
    } else {
      setMessage(
        "✅ Éleveur inscrit et PV généré avec succès ! Le compte sera activé après validation du bouclage par l'admin régional.",
      );
      setFormData({
        nom_eleveur: "",
        prenom_eleveur: "",
        cin_eleveur: "",
        telephone_eleveur: "",
        adresse_eleveur: "",
        commune_eleveur: "",
      });
      // Refresh PVs
      fetch(`${API}/pvs`, { headers })
        .then((r) => r.json())
        .then((data) => setPvs(data || []));
    }
  }

  const pvInscription = pvs.filter((pv) => pv.eleveur);

  return (
    <section className="panel">
      <div className="panel-header" style={{ marginBottom: "20px" }}>
        <h2 style={{ color: "#047857" }}>
          <i className="fas fa-user-tag" style={{ marginRight: "10px" }}></i>
          Espace Moqaddem – Inscription des Éleveurs
        </h2>
        <p style={{ color: "#858796", margin: "5px 0 0" }}>
          Bonjour <strong>{user?.nom}</strong>. Vous pouvez inscrire de nouveaux
          éleveurs ci-dessous.
        </p>
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
        {/* Bouton Fiche imprimable */}
      <button
        onClick={() => setShowFiche(true)}
        style={{
          marginLeft: "auto",
          background: "linear-gradient(135deg, #047857, #10b981)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "8px 16px",
          fontWeight: "700",
          fontSize: "13px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: "0 2px 8px rgba(4,120,87,0.3)",
        }}
      >
        🖨️ Imprimer feuille de collecte
      </button>

      {[
          { key: "formulaire", label: "📝 Inscrire un éleveur" },
          { key: "historique", label: "📋 Historique" },
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

      {/* FORMULAIRE */}
      {activeTab === "formulaire" && (
        <div>
          {/* Formulaire éleveur */}
          <div
            style={{
              background: "#f8fafc",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #10b981",
            }}
          >
            <h3 style={{ margin: "0 0 15px 0", color: "#047857" }}>
              Informations de l'éleveur
            </h3>

            {message && (
              <div
                style={{
                  marginBottom: "15px",
                  padding: "12px",
                  borderRadius: "8px",
                  background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2",
                  color: message.startsWith("✅") ? "#065f46" : "#dc2626",
                  fontWeight: "600",
                }}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>
                    Nom <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nom_eleveur"
                    value={formData.nom_eleveur}
                    onChange={handleChange}
                    required
                    placeholder="Nom de l'éleveur"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="prenom_eleveur"
                    value={formData.prenom_eleveur}
                    onChange={handleChange}
                    placeholder="Prénom"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>
                    CIN <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="cin_eleveur"
                    value={formData.cin_eleveur}
                    onChange={handleChange}
                    required
                    placeholder="Numéro CIN"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>
                    Téléphone <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="telephone_eleveur"
                    value={formData.telephone_eleveur}
                    onChange={handleChange}
                    required
                    placeholder="0600000000"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Adresse</label>
                  <input
                    type="text"
                    name="adresse_eleveur"
                    value={formData.adresse_eleveur}
                    onChange={handleChange}
                    placeholder="Adresse complète"
                  />
                </div>
                <div className="field-row" style={{ marginBottom: 0 }}>
                  <label>Commune</label>
                  <input
                    type="text"
                    name="commune_eleveur"
                    value={formData.commune_eleveur}
                    onChange={handleChange}
                    placeholder="Commune"
                  />
                </div>
              </div>

              <div className="form-actions" style={{ marginTop: "20px" }}>
                <button type="submit" className="button button-primary">
                  <i className="fas fa-save" style={{ marginRight: "8px" }}></i>
                  Inscrire l'éleveur
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setMessage("");
                    setFormData({
                      nom_eleveur: "",
                      prenom_eleveur: "",
                      cin_eleveur: "",
                      telephone_eleveur: "",
                      adresse_eleveur: "",
                      commune_eleveur: "",
                    });
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORIQUE */}
      {activeTab === "historique" && (
        <div>
          <h3 style={{ color: "#5a5c69", marginBottom: "15px" }}>
            Éleveurs inscrits ({pvInscription.length})
          </h3>
          {pvInscription.length === 0 ? (
            <p style={{ color: "#858796" }}>Aucune inscription enregistrée.</p>
          ) : (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Éleveur</th>
                    <th>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {pvInscription.map((pv) => (
                    <tr key={pv.id_rapport}>
                      <td>{pv.id_rapport}</td>
                      <td>
                        {new Date(pv.date_generation).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td>
                        <strong>
                          {pv.eleveur
                            ? `${pv.eleveur.nom} ${pv.eleveur.prenom}`
                            : "N/A"}
                        </strong>
                      </td>
                      <td>
                        <a
                          href={`${API}/pvs/${pv.id_rapport}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="button button-danger button-small"
                          style={{
                            textDecoration: "none",
                            borderRadius: "5px",
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

      {/* Fiche imprimable modale */}
      {showFiche && (
        <FicheImprimable
          type="inscription"
          comite={null}
          user={user}
          onClose={() => setShowFiche(false)}
        />
      )}
    </section>
  );
}

export default MoqaddedDashboard;
