import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Home from "./Pages/Home";
// import Login from "./Pages/Login";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default AppRoutes;
