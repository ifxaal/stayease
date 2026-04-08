import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel" style={{ maxWidth: "460px", margin: "1rem auto", padding: "1.2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        <h2 className="page-title" style={{ marginBottom: "0.2rem" }}>Welcome Back</h2>
        <p className="muted" style={{ margin: 0 }}>Log in to continue booking with StayEase.</p>
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className="input"
        />
        {error && <p className="status-error">{error}</p>}
        <button type="submit" className="button button-primary">
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
