import React, { useState, useEffect } from "react";
import api from "../../api/api";

const StockAdjustmentForm = ({ onSuccess, onError }) => {
  const [productId, setProductId] = useState("");
  const [quantityChange, setQuantityChange] = useState(""); // Can be positive or negative
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productStock, setProductStock] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        console.error(
          "Error fetching products for stock adjustment form:",
          err
        );
        onError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [onError]);

  useEffect(() => {
    if (productId) {
      const selectedProduct = products.find(
        (p) => p.id === parseInt(productId)
      );
      if (selectedProduct) {
        setProductStock(selectedProduct.currentStock);
      }
    } else {
      setProductStock(0);
    }
    setQuantityChange(""); // Reset quantity when product changes
  }, [productId, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(""); // Clear previous errors

    const parsedQuantity = parseInt(quantityChange);
    if (isNaN(parsedQuantity) || parsedQuantity === 0) {
      onError("Quantity change must be a non-zero number.");
      return;
    }

    const potentialNewStock = productStock + parsedQuantity;
    if (potentialNewStock < 0) {
      onError(
        `Adjustment would result in negative stock. Current: ${productStock}, Change: ${parsedQuantity}`
      );
      return;
    }

    try {
      const data = {
        productId: parseInt(productId),
        quantity: parsedQuantity, // Send as positive or negative
        notes,
      };
      await api.post("/stock/adjustment", data);
      alert("Stock Adjustment recorded successfully!");
      // Reset form fields
      setProductId("");
      setQuantityChange("");
      setNotes("");
      onSuccess(); // Trigger parent to refresh data
    } catch (err) {
      onError(
        "Failed to record Stock Adjustment: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Stock Adjustment error:", err);
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
              {p.name} ({p.code}) - Current Stock: {p.currentStock}
            </option>
          ))}
        </select>
        {productId && <small>Current Stock: {productStock}</small>}
      </div>
      <div className="form-group">
        <label htmlFor="quantityChange">Quantity Change (+/-):</label>
        <input
          type="number"
          id="quantityChange"
          value={quantityChange}
          onChange={(e) => setQuantityChange(e.target.value)}
          required
          placeholder="e.g., 5 for increase, -3 for decrease"
        />
      </div>
      <div className="form-group">
        <label htmlFor="notes">Reason for Adjustment:</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          required
        ></textarea>
      </div>
      <button type="submit" className="submit-button">
        Record Stock Adjustment
      </button>
    </form>
  );
};

export default StockAdjustmentForm;
