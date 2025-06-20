import React from "react";

const ActivityLogList = ({ logs, loading, error }) => {
  if (loading) {
    return <div className="loading-spinner"></div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!logs || logs.length === 0) {
    return <p>No activity logs found.</p>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>User</th>
          <th>Role</th>
          <th>Action</th>
          <th>Details</th>
          <th>IP Address</th>
        </tr>
      </thead>
      <tbody>
        {logs.map((log) => (
          <tr key={log._id}>
            {" "}
            {/* Use _id for MongoDB documents */}
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            <td>{log.username}</td>
            <td>{log.role}</td>
            <td>{log.action}</td>
            <td>
              {log.details ? JSON.stringify(log.details, null, 2) : "N/A"}
            </td>
            <td>{log.ipAddress || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ActivityLogList;
