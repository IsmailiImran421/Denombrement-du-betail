import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const API = "http://127.0.0.1:8000/api";

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pour l'exemple, voici quelques régions du Maroc
  const regionsMaroc = [
    "Tanger-Tétouan-Al Hoceïma",
    "L'Oriental",
    "Fès-Meknès",
    "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra",
    "Casablanca-Settat",
    "Marrakech-Safi",
    "Drâa-Tafilalet", // Errachidia est ici
    "Souss-Massa",
    "Guelmim-Oued Noun",
    "Laâyoune-Sakia El Hamra",
    "Dakhla-Oued Ed-Dahab"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          region: selectedRegion || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Identifiants incorrects");
      }

      // Si admin_regional sans région sélectionnée
      if (data.user.role === 'admin_regional' && !selectedRegion) {
        throw new Error("Veuillez sélectionner votre région");
      }

      // La région est déjà enregistrée en base via l'API
      // On la passe aussi au contexte pour l'afficher en local
      login(data.user, data.access_token, selectedRegion || data.user.region);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/Coat_of_arms_of_Morocco.svg" alt="Royaume" className="login-logo" />
          <h2>Système de Dénombrement</h2>
          <p>Connectez-vous à votre espace</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-row">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="votre@email.com"
            />
          </div>

          <div className="field-row">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>

          <div className="field-row">
            <label>Région (pour Admin Régional)</label>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">Sélectionnez votre région</option>
              {regionsMaroc.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="button button-primary login-btn" disabled={loading}>
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
