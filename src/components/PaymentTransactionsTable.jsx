// src/components/PaymentTransactionsTable.jsx
import { useState } from "react";

export default function PaymentTransactionsTable({ transactions = [] }) {
  const [expandedRow, setExpandedRow] = useState(null);

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

  if (!transactions || transactions.length === 0) {
    return <p style={{ color: "#6B7280" }}>No transactions recorded for this payment yet.</p>;
  }

  return (
    <div style={{ overflowX: "auto" }}>
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
            <th style={thStyle}>Transaction Ref</th>
            <th style={thStyle}>Amount</th>
            <th style={thStyle}>Method</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn, idx) => (
            <tr
              key={txn._id}
              style={{
                background: idx % 2 === 0 ? "#F9F9F9" : "white",
              }}
            >
              <td style={tdStyle}>{txn.transactionRef}</td>
              <td style={tdStyle}>{formatCurrency(txn.amountPaid)}</td>
              <td style={tdStyle}>{txn.paymentMethod}</td>
              <td style={tdStyle}>
                <span style={getStatusStyle(txn.status)}>{txn.status}</span>
              </td>
              <td style={tdStyle}>
                {new Date(txn.transactionDate).toLocaleString("en-PH")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding: "0.75rem",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: "0.9rem",
  borderBottom: "2px solid #006666",
};

const tdStyle = {
  padding: "0.75rem",
  fontSize: "0.9rem",
  borderBottom: "1px solid #ddd",
};
