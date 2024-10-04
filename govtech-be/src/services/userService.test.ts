import { db } from "../configs/firebase";
import { User } from "../models/userModel";
import { UserService } from "./userService";

jest.mock("../configs/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should retrieve a user by email", async () => {
      const mockUserSnapshot = {
        empty: false,
        docs: [
          {
            id: "user123",
            data: () => ({
              name: "John Doe",
              email: "johndoe@example.com",
            }),
          },
        ],
      };
      const mockWhere = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
      });

      const user = await userService.get("johndoe@example.com");

      expect(user).toEqual({
        id: "user123",
        name: "John Doe",
        email: "johndoe@example.com",
      });
      expect(db.collection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith(
        "email",
        "==",
        "johndoe@example.com"
      );
    });

    it("should throw an error if user is not found", async () => {
      const mockUserSnapshot = { empty: true };
      const mockWhere = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        where: mockWhere,
      });

      await expect(userService.get("nonexistent@example.com")).rejects.toThrow(
        "User with email nonexistent@example.com not found."
      );

      expect(db.collection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith(
        "email",
        "==",
        "nonexistent@example.com"
      );
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        id: "newUserId",
        set: mockSet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const user: User = {
        name: "Jane Doe",
        email: "janedoe@example.com",
        id: undefined,
      };

      const createdUser = await userService.create(user);

      expect(createdUser).toEqual({
        ...user,
        id: "newUserId",
      });
      expect(db.collection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "janedoe@example.com",
      });
    });

    it("should throw an error if creation fails", async () => {
      const mockSet = jest
        .fn()
        .mockRejectedValue(new Error("Failed to create user"));
      const mockDoc = jest.fn().mockReturnValue({
        id: "newUserId",
        set: mockSet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const user: User = {
        name: "Jane Doe",
        email: "janedoe@example.com",
        id: undefined,
      };

      await expect(userService.create(user)).rejects.toThrow(
        "Failed to create user"
      );

      expect(db.collection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalled();
      expect(mockSet).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "janedoe@example.com",
      });
    });
  });
});
