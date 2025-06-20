import React from "react";

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

const ProductList = ({ products, onEdit, onDelete, viewOnly = false }) => {
  if (!products || products.length === 0) {
    return <p>No products available.</p>;
  }

  // Mendapatkan base URL API untuk gambar
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";
  const IMAGE_BASE_URL = API_BASE_URL.replace("/api", ""); // Misalnya: http://localhost:5000

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Price</th>
          <th>Current Stock</th>
          <th>Category</th>
          <th>Supplier</th>
          <th>Color</th>
          <th>Image</th> {/* Kolom untuk 'Image' */}
          {!viewOnly && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id}>
            <td>{product.name}</td>
            <td>{product.code}</td>
            <td>{formatRupiah(product.price)}</td>
            <td>{product.currentStock}</td>
            <td>{product.category ? product.category.name : "N/A"}</td>
            <td>{product.supplier ? product.supplier.name : "N/A"}</td>
            <td>{product.color || "N/A"}</td>
            <td>
              {product.imageUrl ? (
                <img
                  src={`${IMAGE_BASE_URL}${product.imageUrl}`} // Selalu gunakan IMAGE_BASE_URL karena kini hanya path relatif
                  alt={product.name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              ) : (
                "N/A"
              )}
            </td>
            {!viewOnly && (
              <td className="action-buttons">
                <button onClick={() => onEdit(product)}>Edit</button>
                <button onClick={() => onDelete(product.id)} className="delete">
                  Delete
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductList;
