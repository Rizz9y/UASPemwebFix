import React, { useState } from "react";
import api from "../../api/api";

const SupplierForm = ({ supplier, onClose, onSuccess }) => {
  const [name, setName] = useState(supplier ? supplier.name : "");
  const [contactPerson, setContactPerson] = useState(
    supplier ? supplier.contactPerson : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    supplier ? supplier.phoneNumber : ""
  );
  const [email, setEmail] = useState(supplier ? supplier.email : "");
  const [address, setAddress] = useState(supplier ? supplier.address : "");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const supplierData = { name, contactPerson, phoneNumber, email, address };

    try {
      if (supplier) {
        await api.put(`/suppliers/${supplier.id}`, supplierData);
        alert("Supplier updated successfully!");
      } else {
        await api.post("/suppliers", supplierData);
        alert("Supplier added successfully!");
      }
      onSuccess();
    } catch (err) {
      setFormError(
        "Error saving supplier: " + (err.response?.data?.message || err.message)
      );
      console.error("Error saving supplier:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{supplier ? "Edit Supplier" : "Add New Supplier"}</h3>
        {formError && <p className="error-message">{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Person:</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Address:</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            ></textarea>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-button">
              {supplier ? "Update Supplier" : "Add Supplier"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="logout-button cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
