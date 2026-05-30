import { Navigate } from "react-router-dom";
import { getRole } from "../utils/auth";

export default function ProtectedRoute({ children, role }) {
  const userRole = getRole();

  if (!userRole) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}