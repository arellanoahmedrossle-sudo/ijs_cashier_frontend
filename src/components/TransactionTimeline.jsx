import React from "react";

export default function TransactionTimeline({ transaction }) {
  if (!transaction) return null;

  const events = [];

  // ✅ Created
  events.push({
    label: "Created",
    date: new Date(transaction.createdAt).toLocaleString(),
    detail: `Recorded by ${transaction.staff?.fullName || "Unknown"}`,
    status: "info",
  });

  // ✅ Verification
  if (transaction.verifiedAt) {
    events.push({
      label: "Verified",
      date: new Date(transaction.verifiedAt).toLocaleString(),
      detail: transaction.paymentMethod === 'cash'
        ? 'Cash payment auto-verified by cashier'
        : transaction.source === 'cashier'
            ? `Cashier verified (PayMongo: ${transaction.gatewayResponse?.data?.attributes?.status || "N/A"})`
            : 'Generated automatically by system (QR Ph)',
      status: transaction.status === "success" ? "success" : "failed",
    });
  }

  // ✅ Success / Failure
  if (transaction.status === "success") {
    events.push({
      label: "Payment Succeeded",
      date: new Date(transaction.updatedAt).toLocaleString(),
      detail: "Funds confirmed",
      status: "success",
    });
  } else if (transaction.status === "failed") {
    events.push({
      label: "Payment Failed",
      date: new Date(transaction.updatedAt).toLocaleString(),
      detail: "Transaction did not complete",
      status: "failed",
    });
  }

  // ✅ Refund (future flow)
  if (transaction.refundedAt) {
    events.push({
      label: "Refunded",
      date: new Date(transaction.refundedAt).toLocaleString(),
      detail: "Refund processed",
      status: "refund",
    });
  }

  const getColor = (status) => {
    switch (status) {
      case "success": return "#10B981";
      case "failed": return "#DC2626";
      case "refund": return "#2563EB";
      default: return "#6B7280";
    }
  };

  return (
    <div style={{ marginTop: "0.5rem", paddingLeft: "1rem", borderLeft: "2px solid #ccc" }}>
      {events.map((ev, idx) => (
        <div key={idx} style={{ marginBottom: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: getColor(ev.status),
              }}
            ></span>
            <strong>{ev.label}</strong>
            <small style={{ color: "#6B7280" }}>{ev.date}</small>
          </div>
          <div style={{ marginLeft: "1.5rem", color: "#374151" }}>{ev.detail}</div>
        </div>
      ))}
    </div>
  );
}
