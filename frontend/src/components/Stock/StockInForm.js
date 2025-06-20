import React, { useState, useEffect } from "react";
import api from "../../api/api";

const StockInForm = ({ onSuccess, onError }) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sourceDestination, setSourceDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products for stock in form:", err);
        onError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(""); // Clear previous errors

    try {
      const data = {
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        sourceDestination,
        notes,
      };
      await api.post("/stock/in", data);
      alert("Stock In recorded successfully!");
      // Reset form fields
      setProductId("");
      setQuantity("");
      setSourceDestination("");
      setNotes("");
      onSuccess(); // Trigger parent to refresh data
    } catch (err) {
      onError(
        "Failed to record Stock In: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Stock In error:", err);
    }
  };

  if (loadingProducts) {
    return <div className="loading-spinner"></div>;
  }

  if (products.length === 0) {
    return (
      <p className="error-message">
        No products available. Please add products first to manage stock.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="productId">Product:</label>
        <select
          id="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">Select a product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.code})
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="quantity">Quantity:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="form-group">
        <label htmlFor="sourceDestination">Source (e.g., Supplier Name):</label>
        <input
          type="text"
          id="sourceDestination"
          value={sourceDestination}
          onChange={(e) => setSourceDestination(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Notes:</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>
      <button type="submit" className="submit-button">
        Record Stock In
      </button>
    </form>
  );
};

export default StockInForm;
