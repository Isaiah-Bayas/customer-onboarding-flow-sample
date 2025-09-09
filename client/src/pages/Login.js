import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) return setError("Email is required");
    if (!password) return setError("Password is required");

    setLoading(true);
    try {
      const uid = email; // keep email as uid
      await axios.post(`${API}/users`, {
        uid,
        profile: { email, password },
        data: {}
      });
      localStorage.setItem("currentUid", uid);
      navigate("/wizard/page2");
    } catch (err) {
      console.error(err);
      setError("Failed to login. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label><br/>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label><br/>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
