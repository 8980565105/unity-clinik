import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
