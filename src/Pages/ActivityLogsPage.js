import React, { useEffect, useState } from "react";
import api from "../api/api";
import Header from "../components/Common/Header";
import Sidebar from "../components/Common/Sidebar";
import ActivityLogList from "../components/Logs/ActivityLogList";

const ActivityLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/logs"); // This endpoint fetches all logs
      setLogs(response.data);
    } catch (err) {
      setError(
        "Failed to fetch activity logs. " +
          (err.response?.data?.message || err.message)
      );
      console.error("Error fetching activity logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">
          <h1>Activity Logs</h1>
          <p>This page displays all system activities recorded in MongoDB.</p>

          {error && <div className="error-message">{error}</div>}

          <ActivityLogList logs={logs} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
};

export default ActivityLogsPage;
