import React from "react";
import Draggable from "react-draggable";
import { X, Maximize2, Check } from "lucide-react";
import Select from "react-select";

import MiniMap from "../../components/MiniMap/MiniMap";

import styles from "./editPopup.module.css";

const EditPopup = ({
  id,
  localReport,
  localReports,
  fullWindow,
  popupPositions,
  report,
  responders,
  events,
  entries,
  bringToFront,
  setFullWindow,
  closeEditReport,
  handleChange,
  handleMapLocationChange,
}) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = storedUser.data.isAdmin;

  const colourStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "#1A2332",
      borderColor: "#1A2332",
      fontSize: 14,
      color: "#FFFFFF",
      border: "1px solid #3C4554",
    }),
    option: (styles) => ({
      ...styles,
      backgroundColor: "#1A2332",
      padding: 10,
      fontSize: 14,
      color: "#FFFFFF",
      ":hover": {
        backgroundColor: "#2c3e50",
        cursor: "pointer",
      },
    }),
    placeholder: (styles) => ({
      ...styles,
      fontSize: 14,
      color: "#FFFFFF",
    }),
    singleValue: (styles) => ({
      ...styles,
      fontSize: 14,
      color: "#FFFFFF",
    }),
    input: (styles) => ({
      ...styles,
      color: "#FFFFFF",
      fontSize: 14,
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: "#1A2332",
      color: "#FFFFFF",
      border: "1px solid #3C4554",
    }),
    menuList: (styles) => ({
      ...styles,
      backgroundColor: "#1A2332",
    }),
  };

  const renderEventOptions = (event, eventOptionName) =>
    event.options.length > 0 && (
      <div className={styles.eventOptionsContainer}>
        <label>Opción del Evento</label>
        {event.options.map((option, index) => (
          <div key={index} className={styles.eventOption}>
            <input
              type="radio"
              name={eventOptionName}
              value={option.value.name}
              checked={localReport[eventOptionName] === option.value.name}
              onChange={(e) => handleChange(e, id)}
            />
            <label>{option.value.name}</label>
          </div>
        ))}
      </div>
    );

  const renderSelect = (label, name, value, options) => (
    <div>
      <label>{label}</label>
      <Select
        styles={colourStyles}
        className={styles.select}
        name={name}
        value={{
          value: value,
          label: value ? value : `Seleccionar ${label.toLowerCase()}`,
        }}
        onChange={(selectedOption) =>
          handleChange(
            {
              target: {
                name: name,
                value: selectedOption.value,
              },
            },
            id
          )
        }
        options={options.map((option) => ({
          value: option.name,
          label: option.name,
        }))}
      />
    </div>
  );

  const correctText = async (text) => {
    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          text: text,
          language: "es",
        }),
      });

      const data = await response.json();
      let correctedText = text;

      // Aplicar las correcciones desde el final para no afectar los índices
      data.matches.reverse().forEach((match) => {
        const replacement =
          match.replacements[0]?.value !== undefined
            ? match.replacements[0].value
            : match.context.text.substring(
                match.context.offset,
                match.context.offset + match.context.length
              );
        correctedText =
          correctedText.substring(0, match.offset) +
          replacement +
          correctedText.substring(match.offset + match.length);
      });

      handleChange(
        {
          target: {
            name: "story",
            value: correctedText,
          },
        },
        id
      );
    } catch (error) {
      console.error("Error al corregir el texto:", error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "open":
        return styles.greenDot;
      case "sent":
        return styles.blueDot;
      case "pending":
        return styles.yellowDot;
      case "inProgress":
        return styles.orangeDot;
      case "close":
      default:
        return styles.redDot;
    }
  };

  return (
    <Draggable key={id} handle={`#popup-header-${id}`}>
      <div
        id={`popup-${id}`}
        className={fullWindow ? styles.fullWindowPopup : styles.windowPopup}
        style={popupPositions[id]}
        onClick={() => bringToFront(id)}
      >
        <div id={`popup-header-${id}`} className={styles.popupHeader}>
          <div className={styles.headerTitle}>
            <h2>Editando Reporte {report.code}</h2>
            <p className={getStatusClass(report.status)}></p>
          </div>
          <div className={styles.headerButtons}>
            <Maximize2
              onClick={() => setFullWindow(!fullWindow)}
              className={styles.expandButton}
            />
            <X
              onClick={() => closeEditReport(id)}
              className={styles.closeButton}
            />
          </div>
        </div>
        <div className={styles.popupContent}>
          <div className={styles.gridSection}>
            {/* Sección Ubicación */}
            <div className={styles.sectionContainer}>
              <h3>Ubicación</h3>
              <MiniMap
                key={fullWindow}
                id={id}
                onLocationChange={(locationInfo) =>
                  handleMapLocationChange(id, locationInfo)
                }
                localReports={localReports}
              />
            </div>

            {/* Sección Intervinientes */}
            <div className={styles.sectionContainer}>
              <h3>Intervinientes y eventos</h3>
              {renderSelect(
                "Primer Interviniente",
                "firstResponder",
                localReport.firstResponder,
                responders
              )}
              {renderSelect(
                "Segundo Interviniente",
                "secondResponder",
                localReport.secondResponder,
                responders
              )}
              {renderSelect(
                "Primer Evento",
                "firstEvent",
                localReport.firstEvent,
                events
              )}
              {events.map(
                (event, index) =>
                  event.name === localReport.firstEvent &&
                  renderEventOptions(event, "firstEventOption")
              )}
              {renderSelect(
                "Segundo Evento",
                "secondEvent",
                localReport.secondEvent,
                events
              )}
              {events.map(
                (event, index) =>
                  event.name === localReport.secondEvent &&
                  renderEventOptions(event, "secondEventOption")
              )}
            </div>
          </div>

          {/* Sección Historia y Aclaraciones */}
          <div className={styles.sectionContainer}>
            <h3>Historia</h3>
            <div>
              <div className={styles.storyHeader}>
                <label>Redacción de la historia</label>
                <button
                  className={styles.correctButton}
                  onClick={() => correctText(localReport.story)}
                  title="Corregir ortografía"
                >
                  <Check size={16} /> Corregir
                </button>
              </div>
              <textarea
                id="story"
                name="story"
                value={localReport.story || ""}
                onChange={(e) => handleChange(e, id)}
                placeholder="Ingrese la historia detallada del evento..."
              />
            </div>
          </div>

          {/* Sección Detalles del Evento */}
          <div className={styles.sectionContainer}>
            <h3>Detalles del Evento</h3>
            <div>
              <label>Tiempo de Llegada del Móvil</label>
              <input
                type="time"
                placeholder="HH:MM"
                name="mobileArrivalTime"
                value={localReport.mobileArrivalTime || ""}
                onChange={(e) => handleChange(e, id)}
              />
            </div>
            {isAdmin && (
              <div>
                <label>Estado del Reporte</label>
                <select
                  name="status"
                  value={localReport.status || ""}
                  onChange={(e) => handleChange(e, id)}
                >
                  <option value="open">Abierto</option>
                  <option value="sent">Enviado</option>
                  <option value="pending">Pendiente</option>
                  <option value="inProgress">En Proceso</option>
                  <option value="close">Cerrado</option>
                </select>
              </div>
            )}
            <div>
              <label>Ingreso de Novedad</label>
              <Select
                styles={colourStyles}
                className={styles.select}
                name="storyEntrie"
                value={{
                  value: localReport.storyEntrie,
                  label: localReport.storyEntrie
                    ? localReport.storyEntrie
                    : "Seleccionar tipo de novedad",
                }}
                onChange={(selectedOption) =>
                  handleChange(
                    {
                      target: {
                        name: "storyEntrie",
                        value: selectedOption.value,
                      },
                    },
                    id
                  )
                }
                options={entries.map((entrie) => ({
                  value: entrie.name,
                  label: entrie.name,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  );
};

export default EditPopup;
