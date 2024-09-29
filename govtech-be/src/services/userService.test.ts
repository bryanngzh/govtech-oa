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
  let mockCollection: jest.Mock;
  let mockWhere: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockDoc: jest.Mock;

  beforeEach(() => {
    userService = new UserService();
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockDoc = jest.fn().mockReturnValue({ set: mockSet });
    mockWhere = jest.fn().mockReturnValue({ get: mockGet });
    mockCollection = jest.fn().mockReturnValue({
      where: mockWhere,
      doc: mockDoc,
    });
    (db.collection as jest.Mock).mockImplementation(mockCollection);
  });

  describe("get", () => {
    it("should return null if user not found", async () => {
      const mockQuerySnapshot = {
        empty: true,
        docs: [],
      };
      mockGet.mockResolvedValue(mockQuerySnapshot);

      const result = await userService.get("nonexistent@example.com");

      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith(
        "email",
        "==",
        "nonexistent@example.com"
      );
    });

    it("should return user if found", async () => {
      const mockUser: User = {
        id: "123",
        name: "John Doe",
        email: "john@example.com",
      };
      const mockDocSnapshot = {
        data: () => mockUser,
      };
      const mockQuerySnapshot = {
        empty: false,
        docs: [mockDocSnapshot],
      };
      mockGet.mockResolvedValue(mockQuerySnapshot);

      const result = await userService.get("john@example.com");

      expect(result).toEqual(mockUser);
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith("email", "==", "john@example.com");
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const newUser: User = {
        id: "456",
        name: "Jane Doe",
        email: "jane@example.com",
      };

      const result = await userService.create(newUser);

      expect(result).toEqual(newUser);
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockSet).toHaveBeenCalledWith({
        name: newUser.name,
        email: newUser.email,
      });
    });
  });
});
