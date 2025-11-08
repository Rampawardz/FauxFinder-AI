import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <section className="w-screen min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-rose-50 to-yellow-50 text-gray-900 px-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Sign in to continue your AI-powered detection journey.
        </p>

        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-full transition duration-200 shadow-sm"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-orange-600 font-semibold hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </section>
  );
}

export default Login;
