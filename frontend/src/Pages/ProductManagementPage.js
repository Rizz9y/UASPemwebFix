import React, { useEffect, useState } from "react";
import api from "../api/api"; //
import Header from "../components/Common/Header"; //
import Sidebar from "../components/Common/Sidebar"; //
import ProductList from "../components/Products/ProductList"; //
import ProductForm from "../components/Products/ProductForm"; //
import { useAuth } from "../components/Auth/AuthProvider"; //

const ProductManagementPage = ({ viewOnly = false }) => {
  const { user } = useAuth(); //
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/products"); //
      setProducts(response.data);
    } catch (err) {
      setError(
        "Failed to fetch products. " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductClick = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProductClick = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone and is only allowed if no stock transactions are linked."
      )
    ) {
      try {
        await api.delete(`/products/${productId}`); //
        alert("Product deleted successfully!");
        fetchProducts();
      } catch (err) {
        setError(
          "Failed to delete product. " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error deleting product:", err);
      }
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowProductForm(false);
    fetchProducts();
  };

  // === FUNGSI EKSPOR PRODUK ===
  const handleExportProducts = async () => {
    try {
      const response = await api.get("/export/products", {
        responseType: "blob", // Penting: memberitahu Axios untuk mengharapkan blob (file)
      });

      // Buat URL objek dari blob respons
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      // Dapatkan nama file dari header Content-Disposition jika tersedia
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "products.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      link.setAttribute("download", fileName); // Atur nama file
      document.body.appendChild(link);
      link.click(); // Klik tautan untuk memulai unduhan
      link.remove(); // Hapus tautan
      window.URL.revokeObjectURL(url); // Bersihkan URL objek
      alert("File produk berhasil diekspor!");
    } catch (err) {
      setError(
        "Failed to export products: " +
          (err.response?.data?.message || err.message || "Server error")
      );
      console.error("Error exporting products:", err);
    }
  };
  // ==========================

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>{viewOnly ? "View Products" : "Manage Products"}</h1>

          {!viewOnly && user.role === "admin" && (
            <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleAddProductClick}
                className="submit-button"
                style={{ maxWidth: "200px" }}
              >
                Add New Product
              </button>
              <button
                onClick={handleExportProducts}
                className="submit-button"
                style={{ maxWidth: "200px", backgroundColor: "#28a745" }} // Warna hijau
              >
                Export Products to Excel
              </button>
            </div>
          )}
          {user.role === "staff" && ( // Staff juga bisa ekspor kalau viewOnly=false
            <button
              onClick={handleExportProducts}
              className="submit-button"
              style={{
                marginBottom: "20px",
                maxWidth: "200px",
                backgroundColor: "#28a745",
              }}
            >
              Export Products to Excel
            </button>
          )}

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <ProductList
              products={products}
              onEdit={handleEditProductClick}
              onDelete={handleDeleteProduct}
              viewOnly={viewOnly}
            />
          )}

          {showProductForm && (
            <ProductForm
              product={editingProduct}
              onClose={() => setShowProductForm(false)}
              onSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductManagementPage;
