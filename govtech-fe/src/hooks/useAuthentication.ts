import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { FIREBASE_AUTH } from "../configs/firebase";

interface UseAuthenticationResult {
  user: User | null;
}

const useAuthentication = (): UseAuthenticationResult => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeFromAuthStatusChanged = onAuthStateChanged(
      FIREBASE_AUTH,
      (user) => {
        setUser(user);
      }
    );

    return () => unsubscribeFromAuthStatusChanged();
  }, []);

  return { user };
};

export default useAuthentication;
