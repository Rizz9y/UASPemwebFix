import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Common/Header";
import Sidebar from "../components/Common/Sidebar";
import UserList from "../components/Users/UserList";
import UserForm from "../components/Users/UserForm";
import { useAuth } from "../components/Auth/AuthProvider"; // To get current user ID for deletion check

const UserManagementPage = () => {
  const { user: currentUser } = useAuth(); // Get currently logged-in user
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError(
        "Failed to fetch users. " + (err.response?.data?.message || err.message)
      );
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserClick = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser && currentUser.id === userId) {
      alert("You cannot delete your own account!");
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone and is only allowed if no stock transactions are linked to them."
      )
    ) {
      try {
        await api.delete(`/users/${userId}`);
        alert("User deleted successfully!");
        fetchUsers(); // Refresh list
      } catch (err) {
        setError(
          "Failed to delete user. " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleResetPassword = async (userId) => {
    const newPassword = prompt("Enter new password for this user:");
    if (newPassword) {
      if (newPassword.length < 6) {
        // Basic password length validation
        alert("New password must be at least 6 characters long.");
        return;
      }
      try {
        await api.put(`/users/${userId}/reset-password`, { newPassword });
        alert("User password reset successfully!");
      } catch (err) {
        setError(
          "Failed to reset password. " +
            (err.response?.data?.message || err.message)
        );
        console.error("Error resetting password:", err);
      }
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowUserForm(false);
    fetchUsers(); // Refresh list after add/edit
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>User Management</h1>
          <button
            onClick={handleAddUserClick}
            className="submit-button"
            style={{ marginBottom: "20px", maxWidth: "200px" }}
          >
            Add New User
          </button>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <UserList
              users={users}
              onEdit={handleEditUserClick}
              onDelete={handleDeleteUser}
              onResetPassword={handleResetPassword}
            />
          )}

          {showUserForm && (
            <UserForm
              user={editingUser}
              onClose={() => setShowUserForm(false)}
              onSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
