import { useEffect, useState } from "react";
import cashierApi from "../api/cashierApi";

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

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, recentRes] = await Promise.all([
        cashierApi.get("/transactions/summary"),
        cashierApi.get("/transactions/recent?limit=5"),
      ]);

      if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      if (recentRes.data.success) setRecentTransactions(recentRes.data.transactions);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Export to CSV
  const exportToCSV = () => {
    if (!recentTransactions || recentTransactions.length === 0) return;

    const headers = ["Student", "Method", "Amount", "Status", "Date"];
    const rows = recentTransactions.map((txn) => [
      `${txn.student?.firstName || ""} ${txn.student?.lastName || ""}`,
      txn.paymentMethod,
      txn.amountPaid.toFixed(2),
      txn.status,
      new Date(txn.createdAt).toLocaleString(),
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-page" style={{ padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Cashier Dashboard</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={fetchDashboardData} style={buttonStyle("#008080")}>
            Refresh
          </button>
          <button onClick={exportToCSV} style={buttonStyle("#009150")}>
            Export CSV
          </button>
          <button onClick={() => window.print()} style={buttonStyle("#006666")}>
            Print
          </button>
        </div>
      </header>

      {/* ✅ Summary Cards */}
      <div style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}>
        <SummaryCard title="Transactions Today" value={summary?.transactionsToday || 0} />
        <SummaryCard
          title="Amount Collected"
          value={`₱${(summary?.amountCollected || 0).toFixed(2)}`}
        />
        <SummaryCard title="Pending Payments" value={summary?.pendingPayments || 0} />
        <SummaryCard title="Completed Payments" value={summary?.completedPayments || 0} />
      </div>

      {/* ✅ Recent Transactions */}
      <h3>Recent Transactions</h3>
      <div
        style={{
          overflowX: "auto",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "white",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#008080", color: "white" }}>
              <th style={thStyle}>Student</th>
              <th style={thStyle}>Method</th>
              <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Status</th>
              <th style={thStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((txn, idx) => (
              <tr
                key={txn._id}
                style={{
                  background: idx % 2 === 0 ? "#f9f9f9" : "white",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e6f7f7")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = idx % 2 === 0 ? "#f9f9f9" : "white")
                }
              >
                <td style={{ ...tdStyle, textAlign: "left" }}>
                  {txn.student?.firstName} {txn.student?.lastName}
                </td>
                <td style={{ ...tdStyle, textAlign: "left" }}>{txn.paymentMethod}</td>
                <td style={{ ...tdStyle, textAlign: "right" }}>₱{txn.amountPaid.toFixed(2)}</td>
                <td
                  style={{
                    ...tdStyle,
                    textAlign: "center",
                    fontWeight: "bold",
                    color: txn.status === "success" ? "#009150" : "#d9534f",
                  }}
                >
                  {txn.status}
                </td>
                <td style={{ ...tdStyle, textAlign: "left" }}>
                  {new Date(txn.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {recentTransactions.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    color: "#6B7280",
                    fontStyle: "italic",
                  }}
                >
                  No recent transactions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: "0.75rem 1rem",
  fontWeight: "bold",
  fontSize: "0.95rem",
  borderBottom: "2px solid #006666",
  textAlign: "left",
};

const tdStyle = {
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  borderBottom: "1px solid #ddd",
};

const buttonStyle = (bgColor) => ({
  background: bgColor,
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontWeight: "600",
});
