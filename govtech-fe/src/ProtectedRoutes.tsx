import { Flex, Spinner } from "@chakra-ui/react";
import { User } from "firebase/auth";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import NavBar from "./components/NavBar";
import useAuthentication from "./hooks/useAuthentication";
import { setToken } from "./slices/authSlice";

interface UserWithToken extends User {
  accessToken: string;
}

const ProtectedRoutes = () => {
  const { user, loading } = useAuthentication();
  const dispatch = useDispatch();

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (user) {
    dispatch(setToken((user as UserWithToken).accessToken));
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
