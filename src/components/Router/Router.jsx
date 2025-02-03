import { Routes, Route } from "react-router-dom";
import Home from "../../screens/Home/Home";
import Report from "../../screens/Report/Report";

const Router = ({ socket, connectedUsers }) => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home connectedUsers={connectedUsers} />}
      />
      <Route path="/report" element={<Report socket={socket} />} />
    </Routes>
  );
};

export default Router;
