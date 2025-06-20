import React from "react";

const UserList = ({ users, onEdit, onDelete, onResetPassword }) => {
  if (!users || users.length === 0) {
    return <p>No users available.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Role</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.username}</td>
            <td>{user.role}</td>
            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            <td className="action-buttons">
              <button onClick={() => onEdit(user)}>Edit</button>
              <button onClick={() => onResetPassword(user.id)}>Reset PW</button>
              {/* Prevent deleting own account for safety */}
              {/* Assuming req.user.id is passed to this component or checked in handler */}
              <button onClick={() => onDelete(user.id)} className="delete">
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserList;
