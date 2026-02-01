import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  FaHome,
  FaClipboardList,
  FaSignOutAlt,
  FaCashRegister,
} from "react-icons/fa";

const primaryColor = "#008080";   // teal
const accentColor = "#009150";    // emerald green

const CashierLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: collapsed ? "50px" : "220px",
          background: primaryColor,
          padding: "1rem",
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "95vh",
          position: "sticky",
          top: 0,
          transition: "width 0.3s ease",
        }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
      >
        {/* Branding */}
        <div
          style={{
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <FaCashRegister size={28} />
          <span
            style={{
              marginLeft: collapsed ? 0 : "0.5rem",
              fontWeight: "bold",
              fontSize: "1.2rem",
              whiteSpace: "nowrap",
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "opacity 0.3s ease, transform 0.3s ease, margin-left 0.3s ease",
            }}
          >
            IJS Cashier
          </span>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1 }}>
          <nav>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <NavItem to="/dashboard" icon={<FaHome />} label="Dashboard" collapsed={collapsed} delay={0} />
              <NavItem to="/transactions" icon={<FaClipboardList />} label="Transactions" collapsed={collapsed} delay={0.05} />
              <NavItem to="/payments" icon={<FaCashRegister />} label="Payments" collapsed={collapsed} delay={0.1} />
            </ul>
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          title="Logout"
          style={{
            marginTop: "auto",
            padding: "0.5rem",
            background: "white",
            color: primaryColor,
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            transition: "all 0.3s ease",
          }}
        >
          <FaSignOutAlt />
          <span
            style={{
              marginLeft: collapsed ? 0 : "0.5rem",
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "opacity 0.3s ease, transform 0.3s ease, margin-left 0.3s ease",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </span>
        </button>
      </aside>

      <main
        style={{
          flex: 1,
          padding: "1rem",
          background: "#F9F9F9",
          overflowY: "auto",
          color: "#333333",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

// NavItem component
const NavItem = ({ to, icon, label, collapsed, delay }) => (
  <li>
    <NavLink
      to={to}
      title={label}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        padding: "0.5rem",
        color: isActive ? primaryColor : "white",
        background: isActive ? "white" : "transparent",
        textDecoration: "none",
        borderRadius: "4px",
        marginBottom: "0.5rem",
        fontWeight: isActive ? "bold" : "normal",
        transition: "all 0.3s ease",
        boxShadow: isActive ? "0 0 6px rgba(255,255,255,0.6)" : "none",
      })}
    >
      <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      <span
        style={{
          marginLeft: collapsed ? 0 : "0.5rem",
          opacity: collapsed ? 0 : 1,
          transform: collapsed ? "translateX(-10px)" : "translateX(0)",
          transition: `opacity 0.3s ease ${delay}s, transform 0.3s ease ${delay}s, margin-left 0.3s ease ${delay}s`,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </NavLink>
  </li>
);

export default CashierLayout;
