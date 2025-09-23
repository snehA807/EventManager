import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import ClubLogin from "./pages/ClubLogin";
import Clubs from "./pages/clubs";
import ClubDetails from "./pages/ClubDetails";
import About from "./pages/About";
import Liveupdates from './pages/Liveupdates';
import ClubDashboard from "./pages/ClubDashboard"; 
import ClubLogin from "./pages/ClubLogin"; 
import Members from "./pages/Members";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register/>}/>
          <Route path="/club-login" element={<ClubLogin />} />
          <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/:id" element={<ClubDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/live-updates" element={<Liveupdates />} />


<Route path="/members" element={<Members />} />

        <Route path="/club-dashboard" element={<ClubDashboard />} />
      
      
      </Routes>
    </Router>
  );
}

export default App;
