import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { api } from "../../api/api";
import LoadingScreen from "../ui/LoadingScreen";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { setCurrentUser } from "../../features/auth/authSlice";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/current");
        if (response.data.success && response.data.user?.isAuthenticated) {
          setIsAuthenticated(true);
          dispatch(
            setCurrentUser({
              studentid: response?.data?.user?.studentid,
              username: response?.data?.user?.adminusername,
            })
          );
        } else {
          setIsAuthenticated(false);
          Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You are not authorized.",
          });
        }
      } catch (error) {
        const { message } = error as { message: string };
        setIsAuthenticated(false);
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: message,
        });
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading || isAuthenticated === null) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
