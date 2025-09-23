import React, { useState, useEffect } from "react";
import { Bell, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Import your logo

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bgBlack, setBgBlack] = useState(false);
  const navigate = useNavigate();

  const handleScroll = () => {
    setBgBlack(window.scrollY > 50);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCloseMenu = () => setIsOpen(false);

  const handleClubsClick = () => {
    navigate("/clubs");
    setIsOpen(false);
  };

  const handleBellClick = () => {
    navigate("/live-updates");
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${
        bgBlack ? "bg-black shadow-lg" : "bg-transparent"
      } text-white`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Heading */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Logo" className="h-20 w-20 mr-2" /> {/* Logo added */}
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-red-500">UEvents</h1>
              <span className="text-sm text-gray-300">University Event Hub</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/events" className="hover:text-red-500">
              Events
            </Link>

            <button
              onClick={handleClubsClick}
              className="border border-transparent px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Clubs
            </button>

            <Link to="/about" className="hover:text-red-500">
              About
            </Link>

            <Link
              to="/club-login"
              className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-700 transition"
            >
              Club Login
            </Link>

            <Link
              to="/login"
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Student Login
            </Link>

            {/* Desktop Bell Button */}
            <button
              className="relative p-2 hover:text-red-500"
              onClick={handleBellClick}
            >
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-red-500 focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 text-white px-4 py-3 space-y-2">
          <Link to="/events" className="block hover:text-red-500" onClick={handleCloseMenu}>
            Events
          </Link>

          <button
            onClick={handleClubsClick}
            className="block w-full text-left border border-transparent px-4 py-2 rounded hover:bg-gray-700 transition"
          >
            Clubs
          </button>

          <Link to="/about" className="block hover:text-red-500" onClick={handleCloseMenu}>
            About
          </Link>

          <Link
            to="/club-login"
            className="block border border-gray-400 px-4 py-2 rounded hover:bg-gray-700 transition"
            onClick={handleCloseMenu}
          >
            Club Login
          </Link>

          <Link
            to="/login"
            className="block bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            onClick={handleCloseMenu}
          >
            Student Login
          </Link>

          {/* Mobile Bell Button */}
          <button
            className="relative p-2 hover:text-red-500"
            onClick={handleBellClick}
          >
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
