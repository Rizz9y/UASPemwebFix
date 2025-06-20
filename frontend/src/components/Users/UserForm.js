import React, { useState } from "react";
import api from "../../api/api";

const UserForm = ({ user, onClose, onSuccess }) => {
  const [username, setUsername] = useState(user ? user.username : "");
  const [password, setPassword] = useState(""); // Only used for new users or explicit password change
  const [role, setRole] = useState(user ? user.role : "staff"); // Default to staff for new users
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(""); // Clear previous errors

    const userData = { username, role };
    if (password) {
      // Only include password if it's provided (for new user or explicit change)
      userData.password = password;
    }

    try {
      if (user) {
        // Update existing user
        await api.put(`/users/${user.id}`, userData);
        alert("User updated successfully!");
      } else {
        // Add new user
        if (!password) {
          // Password is required for new users
          setFormError("Password is required for new users.");
          return;
        }
        await api.post("/users", userData);
        alert("User added successfully!");
      }
      onSuccess(); // Close form and trigger data refresh in parent
    } catch (err) {
      setFormError(
        "Error saving user: " + (err.response?.data?.message || err.message)
      );
      console.error("Error saving user:", err);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{user ? "Edit User" : "Add New User"}</h3>
        {formError && <p className="error-message">{formError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          {/* Password field logic: required for new user, optional for edit */}
          {!user ? ( // If adding new user
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          ) : (
            // If editing existing user
            <div className="form-group">
              <label>New Password (optional):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
              />
              <small>Fill this to change password.</small>
            </div>
          )}
          <div className="form-group">
            <label>Role:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="modal-buttons">
            <button type="submit" className="submit-button">
              {user ? "Update User" : "Add User"}
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

export default UserForm;
