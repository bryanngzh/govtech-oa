import { db } from "../configs/firebase";
import { Team } from "../models/teamModel";
import { TeamService } from "./teamService";

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

      const team = await teamService.get("team123");

      expect(team).toEqual({
        id: "team123",
        regDate: "2023-01-01",
        group: "Group A",
      });
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });

    it("should throw an error if team is not found", async () => {
      const mockTeamSnapshot = { exists: false };
      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      await expect(teamService.get("team123")).rejects.toThrow(
        "Team with ID team123 not found."
      );

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
    it("should throw an error if the team data is missing", async () => {
      const mockTeamSnapshot = {
        exists: true,
        id: "team123",
        data: jest.fn().mockReturnValue(undefined),
      };
      const mockDoc = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamSnapshot),
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      await expect(teamService.get("team123")).rejects.toThrow(
        "Team with ID team123 has no data."
      );

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("getAll", () => {
    it("should retrieve all teams", async () => {
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

      const teams = await teamService.getAll();

      expect(teams).toEqual([
        { id: "team123", regDate: "2023-01-01", group: "Group A" },
        { id: "team456", regDate: "2023-02-01", group: "Group B" },
      ]);
      expect(db.collection).toHaveBeenCalledWith("teams");
    });

    it("should throw an error if no teams are found", async () => {
      const mockTeamsSnapshot = { empty: true };
      (db.collection as jest.Mock).mockReturnValue({
        get: jest.fn().mockResolvedValue(mockTeamsSnapshot),
      });

      await expect(teamService.getAll()).rejects.toThrow("No teams found.");

      expect(db.collection).toHaveBeenCalledWith("teams");
    });
  });

  describe("create", () => {
    it("should create a new team with the specified ID", async () => {
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

      const createdTeam = await teamService.create("team123", team);

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

      await expect(teamService.create("team123", team)).rejects.toThrow(
        "Team with ID team123 already exists."
      );

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("update", () => {
    it("should update an existing team", async () => {
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

      const updatedTeam = await teamService.update("team123", team);

      expect(updatedTeam).toEqual(team);
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
      expect(mockUpdate).toHaveBeenCalledWith({
        regDate: "2023-02-01",
        group: "Group B",
      });
    });

    it("should throw an error if the team does not exist", async () => {
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

      await expect(teamService.update("team123", team)).rejects.toThrow(
        "Team with ID team123 not found."
      );

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });

  describe("delete", () => {
    it("should delete an existing team", async () => {
      const mockGet = jest.fn().mockResolvedValue({ exists: true });
      const mockDelete = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
        delete: mockDelete,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      await teamService.delete("team123");

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw an error if the team does not exist", async () => {
      const mockGet = jest.fn().mockResolvedValue({ exists: false });
      const mockDoc = jest.fn().mockReturnValue({
        get: mockGet,
      });
      (db.collection as jest.Mock).mockReturnValue({
        doc: mockDoc,
      });

      await expect(teamService.delete("team123")).rejects.toThrow(
        "Team with ID team123 does not exist."
      );

      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team123");
    });
  });
});
