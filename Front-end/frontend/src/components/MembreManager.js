import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function MembreManager() {
  const { token } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const [membres, setMembres] = useState([]);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    role: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Charger les membres
  useEffect(() => {
    getMembres();
  }, []);

  function getMembres() {
    fetch(`${API}/membres`, { headers })
      .then((response) => response.json())
      .then((data) => {
        setMembres(data);
      })
      .catch(() => {
        setMessage("Erreur de chargement.");
      });
  }

  // Changer les inputs
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Réinitialiser formulaire
  function resetForm() {
    setFormData({
      nom: "",
      prenom: "",
      role: "",
    });

    setEditingId(null);
  }

  // Ajouter ou modifier
  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.nom || !formData.prenom) {
      setMessage("Nom et prénom obligatoires.");
      return;
    }

    const method = editingId ? "PUT" : "POST";

    const url = editingId ? `${API}/membres/${editingId}` : `${API}/membres`;

    fetch(url, {
      method: method,
      headers,
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())

      .then(() => {
        setMessage(editingId ? "Membre modifié." : "Membre ajouté.");

        resetForm();
        getMembres();
      })

      .catch(() => {
        setMessage("Erreur.");
      });
  }

  // Supprimer
  function deleteMember(id) {
    fetch(`${API}/membres/${id}`, {
      method: "DELETE",
      headers,
    })
      .then(() => {
        setMessage("Membre supprimé.");
        getMembres();
      })

      .catch(() => {
        setMessage("Erreur suppression.");
      });
  }

  // Modifier
  function editMember(membre) {
    setFormData({
      nom: membre.nom,
      prenom: membre.prenom,
      role: membre.role,
    });

    setEditingId(membre.id_membre);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Gestion des membres</h2>

        <form className="form-card" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>Nom</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
            />
          </div>

          <div className="field-row">
            <label>Prénom</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
            />
          </div>

          <div className="field-row">
            <label>Rôle</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Choisir rôle</option>
              <option value="président">Président</option>
              <option value="vice-président">Vice-Président</option>
              <option value="secrétaire">Secrétaire</option>
              <option value="vétérinaire">Vétérinaire</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="button button-primary">
              {editingId ? "Modifier" : "Ajouter"}
            </button>

            {editingId && (
              <button
                type="button"
                className="button button-secondary"
                onClick={resetForm}
              >
                Annuler
              </button>
            )}
          </div>

          {message && <div className="message">{message}</div>}
        </form>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {membres.map((membre) => (
                <tr key={membre.id_membre}>
                  <td>{membre.nom}</td>
                  <td>{membre.prenom}</td>
                  <td>{membre.role}</td>

                  <td className="actions-cell">
                    <button
                      className="button button-small"
                      onClick={() => editMember(membre)}
                    >
                      Modifier
                    </button>

                    <button
                      className="button button-danger button-small"
                      onClick={() => deleteMember(membre.id_membre)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default MembreManager;
