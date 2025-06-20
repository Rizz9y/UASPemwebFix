import React, { useState, useEffect } from "react";
import Header from "../components/Common/Header"; //
import Sidebar from "../components/Common/Sidebar"; //
import StockInForm from "../components/Stock/StockInForm"; //
import StockOutForm from "../components/Stock/StockOutForm"; //
import StockAdjustmentForm from "../components/Stock/StockAdjustmentForm"; //
import StockTransactionList from "../components/Stock/StockTransactionList"; //
import api from "../api/api"; //

const StockManagementPage = ({ defaultTab = "in" }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionError, setTransactionError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransactions();
    }
  }, [activeTab]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    setTransactionError("");
    try {
      const response = await api.get("/stock/transactions"); //
      setTransactions(response.data);
    } catch (err) {
      setTransactionError(
        "Failed to fetch stock history: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error fetching stock transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleFormSuccess = () => {
    setFormError("");
    if (activeTab === "history") {
      fetchTransactions();
    } else {
      alert("Operation successful!");
    }
  };

  const handleFormError = (msg) => {
    setFormError(msg);
  };

  // === FUNGSI EKSPOR RIWAYAT STOK ===
  const handleExportStockHistory = async () => {
    try {
      const response = await api.get("/export/stock-transactions", {
        responseType: "blob", // Penting: memberitahu Axios untuk mengharapkan blob (file)
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "stock_transactions.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      alert("File riwayat stok berhasil diekspor!");
    } catch (err) {
      setTransactionError(
        "Failed to export stock history: " +
          (err.response?.data?.message || err.message || "Server error")
      );
      console.error("Error exporting stock history:", err);
    }
  };
  // ==================================

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Stock Management</h1>

          {formError && <div className="error-message">{formError}</div>}

          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === "in" ? "active" : ""}`}
              onClick={() => setActiveTab("in")}
            >
              Stock In
            </button>
            <button
              className={`tab-button ${activeTab === "out" ? "active" : ""}`}
              onClick={() => setActiveTab("out")}
            >
              Stock Out
            </button>
            <button
              className={`tab-button ${
                activeTab === "adjustment" ? "active" : ""
              }`}
              onClick={() => setActiveTab("adjustment")}
            >
              Adjustment
            </button>
            <button
              className={`tab-button ${
                activeTab === "history" ? "active" : ""
              }`}
              onClick={() => setActiveTab("history")}
            >
              History
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "in" && (
              <StockInForm
                onSuccess={handleFormSuccess}
                onError={handleFormError}
              />
            )}
            {activeTab === "out" && (
              <StockOutForm
                onSuccess={handleFormSuccess}
                onError={handleFormError}
              />
            )}
            {activeTab === "adjustment" && (
              <StockAdjustmentForm
                onSuccess={handleFormSuccess}
                onError={handleFormError}
              />
            )}
            {activeTab === "history" && (
              <div>
                <button
                  onClick={handleExportStockHistory}
                  className="submit-button"
                  style={{ marginBottom: "20px", backgroundColor: "#28a745" }}
                >
                  Export Stock History to Excel
                </button>
                <StockTransactionList
                  transactions={transactions}
                  loading={loadingTransactions}
                  error={transactionError}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockManagementPage;
