import React from "react";

const SupplierList = ({ suppliers, onEdit, onDelete }) => {
  if (!suppliers || suppliers.length === 0) {
    return <p>No suppliers available.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Contact Person</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Address</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier) => (
          <tr key={supplier.id}>
            <td>{supplier.name}</td>
            <td>{supplier.contactPerson || "N/A"}</td>
            <td>{supplier.phoneNumber || "N/A"}</td>
            <td>{supplier.email || "N/A"}</td>
            <td>{supplier.address || "N/A"}</td>
            <td>{new Date(supplier.createdAt).toLocaleDateString()}</td>
            <td className="action-buttons">
              <button onClick={() => onEdit(supplier)}>Edit</button>
              <button onClick={() => onDelete(supplier.id)} className="delete">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SupplierList;
