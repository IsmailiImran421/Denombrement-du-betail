import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import FicheImprimable from "./FicheImprimable";

const API = "http://127.0.0.1:8000/api";

function PvManager({ type, user }) {
  const { token } = useAuth();
  const [comites, setComites] = useState([]);
  const [eleveurs, setEleveurs] = useState([]);
  const [pvs, setPvs] = useState([]);

  const [activeComite, setActiveComite] = useState(null);

  const [formData, setFormData] = useState({
    id_eleveur: "",
    // inscription (nouveau eleveur)
    nom_eleveur: "",
    prenom_eleveur: "",
    cin_eleveur: "",
    telephone_eleveur: "",
    adresse_eleveur: "",
    commune_eleveur: "",
    // collection
    total_animaux: 0,
    total_moutons_males: 0,
    total_moutons_femmelles: 0,
    total_vaches_males: 0,
    total_vaches_femmelles: 0,
    total_chevres_males: 0,
    total_chevres_femmelles: 0,
    total_chamelles_males: 0,
    total_chamelles_femmelles: 0,
    // bouclage
    date_bouclage: "",
    nb_animaux_boucles: 0,
    marge_boucles_min: "",
    marge_boucles_max: "",
    responsable_bouclage: "",
  });

  const [message, setMessage] = useState("");
  const [showFiche, setShowFiche] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const filteredPvs = pvs.filter((pv) => {
    if (type === "inscription") {
      return !pv.comite || pv.comite.role === "inscription";
    }
    if (type === "collection") {
      return pv.comite?.role === "collection" || !!pv.pv_collection;
    }
    if (type === "bouclage") {
      return pv.comite?.role === "bouclage" || !!pv.pv_bouclage;
    }
    return false;
  });

  useEffect(() => {
    getComites();
    getEleveurs();
    getPvs();
  }, []);

  useEffect(() => {
    setActiveComite(null);
    setMessage("");
    // Pour le moqaddem en mode inscription, activer automatiquement le formulaire
    if (type === "inscription" && user?.role === "moqaddem") {
      setActiveComite({ role: "inscription", nom_comite: "Moqaddem" });
    }
  }, [type, user]);

  if (type === "inscription" && user?.role !== "moqaddem") {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2>Accès refusé</h2>
        </div>
        <div style={{ padding: "20px", color: "#555" }}>
          La tâche d'inscription est réservée au moqaddem. Les comités ne
          peuvent pas réaliser cette action.
        </div>
      </section>
    );
  }

  if (
    (type === "collection" || type === "bouclage") &&
    user?.role !== "comite"
  ) {
    return (
      <section className="panel">
        <div className="panel-header">
          <h2>Accès refusé</h2>
        </div>
        <div style={{ padding: "20px", color: "#555" }}>
          La tâche de collection et bouclage est réservée aux comités. L'admin
          local ne peut pas réaliser cette action.
        </div>
      </section>
    );
  }

  function getComites() {
    fetch(`${API}/comites`, { headers })
      .then((res) => res.json())
      .then((data) => {
        setComites(data);
        // Auto-sélectionner le comité pour les utilisateurs comité
        if (user?.role === "comite") {
          const matched = data.find((c) => c.id_comite === user.id_comite);
          if (matched) setActiveComite(matched);
        }
      });
  }

  function getEleveurs() {
    fetch(`${API}/eleveurs`, { headers })
      .then((res) => res.json())
      .then((data) => setEleveurs(data));
  }

  function getPvs() {
    fetch(`${API}/pvs`, { headers })
      .then((res) => res.json())
      .then((data) => setPvs(data));
  }

  function openTaskForComite(comite) {
    setActiveComite(comite);
    setMessage("");
    setFormData({
      id_eleveur: "",
      nom_eleveur: "",
      prenom_eleveur: "",
      cin_eleveur: "",
      telephone_eleveur: "",
      adresse_eleveur: "",
      commune_eleveur: "",
      total_animaux: 0,
      total_moutons_males: 0,
      total_moutons_femmelles: 0,
      total_vaches_males: 0,
      total_vaches_femmelles: 0,
      total_chevres_males: 0,
      total_chevres_femmelles: 0,
      total_chamelles_males: 0,
      total_chamelles_femmelles: 0,
      date_bouclage: "",
      nb_animaux_boucles: 0,
      marge_boucles_min: "",
      marge_boucles_max: "",
      responsable_bouclage: "",
    });
  }

  function cancelTask() {
    setActiveComite(null);
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (activeComite.role !== "inscription" && !formData.id_eleveur) {
      setMessage("Veuillez sélectionner un éleveur.");
      return;
    }

    if (activeComite.role === "inscription") {
      if (
        !formData.nom_eleveur ||
        !formData.cin_eleveur ||
        !formData.telephone_eleveur
      ) {
        setMessage(
          "Nom, CIN et Téléphone sont obligatoires pour inscrire un éleveur.",
        );
        return;
      }
    }

    const payload = {
      ...formData,
      id_comite: activeComite.id_comite || null,
    };

    fetch(`${API}/pvs`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          const errorMessage =
            data.error ||
            data.message ||
            (data.errors
              ? JSON.stringify(data.errors)
              : "Erreur lors de l'envoi.");
          setMessage("Erreur : " + errorMessage);
          return;
        }

        if (data.error) {
          setMessage("Erreur : " + data.error);
          return;
        }

        setMessage("Tâche enregistrée avec succès.");
        getPvs();
        getEleveurs();
        setActiveComite(null);
        setFormData({
          ...formData,
          id_eleveur: "",
          nom_eleveur: "",
          prenom_eleveur: "",
          cin_eleveur: "",
          telephone_eleveur: "",
          adresse_eleveur: "",
          commune_eleveur: "",
          total_animaux: 0,
          total_moutons_males: 0,
          total_moutons_femmelles: 0,
          total_vaches_males: 0,
          total_vaches_femmelles: 0,
          total_chevres_males: 0,
          total_chevres_femmelles: 0,
          total_chamelles_males: 0,
          total_chamelles_femmelles: 0,
          date_bouclage: "",
          nb_animaux_boucles: 0,
          marge_boucles_min: "",
          marge_boucles_max: "",
          responsable_bouclage: "",
        });
      })
      .catch(() => {
        setMessage("Erreur de connexion.");
      });
  }

  return (
    <section className="panel">
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Gestion des Tâches par Comité</h2>
        {(type === "collection" || type === "bouclage") && (
          <button
            onClick={() => setShowFiche(true)}
            style={{
              background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 18px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              boxShadow: "0 2px 10px rgba(30,58,138,0.3)",
              transition: "opacity 0.2s",
            }}
            onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
            onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            🖨️ Imprimer feuille de {type === "collection" ? "collecte" : "bouclage"}
          </button>
        )}
        {type === "inscription" && (
          <button
            onClick={() => setShowFiche(true)}
            style={{
              background: "linear-gradient(135deg, #047857, #10b981)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "9px 18px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "7px",
              boxShadow: "0 2px 10px rgba(4,120,87,0.3)",
            }}
          >
            🖨️ Imprimer feuille d'inscription
          </button>
        )}
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {!(type === "inscription" && user?.role === "moqaddem") && (
          <div className="field-row">
            {user?.role !== "comite" && <label>Sélectionner le Comité</label>}
            {user?.role === "comite" && (
              <label>Votre Comité : {activeComite?.nom_comite}</label>
            )}

            {user?.role !== "comite" && (
              <div
                className="comite-groups"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  marginTop: "10px",
                }}
              >
                <div className="comite-group">
                  <h4
                    style={{
                      margin: "0 0 10px 0",
                      color: "#555",
                      fontSize: "14px",
                      textTransform: "uppercase",
                    }}
                  >
                    Comités de {type}
                  </h4>
                  <div
                    className="comite-checkbox-list"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(250px, 1fr))",
                      gap: "10px",
                    }}
                  >
                    {comites
                      .filter((c) => c.role === type)
                      .map((c) => (
                        <label
                          key={c.id_comite}
                          className="checkbox-item"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "5px",
                            cursor: "pointer",
                            background:
                              activeComite?.id_comite === c.id_comite
                                ? "#f0f8ff"
                                : "#fff",
                          }}
                        >
                          <input
                            type="radio"
                            name="comite_selection"
                            value={c.id_comite}
                            checked={activeComite?.id_comite === c.id_comite}
                            onChange={() => openTaskForComite(c)}
                          />
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span style={{ fontWeight: "600", color: "#333" }}>
                              {c.nom_comite}
                            </span>
                            {c.membres && c.membres.length > 0 && (
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#666",
                                  marginTop: "2px",
                                }}
                              >
                                (
                                {c.membres
                                  .map((m) => `${m.nom} ${m.prenom}`)
                                  .join(", ")}
                                )
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    {comites.filter((c) => c.role === type).length === 0 && (
                      <span style={{ fontSize: "13px", color: "#999" }}>
                        Aucun comité de {type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeComite && (
          <div
            className="task-form-section"
            style={{
              marginTop: "25px",
              padding: "20px",
              border: "1px solid #4a90e2",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#4a90e2",
                borderBottom: "1px solid #ddd",
                paddingBottom: "10px",
                marginBottom: "20px",
              }}
            >
              Tâche :{" "}
              {activeComite.role.charAt(0).toUpperCase() +
                activeComite.role.slice(1)}
            </h3>

            {activeComite.role !== "inscription" && (
              <div className="field-row">
                <label>Éleveur Concerné</label>
                <select
                  name="id_eleveur"
                  value={formData.id_eleveur}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner un éleveur</option>
                  {eleveurs.map((e) => (
                    <option key={e.id_eleveur} value={e.id_eleveur}>
                      {e.nom} {e.prenom} (CIN: {e.cin})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeComite.role === "inscription" && (
              <div className="inscription-fields">
                <p style={{ marginBottom: "15px", color: "#555" }}>
                  Veuillez saisir les informations du nouvel éleveur. Un PV
                  d'inscription sera généré automatiquement.
                </p>
                <div className="field-row">
                  <label>
                    Nom <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="nom_eleveur"
                    value={formData.nom_eleveur}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field-row">
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="prenom_eleveur"
                    value={formData.prenom_eleveur}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-row">
                  <label>
                    CIN <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="cin_eleveur"
                    value={formData.cin_eleveur}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field-row">
                  <label>
                    Téléphone <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="telephone_eleveur"
                    value={formData.telephone_eleveur}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="field-row">
                  <label>Adresse</label>
                  <input
                    type="text"
                    name="adresse_eleveur"
                    value={formData.adresse_eleveur}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-row">
                  <label>Commune</label>
                  <input
                    type="text"
                    name="commune_eleveur"
                    value={formData.commune_eleveur}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {activeComite.role === "collection" && (
              <div className="collection-fields">
                <div className="field-row">
                  <label>Total Animaux</label>
                  <input
                    type="number"
                    name="total_animaux"
                    value={formData.total_animaux}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-row">
                  <label>Moutons (Mâles / Femelles)</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="number"
                      name="total_moutons_males"
                      placeholder="Mâles"
                      value={formData.total_moutons_males}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="total_moutons_femmelles"
                      placeholder="Femelles"
                      value={formData.total_moutons_femmelles}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <label>Vaches (Mâles / Femelles)</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="number"
                      name="total_vaches_males"
                      placeholder="Mâles"
                      value={formData.total_vaches_males}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="total_vaches_femmelles"
                      placeholder="Femelles"
                      value={formData.total_vaches_femmelles}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <label>Chèvres (Mâles / Femelles)</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="number"
                      name="total_chevres_males"
                      placeholder="Mâles"
                      value={formData.total_chevres_males}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="total_chevres_femmelles"
                      placeholder="Femelles"
                      value={formData.total_chevres_femmelles}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <label>Chamelles (Mâles / Femelles)</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      type="number"
                      name="total_chamelles_males"
                      placeholder="Mâles"
                      value={formData.total_chamelles_males}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="total_chamelles_femmelles"
                      placeholder="Femelles"
                      value={formData.total_chamelles_femmelles}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeComite.role === "bouclage" && (
              <div className="bouclage-fields">
                <div className="field-row">
                  <label>Date de Bouclage</label>
                  <input
                    type="date"
                    name="date_bouclage"
                    value={formData.date_bouclage}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-row">
                  <label>Nombre Animaux Bouclés</label>
                  <input
                    type="number"
                    name="nb_animaux_boucles"
                    value={formData.nb_animaux_boucles}
                    onChange={handleChange}
                  />
                </div>
                <div className="field-row">
                  <label>Marge Boucles (de ... à ...)</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="number"
                      name="marge_boucles_min"
                      placeholder="de"
                      value={formData.marge_boucles_min}
                      onChange={handleChange}
                    />
                    <input
                      type="number"
                      name="marge_boucles_max"
                      placeholder="à"
                      value={formData.marge_boucles_max}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="field-row">
                  <label>Responsable Bouclage</label>
                  <select
                    name="responsable_bouclage"
                    value={formData.responsable_bouclage}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un responsable</option>
                    {(activeComite.membres || []).map((membre) => (
                      <option
                        key={membre.id_membre}
                        value={`${membre.nom} ${membre.prenom}`.trim()}
                      >
                        {membre.nom} {membre.prenom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="button button-primary">
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="message" style={{ marginTop: "15px" }}>
            {message}
          </div>
        )}
      </form>

      <div className="table-card" style={{ marginTop: "30px" }}>
        <h3>Historique des PVs</h3>
        <table>
          <thead>
            <tr>
              <th>ID PV</th>
              <th>Date Génération</th>
              <th>Comité Inscription</th>
              <th>Éleveur</th>
              <th>Statut Collection</th>
              <th>Statut Bouclage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPvs.map((pv) => (
              <tr key={pv.id_rapport}>
                <td>{pv.id_rapport}</td>
                <td>{new Date(pv.date_generation).toLocaleDateString()}</td>
                <td>{pv.comite ? pv.comite.nom_comite : "Moqaddem"}</td>
                <td>
                  {pv.eleveur
                    ? `${pv.eleveur.nom} ${pv.eleveur.prenom}`
                    : "N/A"}
                </td>
                <td>{pv.pv_collection ? "Réalisée" : "En attente"}</td>
                <td>{pv.pv_bouclage ? "Réalisé" : "En attente"}</td>
                <td>
                  <a
                    href={`${API}/pvs/${pv.id_rapport}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      textDecoration: "none",
                      display: "inline-block",
                      textAlign: "center",
                      backgroundColor: "#e74c3c",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "5px",
                      fontWeight: "600",
                      fontSize: "13px",
                      boxShadow: "0 2px 5px rgba(231, 76, 60, 0.3)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#c0392b")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = "#e74c3c")
                    }
                  >
                    📄 Télécharger PDF
                  </a>
                </td>
              </tr>
            ))}
            {filteredPvs.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Aucun PV trouvé pour {type}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fiche imprimable modale */}
      {showFiche && (
        <FicheImprimable
          type={type}
          comite={activeComite}
          user={user}
          onClose={() => setShowFiche(false)}
        />
      )}
    </section>
  );
}

export default PvManager;
