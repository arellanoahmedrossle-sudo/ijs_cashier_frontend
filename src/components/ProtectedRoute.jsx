import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children, allowedRole = "cashier" }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // ✅ saved at login

  if (!token) {
    toast.info("Please log in to continue");
    return <Navigate to="/login" replace />;
  }

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      toast.info("Session expired, please log in again");
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast.error("Invalid session, please log in again");
    return <Navigate to="/login" replace />;
  }

  // ✅ Role check
  if (!role || role.toLowerCase() !== allowedRole.toLowerCase()) {
    toast.error("Access denied: only cashiers can use this app.");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  return children;
}
