import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [state, setState] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (state === "Sign Up") {
        // register user
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/users/register`, {
          name,
          email,
          password,
        });

        // immediately login after signup
        await login(email, password);
        navigate("/");
      } else {
        // login user
        await login(email, password); // AuthContext handles setting token + user
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4"
    >
      <div className="bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl p-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-3">
          {state === "Sign Up" ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Please {state === "Sign Up" ? "sign up" : "login"} to book your appointment
        </p>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {state === "Sign Up" && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
              placeholder="Enter your full name"
              className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
            />
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
            placeholder="Enter your email"
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
          />
        </div>

        <div className="mb-7">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            required
            placeholder="Enter your password"
            className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          {loading
            ? "Please wait..."
            : state === "Sign Up"
            ? "Create Account"
            : "Login"}
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          {state === "Sign Up" ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setState("Login")}
                className="text-blue-500 hover:underline cursor-pointer font-medium transition-colors"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don’t have an account?{" "}
              <span
                onClick={() => setState("Sign Up")}
                className="text-blue-500 hover:underline cursor-pointer font-medium transition-colors"
              >
                Sign Up
              </span>
            </>
          )}
        </p>
      </div>
    </form>
  );
};

export default Login;
