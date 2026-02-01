import { useState, useEffect } from "react";
import cashierApi from "../api/cashierApi";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "react-toastify";
import StudentSelect from "./StudentSelect"; // ✅ searchable select

// ✅ Helper: calculate remaining balance
const calculateRemainingBalance = (payment) => {
  if (!payment) return null;
  const totalPaid = (payment.transactions || [])
    .filter(txn => txn.status === "success")
    .reduce((sum, txn) => sum + txn.amountPaid, 0);
  return payment.totalAmount - totalPaid;
};

// ✅ Helper: validate amount before submit
const validateAmount = (amount, method, remainingBalance) => {
  if (amount <= 0) {
    toast.error("Amount must be greater than zero");
    return false;
  }
  if (method === "cash" && amount > remainingBalance) {
    toast.error(`Cash payment cannot exceed ₱${remainingBalance}`);
    return false;
  }
  if (method === "online" && amount < 20) {
    toast.error("Online payments must be at least ₱20");
    return false;
  }
  return true;
};

// ✅ Modular components
const PaymentSelect = ({ payments, selectedStudent, selectedPayment, setSelectedPayment }) => (
  <label>
    <span style={{ fontWeight: "600" }}>Payment</span>
    <select
      value={selectedPayment}
      onChange={(e) => setSelectedPayment(e.target.value)}
      disabled={!selectedStudent}
      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
    >
      <option value="">Select Payment</option>
      {payments.map((p) => (
        <option key={p._id} value={p._id}>
          SY {p.schoolYear} - ₱{p.totalAmount} ({p.status})
        </option>
      ))}
    </select>
  </label>
);

const AmountInput = ({ amountPaid, setAmountPaid, remainingBalance }) => (
  <label>
    <span style={{ fontWeight: "600" }}>Amount</span>
    <input
      type="number"
      value={amountPaid}
      onChange={(e) => setAmountPaid(e.target.value)}
      placeholder="Enter amount"
      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
      min={0.01}
      step={0.01}
      max={remainingBalance || undefined}
    />
    {remainingBalance !== null && (
      <small style={{ color: "#6B7280" }}>
        Remaining balance: ₱{remainingBalance}
      </small>
    )}
  </label>
);

const MethodSelect = ({ method, setMethod }) => (
  <label>
    <span style={{ fontWeight: "600" }}>Method</span>
    <select
      value={method}
      onChange={(e) => setMethod(e.target.value)}
      style={{ width: "100%", padding: "0.5rem", borderRadius: "6px", border: "1px solid #ccc" }}
    >
      <option value="cash">Cash</option>
      <option value="online">Online (QR Ph)</option>
    </select>
  </label>
);

const QrSection = ({ qrCodeValue, checking, handleCheckStatus }) => (
  <div style={{ marginTop: "1rem", textAlign: "center", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", background: "#f9fafb" }}>
    <h4 style={{ marginBottom: "0.5rem", color: "#374151" }}>Scan QR to Pay</h4>
    {qrCodeValue.startsWith("data:image") ? (
      <img
        src={qrCodeValue}
        alt="QR Code"
        style={{ maxWidth: "100%", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      />
    ) : (
      <QRCodeCanvas value={qrCodeValue} size={200} />
    )}
    <button
      onClick={handleCheckStatus}
      disabled={checking}
      style={{
        marginTop: "1rem",
        background: checking ? "#6B7280" : "#008080",
        color: "white",
        border: "none",
        borderRadius: "6px",
        padding: "0.75rem",
        cursor: checking ? "not-allowed" : "pointer",
        fontWeight: "600",
        width: "100%",
      }}
    >
      {checking ? "Checking..." : "Check Status"}
    </button>
  </div>
);

export default function AddTransactionModal({ isOpen, onClose, refreshTransactions }) {
  const [students, setStudents] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [method, setMethod] = useState("cash");
  const [qrCodeValue, setQrCodeValue] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // ✅ Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStudents([]);
      setPayments([]);
      setSelectedStudent("");
      setSelectedPayment("");
      setAmountPaid("");
      setMethod("cash");
      setQrCodeValue(null);
      setTransactionId(null);
      setLoading(false);
      setChecking(false);
    }
  }, [isOpen]);

  // ✅ Fetch students on open
  useEffect(() => {
    if (isOpen) {
      cashierApi.get("/admin/students")
        .then(res => {
          if (res.data.success) setStudents(res.data.students);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  // ✅ Fetch payments when student selected
  useEffect(() => {
    if (selectedStudent) {
      cashierApi.get(`/payments/student/${selectedStudent}`)
        .then(res => {
          if (res.data.success) {
            const validPayments = res.data.payments.filter(p => p.status !== "completed");
            setPayments(validPayments);
          }
        })
        .catch(err => console.error(err));
    } else {
      setPayments([]);
      setSelectedPayment("");
    }
  }, [selectedStudent]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedPayObj = payments.find(p => p._id === selectedPayment);
    const remainingBalance = calculateRemainingBalance(selectedPayObj);

    if (!validateAmount(Number(amountPaid), method, remainingBalance)) return;

    setLoading(true);
    try {
      const res = await cashierApi.post("/transactions", {
        studentId: selectedStudent,
        paymentId: selectedPayment,
        amountPaid: Number(amountPaid),
        paymentMethod: method,
        source: "cashier",
      });

      if (res.data.success) {
        toast.success("Transaction recorded!");
        setTransactionId(res.data.transaction._id);
        refreshTransactions();

        if (res.data.paymentCompleted) {
          toast.success("🎉 Payment fully completed!");
        }

        if (res.data.qrImage) {
          setQrCodeValue(res.data.qrImage);
        } else {
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!transactionId) return;
    setChecking(true);
    try {
      const res = await cashierApi.get(`/transactions/${transactionId}/status`);
      if (res.data.success) {
        const { currentStatus, appStatus, paymentCompleted } = res.data;
        toast.info(`PayMongo status: ${currentStatus} | App status: ${appStatus}`);
        refreshTransactions();

        if (paymentCompleted) {
          toast.success("🎉 Payment fully completed!");
          onClose();
        }

        if (appStatus === "success") {
          toast.success("Payment succeeded!");
          onClose();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Status check failed");
    } finally {
      setChecking(false);
    }
  };

  if (!isOpen) return null;

  const selectedPayObj = payments.find(p => p._id === selectedPayment);
  const remainingBalance = calculateRemainingBalance(selectedPayObj);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "12px", width: "480px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
        <h2 style={{ marginBottom: "1rem", color: "#008080" }}>Create Transaction</h2>

        {/* ✅ Show form only if QR not yet generated */}
        {!qrCodeValue && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label>
              <span style={{ fontWeight: "600" }}>Student</span>
              <StudentSelect students={students} onChange={setSelectedStudent} />
            </label>

            <PaymentSelect
              payments={payments}
              selectedStudent={selectedStudent}
              selectedPayment={selectedPayment}
              setSelectedPayment={setSelectedPayment}
            />

            <AmountInput
              amountPaid={amountPaid}
              setAmountPaid={setAmountPaid}
              remainingBalance={remainingBalance}
            />

            <MethodSelect method={method} setMethod={setMethod} />

            <button
              type="submit"
              disabled={loading || !selectedStudent || !selectedPayment}
              style={{
                background: loading ? "#6B7280" : "#009150",
                color: "white",
                border: "none",
                borderRadius: "6px",
                padding: "0.75rem",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "600",
              }}
            >
              {loading ? "Processing..." : "Submit Transaction"}
            </button>
          </form>
        )}

        {/* ✅ Show QR + Check Status once generated */}
        {qrCodeValue && (
          <QrSection
            qrCodeValue={qrCodeValue}
            checking={checking}
            handleCheckStatus={handleCheckStatus}
          />
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "1rem",
            background: "#DC2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            padding: "0.75rem",
            cursor: "pointer",
            fontWeight: "600",
            width: "100%",
            transition: "background 0.2s ease",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
