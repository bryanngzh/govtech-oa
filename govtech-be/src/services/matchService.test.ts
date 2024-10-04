import { db } from "../configs/firebase";
import { Match } from "../models/MatchModel";
import { Team } from "../models/TeamModel";
import { MatchService } from "./MatchService";

jest.mock("../configs/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("MatchService", () => {
  let matchService: MatchService;
  let mockGet: jest.Mock;
  let mockWhere: jest.Mock;
  let mockSet: jest.Mock;
  let mockDelete: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn();
    mockWhere = jest.fn().mockReturnThis();
    mockSet = jest.fn();
    mockDelete = jest.fn();

    (db.collection as jest.Mock).mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: mockGet,
        set: mockSet,
        delete: mockDelete,
      }),
      where: mockWhere,
      get: mockGet,
    });

    matchService = new MatchService();
  });

  describe("get", () => {
    it("should fetch a match by ID", async () => {
      const mockMatch: Match = {
        id: "match1",
        teamA: "team1",
        teamB: "team2",
        scoreA: 2,
        scoreB: 1,
      };

      mockGet.mockResolvedValue({
        exists: true,
        id: "match1",
        data: () => mockMatch,
      });

      const result = await matchService.get("match1");
      expect(result).toEqual(mockMatch);
    });

    it("should throw an error if match is not found", async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(matchService.get("nonexistent")).rejects.toThrow(
        "Match with ID nonexistent not found."
      );
    });

    it("should throw an error if match has no data", async () => {
      mockGet.mockResolvedValue({ exists: true, data: () => null });

      await expect(matchService.get("match1")).rejects.toThrow(
        "Match with ID match1 has no data."
      );
    });
  });

  describe("getAll", () => {
    it("should fetch all matches", async () => {
      const mockMatches: Match[] = [
        { id: "match1", teamA: "team1", teamB: "team2", scoreA: 2, scoreB: 1 },
        { id: "match2", teamA: "team3", teamB: "team4", scoreA: 0, scoreB: 0 },
      ];

      mockGet.mockResolvedValue({
        empty: false,
        docs: mockMatches.map((match) => ({
          id: match.id,
          data: () => match,
        })),
      });

      const result = await matchService.getAll();
      expect(result).toEqual(mockMatches);
    });

    it("should throw an error if no matches are found", async () => {
      mockGet.mockResolvedValue({ empty: true });

      await expect(matchService.getAll()).rejects.toThrow("No matches found.");
    });
  });

  describe("getMatchesByTeamId", () => {
    it("should fetch matches for a specific team", async () => {
      const teamId = "team1";
      const mockMatches: Match[] = [
        { id: "match1", teamA: teamId, teamB: "team2", scoreA: 2, scoreB: 1 },
        { id: "match2", teamA: "team3", teamB: teamId, scoreA: 1, scoreB: 1 },
      ];

      mockGet.mockResolvedValueOnce({
        docs: [mockMatches[0]].map((match) => ({
          id: match.id,
          data: () => match,
        })),
      });
      mockGet.mockResolvedValueOnce({
        docs: [mockMatches[1]].map((match) => ({
          id: match.id,
          data: () => match,
        })),
      });

      const result = await matchService.getMatchesByTeamId(teamId);
      expect(result).toEqual(mockMatches);
    });

    it("should throw an error if no matches are found for the team", async () => {
      mockGet.mockResolvedValue({ docs: [] });

      await expect(matchService.getMatchesByTeamId("team1")).rejects.toThrow(
        "No matches found for team with ID team1."
      );
    });
  });

  describe("create", () => {
    it("should create a new match", async () => {
      const newMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: 2,
        scoreB: 1,
      };

      const mockTeamA: Team = {
        id: "team1",
        group: "A",
        regDate: "new Date()",
      };
      const mockTeamB: Team = {
        id: "team2",
        group: "A",
        regDate: "new Date()",
      };

      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamA });
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamB });

      mockSet.mockResolvedValue({});

      const result = await matchService.create(newMatch);
      expect(result).toEqual(expect.objectContaining(newMatch));
    });

    it("should throw an error if teamB does not exist", async () => {
      const newMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: 2,
        scoreB: 1,
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ group: "A" }),
      });
      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(matchService.create(newMatch)).rejects.toThrow(
        "Team with ID team2 does not exist."
      );
    });

    it("should throw an error if teams are not in the same group", async () => {
      const newMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: 2,
        scoreB: 1,
      };

      const mockTeamA: Team = {
        id: "team1",
        group: "A",
        regDate: "new Date()",
      };
      const mockTeamB: Team = {
        id: "team2",
        group: "B",
        regDate: "new Date()",
      };

      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamA });
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamB });

      await expect(matchService.create(newMatch)).rejects.toThrow(
        "Teams team1 and team2 are not in the same group."
      );
    });

    it("should throw an error if a team does not exist", async () => {
      const newMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: 2,
        scoreB: 1,
      };

      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(matchService.create(newMatch)).rejects.toThrow(
        "Team with ID team1 does not exist."
      );
    });

    it("should throw an error if scores are not numbers", async () => {
      const newMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: "2" as any,
        scoreB: "1" as any,
      };

      await expect(matchService.create(newMatch)).rejects.toThrow(
        "Scores must be numbers."
      );
    });
  });

  describe("update", () => {
    it("should update an existing match", async () => {
      const updatedMatch: Match = {
        id: "match1",
        teamA: "team1",
        teamB: "team2",
        scoreA: 3,
        scoreB: 2,
      };

      const mockTeamA: Team = {
        id: "team1",
        group: "A",
        regDate: "new Date()",
      };
      const mockTeamB: Team = {
        id: "team2",
        group: "A",
        regDate: "new Date()",
      };

      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamA });
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeamB });
      mockGet.mockResolvedValueOnce({ exists: true });

      mockSet.mockResolvedValue({});

      const result = await matchService.update("match1", updatedMatch);
      expect(result).toEqual(updatedMatch);
    });

    it("should throw an error if match ID is not provided", async () => {
      const updatedMatch: Match = {
        teamA: "team1",
        teamB: "team2",
        scoreA: 3,
        scoreB: 2,
      };

      await expect(matchService.update("", updatedMatch)).rejects.toThrow(
        "Match ID is required for updates."
      );
    });

    it("should throw an error if scoreA is not a number", async () => {
      const updatedMatch: Match = {
        id: "match1",
        teamA: "team1",
        teamB: "team2",
        scoreA: "3" as any, // Invalid score type
        scoreB: 2,
      };

      await expect(matchService.update("match1", updatedMatch)).rejects.toThrow(
        "Scores must be numbers."
      );
    });

    it("should throw an error if scoreB is not a number", async () => {
      const updatedMatch: Match = {
        id: "match1",
        teamA: "team1",
        teamB: "team2",
        scoreA: 3,
        scoreB: "2" as any, // Invalid score type
      };

      await expect(matchService.update("match1", updatedMatch)).rejects.toThrow(
        "Scores must be numbers."
      );
    });

    it("should throw an error if match does not exist", async () => {
      const updatedMatch: Match = {
        id: "nonexistent",
        teamA: "team1",
        teamB: "team2",
        scoreA: 3,
        scoreB: 2,
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ group: "A" }),
      });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => ({ group: "A" }),
      });
      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(
        matchService.update("nonexistent", updatedMatch)
      ).rejects.toThrow(
        "Match with ID nonexistent does not exist. Please provide a valid ID to update."
      );
    });
  });

  describe("delete", () => {
    it("should delete an existing match", async () => {
      mockGet.mockResolvedValue({ exists: true });

      await expect(matchService.delete("match1")).resolves.not.toThrow();
      expect(mockDelete).toHaveBeenCalled();
    });

    it("should throw an error if match does not exist", async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(matchService.delete("nonexistent")).rejects.toThrow(
        "Match with ID nonexistent does not exist. Cannot delete."
      );
    });
  });

  describe("getTeamStats", () => {
    it("should calculate team statistics correctly", async () => {
      const teamId = "team1";
      const mockTeam: Team = { id: teamId, group: "A", regDate: "new Date()" };
      const mockMatches: Match[] = [
        { id: "match1", teamA: teamId, teamB: "team2", scoreA: 2, scoreB: 1 },
        { id: "match2", teamA: "team3", teamB: teamId, scoreA: 1, scoreB: 1 },
        { id: "match3", teamA: teamId, teamB: "team4", scoreA: 0, scoreB: 3 },
      ];

      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockTeam });
      mockGet.mockResolvedValueOnce({
        docs: mockMatches.slice(0, 2).map((m) => ({ data: () => m })),
      });
      mockGet.mockResolvedValueOnce({
        docs: mockMatches.slice(2).map((m) => ({ data: () => m })),
      });

      const result = await matchService.getTeamStats(teamId);

      expect(result).toEqual({
        id: teamId,
        group: "A",
        regDate: "new Date()",
        totalMatches: 3,
        wins: 1,
        losses: 1,
        draws: 1,
        points: 4,
        altPoints: 9,
      });
    });

    it("should throw an error if team does not exist", async () => {
      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(matchService.getTeamStats("nonexistent")).rejects.toThrow(
        "Team with ID nonexistent does not exist or has no data."
      );
    });
  });

  describe("getAllTeamStats", () => {
    it("should calculate statistics for all teams", async () => {
      const mockTeams: Team[] = [
        { id: "team1", group: "A", regDate: "new Date()" },
        { id: "team2", group: "A", regDate: "new Date()" },
        { id: "team3", group: "B", regDate: "new Date()" },
      ];

      const mockMatches: Match[] = [
        { id: "match1", teamA: "team1", teamB: "team2", scoreA: 2, scoreB: 1 },
        { id: "match2", teamA: "team2", teamB: "team3", scoreA: 1, scoreB: 1 },
        { id: "match3", teamA: "team3", teamB: "team1", scoreA: 0, scoreB: 3 },
      ];

      mockGet.mockResolvedValueOnce({
        docs: mockTeams.map((t) => ({ id: t.id, data: () => t })),
      });
      mockGet.mockResolvedValueOnce({
        docs: mockMatches.map((m) => ({ id: m.id, data: () => m })),
      });

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual({
        A: expect.arrayContaining([
          expect.objectContaining({
            id: "team1",
            totalMatches: 2,
            wins: 2,
            losses: 0,
            draws: 0,
          }),
          expect.objectContaining({
            id: "team2",
            totalMatches: 2,
            wins: 0,
            losses: 1,
            draws: 1,
          }),
        ]),
        B: expect.arrayContaining([
          expect.objectContaining({
            id: "team3",
            totalMatches: 2,
            wins: 0,
            losses: 1,
            draws: 1,
          }),
        ]),
      });
    });

    it("should return an empty object if no teams or matches exist", async () => {
      mockGet.mockResolvedValueOnce({ docs: [] });
      mockGet.mockResolvedValueOnce({ docs: [] });

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual({});
    });
  });
});
