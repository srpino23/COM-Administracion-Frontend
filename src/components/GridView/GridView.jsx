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
                <Pencil
                  onClick={() => editReport(report._id)}
                  className={styles.icon}
                  color="#619CEC"
                />
              )}
              <Eye
                onClick={() => viewReport(report._id)}
                className={styles.icon}
                color="#619CEC"
              />
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <MapPin className={styles.icon} color="#619CEC" />
              <p>{report.location}</p>
            </div>
            <div className={styles.infoItem}>
              <Clock className={styles.icon} color="#619CEC" />
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
              <Tag className={styles.icon} color="#619CEC" />
              <p>{report.code}</p>
            </div>
            <div className={styles.infoItem}>
              <LogIn className={styles.icon} color="#619CEC" />
              <p>{report.storyEntrie}</p>
            </div>
            <div className={styles.infoItem}>
              <NotepadText className={styles.icon} color="#619CEC" />
              <p>{report.story}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridView;
