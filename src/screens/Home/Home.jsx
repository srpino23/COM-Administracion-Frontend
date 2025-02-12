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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [createdReports, setCreatedReports] = useState([]);
  const [editedReports, setEditedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedEditHistory, setSelectedEditHistory] = useState(null);

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
  }, [startDate, endDate]);

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/getReports`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      const filteredReports = data.filter((report) => {
        const reportDate = new Date(report.date);
        return reportDate >= startDate && reportDate <= endDate;
      });
      setReports(filteredReports.reverse());
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
      const ordenedFullName = `${employee.name.split(" ")[1]} ${
        employee.surname
      } ${employee.name.split(" ")[0]}`;
      const created = data.filter(
        (report) => report.operator === ordenedFullName
      );
      const edited = data.filter(
        (report) =>
          report.history && report.history.some((h) => h.user === fullName)
      );
      setCreatedReports(created);
      setEditedReports(edited);
    } catch (error) {
      setError(error);
    }
  };

  const viewEditHistory = (report) => {
    setSelectedReport(report);
    setSelectedEditHistory(null);
  };

  const viewEditDetails = (edit) => {
    setSelectedEditHistory(edit);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString.$date || dateString);
    return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleString();
  };

  const closePopup = () => {
    setSelectedEmployee(null);
    setCreatedReports([]);
    setEditedReports([]);
    setSelectedReport(null);
    setSelectedEditHistory(null);
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
          <h2>Reportes</h2>
        </div>
        <div className={styles.datePickers}>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className={styles.datePicker}
          />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            className={styles.datePicker}
          />
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
        <div className={styles.popup} style={{ width: "80%", height: "80%" }}>
          <div className={styles.popupHeader}>
            <h2>
              {selectedEmployee.name} {selectedEmployee.surname}
            </h2>
            <button className={styles.popupCloseButton} onClick={closePopup}>
              &times;
            </button>
          </div>
          <div className={styles.popupContent}>
            <div className={styles.operatorInfo}>
              <div className={styles.infoItem}>
                <strong>ID:</strong> {selectedEmployee._id}
              </div>
              <div className={styles.infoItem}>
                <strong>Turno:</strong> {selectedEmployee.shift}
              </div>
              <div className={styles.infoItem}>
                <strong>Legajo:</strong> {selectedEmployee.docket}
              </div>
              <div className={styles.infoItem}>
                <strong>Posición:</strong> {selectedEmployee.position}
              </div>
              <div className={styles.infoItem}>
                <strong>Fecha:</strong>{" "}
                {new Date(selectedEmployee.date).toLocaleDateString()}
              </div>
            </div>
            <div className={styles.columns}>
              <div className={styles.column}>
                <div className={styles.historySection}>
                  <h3>Reportes Creados</h3>
                  {createdReports.map((report, index) => (
                    <div key={index} className={styles.historyItem}>
                      <p>
                        <strong>Codigo:</strong> {report.code}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={styles.historySection}>
                  <h3>Reportes Editados</h3>
                  {editedReports.map((report, index) => (
                    <div
                      key={index}
                      className={`${styles.historyItem} ${
                        selectedReport && selectedReport.code === report.code
                          ? styles.selectedReport
                          : ""
                      }`}
                      onClick={() => viewEditHistory(report)}
                    >
                      <p>
                        <strong>Codigo:</strong> {report.code}
                      </p>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {new Date(report.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.column}>
                {selectedReport && (
                  <div className={styles.historySection}>
                    <h3>Historial de Ediciones</h3>
                    <div className={styles.historyList}>
                      {selectedReport.history.map((edit, index) => (
                        <div
                          key={index}
                          className={`${styles.historyItem} ${
                            selectedEditHistory === edit
                              ? styles.selectedReport
                              : ""
                          }`}
                          onClick={() => viewEditDetails(edit)}
                        >
                          <p>
                            <strong>Usuario:</strong> {edit.user}
                          </p>
                          <p>
                            <strong>Fecha:</strong> {formatDate(edit.timestamp)}
                          </p>
                          <p>
                            <strong>Cambios:</strong>{" "}
                            {Object.keys(edit.updates).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.column}>
                {selectedEditHistory && (
                  <div className={styles.detailsSection}>
                    <h3>Detalles de la Edición</h3>
                    <div className={styles.infoItem}>
                      <strong>Usuario:</strong> {selectedEditHistory.user}
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Fecha:</strong>{" "}
                      {formatDate(selectedEditHistory.timestamp)}
                    </div>
                    {Object.entries(selectedEditHistory.updates).map(
                      ([key, value], index) => (
                        <div key={index} className={styles.infoItem}>
                          <strong>{key}:</strong> {JSON.stringify(value)}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
