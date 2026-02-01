import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="login-page"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #008080 0%, #00b3b3 100%)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          width: "100%",
          maxWidth: "400px",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {/* ✅ Header */}
        <h2 style={{ marginBottom: "0.5rem", color: "#008080" }}>Cashier Login</h2>
        <p style={{ marginBottom: "1.5rem", color: "#6B7280", fontSize: "0.95rem" }}>
          Please sign in to continue
        </p>

        {/* ✅ Login Form */}
        <LoginForm />

        {/* ✅ Footer */}
        <p style={{ marginTop: "1.5rem", fontSize: "0.85rem", color: "#6B7280" }}>
          © {new Date().getFullYear()} IJS Payment System
        </p>
      </div>
    </div>
  );
}
