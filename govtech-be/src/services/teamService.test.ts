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
    it("should return a team if found", async () => {
      const mockTeam: Team = {
        id: "team-id",
        regDate: "2024-01-01",
        group: "Group A",
      };

      (
        db.collection("teams").doc("team-id").get as jest.Mock
      ).mockResolvedValue({
        exists: true,
        id: "team-id",
        data: () => mockTeam,
      });

      const result = await teamService.get("team-id");

      expect(result).toEqual(mockTeam);
      expect(db.collection).toHaveBeenCalledWith("teams");
      expect(db.collection("teams").doc).toHaveBeenCalledWith("team-id");
    });

    it("should throw an error if team not found", async () => {
      (
        db.collection("teams").doc("nonexistent-team-id").get as jest.Mock
      ).mockResolvedValue({
        exists: false,
      });

      await expect(teamService.get("nonexistent-team-id")).rejects.toThrow(
        "Team with ID nonexistent-team-id not found."
      );
      expect(db.collection("teams").doc).toHaveBeenCalledWith(
        "nonexistent-team-id"
      );
    });

    it("should return null if team exists but has no data", async () => {
      (
        db.collection("teams").doc("team-id").get as jest.Mock
      ).mockResolvedValue({
        exists: true,
        id: "team-id",
        data: () => null,
      });

      const result = await teamService.get("team-id");

      expect(result).toBeNull();
    });

    it("should handle errors when fetching a team", async () => {
      (
        db.collection("teams").doc("team-id").get as jest.Mock
      ).mockRejectedValue(new Error("Database error"));

      await expect(teamService.get("team-id")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createOrUpdate", () => {
    it("should create a new team", async () => {
      const newTeam: Team = {
        id: "team B",
        regDate: new Date().toISOString(),
        group: "group-id",
      };

      const mockTeamDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
        id: newTeam.id,
      };

      const mockGroupDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };

      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockImplementation((id) => {
          if (id === newTeam.group) {
            return mockGroupDoc;
          }
          return mockTeamDoc;
        }),
        get: jest.fn(),
      });

      jest.spyOn(db, "collection").mockImplementation(mockCollection);

      const result = await teamService.createOrUpdate(newTeam);

      expect(result.id).toBe(newTeam.id);
      expect(mockTeamDoc.set).toHaveBeenCalledWith({
        regDate: newTeam.regDate,
        group: newTeam.group,
      });
      expect(mockGroupDoc.set).toHaveBeenCalledWith({ count: 1 });
    });

    it("should update an existing team", async () => {
      const existingTeam: Team = {
        id: "team-id",
        regDate: new Date().toISOString(),
        group: "group-id",
      };

      const mockTeamDoc = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: "team-id",
          data: () => ({
            regDate: new Date().toISOString(),
            group: "old-group-id", // Old group ID
          }),
        }),
        set: jest.fn(),
      };

      const mockGroupDocOld = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 5 }), // Old count of teams in the old group
        }),
        update: jest.fn(),
        delete: jest.fn(),
      };

      const mockGroupDocNew = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 2 }), // New count of teams in the new group
        }),
        update: jest.fn(),
        set: jest.fn(),
      };

      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockImplementation((id) => {
          if (id === "team-id") {
            return mockTeamDoc; // Return the mock for the existing team
          } else if (id === "old-group-id") {
            return mockGroupDocOld; // Return the mock for the old group
          } else if (id === "group-id") {
            return mockGroupDocNew; // Return the mock for the new group
          }
          return {};
        }),
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      // Mock Firestore's collection method
      jest.spyOn(db, "collection").mockImplementation(mockCollection);

      // Call the method being tested
      const result = await teamService.createOrUpdate(existingTeam);

      // Assertions to ensure correct behavior
      expect(result.id).toBe(existingTeam.id); // Check that the returned ID is correct
      expect(mockTeamDoc.set).toHaveBeenCalledWith({
        regDate: existingTeam.regDate,
        group: existingTeam.group,
      });
      expect(mockGroupDocOld.update).toHaveBeenCalledWith({ count: 4 }); // Check that the old group count is decremented
      expect(mockGroupDocNew.update).toHaveBeenCalledWith({ count: 3 }); // Check that the new group count is incremented
    });

    it("should create a new group if it does not exist", async () => {
      const newTeam: Team = {
        id: "Team D",
        regDate: new Date().toISOString(),
        group: "new-group-id",
      };

      const mockTeamDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
      };
      const mockGroupDoc = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        set: jest.fn(),
        update: jest.fn(),
      };

      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockImplementation((id) => {
          if (id === newTeam.group) {
            return mockGroupDoc;
          }
          return mockTeamDoc;
        }),
        get: jest.fn(),
      });

      db.collection = mockCollection;

      await teamService.createOrUpdate(newTeam);

      expect(mockGroupDoc.set).toHaveBeenCalledWith({ count: 1 });
    });

    it("should delete the group if its count becomes zero after updating a team", async () => {
      const existingTeam: Team = {
        id: "Team to Remove",
        regDate: new Date().toISOString(),
        group: "old-group-id",
      };

      const mockTeamDoc = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            regDate: new Date().toISOString(),
            group: "old-group-id",
          }),
        }),
        set: jest.fn(),
      };

      const mockGroupDocOld = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 1 }),
        }),
        update: jest.fn(),
        delete: jest.fn(),
      };

      const mockGroupDocNew = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ count: 3 }),
        }),
        update: jest.fn(),
        set: jest.fn(),
      };

      const mockCollection = jest.fn().mockReturnValue({
        doc: jest.fn().mockImplementation((id) => {
          if (id === existingTeam.id) {
            return mockTeamDoc;
          } else if (id === "old-group-id") {
            return mockGroupDocOld;
          } else if (id === "new-group-id") {
            return mockGroupDocNew;
          }
          return {};
        }),
        get: jest.fn().mockResolvedValue({
          docs: [],
        }),
      });

      jest.spyOn(db, "collection").mockImplementation(mockCollection);

      existingTeam.group = "new-group-id";

      await teamService.createOrUpdate(existingTeam);

      expect(mockGroupDocOld.update).toHaveBeenCalledWith({ count: 0 });
      expect(mockGroupDocOld.delete).toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should return all teams", async () => {
      const mockTeams: Team[] = [
        {
          id: "team1",
          regDate: new Date().toISOString(),
          group: "group1",
        },
        {
          id: "team2",
          regDate: new Date().toISOString(),
          group: "group2",
        },
      ];

      const mockDocs = mockTeams.map((team) => ({
        id: team.id,
        data: () => team,
      }));

      const mockGet = jest.fn().mockResolvedValue({
        empty: false,
        docs: mockDocs,
      });

      mockCollection.mockReturnValue({
        get: mockGet,
      });

      const result = await teamService.getAll();

      expect(result).toEqual(mockTeams);
      expect(mockGet).toHaveBeenCalled();
    });

    it("should throw an error when there are no teams", async () => {
      const mockEmptySnapshot = {
        empty: true,
        docs: [],
      };

      (db.collection("teams").get as jest.Mock).mockResolvedValueOnce(
        mockEmptySnapshot
      );

      await expect(teamService.getAll()).rejects.toThrow("No teams found.");
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

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should handle case where team has no associated group", async () => {
      const teamId = "team-id";

      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({}),
      });

      await teamService.delete(teamId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith("teams");
      expect(mockDoc).toHaveBeenCalledWith(teamId);
      expect(mockCollection).not.toHaveBeenCalledWith("groups");
    });

    it("should handle case where group does not exist after team deletion", async () => {
      const teamId = "team-id";
      const mockGroupId = "group-id";

      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({ group: mockGroupId }),
      });

      const mockGroupRef = {
        get: jest.fn().mockResolvedValue({
          exists: false,
        }),
        update: mockUpdate,
        delete: mockDelete,
      };

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

      expect(mockDelete).toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalledWith(mockGroupId);
    });
  });
});
