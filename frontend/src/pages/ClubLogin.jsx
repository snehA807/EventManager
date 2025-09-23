import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const ClubLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/club-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Save JWT and club info to localStorage
      localStorage.setItem("clubToken", data.token);
      localStorage.setItem("clubInfo", JSON.stringify(data.club));

      // <-- Redirect to Club Dashboard (replace history so Back won't go to login)
      navigate("/club-dashboard", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-red-900">
      <div className="bg-black p-8 rounded-2xl shadow-2xl w-full max-w-md border border-red-600">
        <h2 className="text-3xl font-bold text-center mb-6 text-red-500">
          Club Login
        </h2>
        <p className="text-center text-gray-400 mb-4">Campus Event Handler</p>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Club Email"
            className="w-full p-3 border border-red-600 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-red-600 bg-black text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition hover:shadow-lg hover:shadow-red-700/50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-4 text-sm">
          Don't have an account?{" "}
          <Link
            to="/club-register"
            className="text-red-500 font-semibold hover:underline"
          >
            Register as Club
          </Link>
        </p>

        <p className="text-center text-gray-400 mt-2 text-sm">
          Are you a student?{" "}
          <Link
            to="/login"
            className="text-red-500 font-semibold hover:underline"
          >
            Student Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ClubLogin;
