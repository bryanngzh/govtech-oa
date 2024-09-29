import { Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import useAuthentication from "./hooks/useAuthentication";

const ProtectedRoutes = () => {
  const user = useAuthentication();
  return user ? (
    <>
      <NavBar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default ProtectedRoutes;
