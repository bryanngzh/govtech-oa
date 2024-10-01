import { Flex, Spinner } from "@chakra-ui/react";
import { Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import useAuthentication from "./hooks/useAuthentication";

const ProtectedRoutes = () => {
  const { user, loading } = useAuthentication();

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

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
