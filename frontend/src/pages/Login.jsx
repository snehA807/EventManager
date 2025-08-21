import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNumber: "",
    department: "",
    year: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.rollNumber ||
      !formData.department ||
      !formData.year ||
      !formData.password
    ) {
      setError("All fields are required.");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Enter a valid email address.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Login Successful!");
      navigate("/events");
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-900 to-red-900">
      <div className="bg-black bg-opacity-90 p-8 rounded-2xl shadow-lg w-full max-w-md border border-red-600">
        <h2 className="text-2xl font-bold text-center mb-6 text-red-500">
          Student Login
        </h2>
        <p className="text-center text-gray-400 mb-4">Campus Event Handler</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.rollNumber}
            onChange={handleChange}
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.department}
            onChange={handleChange}
          />

          <select
            name="year"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.year}
            onChange={handleChange}
          >
            <option value="">Select Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            value={formData.password}
            onChange={handleChange}
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500 font-semibold hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
