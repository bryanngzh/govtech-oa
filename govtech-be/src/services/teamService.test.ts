// teamService.test.ts

import { db } from "../configs/firebase"; // adjust path as needed
import { Team } from "../models/teamModel";
import { TeamService } from "./teamService"; // adjust path as needed

// Mock the db collection and methods
jest.mock("../configs/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("TeamService", () => {
  let teamService: TeamService;

  beforeEach(() => {
    teamService = new TeamService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("get", () => {
    it("should retrieve a team by ID", async () => {
      // Mock Firestore behavior for team retrieval
      const mockTeamSnapshot = {
        exists: true,
        id: "team123",
        data: () => ({
          regDate: "2023-01-01",
          group: "Group A",
        }),
      };
      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      // Call the method
      const team = await teamService.get("team123");

      // Assertions
      expect(team).toEqual({
        id: "team123",
        regDate: "2023-01-01",
        group: "Group A",
      });
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });

    it("should throw an error if team is not found", async () => {
      // Mock Firestore behavior for non-existent team
      const mockTeamSnapshot = { exists: false };
      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      // Expect an error to be thrown
      await expect(teamService.get("team123")).rejects.toThrow(
        "Team with ID team123 not found."
      );

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
    it("should throw an error if the team data is missing", async () => {
      // Mock Firestore behavior for a team that exists but has no data
      const mockTeamSnapshot = {
        exists: true,
        id: "team123",
        data: jest.fn().mockReturnValue(undefined), // teamData is undefined
      };
      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      // Expect an error to be thrown
      await expect(teamService.get("team123")).rejects.toThrow(
        "Team with ID team123 has no data."
      );

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("getAll", () => {
    it("should retrieve all teams", async () => {
      // Mock Firestore behavior for retrieving all teams
      const mockTeamsSnapshot = {
        empty: false,
        docs: [
          {
            id: "team123",
            data: () => ({
              regDate: "2023-01-01",
              group: "Group A",
            }),
          },
          {
            id: "team456",
            data: () => ({
              regDate: "2023-02-01",
              group: "Group B",
            }),
          },
        ],
      };
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamsSnapshot),
      });

      // Call the method
      const teams = await teamService.getAll();

      // Assertions
      expect(teams).toEqual([
        { id: "team123", regDate: "2023-01-01", group: "Group A" },
        { id: "team456", regDate: "2023-02-01", group: "Group B" },
      ]);
      expect(db.collection).toHaveBeenCalledWith("teams");
    });

    it("should throw an error if no teams are found", async () => {
      // Mock Firestore behavior for an empty teams collection
      const mockTeamsSnapshot = { empty: true };
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamsSnapshot),
      });

      // Expect an error to be thrown
      await expect(teamService.getAll()).rejects.toThrow("No teams found.");

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
    });
  });

  describe("create", () => {
    it("should create a new team with the specified ID", async () => {
      // Mock Firestore behavior for creating a new team
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
        set: mockSet,
        id: "team123",
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const team: Team = {
        regDate: "2023-01-01",
        group: "Group A",
        id: undefined,
      };

      // Call the method
      const createdTeam = await teamService.create("team123", team);

      // Assertions
      expect(createdTeam).toEqual({
        ...team,
        id: "team123",
      });
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
      expect(mockSet).toHaveBeenCalledWith({
        regDate: "2023-01-01",
        group: "Group A",
      });
    });

    it("should throw an error if a team with the specified ID already exists", async () => {
      // Mock Firestore behavior for existing team
      const mockGet = jest.fn().mockResolvedValue({ exists: true });
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const team: Team = {
        regDate: "2023-01-01",
        group: "Group A",
        id: undefined,
      };

      // Expect an error to be thrown
      await expect(teamService.create("team123", team)).rejects.toThrow(
        "Team with ID team123 already exists."
      );

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("update", () => {
    it("should update an existing team", async () => {
      // Mock Firestore behavior for updating a team
      const mockGet = jest.fn().mockResolvedValue({ exists: true });
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
        update: mockUpdate,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const team: Team = {
        regDate: "2023-02-01",
        group: "Group B",
        id: "team123",
      };

      // Call the method
      const updatedTeam = await teamService.update("team123", team);

      // Assertions
      expect(updatedTeam).toEqual(team);
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
      expect(mockUpdate).toHaveBeenCalledWith({
        regDate: "2023-02-01",
        group: "Group B",
      });
    });

    it("should throw an error if the team does not exist", async () => {
      // Mock Firestore behavior for non-existent team
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      const team: Team = {
        regDate: "2023-02-01",
        group: "Group B",
        id: "team123",
      };

      // Expect an error to be thrown
      await expect(teamService.update("team123", team)).rejects.toThrow(
        "Team with ID team123 not found."
      );

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("delete", () => {
    it("should delete an existing team", async () => {
      // Mock Firestore behavior for deleting a team
      const mockGet = jest.fn().mockResolvedValue({ exists: true });
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
        delete: mockDelete,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      // Call the method
      await teamService.delete("team123");

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw an error if the team does not exist", async () => {
      // Mock Firestore behavior for non-existent team
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      // Expect an error to be thrown
      await expect(teamService.delete("team123")).rejects.toThrow(
        "Team with ID team123 does not exist."
      );

      // Assertions
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });
});
