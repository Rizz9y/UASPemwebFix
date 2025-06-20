import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";

const ProductForm = ({ product, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [color, setColor] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // Untuk menampilkan gambar yang sudah ada
  const [selectedImageFile, setSelectedImageFile] = useState(null); // Untuk file baru yang diunggah
  const fileInputRef = useRef(null); // Referensi untuk input file

  const [formError, setFormError] = useState("");
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingForm, setLoadingForm] = useState(true);

  // Sinkronisasi state saat product berubah (edit)
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCode(product.code || "");
      setDescription(product.description || "");
      setPrice(product.price || "");
      setCategoryId(product.categoryId || "");
      setSupplierId(product.supplierId || "");
      setColor(product.color || "");
      setCurrentImageUrl(product.imageUrl || ""); // Set URL gambar yang ada
      setSelectedImageFile(null); // Reset file yang dipilih saat edit produk baru
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Bersihkan input file
      }
    } else {
      // Reset form jika tambah produk baru
      setName("");
      setCode("");
      setDescription("");
      setPrice("");
      setCategoryId("");
      setSupplierId("");
      setColor("");
      setCurrentImageUrl(""); // Kosongkan URL gambar saat tambah
      setSelectedImageFile(null); // Reset file yang dipilih
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Bersihkan input file
      }
    }
  }, [product]);

  useEffect(() => {
    const fetchDataForForm = async () => {
      setLoadingForm(true);
      setFormError("");
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          api.get("/categories"),
          api.get("/suppliers"),
        ]);
        setCategories(categoriesRes.data);
        setSuppliers(suppliersRes.data);
      } catch (err) {
        setFormError(
          "Failed to load form data: " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error fetching form data:", err);
      } finally {
        setLoadingForm(false);
      }
    };
    fetchDataForForm();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (
      file &&
      (file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/gif")
    ) {
      setSelectedImageFile(file);
      setFormError(""); // Hapus error jika file valid
    } else {
      setSelectedImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Bersihkan input file jika tidak valid
      }
      setFormError("Hanya file gambar (JPEG, PNG, GIF) yang diizinkan!");
    }
  };

  const handleRemoveCurrentImage = () => {
    setCurrentImageUrl(""); // Set kosong agar backend tahu untuk menghapus (melalui flag removeImage)
    setSelectedImageFile(null); // Pastikan tidak ada file baru yang dipilih juga
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Bersihkan input file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (selectedImageFile && selectedImageFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      setFormError("Ukuran file gambar tidak boleh lebih dari 5MB.");
      return;
    }

    const formData = new FormData(); // Gunakan FormData untuk upload file
    formData.append("name", name);
    formData.append("code", code);
    formData.append("description", description);
    formData.append("price", parseFloat(price));
    formData.append("categoryId", categoryId || "");
    formData.append("supplierId", supplierId || "");
    formData.append("color", color.trim() === "" ? "" : color);

    // === Logika penanganan gambar untuk FormData ===
    if (selectedImageFile) {
      formData.append("image", selectedImageFile); // Tambahkan file baru jika ada
    } else if (product && !currentImageUrl && !selectedImageFile) {
      // Jika mode edit, tidak ada file baru dipilih, DAN currentImageUrl kosong
      // Ini berarti pengguna menghapus gambar yang sudah ada
      formData.append("removeImage", "true"); // Kirim flag ke backend untuk menghapus
    }
    // Jika tidak ada selectedImageFile DAN currentImageUrl masih ada,
    // tidak perlu append apapun; backend akan mempertahankan gambar yang ada.
    // ===============================================

    try {
      if (product) {
        await api.put(`/products/${product.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Penting untuk upload file
          },
        });
        alert("Product updated successfully!");
      } else {
        await api.post("/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Penting untuk upload file
          },
        });
        alert("Product added successfully!");
      }
      onSuccess();
    } catch (err) {
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : err.message;
      setFormError("Error saving product: " + errorMessage);
      console.error("Error saving product:", err);
    }
  };

  if (loadingForm) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="loading-spinner"></div>
          <p style={{ textAlign: "center" }}>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{product ? "Edit Product" : "Add New Product"}</h3>
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
            <label>Code:</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Price:</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Category:</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Supplier:</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Color:</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Red, Blue, Black"
            />
          </div>
          {/* === PERUBAHAN: Input file untuk Gambar === */}
          <div className="form-group">
            <label>Product Image (JPG, PNG, GIF, Max 5MB):</label>
            {currentImageUrl && (
              <div style={{ marginBottom: "10px", textAlign: "center" }}>
                <img
                  src={`${process.env.REACT_APP_API_BASE_URL.replace(
                    "/api",
                    ""
                  )}${currentImageUrl}`}
                  alt="Current Product"
                  style={{
                    maxWidth: "150px",
                    maxHeight: "150px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveCurrentImage}
                  className="delete-button"
                  style={{ marginLeft: "10px" }}
                >
                  Hapus Gambar Ini
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif" // Batasi jenis file
              onChange={handleImageChange}
              ref={fileInputRef} // Pasang ref ke input file
            />
            {selectedImageFile && (
              <small style={{ display: "block", marginTop: "5px" }}>
                File terpilih: {selectedImageFile.name} (
                {(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
              </small>
            )}
            {currentImageUrl && !selectedImageFile && (
              <small style={{ display: "block", marginTop: "5px" }}>
                Abaikan ini untuk mempertahankan gambar yang ada. Pilih file
                baru untuk mengganti.
              </small>
            )}
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-button">
              {product ? "Update Product" : "Add Product"}
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

export default ProductForm;
