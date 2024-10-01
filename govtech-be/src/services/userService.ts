import { db } from "../configs/firebase";
import { User } from "../models/userModel";

/**
 * Service for managing user-related operations.
 */
export class UserService {
  /**
   * Retrieve a user by their email address.
   * @param userEmail - The email of the user to retrieve.
   * @returns A promise that resolves to a User object.
   * @throws Error if the user is not found.
   */
  public async get(userEmail: string): Promise<User> {
    const userRef = db.collection("users").where("email", "==", userEmail);
    const userSnapshot = await userRef.get();

    if (userSnapshot.empty) {
      throw new Error(`User with email ${userEmail} not found.`);
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    return {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
    };
  }

  /**
   * Create a new user.
   * @param user - The user data to create.
   * @returns A promise that resolves to the created User object.
   * @throws Error if the creation fails.
   */
  public async create(user: User): Promise<User> {
    const userRef = db.collection("users").doc();

    await userRef.set({
      name: user.name,
      email: user.email,
    });

    return {
      ...user,
      id: userRef.id,
    };
  }
}
