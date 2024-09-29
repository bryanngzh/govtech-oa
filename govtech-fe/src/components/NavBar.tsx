import { Box, Flex, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../configs/firebase";

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    FIREBASE_AUTH.signOut();
    navigate("/login");
  };

  return (
    <Box bg="blue.500" p={4}>
      <Flex align="center" justify="space-between">
        <Heading size="lg" color="white">
          GovTech
        </Heading>
        <Flex>
          <Link as={RouterLink} to="/" color="white" mx={2}>
            Dashboard
          </Link>
          <Link onClick={handleLogout} mx={2}>
            Log Out
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
};

export default NavBar;
