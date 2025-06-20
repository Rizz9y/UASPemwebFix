import React, { useState, useEffect } from "react";
import api from "../../api/api";

const StockOutForm = ({ onSuccess, onError }) => {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sourceDestination, setSourceDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productStock, setProductStock] = useState(0); // To display current stock for selected product

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await api.get("/products");
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching products for stock out form:", err);
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
    setQuantity(""); // Reset quantity when product changes
  }, [productId, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(""); // Clear previous errors

    if (parseInt(quantity) > productStock) {
      onError(`Insufficient stock. Available: ${productStock}`);
      return;
    }

    try {
      const data = {
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        sourceDestination,
        notes,
      };
      await api.post("/stock/out", data);
      alert("Stock Out recorded successfully!");
      // Reset form fields
      setProductId("");
      setQuantity("");
      setSourceDestination("");
      setNotes("");
      onSuccess(); // Trigger parent to refresh data
    } catch (err) {
      onError(
        "Failed to record Stock Out: " +
          (err.response?.data?.message || err.message)
      );
      console.error("Stock Out error:", err);
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
              {p.name} ({p.code}) - Stock: {p.currentStock}
            </option>
          ))}
        </select>
        {productId && <small>Current Stock: {productStock}</small>}
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
          max={productStock}
        />
      </div>
      <div className="form-group">
        <label htmlFor="sourceDestination">
          Destination (e.g., Customer Name):
        </label>
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
        Record Stock Out
      </button>
    </form>
  );
};

export default StockOutForm;
