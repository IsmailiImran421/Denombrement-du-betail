import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
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

  const { eleveur, stats, reclamations, collection } = dashboard;

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

      {/* Section des statistiques détaillées de dénombrement */}
      <h3 className="stats-section-title">
        📊 Suivi Détaillé du Dénombrement (Collection)
      </h3>
      <div className="stats-grid" style={{ gridTemplateColumns: "1fr" }}>
        {/* Carte de Collection / Dénombrement */}
        <div className="card" style={{ borderColor: collection ? (collection.valide ? "#10b981" : "#f59e0b") : "#ef4444" }}>
          <div className="card-header-flex">
            <h3>📊 Détails des Animaux Dénombrés</h3>
            {collection ? (
              collection.valide ? (
                <span className="status-badge success">✓ Validé</span>
              ) : (
                <span className="status-badge warning">⏳ En cours</span>
              )
            ) : (
              <span className="status-badge danger">✗ Non effectué</span>
            )}
          </div>
          
          {collection ? (
            <div>
              <table className="table-stats-animals">
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Catégorie d'Animaux</th>
                    <th className="text-right" style={{ padding: "0.75rem 0.5rem" }}>Total Enregistré (Détails par Sexe)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ paddingLeft: "0.5rem" }}><strong>Ovins (Moutons)</strong></td>
                    <td className="text-right" style={{ paddingRight: "0.5rem" }}>
                      <strong>{collection.total_moutons_males + collection.total_moutons_femmelles}</strong>
                      <span className="gender-icons">({collection.total_moutons_males} Mâles ♂ / {collection.total_moutons_femmelles} Femelles ♀)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: "0.5rem" }}><strong>Caprins (Chèvres)</strong></td>
                    <td className="text-right" style={{ paddingRight: "0.5rem" }}>
                      <strong>{collection.total_chevres_males + collection.total_chevres_femmelles}</strong>
                      <span className="gender-icons">({collection.total_chevres_males} Mâles ♂ / {collection.total_chevres_femmelles} Femelles ♀)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: "0.5rem" }}><strong>Bovins (Vaches)</strong></td>
                    <td className="text-right" style={{ paddingRight: "0.5rem" }}>
                      <strong>{collection.total_vaches_males + collection.total_vaches_femmelles}</strong>
                      <span className="gender-icons">({collection.total_vaches_males} Mâles ♂ / {collection.total_vaches_femmelles} Femelles ♀)</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: "0.5rem" }}><strong>Camelins (Chamelles)</strong></td>
                    <td className="text-right" style={{ paddingRight: "0.5rem" }}>
                      <strong>{collection.total_chamelles_males + collection.total_chamelles_femmelles}</strong>
                      <span className="gender-icons">({collection.total_chamelles_males} Mâles ♂ / {collection.total_chamelles_femmelles} Femelles ♀)</span>
                    </td>
                  </tr>
                  <tr style={{ borderTop: "2px solid #e2e8f0", backgroundColor: "#ecfdf5" }}>
                    <td style={{ paddingLeft: "0.5rem" }}><strong>Total Général des Animaux</strong></td>
                    <td className="text-right" style={{ paddingRight: "0.5rem" }}>
                      <strong style={{ fontSize: "1.2rem", color: "#10b981" }}>{collection.total_animaux} têtes</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#334155' }}>Répartition par Espèce</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Moutons', value: collection.total_moutons_males + collection.total_moutons_femmelles, color: '#3b82f6' },
                            { name: 'Chèvres', value: collection.total_chevres_males + collection.total_chevres_femmelles, color: '#10b981' },
                            { name: 'Vaches', value: collection.total_vaches_males + collection.total_vaches_femmelles, color: '#f59e0b' },
                            { name: 'Chamelles', value: collection.total_chamelles_males + collection.total_chamelles_femmelles, color: '#ef4444' },
                          ].filter(d => d.value > 0)}
                          dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label
                        >
                          {[
                            { name: 'Moutons', value: collection.total_moutons_males + collection.total_moutons_femmelles, color: '#3b82f6' },
                            { name: 'Chèvres', value: collection.total_chevres_males + collection.total_chevres_femmelles, color: '#10b981' },
                            { name: 'Vaches', value: collection.total_vaches_males + collection.total_vaches_femmelles, color: '#f59e0b' },
                            { name: 'Chamelles', value: collection.total_chamelles_males + collection.total_chamelles_femmelles, color: '#ef4444' },
                          ].filter(d => d.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#334155' }}>Mâles vs Femelles</h4>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={[
                        { name: 'Moutons', Mâles: collection.total_moutons_males, Femelles: collection.total_moutons_femmelles },
                        { name: 'Chèvres', Mâles: collection.total_chevres_males, Femelles: collection.total_chevres_femmelles },
                        { name: 'Vaches', Mâles: collection.total_vaches_males, Femelles: collection.total_vaches_femmelles },
                        { name: 'Chamelles', Mâles: collection.total_chamelles_males, Femelles: collection.total_chamelles_femmelles },
                      ].filter(d => d.Mâles > 0 || d.Femelles > 0)}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} />
                        <Legend />
                        <Bar dataKey="Mâles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Femelles" fill="#ec4899" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="stats-empty-state">
              <div className="stats-empty-icon">📋</div>
              <p>Aucun dénombrement n'a été enregistré pour le moment par la commission.</p>
            </div>
          )}
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
            {reclamations.map((reclamation, index) => (
              <div
                className="reclamation-item"
                key={reclamation.id_reclamation || reclamation.id || index}
                style={{
                  borderLeft: reclamation.statut === "resolue" ? "4px solid #10b981" : reclamation.statut === "rejetee" ? "4px solid #ef4444" : "4px solid #f59e0b"
                }}
              >
                <div className="reclamation-header">
                  <strong>{reclamation.sujet}</strong>
                  <span>
                    {new Date(reclamation.date_plainte).toLocaleDateString()}
                    <span style={{ 
                      marginLeft: "10px", padding: "2px 6px", borderRadius: "4px", fontSize: "0.8rem", 
                      color: reclamation.statut === "resolue" ? "#065f46" : reclamation.statut === "rejetee" ? "#991b1b" : "#92400e", 
                      background: reclamation.statut === "resolue" ? "#d1fae5" : reclamation.statut === "rejetee" ? "#fee2e2" : "#fef3c7" 
                    }}>
                      {reclamation.statut === "resolue" ? "Résolue" : reclamation.statut === "rejetee" ? "Rejetée" : "En attente"}
                    </span>
                  </span>
                </div>
                <p style={{ color: "#334155" }}>{reclamation.description}</p>
                
                {reclamation.reponse && (
                  <div style={{ marginTop: "12px", padding: "10px", background: "#f1f5f9", borderRadius: "6px", borderLeft: "3px solid #94a3b8" }}>
                    <strong style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#475569" }}>
                      Réponse de l'administrateur :
                    </strong>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#1e293b", whiteSpace: "pre-wrap" }}>
                      {reclamation.reponse}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default EleveurDashboard;
