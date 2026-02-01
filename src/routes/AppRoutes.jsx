import { Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import ProtectedRoute from "../components/ProtectedRoute";
import CashierLayout from "../layouts/CashierLayout";
import PaymentsPage from "../pages/PaymentsPage";
import StudentPaymentDetailsPage from "../pages/StudentPaymentDetailsPage";


export const AppRoutes = (
  <>
    {/* ✅ Root route: conditional redirect */}
    <Route
      path="/"
      element={
        localStorage.getItem("token")
          ? <Navigate to="/dashboard" replace />
          : <Navigate to="/login" replace />
      }
    />

    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <ProtectedRoute allowedRole="cashier">
          <CashierLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/payments" element={<PaymentsPage />} />   {/* ✅ new route */}
      <Route path="/payments/:id" element={<StudentPaymentDetailsPage />} />

    </Route>
  </>
);
