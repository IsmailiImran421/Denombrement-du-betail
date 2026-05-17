import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("auth_token"));
  const [region, setRegion] = useState(localStorage.getItem("selected_region"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Vérifier le token et récupérer l'utilisateur
      fetch("http://127.0.0.1:8000/api/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Token invalide");
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (userData, authToken, selectedRegion = null) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("auth_token", authToken);
    if (selectedRegion) {
      setRegion(selectedRegion);
      localStorage.setItem("selected_region", selectedRegion);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRegion(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("selected_region");
  };

  return (
    <AuthContext.Provider value={{ user, token, region, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
