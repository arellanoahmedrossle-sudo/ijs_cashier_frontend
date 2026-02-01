import { useState } from "react";
import cashierApi from "../api/cashierApi";
import { toast } from "react-toastify";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await cashierApi.post("/staff/auth/login", { username, password });

      if (res.data.success) {
        const { token, staff } = res.data;

        // ✅ Save token + role
        localStorage.setItem("token", token);
        localStorage.setItem("role", staff.role.toLowerCase());

        toast.success("Login successful! Redirecting…", { autoClose: 2000 });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        textAlign: "left",
      }}
    >
      {/* Username */}
      <div>
        <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>
          Username
        </label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          style={inputStyle}
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div>
        <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#374151" }}>
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          style={inputStyle}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!username || !password || loading}
        style={{
          background: loading ? "#6B7280" : "#008080",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "0.75rem",
          fontWeight: "600",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s ease",
        }}
      >
        {loading ? "Logging in…" : "Login"}
      </button>
    </form>
  );
}

// ✅ Shared input style
const inputStyle = {
  width: "100%",
  padding: "0.65rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "0.95rem",
  marginTop: "0.25rem",
  outline: "none",
  transition: "border-color 0.2s ease",
};
