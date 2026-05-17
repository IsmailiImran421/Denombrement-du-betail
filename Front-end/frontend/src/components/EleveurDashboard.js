import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

function EleveurDashboard() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    fetch("http://127.0.0.1:8000/api/eleveurs/me/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            "Impossible de charger les données du tableau de bord.",
          );
        }
        return res.json();
      })
      .then((data) => {
        setDashboard(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Erreur lors du chargement.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const submitReclamation = async (event) => {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError("Le sujet et la description sont requis.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/eleveurs/me/reclamations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sujet: subject, description }),
        },
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.message || data.error || "Impossible d'envoyer la réclamation.",
        );
      }

      const newReclamation = await res.json();
      setDashboard((prev) => ({
        ...prev,
        reclamations: [newReclamation, ...(prev?.reclamations || [])],
        stats: {
          ...prev.stats,
          reclamations_count: (prev?.stats?.reclamations_count || 0) + 1,
        },
      }));
      setSubject("");
      setDescription("");
    } catch (err) {
      setError(err.message || "Erreur lors de l'envoi de la réclamation.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Chargement des informations éleveur…</div>;
  }

  if (error) {
    return <div style={{ color: "#dc2626" }}>{error}</div>;
  }

  if (!dashboard) {
    return <div>Aucune donnée disponible pour votre compte.</div>;
  }

  const { eleveur, stats, reclamations } = dashboard;

  return (
    <div className="eleveur-dashboard">
      <div className="dashboard-grid">
        <div className="card card-info">
          <h3>Informations</h3>
          <p>
            <strong>Éleveur :</strong> {eleveur.nom} {eleveur.prenom}
          </p>
          <p>
            <strong>CIN :</strong> {eleveur.cin}
          </p>
          <p>
            <strong>Compte actif :</strong> {stats.compte_actif ? "Oui" : "Non"}
          </p>
        </div>

        <div className="card card-success">
          <h3>Remboursement attendu</h3>
          <div className="data-row">
            <span>Moutons / Chèvres</span>
            <strong>{stats.moutons_chevres}</strong>
          </div>
          <div className="data-row">
            <span>Vaches / Chamelles</span>
            <strong>{stats.vaches_chamelles}</strong>
          </div>
          <div className="data-row total-row">
            <span>Montant estimé</span>
            <strong>{stats.montant_remboursement} DH</strong>
          </div>
          <p className="helper-text">
            100 DH par mouton/chèvre et 150 DH par vache/chamelle.
          </p>
        </div>

        <div className="card card-primary">
          <h3>Réclamations</h3>
          <div className="data-row">
            <span>Nombre de réclamations</span>
            <strong>{stats.reclamations_count}</strong>
          </div>
          <p>
            <strong>Dernière réclamation :</strong>{" "}
            {reclamations.length > 0
              ? new Date(reclamations[0].date_plainte).toLocaleDateString()
              : "Aucune"}
          </p>
        </div>
      </div>

      <div className="card card-light" style={{ marginTop: "1.5rem" }}>
        <h3>Créer une réclamation</h3>
        <form onSubmit={submitReclamation}>
          <div className="form-group">
            <label>Sujet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet de la réclamation"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Racontez votre réclamation"
              className="form-control"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="button button-primary"
            disabled={submitting}
          >
            {submitting ? "Envoi…" : "Envoyer la réclamation"}
          </button>
        </form>
      </div>

      <div className="card card-light" style={{ marginTop: "1.5rem" }}>
        <h3>Liste des réclamations</h3>
        {reclamations.length === 0 ? (
          <p>Aucune réclamation enregistrée.</p>
        ) : (
          <div className="reclamation-list">
            {reclamations.map((reclamation) => (
              <div
                className="reclamation-item"
                key={reclamation.id_reclamation || reclamation.id}
              >
                <div className="reclamation-header">
                  <strong>{reclamation.sujet}</strong>
                  <span>
                    {new Date(reclamation.date_plainte).toLocaleDateString()}
                  </span>
                </div>
                <p>{reclamation.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EleveurDashboard;
