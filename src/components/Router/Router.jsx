import { Routes, Route } from "react-router-dom";
import Home from "../../screens/Home/Home";
import Report from "../../screens/Report/Report";
import EasterEgg from "../../screens/EasterEgg/EasterEgg";

const Router = ({ socket, connectedUsers }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home connectedUsers={connectedUsers} />}
      />
      <Route path="/report" element={<Report socket={socket} />} />
      <Route path="/easter-egg" element={<EasterEgg />} />
    </Routes>
  );
};

export default Router;
