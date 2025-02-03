import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Tag,
  Calendar,
  Plus,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";

import GridView from "../../components/GridView/GridView";
import EditPopup from "../../components/EditPopup/EditPopup";
import ViewPopup from "../../components/ViewPopup/ViewPopup";

import "react-datepicker/dist/react-datepicker.css";
import styles from "./report.module.css";

const Report = ({ socket }) => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = storedUser.data.isAdmin;
  const canEdit = storedUser.data.canEdit;
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entries, setEntries] = useState([]);
  const [responders, setResponders] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [editingReports, setEditingReports] = useState([]);
  const [viewingReports, setViewingReports] = useState([]);
  const [zIndex, setZIndex] = useState(1000);
  const [popupPositions, setPopupPositions] = useState({});
  const [localReports, setLocalReports] = useState({});
  const [fullWindow, setFullWindow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const priorityLists = {
    high: [
      "Abuso",
      "Accidente",
      "Alarma",
      "Amenazas",
      "Operativo",
      "Demorado",
      "Enfrentamiento armado",
      "Escruche",
      "Herido con arma",
      "Homicidio",
      "Incendio",
      "Ingreso no autorizado",
      "Suicidio",
      "Persona armada",
      "Piratería del asfalto",
      "Privación de la libertad",
      "Robo",
      "Violación",
      "Violencia",
    ],
    medium: [
      "Acoso",
      "Averiguación",
      "Venta de estupefacientes",
      "Maniobras peligrosas",
      "Emergencia",
      "Estafa",
      "Evento municipal",
      "Corte de pulsera",
      "Ciudadano extraviado",
      "Estafa",
      "Hurto",
      "Ley",
      "Secuestro de arma de fuego",
      "Persecución",
      "Resistencia a la autoridad",
      "Usurpación",
      "Detonaciones de arma de fuego",
      "Fiscalización",
      "Hallazgo de arma de fuego",
      "Restos óseos",
    ],
    low: [
      "Allanamiento",
      "Anillo digital",
      "Apoyo",
      "Aprehensión",
      "Animales sueltos",
      "Colaboración",
      "Recupero de bien",
      "Conflicto",
      "Consumo de sustancias",
      "Contravención",
      "Daños",
      "Disturbios",
      "Exhibicionismo",
      "Hallazgo",
      "Identificación",
      "Lesiones",
      "Maltrato animal",
      "Menor extraviado",
      "Identificación N/N",
      "Óbito",
      "Resguardo de bien",
      "Patrullaje preventivo",
      "Pedido de auxilio",
      "Patruya ambiental",
      "Ruidos molestos",
      "Tránsito",
      "Vandalismo",
      "Zoonosis",
      "Seguimiento del COM",
      "Desarrollo humano",
    ],
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/getReports`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setReports(data.reverse());
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const responses = await Promise.all([
        fetch(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/entrie/getEntries`
        ),
        fetch(
          `${
            import.meta.env.VITE_REACT_APP_API_URL
          }/api/responder/getResponders`
        ),
        fetch(`${import.meta.env.VITE_REACT_APP_API_URL}/api/event/getEvents`),
      ]);

      const [entrieResponse, responderResponse, eventResponse] = responses;

      if (!entrieResponse.ok || !responderResponse.ok || !eventResponse.ok) {
        throw new Error("Network response was not ok");
      }

      const [entrieData, responderData, eventData] = await Promise.all([
        entrieResponse.json(),
        responderResponse.json(),
        eventResponse.json(),
      ]);

      const entries = entrieData
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((entrie) => ({
          _id: entrie._id,
          name: entrie.name,
        }));

      const responders = responderData
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((responder) => ({
          _id: responder._id,
          name: responder.name,
        }));

      const events = eventData
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((event) => ({
          _id: event._id,
          name: event.name,
          options: event.options
            ? event.options.map((option) => ({
                label: option,
                value: option,
              }))
            : [],
        }));

      setEntries(entries);
      setResponders(responders);
      setEvents(events);
    } catch (error) {
      setError(error);
    }
  };

  const createReport = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const fullName = storedUser.data.name + " " + storedUser.data.surname;
      const names = fullName.split(" ");
      const reorderedName = names.slice(1).join(" ") + " " + names[0];

      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/report/createReport`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operator: reorderedName,
            docket: storedUser.data.docket,
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setReports([data.data, ...reports]);
      editReport(data.data._id);
    } catch (error) {
      console.error("Error creando reporte:", error);
    }
  };

  const editReport = (id) => {
    if (editingReports.length < 4 && !editingReports.includes(id)) {
      const nextPositionIndex = getNextAvailablePosition(editingReports);
      setEditingReports([...editingReports, id]);
      setPopupPositions({
        ...popupPositions,
        [id]: getPopupPosition(nextPositionIndex),
      });

      const report = reports.find((report) => report._id === id);
      if (report) {
        setLocalReports((prevReports) => ({
          ...prevReports,
          [id]: {
            firstResponder: report.firstResponder || "",
            firstEventOption: report.firstEventOption || "",
            secondResponder: report.secondResponder || "",
            secondEventOption: report.secondEventOption || "",
            status: report.status || "",
            location: report.location || "",
            locality: report.locality || "",
            jurisdiction: report.jurisdiction || "",
            cameraOnSite: report.nearbyCameras || "",
            firstEvent: report.firstEvent || "",
            secondEvent: report.secondEvent || "",
            story: report.story || "",
            storyEntrie: report.storyEntrie || "",
            mobileArrivalTime: report.mobileArrivalTime || "",
            latitude: report.latitude || "",
            longitude: report.longitude || "",
          },
        }));
      }
    }
  };

  const closeEditReport = (id) => {
    setEditingReports(editingReports.filter((reportId) => reportId !== id));
    const newPositions = { ...popupPositions };
    delete newPositions[id];
    setPopupPositions(newPositions);
  };

  const getNextAvailablePosition = (reports) => {
    const usedPositions = Object.values(popupPositions);
    const allPositions = [
      { top: "10px", left: "10px" },
      { top: "10px", right: "10px" },
      { bottom: "10px", left: "10px" },
      { bottom: "10px", right: "10px" },
    ];

    for (let i = 0; i < allPositions.length; i++) {
      if (
        !usedPositions.some(
          (pos) =>
            pos.top === allPositions[i].top && pos.left === allPositions[i].left
        )
      ) {
        return i;
      }
    }
    return 0;
  };

  const getPopupPosition = (index) => {
    const positions = [
      { top: "10px", left: "10px" },
      { top: "10px", right: "10px" },
      { bottom: "10px", left: "10px" },
      { bottom: "10px", right: "10px" },
    ];
    return positions[index];
  };

  const bringToFront = (id) => {
    setZIndex(zIndex + 1);
    document.getElementById(`popup-${id}`).style.zIndex = zIndex + 1;
  };

  const viewReport = (id) => {
    if (viewingReports.length < 4 && !viewingReports.includes(id)) {
      const nextPositionIndex = getNextAvailablePosition(viewingReports);
      setViewingReports([...viewingReports, id]);
      setPopupPositions({
        ...popupPositions,
        [`view-${id}`]: getPopupPosition(nextPositionIndex),
      });
    }
  };

  const closeViewReport = (id) => {
    setViewingReports(viewingReports.filter((reportId) => reportId !== id));
    const newPositions = { ...popupPositions };
    delete newPositions[`view-${id}`];
    setPopupPositions(newPositions);
  };

  const handleCreateReport = () => {
    setShowConfirmation(true);
  };

  const confirmCreateReport = () => {
    setShowConfirmation(false);
    createReport();
  };

  const cancelCreateReport = () => {
    setShowConfirmation(false);
  };

  useEffect(() => {
    fetchReports();
    fetchParticipants();

    const interval = setInterval(() => {
      fetchReports();
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (editingReports.length > 0) {
      const id = editingReports[editingReports.length - 1];
      socket.emit("joinRoom", id);

      socket.on("updateField", ({ id, name, value, role }) => {
        setLocalReports((prevReports) => ({
          ...prevReports,
          [id]: {
            ...prevReports[id],
            [name]: value,
            role: role,
          },
        }));
      });
    }

    return () => {
      if (editingReports.length > 0) {
        const id = editingReports[editingReports.length - 1];
        socket.emit("leaveRoom", id);
        socket.off("updateField");
      }
    };
  }, [editingReports]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setEditingReports([]);
        setViewingReports([]);
        setPopupPositions([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleChange = (e, id) => {
    const { name, value } = e.target;

    setLocalReports((prevReports) => ({
      ...prevReports,
      [id]: {
        ...prevReports[id],
        [name]: value,
      },
    }));

    socket.emit("editFields", {
      id,
      changes: [{ name, value }],
      user: `${storedUser.data.surname} ${storedUser.data.name}`,
      role: storedUser.data.role,
    });
  };

  const handleMapLocationChange = (id, locationInfo) => {
    const {
      address,
      latitude,
      longitude,
      jurisdiccion,
      localidad,
      nearbyCameras,
    } = locationInfo;

    setLocalReports((prevReports) => ({
      ...prevReports,
      [id]: {
        ...prevReports[id],
        location: address,
        latitude,
        longitude,
        jurisdiction: jurisdiccion,
        locality: localidad,
        cameraOnSite: nearbyCameras,
      },
    }));

    socket.emit("editFields", {
      id,
      changes: [
        { name: "location", value: address },
        { name: "latitude", value: latitude },
        { name: "longitude", value: longitude },
        { name: "jurisdiction", value: jurisdiccion },
        { name: "locality", value: localidad },
        { name: "cameraOnSite", value: nearbyCameras },
      ],
      user: `${storedUser.data.surname} ${storedUser.data.name}`,
    });
  };

  useEffect(() => {
    const filterReports = () => {
      if (!Array.isArray(reports)) return [];
      const searchTerms = searchTerm.toLowerCase().split(" ");
      return reports.filter((report) => {
        const reportDate = new Date(report.date);
        if (isNaN(reportDate)) {
          console.error("Fecha inválida:", report.date);
          return false;
        }
        reportDate.setHours(0, 0, 0, 0);
        const isWithinDateRange =
          (!startDate ||
            reportDate >= new Date(startDate).setHours(0, 0, 0, 0)) &&
          (!endDate || reportDate <= new Date(endDate).setHours(0, 0, 0, 0));
        const matchesEvent =
          selectedEvent === "all" ||
          (report.firstEvent &&
            report.firstEvent.toLowerCase() === selectedEvent.toLowerCase()) ||
          (report.secondEvent &&
            report.secondEvent.toLowerCase() === selectedEvent.toLowerCase());
        const matchesStatus =
          selectedStatus === "all" ||
          (selectedStatus === "open" && report.status === "open") ||
          (selectedStatus === "sent" && report.status === "sent") ||
          (selectedStatus === "pending" && report.status === "pending") ||
          (selectedStatus === "inProgress" && report.status === "inProgress") ||
          (selectedStatus === "close" && report.status === "close");

        const matchesSearchTerm = searchTerms.every((term) =>
          [
            report._id,
            report.hour,
            report.status,
            report.code,
            report.operator,
            report.docket,
            report.date,
            report.story,
            report.firstEvent,
            report.cameraOnSite,
            report.jurisdiction,
            report.latitude,
            report.locality,
            report.location,
            report.longitude,
            report.firstResponder,
            report.secondResponder,
            report.secondEvent,
            report.mobileArrivalTime,
            report.responseTime,
            report.storyEntrie,
            report.firstEventOption,
            report.secondEventOption,
          ]
            .map((field) => (field ? field.toString().toLowerCase() : ""))
            .some((field) => field.includes(term))
        );

        const isClosedReportVisible = isAdmin || report.status !== "close";

        return (
          isWithinDateRange &&
          matchesEvent &&
          matchesStatus &&
          matchesSearchTerm &&
          isClosedReportVisible
        );
      });
    };
    setFilteredReports(filterReports());
  }, [
    reports,
    startDate,
    endDate,
    selectedEvent,
    selectedStatus,
    searchTerm,
    isAdmin,
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedReports = Array.from(filteredReports);
    const [movedReport] = reorderedReports.splice(result.source.index, 1);
    reorderedReports.splice(result.destination.index, 0, movedReport);

    setFilteredReports(reorderedReports);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainTitle}>
        <div>
          <h1>Eventos</h1>
          <p>Sistema de gestion de eventos</p>
        </div>
        <div className={styles.viewMode}>
          <p onClick={() => setViewMode(!viewMode)}>
            {viewMode ? <LayoutGrid /> : <Rows3 />}
          </p>
        </div>
      </div>
      <div className={styles.search}>
        <div className={styles.searchInput}>
          <Search className={styles.icon} color="#619CEC" />
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          <div className={styles.filterType}>
            <Tag className={styles.icon} color="#619CEC" />
            <select
              name="type"
              id="type"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="all">Eventos</option>
              {events.map((type, index) => (
                <option key={index} value={type}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterType}>
            <Filter className={styles.icon} color="#619CEC" />
            <select
              name="status"
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Estados</option>
              <option value="open">Abierto</option>
              <option value="sent">Enviado</option>
              <option value="pending">Pendiente</option>
              <option value="inProgress">En Proceso</option>
              <option value="close">Cerrado</option>
            </select>
          </div>
          <div className={styles.filterType}>
            <Calendar className={styles.icon} color="#619CEC" />
            <DatePicker
              className={styles.datePicker}
              dateFormat="dd/MM/yyyy"
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
              }}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Desde"
            />

            <DatePicker
              className={styles.datePicker}
              dateFormat="dd/MM/yyyy"
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
              }}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Hasta"
            />
          </div>
        </div>
      </div>
      <GridView
        filteredReports={filteredReports}
        listOfHighPriorities={priorityLists.high}
        listOfMediumPriorities={priorityLists.medium}
        listOfLowPriorities={priorityLists.low}
        editReport={editReport}
        viewReport={viewReport}
        viewMode={viewMode}
      />
      <div className={styles.menu}>
        <div
          onClick={canEdit ? handleCreateReport : null}
          className={styles.mainButton}
        >
          <Plus className={styles.icon} />
          Nuevo Evento
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
      {editingReports.map((id) => {
        const report = reports.find((report) => report._id === id);
        if (!report) return null;
        const localReport = localReports[id] || {};
        return (
          <EditPopup
            id={id}
            localReport={localReport}
            localReports={localReports}
            fullWindow={fullWindow}
            popupPositions={popupPositions}
            report={report}
            responders={responders}
            events={events}
            entries={entries}
            bringToFront={bringToFront}
            setFullWindow={setFullWindow}
            closeEditReport={closeEditReport}
            handleChange={handleChange}
            handleMapLocationChange={handleMapLocationChange}
          />
        );
      })}
      {viewingReports.map((id) => {
        const report = reports.find((report) => report._id === id);
        if (!report) return null;
        return (
          <ViewPopup
            id={id}
            fullWindow={fullWindow}
            popupPositions={popupPositions}
            report={report}
            bringToFront={bringToFront}
            setFullWindow={setFullWindow}
            closeViewReport={closeViewReport}
          />
        );
      })}
      {showConfirmation && (
        <div className={styles.confirmationPopup}>
          <div className={styles.confirmationContent}>
            <h2>¿Desea crear un nuevo evento?</h2>
            <div className={styles.confirmationButtons}>
              <button
                className={`${styles.confirmationButton} ${styles.confirmButton}`}
                onClick={confirmCreateReport}
              >
                Confirmar
              </button>
              <button
                className={`${styles.confirmationButton} ${styles.cancelButton}`}
                onClick={cancelCreateReport}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
