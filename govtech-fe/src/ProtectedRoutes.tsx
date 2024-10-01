import { Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import { FIREBASE_AUTH } from "./configs/firebase";

const ProtectedRoutes = () => {
  const user = FIREBASE_AUTH.currentUser;

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
