import React from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/LogoCOM.png";
import styles from "./header.module.css";

const Header = ({ logout }) => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const rolTranslations = {
    operator: "Monitoreo",
    dispatch: "Despacho",
    911: "911",
    multyagency: "Multiagencia",
    queries: "Consultas",
    eyesOnAlert: "Ojos en Alerta",
    administrative: "Administrativo",
  };

  const getFullName = (name, surname) => {
    const fullName = name.split(" ");
    const firstName = fullName[0];
    const secondName = fullName.slice(1).join(" ");
    return `${secondName} ${firstName} ${surname}`;
  };

  const translateRole = (role) => rolTranslations[role] || "noRole";

  return (
    <div className={styles.container}>
      <div className={styles.logo} onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" />
        <h1>Bitacora</h1>
      </div>
      <div className={styles.menu}>
        <div className={styles.userInfo}>
          <p className={styles.userName}>
            {getFullName(storedUser.data.name, storedUser.data.surname)}
          </p>
          <p className={styles.userRole}>
            {storedUser.data.position} [{translateRole(storedUser.data.role)}]
          </p>
        </div>
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Header;
