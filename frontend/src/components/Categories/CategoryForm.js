import React, { useState } from "react";
import api from "../../api/api";

const CategoryForm = ({ category, onClose, onSuccess }) => {
  const [name, setName] = useState(category ? category.name : "");
  const [description, setDescription] = useState(
    category ? category.description : ""
  );
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const categoryData = { name, description };

    try {
      if (category) {
        await api.put(`/categories/${category.id}`, categoryData);
        alert("Category updated successfully!");
      } else {
        await api.post("/categories", categoryData);
        alert("Category added successfully!");
      }
      onSuccess();
    } catch (err) {
      setFormError(
        "Error saving category: " + (err.response?.data?.message || err.message)
      );
      console.error("Error saving category:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{category ? "Edit Category" : "Add New Category"}</h3>
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
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-button">
              {category ? "Update Category" : "Add Category"}
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

export default CategoryForm;
