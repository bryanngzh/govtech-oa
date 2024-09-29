import { db } from "../configs/firebase";
import { User } from "../models/userModel";

export class UserService {
  public async get(userEmail: string): Promise<User | null> {
    const userRef = db.collection("users").where("email", "==", userEmail);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      throw new Error(`User with email ${userEmail} not found.`);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const user: User = {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
    };

    return user;
  }

  public async create(user: User): Promise<User> {
    const userRef = db.collection("users").doc();

    await userRef.set({
      name: user.name,
      email: user.email,
    });

    return user;
  }
}
