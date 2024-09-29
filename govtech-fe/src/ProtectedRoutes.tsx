import { Navigate, Outlet } from "react-router-dom";
import useAuthentication from "./hooks/useAuthentication";

const ProtectedRoutes = () => {
  const user = useAuthentication();
  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
