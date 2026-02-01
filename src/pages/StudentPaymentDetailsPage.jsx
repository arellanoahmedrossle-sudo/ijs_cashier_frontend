import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cashierApi from "../api/cashierApi";
import useAutoLogout from "../utils/useAutoLogout";
import PaymentTransactionsTable from "../components/PaymentTransactionsTable"; // ✅ scoped table

export default function StudentPaymentDetailsPage() {
  const { id } = useParams(); // ✅ paymentId from route
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };
  useAutoLogout(token, logout);

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.get(`/payments/${id}`);
      if (res.data.success) {
        setPayment(res.data.payment);
      }
    } catch (err) {
      console.error("Failed to fetch payment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  if (loading) return <p>Loading payment details...</p>;
  if (!payment) return <p>Payment not found.</p>;

  // ✅ Ensure numeric values
  const tuitionFee = Number(payment.tuitionFee || 0);
  const miscTotal = Object.values(payment.miscFees || {}).reduce(
    (a, b) => a + Number(b || 0),
    0
  );

  // ✅ Apply discount (e.g. 0.25 = 25%)
  const discountRate = Number(payment.discountApplied || 0);
  const grossFees = tuitionFee + miscTotal;
  const discountAmount = grossFees * discountRate;
  const totalFees = grossFees - discountAmount;

  const totalPaid = (payment.transactions || [])
    .filter(t => t.status === 'success')
    .reduce(
    (a, t) => a + Number(t.amountPaid || 0), // ✅ use amountPaid field
    0
  );

  const balance = totalFees - totalPaid;
  const status = balance <= 0 ? "Completed" : "Pending";

  return (
    <div>
      {/* ✅ Back button */}
      <button
        onClick={() => navigate("/payments")}
        style={{
          background: "#ccc",
          color: "#333",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        ← Back to Payments
      </button>

      <h2>
        {payment.student
          ? `${payment.student.firstName || ""} ${payment.student.lastName || ""}`
          : "Unknown Student"}{" "}
        - {payment.schoolYear}
      </h2>

      {/* ✅ Summary Cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <SummaryCard title="Gross Fees" value={`₱${grossFees.toFixed(2)}`} />
        <SummaryCard
          title="Discount"
          value={`${(discountRate * 100).toFixed(0)}% (₱${discountAmount.toFixed(2)})`}
        />
        <SummaryCard title="Total Fees" value={`₱${totalFees.toFixed(2)}`} />
        <SummaryCard title="Paid" value={`₱${totalPaid.toFixed(2)}`} />
        <SummaryCard title="Balance" value={`₱${balance.toFixed(2)}`} />
        <SummaryCard title="Status" value={status} />
      </div>

      {/* ✅ Transactions for this payment only */}
      <PaymentTransactionsTable transactions={payment.transactions} />
    </div>
  );
}

// ✅ Modular SummaryCard component
const SummaryCard = ({ title, value }) => (
  <div
    style={{
      flex: 1,
      background: "#f9f9f9",
      padding: "1rem",
      borderRadius: "8px",
      textAlign: "center",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }}
  >
    <h4 style={{ marginBottom: "0.5rem", color: "#008080" }}>{title}</h4>
    <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{value}</p>
  </div>
);
