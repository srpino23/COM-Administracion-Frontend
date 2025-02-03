import React from "react";
import Draggable from "react-draggable";
import { X, Maximize2, Clipboard } from "lucide-react";
import { writeText } from "clipboard-polyfill";

import styles from "./viewPopup.module.css";

const statusReport = {
  open: "Abierto",
  sent: "Enviado",
  pending: "Pendiente",
  inProgress: "En Proceso",
  close: "Cerrado",
};

const ViewPopup = ({
  id,
  fullWindow,
  popupPositions,
  report,
  bringToFront,
  setFullWindow,
  closeViewReport,
}) => {
  const copyInfo = (report) => {
    const text = `
Código: ${report.code}
Fecha: ${report.date.split("T")[0]}
Hora: ${report.hour}
Tiempo de respuesta: ${report.responseTime}
Estado: ${statusReport[report.status] || report.status}
Eventos: ${report.firstEvent} / ${report.secondEvent}
Recepción: ${report.storyEntry}
Ubicación: ${report.location}
Localidad: ${report.locality}
Jurisdiccion: ${report.jurisdiction}
Intervinientes: ${report.firstResponder} / ${report.secondResponder}
Cámaras: ${
      report.cameraOnSite && report.cameraOnSite.length > 0
        ? report.cameraOnSite.map((camera) => camera.direction).join(", ")
        : "-"
    }
Operador: ${report.operator}
Relato del hecho: ${report.story}
    `;
    writeText(text.trim()).then();
  };

  const renderSection = (title, fields) => (
    <div className={styles.sectionContainer}>
      <h3>{title}</h3>
      {fields.map(({ label, value }, index) => (
        <div key={index}>
          <label>{label}</label>
          <p>{value || "-"}</p>
        </div>
      ))}
    </div>
  );

  return (
    <Draggable key={id} handle={`#popup-header-${id}`}>
      <div
        id={`popup-view-${id}`}
        className={fullWindow ? styles.fullWindowPopup : styles.windowPopup}
        style={popupPositions[`view-${id}`]}
        onClick={() => bringToFront(`view-${id}`)}
      >
        <div id={`popup-header-${id}`} className={styles.popupHeader}>
          <div className={styles.headerTitle}>
            <h2>Viendo Reporte {report.code}</h2>
            <Clipboard
              onClick={() => copyInfo(report)}
              className={styles.copyButton}
            />
          </div>
          <div className={styles.headerButtons}>
            <Maximize2
              onClick={() => setFullWindow(!fullWindow)}
              className={styles.expandButton}
            />
            <X
              onClick={() => closeViewReport(id)}
              className={styles.closeButton}
            />
          </div>
        </div>
        <div className={styles.popupContent}>
          <div className={styles.gridSection}>
            {renderSection("Ubicación", [
              { label: "Dirección", value: report.location },
              { label: "Localidad", value: report.locality },
              { label: "Jurisdicción", value: report.jurisdiction },
              {
                label: "Cámaras en el Sitio",
                value: report.cameraOnSite
                  ? report.cameraOnSite.map((camera, index) => (
                      <p key={index}>{camera.direction}</p>
                    ))
                  : "-",
              },
            ])}
            {renderSection("Intervinientes", [
              { label: "Primer Interviniente", value: report.firstResponder },
              { label: "Segundo Interviniente", value: report.secondResponder },
              { label: "Primer Evento", value: report.firstEvent },
              {
                label: "Especificacion del Primer Evento",
                value: report.firstEventOption,
              },
              { label: "Segundo Evento", value: report.secondEvent },
              {
                label: "Especificacion del Segundo Evento",
                value: report.secondEventOption,
              },
            ])}
          </div>
          {renderSection("Historia", [
            { label: "Redaccion de la Historia", value: report.story },
          ])}
          {renderSection("Detalles del Evento", [
            {
              label: "Fecha",
              value: `${new Date(report.date).toLocaleDateString()} ${
                report.hour || "-"
              }`,
            },
            {
              label: "Tiempo de Llegada del Movil",
              value: report.mobileArrivalTime,
            },
            { label: "Tiempo de Respuesta", value: report.responseTime },
            {
              label: "Estado del Reporte",
              value: statusReport[report.status] || report.status,
            },
            { label: "Ingreso de Novedad", value: report.storyEntry },
            { label: "Operador", value: report.operator },
          ])}
        </div>
      </div>
    </Draggable>
  );
};

export default ViewPopup;
