import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FIREBASE_AUTH } from "../configs/firebase";

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    FIREBASE_AUTH.signOut();
    navigate("/login");
  };

  return (
    <div>
      <Button onClick={handleLogout}> Log Out </Button>
    </div>
  );
};

export default Dashboard;
