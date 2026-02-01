import { useEffect, useState } from "react";
import cashierApi from "../api/cashierApi";
import { toast } from "react-toastify";
import TransactionTimeline from "./TransactionTimeline";

export default function TransactionTable({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingId, setCheckingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ search state
  const [expandedRow, setExpandedRow] = useState(null);


  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.get("/transactions");
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const getStatusStyle = (status) => {
    switch (status) {
      case "success":
        return { background: "#10B981", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" };
      case "pendingVerification":
        return { background: "#F59E0B", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" };
      case "failed":
        return { background: "#DC2626", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" };
      default:
        return { background: "#6B7280", color: "white", padding: "0.25rem 0.5rem", borderRadius: "4px" };
    }
  };

  const handleCheckStatus = async (id) => {
    setCheckingId(id);
    try {
      const res = await cashierApi.get(`/transactions/${id}/status`);
      if (res.data.success) {
        const { currentStatus, appStatus, paymentCompleted } = res.data;

        toast.info(`PayMongo status: ${currentStatus} | App status: ${appStatus}`);
        if (paymentCompleted) {
          toast.success("🎉 Payment fully completed!");
        }

        fetchTransactions(); // ✅ refresh table after check
      }
    } catch (err) {
      console.error(err);
      toast.error("Status check failed");
    } finally {
      setCheckingId(null);
    }
  };

  // ✅ Filter transactions based on search term
  const filteredTransactions = transactions.filter((txn) => {
    const studentName = `${txn.student?.firstName || ""} ${txn.student?.lastName || ""}`.toLowerCase();
    return (
      txn.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentName.includes(searchTerm.toLowerCase()) ||
      txn.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      {/* ✅ Search bar */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by Ref, Student, or Status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "6px",
        }}
      >
        <thead style={{ background: "#008080", color: "white" }}>
          <tr>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Transaction Ref</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Student</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Amount</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Method</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Status</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Payment</th>
            <th style={{ padding: "0.75rem", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((txn, idx) => (
            <tr
              key={txn._id}
              style={{
                background: idx % 2 === 0 ? "#F9F9F9" : "white",
              }}
            >
              <td style={{ padding: "0.75rem" }}>{txn.transactionRef}</td>
              <td style={{ padding: "0.75rem" }}>
                {txn.student?.firstName} {txn.student?.lastName}
              </td>
              <td style={{ padding: "0.75rem" }}>{formatCurrency(txn.amountPaid)}</td>
              <td style={{ padding: "0.75rem" }}>{txn.paymentMethod}</td>
              <td style={{ padding: "0.75rem" }}>
                <span style={getStatusStyle(txn.status)}>{txn.status}</span>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <span
                  style={{
                    background:
                      txn.payment?.status === "completed"
                        ? "#10B981"
                        : txn.payment?.status === "pending"
                        ? "#F59E0B"
                        : "#6B7280",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                  }}
                >
                  {txn.payment?.status || "N/A"}
                </span>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {txn.status === "pendingVerification" && (
                    <button
                      onClick={() => handleCheckStatus(txn._id)}
                      disabled={checkingId === txn._id}
                      style={{
                        background: checkingId === txn._id ? "#6B7280" : "#009150",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        cursor: checkingId === txn._id ? "not-allowed" : "pointer",
                      }}
                    >
                      {checkingId === txn._id ? "Checking..." : "Check Status"}
                    </button>
                  )}
                  {txn.status === "success" && (
                    <button
                      style={{
                        background: "#2563EB",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        cursor: "pointer",
                      }}
                      onClick={() => toast.info("Refund flow TBD")}
                    >
                      Refund
                    </button>
                  )}
                  <button
                    style={{
                        background: '#6B7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '0.25 rem 0.5rem',
                        cursor: 'pointer',
                    }}
                    onClick={() => setExpandedRow(expandedRow === txn._id ? null : txn._id)}
                  >
                    {expandedRow === txn._id ? "Hide Timeline" : "View Timeline" }
                  </button>
                </div>
                {expandedRow === txn._id && <TransactionTimeline transaction={txn} />}
              </td>
            </tr>
          ))}
          {filteredTransactions.length === 0 && (
            <tr>
              <td colSpan="7" style={{ padding: "1rem", textAlign: "center", color: "#6B7280" }}>
                No transactions found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
