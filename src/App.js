import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/Auth/AuthProvider";

// Page Components
import LoginPage from "./Pages/LoginPage";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import StaffDashboard from "./components/Dashboard/StaffDashboard";
import ProductManagementPage from "./Pages/ProductManagementPage";
import UserManagementPage from "./Pages/UserManagementPage";
import SupplierManagementPage from "./Pages/SupplierManagementPage";
import CategoryManagementPage from "./Pages/CategoryManagementPage";
import StockManagementPage from "./Pages/StockManagementPage";
import ActivityLogsPage from "./Pages/ActivityLogsPage";
import NotFoundPage from "./Pages/NotFoundPage"; // Generic 404 page

// A simple PrivateRoute component for access control
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while auth status is being checked
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        Loading authentication...
      </div>
    );
  }

  if (!user) {
    // User not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // Check if user's role is allowed to access this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is authenticated but not authorized for this role
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        {" "}
        {/* AuthProvider wraps the entire application */}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/unauthorized"
            element={
              <div style={{ padding: "20px", textAlign: "center" }}>
                <h1>403 Forbidden</h1>
                <p>You do not have permission to view this page.</p>
                <button
                  onClick={() => (window.location.href = "/login")}
                  style={{
                    marginTop: "20px",
                    padding: "10px 20px",
                    cursor: "pointer",
                  }}
                >
                  Go to Login
                </button>
              </div>
            }
          />
          {/* Admin Specific Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ProductManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <UserManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/suppliers"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <SupplierManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <CategoryManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/stock" // Unified stock management page for Admin
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <StockManagementPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <ActivityLogsPage />
              </PrivateRoute>
            }
          />
          {/* Staff Specific Routes (Admin can also access these by allowedRoles=['admin', 'staff']) */}
          <Route
            path="/staff/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <StaffDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/products" // Staff can view products
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <ProductManagementPage viewOnly={true} />{" "}
                {/* Pass a prop to make it view-only */}
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/stock/in"
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <StockManagementPage defaultTab="in" />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/stock/out"
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <StockManagementPage defaultTab="out" />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/stock/adjustment"
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <StockManagementPage defaultTab="adjustment" />
              </PrivateRoute>
            }
          />
          <Route
            path="/staff/stock/history"
            element={
              <PrivateRoute allowedRoles={["admin", "staff"]}>
                <StockManagementPage defaultTab="history" />
              </PrivateRoute>
            }
          />
          {/* Default route: Redirect based on login status or show 404 */}
          <Route path="/" element={<InitialRedirect />} />
          <Route path="*" element={<NotFoundPage />} />{" "}
          {/* Catch all other undefined routes */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

// Component to handle initial redirection based on user's role
const InitialRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      // Wait until auth status is checked
      if (user) {
        // If user is logged in, redirect based on their role
        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (user.role === "staff") {
          navigate("/staff/dashboard", { replace: true });
        } else {
          // Fallback for an unknown role (shouldn't happen if roles are strictly 'admin'/'staff')
          navigate("/login", { replace: true });
        }
      } else {
        // If no user is logged in, redirect to login page
        navigate("/login", { replace: true });
      }
    }
  }, [user, loading, navigate]); // Dependencies: user object, loading state, and navigate function

  // Render a simple loading message while redirection is being determined
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      Checking login status...
    </div>
  );
};

export default App;
