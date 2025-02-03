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

  const getFullName = (name, surname) => {
    const fullName = name.split(" ");
    const firstName = fullName[0];
    const secondName = fullName.slice(1).join(" ");
    return { fullName: `${secondName} ${firstName}`, surname };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setIsLogged(true);
      const user = JSON.parse(storedUser);
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
      userData.data.role = role;
      userData.data.isAdmin = userData.data.position === "Supervisor";
      userData.data.canEdit = ["Operador", "Supervisor"].includes(
        userData.data.position
      );
      localStorage.setItem("user", JSON.stringify(userData));
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

  const logout = () => {
    socket.disconnect();
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
    </div>
  );
};

export default App;
