import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../Auth/AuthProvider";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorProducts, setErrorProducts] = useState("");
  const [errorLogs, setErrorLogs] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch Products
      setLoadingProducts(true);
      try {
        const productsResponse = await api.get("/products");
        setProducts(productsResponse.data);
        // Assume 'low stock' is less than or equal to 10 units
        setLowStockCount(
          productsResponse.data.filter((p) => p.currentStock <= 10).length
        );
      } catch (err) {
        setErrorProducts("Failed to fetch product data.");
        console.error("Error fetching products:", err);
      } finally {
        setLoadingProducts(false);
      }

      // Fetch Recent Activity Logs (Admin only)
      if (user && user.role === "admin") {
        setLoadingLogs(true);
        try {
          const logsResponse = await api.get("/logs"); // Get latest 100 logs from backend
          setRecentLogs(logsResponse.data.slice(0, 5)); // Show only top 5 in dashboard
        } catch (err) {
          setErrorLogs("Failed to fetch activity logs.");
          console.error("Error fetching logs:", err);
        } finally {
          setLoadingLogs(false);
        }
      }
    };

    fetchDashboardData();
  }, [user]); // Re-fetch if user changes (e.g., after login)

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Admin Dashboard</h1>

          <div style={styles.cardContainer}>
            <div style={styles.card}>
              <h3>Total Products</h3>
              <p>{loadingProducts ? "Loading..." : products.length}</p>
            </div>
            <div style={styles.card}>
              <h3>Low Stock Items</h3>
              <p>{loadingProducts ? "Loading..." : lowStockCount}</p>
            </div>
            <div style={styles.card}>
              <h3>Recent Logins</h3>
              {loadingLogs ? (
                <div className="loading-spinner"></div>
              ) : errorLogs ? (
                <p className="error-message-inline">{errorLogs}</p>
              ) : (
                <div>
                  {recentLogs
                    .filter((log) => log.action === "Login Success")
                    .slice(0, 3)
                    .map((log, index) => (
                      <div key={index}>
                        {log.username} at{" "}
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    ))}
                  {recentLogs.filter((log) => log.action === "Login Success")
                    .length === 0 && <p>No recent logins.</p>}
                </div>
              )}
            </div>
          </div>

          <h2>Recent Product Stock Overview</h2>
          {loadingProducts ? (
            <div className="loading-spinner"></div>
          ) : errorProducts ? (
            <div className="error-message">{errorProducts}</div>
          ) : products.length === 0 ? (
            <p>No products available. Add some from "Manage Products".</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Current Stock</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map(
                  (
                    product // Show top 5 recent products
                  ) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.code}</td>
                      <td>{product.currentStock}</td>
                      <td>
                        {product.category ? product.category.name : "N/A"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
};

export default AdminDashboard;
