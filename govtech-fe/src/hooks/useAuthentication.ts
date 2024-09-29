import { getAuth } from "firebase/auth";

const useAuthentication = () => {
  const auth = getAuth();
  return auth.currentUser;
};

export default useAuthentication;
