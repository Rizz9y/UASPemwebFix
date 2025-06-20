import React from "react";

const CategoryList = ({ categories, onEdit, onDelete }) => {
  if (!categories || categories.length === 0) {
    return <p>No categories available.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <td>{category.name}</td>
            <td>{category.description || "N/A"}</td>
            <td>{new Date(category.createdAt).toLocaleDateString()}</td>
            <td className="action-buttons">
              <button onClick={() => onEdit(category)}>Edit</button>
              <button onClick={() => onDelete(category.id)} className="delete">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CategoryList;
