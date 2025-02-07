import React from "react";
import styles from "./easteregg.module.css";
import RickRoll from "../../assets/RickRoll.mp4";

const EasterEgg = () => {
  return (
    <div className={styles.container}>
      <h1>¡Easter Egg Secreto!</h1>
      <p>Has encontrado el Easter Egg secreto. ¡Felicidades!</p>
      <video className={styles.video} src={RickRoll} autoPlay controls />
      <p>Creadores: SrPino23, Keptul</p>
    </div>
  );
};

export default EasterEgg;
