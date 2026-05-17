import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://127.0.0.1:8000/api";

function ComiteManager() {
  const { token } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  const [comites, setComites] = useState([]);
  const [membres, setMembres] = useState([]);

  const [formData, setFormData] = useState({
    nom_comite: "",
    role: "",
  });

  const [selectedMembres, setSelectedMembres] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  // Charger données
  useEffect(() => {
    getComites();
    getMembres();
  }, []);

  // Charger comités
  function getComites() {
    fetch(`${API}/comites`, { headers })
      .then((response) => response.json())
      .then((data) => {
        setComites(data);
      })
      .catch(() => {
        setMessage("Erreur chargement comités.");
      });
  }

  // Charger membres
  function getMembres() {
    fetch(`${API}/membres`, { headers })
      .then((response) => response.json())
      .then((data) => {
        setMembres(data);
      });
  }

  // Changer inputs
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Checkbox membres
  function toggleMember(id) {
    if (selectedMembres.includes(id)) {
      setSelectedMembres(selectedMembres.filter((m) => m !== id));
    } else {
      setSelectedMembres([...selectedMembres, id]);
    }
  }

  // Reset formulaire
  function resetForm() {
    setFormData({
      nom_comite: "",
      role: "",
    });

    setSelectedMembres([]);
    setEditingId(null);
  }

  // Ajouter ou modifier
  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.nom_comite) {
      setMessage("Nom obligatoire.");
      return;
    }

    const method = editingId ? "PUT" : "POST";

    const url = editingId ? `${API}/comites/${editingId}` : `${API}/comites`;

    fetch(url, {
      method: method,
      headers,
      body: JSON.stringify({
        ...formData,
        membre_ids: selectedMembres,
      }),
    })
      .then((response) => response.json())

      .then(() => {
        setMessage(editingId ? "Comité modifié." : "Comité ajouté.");

        resetForm();
        getComites();
      })

      .catch(() => {
        setMessage("Erreur.");
      });
  }

  // Supprimer
  function deleteComite(id) {
    fetch(`${API}/comites/${id}`, {
      method: "DELETE",
      headers,
    })
      .then(() => {
        setMessage("Comité supprimé.");
        getComites();
      })

      .catch(() => {
        setMessage("Erreur suppression.");
      });
  }

  // Modifier
  function editComite(comite) {
    setFormData({
      nom_comite: comite.nom_comite,
      role: comite.role,
    });

    setSelectedMembres(
      (comite.membres || []).map((membre) => membre.id_membre),
    );

    setEditingId(comite.id_comite);
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Gestion des comités</h2>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="field-row">
          <label>Nom comité</label>

          <input
            type="text"
            name="nom_comite"
            value={formData.nom_comite}
            onChange={handleChange}
          />
        </div>

        <div className="field-row">
          <label>Rôle</label>

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="">Choisir rôle</option>
            <option value="collection">Collection</option>
            <option value="bouclage">Bouclage</option>
          </select>
        </div>

        <div className="field-row field-checkbox-list">
          <label>Membres</label>

          <div className="member-checkbox-grid">
            {membres.map((membre) => (
              <label key={membre.id_membre} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedMembres.includes(membre.id_membre)}
                  onChange={() => toggleMember(membre.id_membre)}
                />
                <span>
                  {membre.nom} {membre.prenom} ({membre.role})
                </span>
              </label>
            ))}
          </div>
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
              <th>Rôle</th>
              <th>Membres</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {comites.map((comite) => (
              <tr key={comite.id_comite}>
                <td>{comite.nom_comite}</td>

                <td>{comite.role}</td>

                <td>
                  {(comite.membres || [])
                    .map((m) => `${m.nom} (${m.role})`)
                    .join(", ")}
                </td>

                <td className="actions-cell">
                  <button
                    className="button button-small"
                    onClick={() => editComite(comite)}
                  >
                    Modifier
                  </button>

                  <button
                    className="button button-danger button-small"
                    onClick={() => deleteComite(comite.id_comite)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ComiteManager;
