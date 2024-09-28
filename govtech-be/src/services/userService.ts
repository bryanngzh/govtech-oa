import { db } from "../configs/firebase";
import { User } from "../models/userModel";

export class UserService {
  public async get(userEmail: string): Promise<User | null> {
    const userSnapshot = await db
      .collection("users")
      .where("email", "==", userEmail)
      .get();

    if (userSnapshot.empty) {
      return null;
    }

    const userData = userSnapshot.docs[0].data();
    const user: User = {
      id: userData.id,
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
