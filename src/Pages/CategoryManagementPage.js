import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Common/Header";
import Sidebar from "../components/Common/Sidebar";
import CategoryList from "../components/Categories/CategoryList";
import CategoryForm from "../components/Categories/CategoryForm";

const CategoryManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/categories");
      setCategories(response.data);
    } catch (err) {
      setError(
        "Failed to fetch categories. " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategoryClick = () => {
    setEditingCategory(null);
    setShowCategoryForm(true);
  };

  const handleEditCategoryClick = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This will fail if products are still linked to it."
      )
    ) {
      try {
        await api.delete(`/categories/${categoryId}`);
        alert("Category deleted successfully!");
        fetchCategories();
      } catch (err) {
        setError(
          "Failed to delete category. " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error deleting category:", err);
      }
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowCategoryForm(false);
    fetchCategories();
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Manage Categories</h1>
          <button
            onClick={handleAddCategoryClick}
            className="submit-button"
            style={{ marginBottom: "20px", maxWidth: "200px" }}
          >
            Add New Category
          </button>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <CategoryList
              categories={categories}
              onEdit={handleEditCategoryClick}
              onDelete={handleDeleteCategory}
            />
          )}

          {showCategoryForm && (
            <CategoryForm
              category={editingCategory}
              onClose={() => setShowCategoryForm(false)}
              onSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagementPage;
