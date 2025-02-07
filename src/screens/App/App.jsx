import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // Importar socket.io-client

import Router from "../../components/Router/Router";
import Login from "../../screens/Login/Login";
import Header from "../../components/Header/Header";

import styles from "./app.module.css";

const App = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const getFullName = (name, surname) => {
    const fullName = name.split(" ");
    const firstName = fullName[0];
    const secondName = fullName.slice(1).join(" ");
    return { fullName: `${secondName} ${firstName}`, surname };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.data.password) {
        setIsLogged(true);
        const newSocket = io(import.meta.env.VITE_REACT_APP_API_URL);
        setSocket(newSocket);
        const { fullName, surname } = getFullName(
          user.data.name,
          user.data.surname
        );
        newSocket.emit("userConnected", {
          name: fullName,
          surname: surname,
          role: user.data.role,
        });
        if (user.data.position === "Operador") {
          navigate("/report");
        }
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on("connectedUsers", (users) => {
        setConnectedUsers(users);
      });

      return () => {
        socket.off("connectedUsers");
      };
    }
  }, [socket]);

  const fetchData = async (username, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/getUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching user:`, error);
      throw error;
    }
  };

  const login = async (username, password, role) => {
    try {
      const userData = await fetchData(username, password);
      if (userData.data.password && password === userData.data.docket) {
        alert("Debe usar su nueva contraseña para iniciar sesión.");
        return;
      }
      userData.data.role = role;
      userData.data.isAdmin = userData.data.position === "Supervisor";
      userData.data.canEdit = ["Operador", "Supervisor"].includes(
        userData.data.position
      );
      localStorage.setItem("user", JSON.stringify(userData));
      if (!userData.data.password) {
        setShowPasswordPopup(true);
        return;
      }
      setIsLogged(true);
      const newSocket = io(import.meta.env.VITE_REACT_APP_API_URL);
      setSocket(newSocket);
      const { fullName, surname } = getFullName(
        userData.data.name,
        userData.data.surname
      );
      newSocket.emit("userConnected", {
        name: fullName,
        surname: surname,
        role: userData.data.role,
      });
      if (userData.data.position === "Operador") {
        navigate("/report");
      }
    } catch (error) {
      console.error(`Error logging in:`, error);
      throw error;
    }
  };

  const handleSetPassword = async () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{5,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert("La contraseña debe tener al menos 5 caracteres, incluyendo al menos 1 letra y 1 número.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/user/setPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: storedUser.data.docket,
            password: newPassword,
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      storedUser.data.password = newPassword;
      localStorage.setItem("user", JSON.stringify(storedUser));
      setShowPasswordPopup(false);
      setIsLogged(true);
    } catch (error) {
      console.error(`Error setting password:`, error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSetPassword();
    }
  };

  const logout = () => {
    if (socket) {
      socket.disconnect();
    }
    localStorage.removeItem("user");
    navigate("/");
    setIsLogged(false);
  };

  return (
    <div className={styles.container}>
      {isLogged ? (
        <>
          <Header logout={logout} />
          <Router socket={socket} connectedUsers={connectedUsers} />
        </>
      ) : (
        <Login login={login} />
      )}
      {showPasswordPopup && (
        <div className={styles.popup}>
          <h2>Establecer nueva contraseña</h2>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSetPassword}>Confirmar</button>
        </div>
      )}
    </div>
  );
};

export default App;