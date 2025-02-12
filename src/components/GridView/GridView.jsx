import React from "react";
import {
  Tag,
  Eye,
  Pencil,
  Clock,
  NotepadText,
  MapPin,
  LogIn,
} from "lucide-react";

import styles from "./gridView.module.css";

const GridView = ({
  filteredReports,
  listOfHighPriorities,
  listOfMediumPriorities,
  listOfLowPriorities,
  editReport,
  viewReport,
  viewMode,
}) => {
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const canEdit = storedUser.data.canEdit;

  const getPriorityClass = (report) => {
    if (
      listOfHighPriorities.includes(report.firstEvent) ||
      listOfHighPriorities.includes(report.secondEvent)
    ) {
      return `${styles.gridItem} ${styles.highPriority}`;
    }
    if (
      listOfMediumPriorities.includes(report.firstEvent) ||
      listOfMediumPriorities.includes(report.secondEvent)
    ) {
      return `${styles.gridItem} ${styles.mediumPriority}`;
    }
    if (
      listOfLowPriorities.includes(report.firstEvent) ||
      listOfLowPriorities.includes(report.secondEvent)
    ) {
      return `${styles.gridItem} ${styles.lowPriority}`;
    }
    return styles.gridItem;
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

  const formatLocation = (location) => {
    if (!location) return "";
    const parts = location.split(" - ");
    const addressParts = parts[0].split(", ");
    let street = "";
    let number = "";
    let locality = "";

    if (addressParts.length === 3) {
      street = addressParts[0];
      number = addressParts[2];
      locality = parts[1].split(", ")[2];
    } else if (addressParts.length === 2) {
      number = addressParts[0];
      street = parts[1].split(", ")[0];
      locality = parts[1].split(", ")[1];
    } else {
      number = addressParts[0];
      street = parts[1].split(", ")[0];
      locality = parts[1].split(", ")[1];
    }

    return `${street} ${number}, ${locality}`;
  };

  return (
    <div className={viewMode ? styles.list : styles.grid}>
      {filteredReports.map((report, index) => (
        <div key={index} className={getPriorityClass(report)}>
          <div className={styles.subContainer}>
            <div className={styles.title}>
              <p className={getStatusClass(report.status)}></p>
              <h2>
                {report.firstEvent}
                {report.secondEvent && `, ${report.secondEvent}`}
              </h2>
            </div>
            <div className={styles.options}>
              {canEdit && (
                <div className={styles.icon}>
                  <Pencil
                    onClick={() => editReport(report._id)}
                    color="#619CEC"
                  />
                </div>
              )}
              <div className={styles.icon}>
                <Eye onClick={() => viewReport(report._id)} color="#619CEC" />
              </div>
            </div>
          </div>
          <div className={styles.info}>
            <div className={viewMode ? styles.hInfo : styles.vInfo}>
              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <MapPin color="#619CEC" />
                </div>
                <p>{formatLocation(report.location)}</p>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <Clock color="#619CEC" />
                </div>
                <p>
                  {report.date.split("T")[0].split("-").reverse().join("/")}{" "}
                  {report.date
                    .split("T")[1]
                    .split(".")[0]
                    .split(":")
                    .slice(0, 2)
                    .join(":")}
                </p>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <Tag color="#619CEC" />
                </div>
                <p>{report.code}</p>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.icon}>
                  <LogIn color="#619CEC" />
                </div>
                <p>{report.storyEntrie}</p>
              </div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.icon}>
                <NotepadText color="#619CEC" />
              </div>
              <p className={styles.storyText}>{report.story}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView;
