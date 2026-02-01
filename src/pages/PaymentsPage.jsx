import { useState, useEffect } from "react";
import cashierApi from "../api/cashierApi";
import PaymentsTable from "../components/PaymentsTable"; 
import useAutoLogout from "../utils/useAutoLogout";

export default function PaymentsPage() {
  const token = localStorage.getItem("token");
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  useAutoLogout(token, logout);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.get("/payments");
      if (res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div>
      <h2>Payments</h2>
      {loading ? (
        <p>Loading payments...</p>
      ) : (
        <PaymentsTable payments={payments} refreshPayments={fetchPayments} />
      )}
    </div>
  );
}
