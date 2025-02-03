import { useState, useEffect } from "react";
import { CircleX } from "lucide-react";

import logo from "../../assets/LogoCOM.png";
import styles from "./login.module.css";

const Login = ({ login }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(username, password, role);
    } catch (error) {
      setError("Credenciales incorrectas");
    }
  };

  useEffect(() => {
    if (error) {
      const timeoutId = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timeoutId);
    }
  }, [error]);

  return (
    <div className={styles.container}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" />
          <h1>Bitácora</h1>
        </div>
        <form className={styles.loginBox} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label>Legajo</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="operator">Monitoreo</option>
              <option value="dispatch">Despacho</option>
              <option value="911">911</option>
              <option value="multyagency">Multiagencia</option>
              <option value="queries">Consultas</option>
              <option value="eyesOnAlert">Ojos en Alerta</option>
              <option value="administrative">Administrativo</option>
            </select>
          </div>
          <button type="submit" className={styles.loginButton}>
            Iniciar sesión
          </button>
        </form>
      </div>
      {error && (
        <div className={styles.error}>
          <CircleX />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default Login;
