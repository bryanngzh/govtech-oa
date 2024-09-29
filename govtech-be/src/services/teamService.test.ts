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
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    teamService = new TeamService();
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    });
    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      get: jest.fn().mockResolvedValue({
        forEach: jest.fn(),
      }),
    });
    (db.collection as jest.Mock).mockImplementation(mockCollection);
  });

  describe("get", () => {
    it("should return null if team does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await teamService.get("nonexistent-id");

      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("nonexistent-id");
    });

    it("should return team if it exists", async () => {
      const mockTeam: Team = {
        id: "team-id",
        name: "Team A",
        regDate: new Date().toISOString(),
        group: "group-id",
      };
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockTeam,
      });

      const result = await teamService.get("team-id");

      expect(result).toEqual(mockTeam);
      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith("team-id");
    });
  });

  describe("createOrUpdate", () => {
    it("should create a new team", async () => {
      const newTeam: Team = {
        id: "",
        name: "Team B",
        regDate: new Date().toISOString(),
        group: "group-id",
      };

      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: mockSet,
      });

      const result = await teamService.createOrUpdate(newTeam);

      expect(result.name).toBe(newTeam.name);
      expect(mockSet).toHaveBeenCalledWith({
        name: newTeam.name,
        regDate: newTeam.regDate,
        group: newTeam.group,
      });
    });

    it("should update an existing team", async () => {
      const existingTeam: Team = {
        id: "team-id",
        name: "Updated Team",
        regDate: new Date().toISOString(),
        group: "group-id",
      };

      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: true }),
        set: mockSet,
      });

      const result = await teamService.createOrUpdate(existingTeam);

      expect(result.name).toBe(existingTeam.name);
      expect(mockSet).toHaveBeenCalledWith({
        name: existingTeam.name,
        regDate: existingTeam.regDate,
        group: existingTeam.group,
      });
    });

    it("should throw an error if trying to update a non-existing team", async () => {
      const teamToUpdate: Team = {
        id: "nonexistent-id",
        name: "Nonexistent Team",
        regDate: new Date().toISOString(),
        group: "group-id",
      };

      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: false }),
      });

      await expect(teamService.createOrUpdate(teamToUpdate)).rejects.toThrow(
        "Team with ID nonexistent-id does not exist. Please provide a valid ID to update."
      );
    });

    it("should update group count if it exists", async () => {
      const newTeam: Team = {
        name: "Team C",
        regDate: new Date().toISOString(),
        group: "existing-group-id",
      };

      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: mockSet,
      });
      mockDoc.mockReturnValueOnce({
        get: jest
          .fn()
          .mockResolvedValue({ exists: true, data: () => ({ count: 1 }) }),
        update: mockUpdate,
      });

      await teamService.createOrUpdate(newTeam);

      expect(mockUpdate).toHaveBeenCalledWith({ count: 2 });
    });

    it("should create a new group if it does not exist", async () => {
      const newTeam: Team = {
        name: "Team D",
        regDate: new Date().toISOString(),
        group: "new-group-id",
      };

      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: mockSet,
      });
      mockDoc.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
      });

      await teamService.createOrUpdate(newTeam);

      expect(mockSet).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAll", () => {
    it("should return all teams", async () => {
      const mockTeams: Team[] = [
        {
          id: "team1",
          name: "Team 1",
          regDate: new Date().toISOString(),
          group: "group1",
        },
        {
          id: "team2",
          name: "Team 2",
          regDate: new Date().toISOString(),
          group: "group2",
        },
      ];

      const mockGet = jest.fn().mockResolvedValue({
        forEach: (callback: (doc: any) => void) => {
          mockTeams.forEach((team) => callback({ data: () => team }));
        },
      });

      mockCollection.mockReturnValue({
        get: mockGet,
      });

      const result = await teamService.getAll();

      expect(result).toEqual(mockTeams);
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete a team", async () => {
      const teamId = "team-id";
      const mockGroupId = "group-id";

      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ group: mockGroupId }),
      });

      await teamService.delete(teamId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith(teamId);
    });

    it("should throw an error if team does not exist", async () => {
      const teamId = "nonexistent-team-id";

      mockGet.mockResolvedValue({ exists: false });

      await expect(teamService.delete(teamId)).rejects.toThrow(
        `Team with ID ${teamId} does not exist.`
      );
    });

    it("should update group count on delete", async () => {
      const teamId = "team-id";
      const mockGroupId = "group-id";

      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ group: mockGroupId }),
      });

      const mockGroupRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 2 }),
        }),
        update: mockUpdate,
        delete: mockDelete,
      };

      mockDoc.mockReturnValueOnce({
        get: mockGet,
        delete: mockDelete,
      });

      mockCollection.mockImplementation((collectionName) => {
        if (collectionName === "groups") {
          return {
            doc: jest.fn().mockReturnValue(mockGroupRef),
          };
        }
        return {
          doc: jest.fn().mockReturnValue({
            get: mockGet,
            delete: mockDelete,
          }),
        };
      });

      await teamService.delete(teamId);

      expect(mockUpdate).toHaveBeenCalledWith({ count: 1 });
    });

    it("should delete group if count reaches zero", async () => {
      const teamId = "team-id";
      const mockGroupId = "group-id";

      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ group: mockGroupId }),
      });

      const mockGroupRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 1 }),
        }),
        update: mockUpdate,
        delete: mockDelete,
      };

      mockDoc.mockReturnValueOnce(mockGroupRef);

      await teamService.delete(teamId);

      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
