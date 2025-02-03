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
    </div>
  );
};

export default Home;
