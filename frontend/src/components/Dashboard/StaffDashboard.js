import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../Auth/AuthProvider";
import Header from "../Common/Header";
import Sidebar from "../Common/Sidebar";

// Helper function to format currency as IDR
const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) return "Rp 0";
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0, // Rupiah umumnya tanpa desimal untuk nominal besar
    maximumFractionDigits: 0,
  }).format(parsedAmount);
};

const StaffDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [totalStockValue, setTotalStockValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.get("/products");
        setProducts(response.data);
        // Calculate total stock value
        const totalValue = response.data.reduce(
          (sum, p) => sum + p.currentStock * parseFloat(p.price || 0),
          0
        );
        setTotalStockValue(totalValue);
      } catch (err) {
        setError("Failed to fetch product data.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Staff Dashboard</h1>
          <p>
            Welcome, {user.username} ({user.role})
          </p>

          <div style={styles.cardContainer}>
            <div style={styles.card}>
              <h3>Total Unique Products</h3>
              <p>{loading ? "Loading..." : products.length}</p>
            </div>
            <div style={styles.card}>
              <h3>Total Stock Quantity</h3>
              <p>
                {loading
                  ? "Loading..."
                  : products.reduce((sum, p) => sum + p.currentStock, 0)}{" "}
                units
              </p>
            </div>
            <div style={styles.card}>
              <h3>Estimated Stock Value</h3>
              <p>{loading ? "Loading..." : formatRupiah(totalStockValue)}</p>
            </div>
          </div>

          <h2>Current Product Stock Overview</h2>
          {loading ? (
            <div className="loading-spinner"></div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : products.length === 0 ? (
            <p>No products available in the system.</p>
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.code}</td>
                    <td>{product.currentStock}</td>
                    <td>{product.category ? product.category.name : "N/A"}</td>
                  </tr>
                ))}
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

export default StaffDashboard;
