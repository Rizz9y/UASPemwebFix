import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Common/Header";
import Sidebar from "../components/Common/Sidebar";
import SupplierList from "../components/Suppliers/SupplierList";
import SupplierForm from "../components/Suppliers/SupplierForm";

const SupplierManagementPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/suppliers");
      setSuppliers(response.data);
    } catch (err) {
      setError(
        "Failed to fetch suppliers. " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplierClick = () => {
    setEditingSupplier(null);
    setShowSupplierForm(true);
  };

  const handleEditSupplierClick = (supplier) => {
    setEditingSupplier(supplier);
    setShowSupplierForm(true);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this supplier? This will fail if products are still linked to them."
      )
    ) {
      try {
        await api.delete(`/suppliers/${supplierId}`);
        alert("Supplier deleted successfully!");
        fetchSuppliers();
      } catch (err) {
        setError(
          "Failed to delete supplier. " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error deleting supplier:", err);
      }
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowSupplierForm(false);
    fetchSuppliers();
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Manage Suppliers</h1>
          <button
            onClick={handleAddSupplierClick}
            className="submit-button"
            style={{ marginBottom: "20px", maxWidth: "200px" }}
          >
            Add New Supplier
          </button>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <SupplierList
              suppliers={suppliers}
              onEdit={handleEditSupplierClick}
              onDelete={handleDeleteSupplier}
            />
          )}

          {showSupplierForm && (
            <SupplierForm
              supplier={editingSupplier}
              onClose={() => setShowSupplierForm(false)}
              onSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SupplierManagementPage;
