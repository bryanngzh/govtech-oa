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
    it("should return null if match not found", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await matchService.get("nonexistent-match-id");

      expect(result).toBeNull();
      expect(mockCollection).toHaveBeenCalledWith("matches");
      expect(mockDoc).toHaveBeenCalledWith("nonexistent-match-id");
    });

    it("should return match if found", async () => {
      const mockMatch: Match = {
        id: "match-id",
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockMatch,
      });

      const result = await matchService.get("match-id");

      expect(result).toEqual(mockMatch);
      expect(mockCollection).toHaveBeenCalledWith("matches");
      expect(mockDoc).toHaveBeenCalledWith("match-id");
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
          forEach: (callback: (doc: any) => void) => {
            mockMatchesA.forEach((match) => callback({ data: () => match }));
          },
        }),
      });

      (db.collection("matches").where as jest.Mock).mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({
          forEach: (callback: (doc: any) => void) => {
            mockMatchesB.forEach((match) => callback({ data: () => match }));
          },
        }),
      });

      const stats = await matchService.getTeamStats(teamId);

      expect(stats).toEqual({
        totalMatches: 4,
        wins: 2,
        losses: 1,
        draws: 1,
      });
    });

    it("should return null if no matches found", async () => {
      const teamId = "team-id";

      mockCollection.mockReturnValueOnce({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            forEach: jest.fn(),
          }),
        }),
      });

      const stats = await matchService.getTeamStats(teamId);

      expect(stats).toEqual({
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
      });
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
    it("should return all matches", async () => {
      const mockMatches = [
        { teamA: "Team A", teamB: "Team B", scoreA: 1, scoreB: 2 },
        { teamA: "Team C", teamB: "Team D", scoreA: 3, scoreB: 4 },
      ];

      const mockMatchesSnapshot = {
        forEach: jest.fn((callback: (doc: any) => void) => {
          mockMatches.forEach((match, index) => {
            callback({
              id: `match-id-${index}`,
              data: () => match,
            });
          });
        }),
      };

      (db.collection("matches").get as jest.Mock).mockResolvedValueOnce(
        mockMatchesSnapshot
      );

      const result = await matchService.getAll();

      expect(result).toEqual([
        {
          id: "match-id-0",
          teamA: "Team A",
          teamB: "Team B",
          scoreA: 1,
          scoreB: 2,
        },
        {
          id: "match-id-1",
          teamA: "Team C",
          teamB: "Team D",
          scoreA: 3,
          scoreB: 4,
        },
      ]);
    });
  });

  describe("delete", () => {
    it("should delete a match", async () => {
      const matchId = "match-id";
      mockDoc.mockReturnValueOnce({
        delete: mockDelete,
      });

      await matchService.delete(matchId);

      expect(mockDelete).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith("matches");
      expect(mockDoc).toHaveBeenCalledWith(matchId);
    });
  });
});
