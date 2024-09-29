import { db } from "../configs/firebase";
import { Match } from "../models/matchModel";
import { MatchService } from "./matchService";

jest.mock("../configs/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("MatchService", () => {
  let matchService: MatchService;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    matchService = new MatchService();
    mockSet = jest.fn();
    mockGet = jest.fn();
    mockDelete = jest.fn();
    mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    });
    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
      get: jest.fn(),
    });
    (db.collection as jest.Mock).mockImplementation(mockCollection);
  });

  describe("get", () => {
    it("should return a match if found", async () => {
      const mockMatch: Match = {
        id: "match-id",
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      (
        db.collection("matches").doc("match-id").get as jest.Mock
      ).mockResolvedValue({
        exists: true,
        id: "match-id",
        data: () => mockMatch,
      });

      const result = await matchService.get("match-id");

      expect(result).toEqual(mockMatch);
      expect(db.collection).toHaveBeenCalledWith("matches");
      expect(db.collection("matches").doc).toHaveBeenCalledWith("match-id");
    });

    it("should throw an error if match not found", async () => {
      (
        db.collection("matches").doc("nonexistent-match-id").get as jest.Mock
      ).mockResolvedValue({
        exists: false,
      });

      await expect(matchService.get("nonexistent-match-id")).rejects.toThrow(
        "Match with ID nonexistent-match-id not found."
      );
      expect(db.collection("matches").doc).toHaveBeenCalledWith(
        "nonexistent-match-id"
      );
    });

    it("should throw an error if match exists but has no data", async () => {
      (
        db.collection("matches").doc("match-id").get as jest.Mock
      ).mockResolvedValue({
        exists: true,
        id: "match-id",
        data: () => null,
      });

      await expect(matchService.get("match-id")).rejects.toThrow(
        "Match with ID match-id has no data."
      );
    });

    it("should handle errors when fetching a match", async () => {
      (
        db.collection("matches").doc("match-id").get as jest.Mock
      ).mockRejectedValue(new Error("Database error"));

      await expect(matchService.get("match-id")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getTeamStats", () => {
    it("should return team stats", async () => {
      const teamId = "team-id";

      const mockMatchesA = [
        { teamA: teamId, scoreA: 2, scoreB: 1 },
        { teamA: teamId, scoreA: 0, scoreB: 2 },
      ];

      const mockMatchesB = [
        { teamB: teamId, scoreA: 1, scoreB: 1 },
        { teamB: teamId, scoreA: 0, scoreB: 2 },
      ];

      (db.collection("matches").where as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          docs: mockMatchesA.map((match) => ({
            data: () => match,
          })),
        }),
      });

      (db.collection("matches").where as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          docs: mockMatchesB.map((match) => ({
            data: () => match,
          })),
        }),
      });

      const stats = await matchService.getTeamStats(teamId);

      expect(stats).toEqual({
        id: teamId,
        totalMatches: 4,
        wins: 2,
        losses: 1,
        draws: 1,
      });
    });
  });

  describe("getAllTeamStats", () => {
    it("should return team stats when teams exist", async () => {
      const mockTeams = [
        { id: "team-1", name: "Team One", regDate: "2024-01-01", group: "A" },
        { id: "team-2", name: "Team Two", regDate: "2024-01-02", group: "B" },
      ];

      const mockTeamStats = [
        { id: "team-1", totalMatches: 5, wins: 3, losses: 1, draws: 1 },
        { id: "team-2", totalMatches: 4, wins: 2, losses: 2, draws: 0 },
      ];

      (db.collection("teams").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn((callback) => {
          mockTeams.forEach((team) =>
            callback({ id: team.id, data: () => team })
          );
        }),
      });

      jest
        .spyOn(matchService, "getTeamStats")
        .mockResolvedValueOnce(mockTeamStats[0])
        .mockResolvedValueOnce(mockTeamStats[1]);

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual(mockTeamStats);
      expect(db.collection).toHaveBeenCalledWith("teams");
    });

    it("should return an empty array if no teams exist", async () => {
      (db.collection("teams").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual([]);
      expect(db.collection).toHaveBeenCalledWith("teams");
    });

    it("should filter out null team stats", async () => {
      const mockTeams = [
        { id: "team-1", name: "Team One", regDate: "2024-01-01", group: "A" },
        { id: "team-2", name: "Team Two", regDate: "2024-01-02", group: "B" },
      ];

      (db.collection("teams").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn((callback) => {
          mockTeams.forEach((team) =>
            callback({ id: team.id, data: () => team })
          );
        }),
      });

      jest
        .spyOn(matchService, "getTeamStats")
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: "team-2",
          totalMatches: 4,
          wins: 2,
          losses: 2,
          draws: 0,
        });

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual([
        { id: "team-2", totalMatches: 4, wins: 2, losses: 2, draws: 0 },
      ]);
    });

    it("should handle errors when fetching teams", async () => {
      (db.collection("teams").get as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(matchService.getAllTeamStats()).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle errors when fetching team stats", async () => {
      const mockTeams = [
        { id: "team-1", name: "Team One", regDate: "2024-01-01", group: "A" },
      ];

      (db.collection("teams").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn((callback) => {
          mockTeams.forEach((team) =>
            callback({ id: team.id, data: () => team })
          );
        }),
      });

      jest
        .spyOn(matchService, "getTeamStats")
        .mockRejectedValue(new Error("Team stats error"));

      await expect(matchService.getAllTeamStats()).rejects.toThrow(
        "Team stats error"
      );
    });
  });

  describe("createOrUpdate", () => {
    it("should create a new match", async () => {
      const newMatch: Match = {
        id: "",
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      const mockMatchRef = {
        id: "new-match-id",
        set: jest.fn(),
      };
      mockDoc.mockReturnValueOnce(mockMatchRef);

      const result = await matchService.createOrUpdate(newMatch);

      expect(result).toEqual({ ...newMatch, id: "new-match-id" });
    });

    it("should update an existing match", async () => {
      const existingMatch: Match = {
        id: "existing-match-id",
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      mockGet.mockResolvedValueOnce({ exists: true });

      const result = await matchService.createOrUpdate(existingMatch);

      expect(mockSet).toHaveBeenCalledWith({
        teamA: existingMatch.teamA,
        teamB: existingMatch.teamB,
        scoreA: existingMatch.scoreA,
        scoreB: existingMatch.scoreB,
      });
      expect(result).toEqual({ ...existingMatch });
    });

    it("should throw an error if trying to update a non-existent match", async () => {
      const matchToUpdate: Match = {
        id: "nonexistent-match-id",
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(matchService.createOrUpdate(matchToUpdate)).rejects.toThrow(
        `Match with ID ${matchToUpdate.id} does not exist. Please provide a valid ID to update.`
      );
    });
  });

  describe("getAll", () => {
    it("should return all matches when they exist", async () => {
      const mockMatches = [
        {
          id: "match-1",
          teamA: "Team A",
          teamB: "Team B",
          scoreA: 1,
          scoreB: 2,
        },
        {
          id: "match-2",
          teamA: "Team C",
          teamB: "Team D",
          scoreA: 3,
          scoreB: 1,
        },
      ];

      (db.collection("matches").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn((callback) => {
          mockMatches.forEach((match) =>
            callback({ id: match.id, data: () => match })
          );
        }),
      });

      const result = await matchService.getAll();

      expect(result).toEqual(mockMatches);
      expect(db.collection).toHaveBeenCalledWith("matches");
    });

    it("should throw an error if no matches exist", async () => {
      (db.collection("matches").get as jest.Mock).mockResolvedValue({
        forEach: jest.fn(),
      });

      await expect(matchService.getAll()).rejects.toThrow("No matches found.");
      expect(db.collection).toHaveBeenCalledWith("matches");
    });

    it("should handle errors when fetching matches", async () => {
      (db.collection("matches").get as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(matchService.getAll()).rejects.toThrow("Database error");
    });
  });

  describe("delete", () => {
    it("should delete a match", async () => {
      const matchId = "match-id";

      const matchRefMock = {
        get: jest.fn().mockResolvedValue({ exists: true }),
        delete: jest.fn(),
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue(matchRefMock),
      });

      await matchService.delete(matchId);

      expect(matchRefMock.delete).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith("matches");
      expect(mockCollection().doc).toHaveBeenCalledWith(matchId);
    });

    it("should throw an error if the match does not exist", async () => {
      const matchId = "nonexistent-id";

      const matchRefMock = {
        get: jest.fn().mockResolvedValue({ exists: false }),
        delete: jest.fn(),
      };

      mockCollection.mockReturnValue({
        doc: jest.fn().mockReturnValue(matchRefMock),
      });

      await expect(matchService.delete(matchId)).rejects.toThrow(
        `Match with ID ${matchId} does not exist. Cannot delete.`
      );

      expect(matchRefMock.get).toHaveBeenCalled();
      expect(matchRefMock.delete).not.toHaveBeenCalled();
    });
  });
});
