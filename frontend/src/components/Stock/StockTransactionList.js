import React from "react";

const StockTransactionList = ({ transactions, loading, error }) => {
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return <p>No stock transactions found.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Product</th>
          <th>Code</th>
          <th>Type</th>
          <th>Quantity</th>
          <th>Source/Destination</th>
          <th>Notes</th>
          <th>Recorded By</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id}>
            <td>{new Date(t.transactionDate).toLocaleString()}</td>
            <td>{t.product ? t.product.name : "N/A"}</td>
            <td>{t.product ? t.product.code : "N/A"}</td>
            <td>{t.type}</td>
            <td
              style={{
                color:
                  t.type === "in" || (t.type === "adjustment" && t.quantity > 0)
                    ? "green"
                    : "red",
              }}
            >
              {t.type === "adjustment" && t.quantity > 0
                ? `+${t.quantity}`
                : t.quantity}
            </td>
            <td>{t.sourceDestination || "N/A"}</td>
            <td>{t.notes || "N/A"}</td>
            <td>{t.user ? t.user.username : "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StockTransactionList;
