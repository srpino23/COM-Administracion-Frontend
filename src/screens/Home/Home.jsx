import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  ChartGantt,
  LineChart as LineChartIcon,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "./home.module.css";

const Home = ({ connectedUsers }) => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productivity, setProductivity] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const rolTranslations = {
    operator: "Monitoreo",
    dispatch: "Despacho",
    911: "911",
    multyagency: "Multiagencia",
    queries: "Consultas",
    eyesOnAlert: "Ojos en Alerta",
    administrative: "Administrativo",
  };

  useEffect(() => {
    fetchReports();
    fetchEmployees();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/getReports`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const today = new Date().toISOString().split("T")[0];
      const todayReports = data.filter((report) =>
        report.date.startsWith(today)
      );
      setReports(todayReports.reverse());
      calculateProductivity(data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/employee/getEmployees`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const operators = data.filter(
        (employee) => employee.position === "Operador"
      );
      setEmployees(operators);
      console.log(operators);
    } catch (error) {
      setError(error);
    }
  };

  const calculateProductivity = (reports) => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    const productivityData = days.map((day, index) => {
      const date = new Date();
      date.setDate(
        date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1) + index
      );
      const dayString = date.toISOString().split("T")[0];
      const reportsCount = reports.filter((r) =>
        r.date.startsWith(dayString)
      ).length;
      return { day, count: reportsCount };
    });

    setProductivity(productivityData);
  };

  const translateRole = (role) => rolTranslations[role] || "noRole";

  const countReportsByShift = (reports) => {
    const shifts = { Mañana: 0, Tarde: 0, Noche: 0 };
    reports.forEach((report) => {
      const hour = new Date(report.date).getHours();
      if (hour >= 6 && hour < 14) {
        shifts.Mañana++;
      } else if (hour >= 14 && hour < 22) {
        shifts.Tarde++;
      } else {
        shifts.Noche++;
      }
    });
    return shifts;
  };

  const reportCounts = countReportsByShift(reports);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const data = productivity.map((day) => ({
    name: day.day,
    reportes: day.count,
  }));

  const handleEmployeeClick = async (employee) => {
    setSelectedEmployee(employee);
    await fetchEmployeeHistory(employee);
  };

  const fetchEmployeeHistory = async (employee) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/getReports`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const fullName = `${employee.surname} ${employee.name}`;
      const history = data
        .filter(
          (report) =>
            report.history && report.history.some((h) => h.user === fullName)
        )
        .map((report) => report.history.filter((h) => h.user === fullName))
        .flat();
      setEmployeeHistory(history);
    } catch (error) {
      setError(error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString.$date || dateString);
    return isNaN(date) ? "Fecha inválida" : date.toLocaleString();
  };

  const closePopup = () => {
    setSelectedEmployee(null);
    setEmployeeHistory([]);
  };

  const filteredEmployees = employees.filter((employee) =>
    `${employee.name} ${employee.surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Users />
          <h2>Personas Conectadas</h2>
        </div>
        <div className={styles.userList}>
          {connectedUsers.map((user) => (
            <div key={user.id} className={styles.user}>
              <div className={styles.avatar}>
                <User />
              </div>
              <div>
                {user.name} {user.surname} [{translateRole(user.role)}]
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <ChartGantt />
          <h2>Reportes del Día</h2>
        </div>
        <div className={styles.bigNumber}>{reports.length}</div>
        <div className={styles.reportsBreakdown}>
          {Object.entries(reportCounts).map(([shift, count], index) => (
            <div key={index} className={styles.reportRow}>
              <span>{shift}</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progress}
                  style={{ width: `${(count / reports.length) * 100}%` }}
                ></div>
              </div>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <LineChartIcon />
          <h2>Productividad General</h2>
        </div>
        <div className={styles.productivityChart}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="chart-grid"
              />
              <XAxis dataKey="name" className="chart-axis" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f1f1f",
                  border: "1px solid #333",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "#999" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="reportes"
                className="chart-line"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.menu}>
        <div className={styles.mainButton}>
          <Plus className={styles.icon} />
        </div>
        <div className={styles.menuOptions}>
          <button
            onClick={() => navigate("/")}
            className={styles.menuOptionButton}
          >
            Inicio
          </button>
          <button
            onClick={() => navigate("/report")}
            className={styles.menuOptionButton}
          >
            Reportes
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Users />
          <h2>Operadores</h2>
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.employeeList}>
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className={styles.user}
              onClick={() => handleEmployeeClick(employee)}
            >
              <div className={styles.avatar}>
                <User />
              </div>
              <div>
                {employee.name} {employee.surname}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEmployee && (
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            <h2>
              {selectedEmployee.name} {selectedEmployee.surname}
            </h2>
            <button className={styles.popupCloseButton} onClick={closePopup}>
              &times;
            </button>
          </div>
          <div className={styles.popupContent}>
            <p>
              <strong>ID:</strong> {selectedEmployee._id}
            </p>
            <p>
              <strong>Turno:</strong> {selectedEmployee.shift}
            </p>
            <p>
              <strong>Legajo:</strong> {selectedEmployee.docket}
            </p>
            <p>
              <strong>Posición:</strong> {selectedEmployee.position}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(selectedEmployee.date).toLocaleDateString()}
            </p>
            <div className={styles.historySection}>
              <h3>Historial</h3>
              {employeeHistory.map((historyItem, index) => (
                <div key={index} className={styles.historyItem}>
                  <p>
                    <strong>Usuario:</strong> {historyItem.user}
                  </p>
                  <p>
                    <strong>Rol:</strong> {historyItem.role || "N/A"}
                  </p>
                  <p>
                    <strong>Actualización:</strong>{" "}
                    {Object.values(historyItem.updates).join(", ")}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formatDate(historyItem.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
