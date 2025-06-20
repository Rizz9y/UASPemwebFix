import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>404 - Page Not Found</h1>
      <p style={styles.p}>
        Sorry, the page you are looking for does not exist.
      </p>
      <Link to="/" style={styles.link}>
        Go to Home
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    color: "#333",
    textAlign: "center",
    padding: "20px",
  },
  h1: {
    fontSize: "3em",
    marginBottom: "20px",
  },
  p: {
    fontSize: "1.2em",
    marginBottom: "30px",
  },
  link: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "10px 20px",
    borderRadius: "5px",
    textDecoration: "none",
    fontSize: "1em",
    transition: "background-color 0.3s ease",
  },
  linkHover: {
    backgroundColor: "#0056b3",
  },
};

export default NotFoundPage;
