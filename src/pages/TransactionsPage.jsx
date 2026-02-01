import { useState, useEffect } from "react";
import cashierApi from "../api/cashierApi";
import TransactionTable from "../components/TransactionsTable"; // ✅ corrected import name
import AddTransactionModal from "../components/AddTransactionModal";
import useAutoLogout from "../utils/useAutoLogout";

export default function TransactionsPage() {

    const token = localStorage.getItem('token');
    const logout = () => { 
        localStorage.removeItem("token"); 
        window.location.href = "/login"; 
    };
    useAutoLogout(token, logout);

  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await cashierApi.get("/transactions");
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      <button
        onClick={() => setModalOpen(true)}
        style={{
          background: "#008080",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "0.5rem 1rem",
          cursor: "pointer",
          marginBottom: "1rem",
        }}
      >
        Add Transaction
      </button>

      {/* ✅ Show loading state */}
      {loading ? (
        <p>Loading transactions...</p>
      ) : (
        <TransactionTable transactions={transactions} refreshTransactions={fetchTransactions} />
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        refreshTransactions={fetchTransactions} // ✅ pass refresh callback
      />
    </div>
  );
}
