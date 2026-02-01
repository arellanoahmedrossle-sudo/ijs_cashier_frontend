import { useState } from "react";
import { useNavigate } from "react-router-dom";

const parseSemester = (value) => {
  switch (value) {
    case "firstSemester":
      return "1st Semester";
    case "secondSemester":
      return "2nd Semester";
    case "summer":
      return "Summer Term";
    default:
      return value || "—";
  }
};


// ✅ Currency formatter for consistent ₱ values
const formatCurrency = (value) =>
  `₱${Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
  })}`;

export default function PaymentsTable({ payments = [] }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Filter payments based on search term (includes semester now)
  const filteredPayments = payments.filter((p) => {
    const studentName =
      p.student?.fullName ||
      `${p.student?.firstName || ""} ${p.student?.lastName || ""}`.trim();

    return (
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.schoolYear || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.enrollment?.semester || "").toLowerCase().includes(searchTerm.toLowerCase()) || // ✅ include semester
      (p.status || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div
      style={{
        overflowX: "auto",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        background: "white",
        padding: "1rem",
      }}
    >
      {/* ✅ Search bar */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by student, year, semester, or status..."
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

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#008080", color: "white", textAlign: "left" }}>
            <th style={thStyle}>Student</th>
            <th style={thStyle}>School Year</th>
            <th style={thStyle}>Semester</th> {/* ✅ new column */}
            <th style={thStyle}>Total Fees</th>
            <th style={thStyle}>Paid</th>
            <th style={thStyle}>Balance</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.map((p, idx) => {
            const totalFees = Number(p.totalAmount || 0);
            const totalPaid = (p.transactions || [])
              .filter(t => t.status === 'success')
              .reduce(
              (a, t) => a + Number(t.amountPaid || 0),
              0
            );
            const balance = totalFees - totalPaid;
            const status = balance <= 0 ? "Completed" : "Pending";

            const studentName =
              p.student?.fullName ||
              `${p.student?.firstName || ""} ${p.student?.lastName || ""}`.trim();

            return (
              <tr
                key={p._id}
                onClick={() => navigate(`/payments/${p._id}`)}
                style={{
                  cursor: "pointer",
                  background: idx % 2 === 0 ? "#f9f9f9" : "white",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e6f7f7")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = idx % 2 === 0 ? "#f9f9f9" : "white")
                }
              >
                <td style={tdStyle}>{studentName || "—"}</td>
                <td style={tdStyle}>{p.schoolYear}</td>
                <td style={tdStyle}>{parseSemester(p.enrollment?.semester) || "—"}</td> {/* ✅ display semester */}
                <td style={tdStyle}>{formatCurrency(totalFees)}</td>
                <td style={tdStyle}>{formatCurrency(totalPaid)}</td>
                <td style={tdStyle}>{formatCurrency(balance)}</td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: "bold",
                    color: status === "Completed" ? "#009150" : "#d9534f",
                  }}
                >
                  {status}
                </td>
              </tr>
            );
          })}
          {filteredPayments.length === 0 && (
            <tr>
              <td colSpan="7" style={{ padding: "1rem", textAlign: "center", color: "#6B7280" }}>
                No payments found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ✅ Shared styles
const thStyle = {
  padding: "0.75rem 1rem",
  fontWeight: "bold",
  fontSize: "0.95rem",
  borderBottom: "2px solid #006666",
};

const tdStyle = {
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  borderBottom: "1px solid #ddd",
};
