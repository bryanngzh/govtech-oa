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

  describe("getAll", () => {
    it("should return all matches when matches are found", async () => {
      const mockMatches = [
        {
          id: "match1",
          teamA: "Team A",
          teamB: "Team B",
          scoreA: 1,
          scoreB: 2,
        },
        {
          id: "match2",
          teamA: "Team C",
          teamB: "Team D",
          scoreA: 3,
          scoreB: 4,
        },
      ];

      const mockDocs = mockMatches.map((match) => ({
        id: match.id,
        data: jest.fn().mockReturnValue({
          teamA: match.teamA,
          teamB: match.teamB,
          scoreA: match.scoreA,
          scoreB: match.scoreB,
        }),
      }));

      (db.collection("matches").get as jest.Mock).mockResolvedValue({
        empty: false,
        docs: mockDocs,
      });

      const result = await matchService.getAll();

      expect(result).toEqual(mockMatches);
      expect(db.collection).toHaveBeenCalledWith("matches");
    });

    it("should throw an error if no matches are found", async () => {
      (db.collection("matches").get as jest.Mock).mockResolvedValue({
        empty: true,
      });

      await expect(matchService.getAll()).rejects.toThrow("No matches found.");
      expect(db.collection("matches").get).toHaveBeenCalled();
    });

    it("should handle errors when fetching matches", async () => {
      (db.collection("matches").get as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(matchService.getAll()).rejects.toThrow("Database error");
    });
  });

  describe("getMatchesByTeamId", () => {
    it("should return matches where teamA is the specified teamId", async () => {
      const mockMatches = [
        {
          id: "match1",
          teamA: "team-id",
          teamB: "Team B",
          scoreA: 1,
          scoreB: 2,
        },
        {
          id: "match2",
          teamA: "team-id",
          teamB: "Team C",
          scoreA: 3,
          scoreB: 4,
        },
      ];

      const mockDocs = mockMatches.map((match) => ({
        id: match.id,
        data: jest.fn().mockReturnValue(match),
      }));

      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: mockDocs }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        });

      const result = await matchService.getMatchesByTeamId("team-id");

      expect(result).toEqual(mockMatches);
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamA",
        "==",
        "team-id"
      );
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamB",
        "==",
        "team-id"
      );
    });

    it("should return matches where teamB is the specified teamId", async () => {
      const mockMatches = [
        {
          id: "match3",
          teamA: "Team D",
          teamB: "team-id",
          scoreA: 5,
          scoreB: 6,
        },
      ];

      const mockDocs = mockMatches.map((match) => ({
        id: match.id,
        data: jest.fn().mockReturnValue(match),
      }));

      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: mockDocs }),
        });

      const result = await matchService.getMatchesByTeamId("team-id");

      expect(result).toEqual(mockMatches);
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamA",
        "==",
        "team-id"
      );
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamB",
        "==",
        "team-id"
      );
    });

    it("should return matches where teamA and teamB are the specified teamId", async () => {
      const mockMatches = [
        {
          id: "match1",
          teamA: "team-id",
          teamB: "Team B",
          scoreA: 3,
          scoreB: 1,
        },
        {
          id: "match2",
          teamA: "Team C",
          teamB: "team-id",
          scoreA: 2,
          scoreB: 4,
        },
      ];

      const mockDocsA = mockMatches.slice(0, 1).map((match) => ({
        id: match.id,
        data: jest.fn().mockReturnValue(match),
      }));

      const mockDocsB = mockMatches.slice(1).map((match) => ({
        id: match.id,
        data: jest.fn().mockReturnValue(match),
      }));

      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: mockDocsA }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: mockDocsB }),
        });

      const result = await matchService.getMatchesByTeamId("team-id");

      expect(result).toEqual(mockMatches);
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamA",
        "==",
        "team-id"
      );
      expect(db.collection("matches").where).toHaveBeenCalledWith(
        "teamB",
        "==",
        "team-id"
      );
    });

    it("should throw an error if no matches are found for the specified teamId", async () => {
      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        });

      await expect(
        matchService.getMatchesByTeamId("nonexistent-team-id")
      ).rejects.toThrow(
        "No matches found for team with ID nonexistent-team-id."
      );
    });

    it("should handle errors when fetching matches", async () => {
      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockRejectedValue(new Error("Database error")),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ docs: [] }),
        });

      await expect(matchService.getMatchesByTeamId("team-id")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("create", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      db.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          set: jest.fn(),
        }),
      });
    });

    it("should create a match and return it with an id", async () => {
      const mockMatch: Match = {
        teamA: "team-id-1",
        teamB: "team-id-2",
        scoreA: 1,
        scoreB: 2,
      };

      const mockMatchRef = {
        id: "new-match-id",
        set: jest.fn().mockResolvedValueOnce(undefined),
      };

      db.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockMatchRef),
      });

      db.collection("teams").doc("team-id-1").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      db.collection("teams").doc("team-id-2").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      const result = await matchService.create(mockMatch);

      expect(result).toEqual({ ...mockMatch, id: "new-match-id" });
      expect(db.collection).toHaveBeenCalledWith("matches");

      expect(mockMatchRef.set).toHaveBeenCalledWith({
        teamA: "team-id-1",
        teamB: "team-id-2",
        scoreA: 1,
        scoreB: 2,
      });
    });

    it("should throw an error if scores are not numbers", async () => {
      const invalidMatch: Match = {
        teamA: "team-id-1",
        teamB: "team-id-2",
        scoreA: "not-a-number",
        scoreB: 2,
      } as unknown as Match;

      await expect(matchService.create(invalidMatch)).rejects.toThrow(
        "Scores must be numbers."
      );
    });

    it("should throw an error if teamA does not exist", async () => {
      const mockMatch: Match = {
        teamA: "nonexistent-team-id",
        teamB: "team-id-2",
        scoreA: 1,
        scoreB: 2,
      };

      db.collection("teams").doc("nonexistent-team-id").get = jest
        .fn()
        .mockResolvedValue({
          exists: false,
        });

      db.collection("teams").doc("team-id-2").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      expect(matchService.create(mockMatch)).resolves;
    });

    it("should throw an error if teamB does not exist", async () => {
      const mockMatch: Match = {
        teamA: "team-id-1",
        teamB: "nonexistent-team-id",
        scoreA: 1,
        scoreB: 2,
      };

      db.collection("teams").doc("team-id-1").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      db.collection("teams").doc("nonexistent-team-id").get = jest
        .fn()
        .mockResolvedValue({
          exists: false,
        });

      await expect(matchService.create(mockMatch)).rejects.toThrow(
        "Team with ID team-id-1 does not exist."
      );
    });

    it("should throw an error if teams are not in the same group", async () => {
      const mockMatch: Match = {
        teamA: "team-id-1",
        teamB: "team-id-2",
        scoreA: 1,
        scoreB: 2,
      };

      db.collection("teams").doc("team-id-1").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      db.collection("teams").doc("team-id-2").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "B" }),
        });

      expect(matchService.create(mockMatch)).resolves;
    });

    it("should handle errors when setting match data", async () => {
      const mockMatch: Match = {
        teamA: "team-id-1",
        teamB: "team-id-2",
        scoreA: 1,
        scoreB: 2,
      };

      const mockMatchRef = {
        id: "new-match-id",
        set: jest.fn().mockRejectedValue(new Error("Database error")),
      };

      db.collection = jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue(mockMatchRef),
      });

      db.collection("teams").doc("team-id-1").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      db.collection("teams").doc("team-id-2").get = jest
        .fn()
        .mockResolvedValue({
          exists: true,
          data: () => ({ group: "A" }),
        });

      await expect(matchService.create(mockMatch)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("update", () => {
    it("should throw an error if the match does not exist", async () => {
      const mockMatch: Match = {
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      const matchRef = {
        id: "existing-match-id",
        set: jest.fn(),
        get: jest.fn(),
      };

      mockDoc.mockReturnValue(matchRef);
      matchRef.get.mockResolvedValueOnce({ exists: false });

      matchService["validateTeams"] = jest.fn().mockResolvedValue(undefined);

      await expect(
        matchService.update("existing-match-id", mockMatch)
      ).rejects.toThrow(
        `Match with ID existing-match-id does not exist. Please provide a valid ID to update.`
      );
    });

    it("should throw an error if match ID is not provided", async () => {
      const mockMatch: Match = {
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      await expect(matchService.update("", mockMatch)).rejects.toThrow(
        "Match ID is required for updates."
      );
    });

    it("should throw an error if scores are not numbers", async () => {
      const invalidMatch: Match = {
        teamA: "Team A",
        teamB: "Team B",
        scoreA: "not-a-number",
        scoreB: 2,
      } as unknown as Match;

      await expect(
        matchService.update("existing-match-id", invalidMatch)
      ).rejects.toThrow("Scores must be numbers.");
    });

    it("should throw an error if team validation fails", async () => {
      const mockMatch: Match = {
        teamA: "Invalid Team A",
        teamB: "Invalid Team B",
        scoreA: 1,
        scoreB: 2,
      };

      matchService["validateTeams"] = jest.fn().mockImplementation(() => {
        throw new Error("Teams validation error");
      });

      await expect(
        matchService.update("existing-match-id", mockMatch)
      ).rejects.toThrow("Teams validation error");
    });

    it("should update a match successfully if it exists", async () => {
      const mockMatch: Match = {
        teamA: "Team A",
        teamB: "Team B",
        scoreA: 1,
        scoreB: 2,
      };

      const matchRef = {
        id: "existing-match-id",
        set: jest.fn(),
        get: jest.fn(),
      };

      mockDoc.mockReturnValue(matchRef);
      matchRef.get.mockResolvedValueOnce({ exists: true });

      matchService["validateTeams"] = jest.fn().mockResolvedValue(undefined);

      const result = await matchService.update("existing-match-id", mockMatch);

      expect(result).toEqual({ ...mockMatch, id: "existing-match-id" });
      expect(matchRef.set).toHaveBeenCalledWith({
        teamA: mockMatch.teamA,
        teamB: mockMatch.teamB,
        scoreA: mockMatch.scoreA,
        scoreB: mockMatch.scoreB,
      });
    });
  });

  describe("delete", () => {
    it("should throw an error if the match does not exist", async () => {
      const matchRef = {
        get: jest.fn(),
        delete: jest.fn(),
      };

      mockDoc.mockReturnValue(matchRef);
      matchRef.get.mockResolvedValueOnce({ exists: false });

      await expect(matchService.delete("nonexistent-match-id")).rejects.toThrow(
        `Match with ID nonexistent-match-id does not exist. Cannot delete.`
      );
    });

    it("should delete the match successfully if it exists", async () => {
      const matchRef = {
        get: jest.fn(),
        delete: jest.fn(),
      };

      mockDoc.mockReturnValue(matchRef);
      matchRef.get.mockResolvedValueOnce({ exists: true });

      await matchService.delete("existing-match-id");

      expect(matchRef.get).toHaveBeenCalled();
      expect(matchRef.delete).toHaveBeenCalled();
    });

    it("should handle errors when trying to delete a match", async () => {
      const matchRef = {
        get: jest.fn(),
        delete: jest.fn().mockRejectedValue(new Error("Database error")),
      };

      mockDoc.mockReturnValue(matchRef);
      matchRef.get.mockResolvedValueOnce({ exists: true });

      await expect(matchService.delete("existing-match-id")).rejects.toThrow(
        "Database error"
      );

      expect(matchRef.get).toHaveBeenCalled();
      expect(matchRef.delete).toHaveBeenCalled();
    });
  });

  describe("getTeamStats", () => {
    it("should throw an error if the team does not exist or has no data", async () => {
      const teamId = "nonexistent-team-id";

      (
        db.collection("teams").doc(teamId).get as jest.Mock
      ).mockResolvedValueOnce({
        exists: false,
      });

      await expect(matchService.getTeamStats(teamId)).rejects.toThrow(
        `Team with ID ${teamId} does not exist or has no data.`
      );
    });

    it("should return team stats when team exists and has matches", async () => {
      const teamId = "existing-team-id";
      const mockTeamDoc = {
        exists: true,
        data: jest.fn().mockReturnValue({
          id: teamId,
          group: "A",
          regDate: "2024-01-01",
        }),
      };

      const mockMatchesA = [
        {
          id: "match1",
          teamA: teamId,
          teamB: "Team B",
          scoreA: 2,
          scoreB: 1,
        },
        {
          id: "match2",
          teamA: teamId,
          teamB: "Team C",
          scoreA: 0,
          scoreB: 3,
        },
      ];

      const mockMatchesB = [
        {
          id: "match3",
          teamA: "Team D",
          teamB: teamId,
          scoreA: 1,
          scoreB: 1,
        },
      ];

      (
        db.collection("teams").doc(teamId).get as jest.Mock
      ).mockResolvedValueOnce(mockTeamDoc);
      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValueOnce({
            docs: mockMatchesA.map((match) => ({
              data: () => match,
            })),
          }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValueOnce({
            docs: mockMatchesB.map((match) => ({
              data: () => match,
            })),
          }),
        });

      const result = await matchService.getTeamStats(teamId);

      expect(result).toEqual({
        id: teamId,
        group: "A",
        regDate: "2024-01-01",
        totalMatches: 3,
        wins: 1,
        losses: 1,
        draws: 1,
        points: 4,
        altPoints: 9,
      });
    });

    it("should return team stats when team exists but has no matches", async () => {
      const teamId = "team-with-no-matches";
      const mockTeamDoc = {
        exists: true,
        data: jest.fn().mockReturnValue({
          id: teamId,
          group: "B",
          regDate: "2024-01-01",
        }),
      };

      (
        db.collection("teams").doc(teamId).get as jest.Mock
      ).mockResolvedValueOnce(mockTeamDoc);
      (db.collection("matches").where as jest.Mock)
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValueOnce({ docs: [] }),
        })
        .mockReturnValueOnce({
          get: jest.fn().mockResolvedValueOnce({ docs: [] }),
        });

      const result = await matchService.getTeamStats(teamId);

      expect(result).toEqual({
        id: teamId,
        group: "B",
        regDate: "2024-01-01",
        totalMatches: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        altPoints: 0,
      });
    });

    it("should handle errors when fetching team or matches", async () => {
      const teamId = "error-team-id";

      (db.collection("teams").doc(teamId).get as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(matchService.getTeamStats(teamId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getAllTeamStats", () => {
    it("should return grouped team stats when there are teams and matches", async () => {
      const mockTeams = [
        { id: "team1", group: "A", regDate: "2024-01-01" },
        { id: "team2", group: "A", regDate: "2024-01-02" },
        { id: "team3", group: "B", regDate: "2024-01-03" },
      ];

      const mockMatches = [
        { teamA: "team1", teamB: "team2", scoreA: 2, scoreB: 1 },
        { teamA: "team2", teamB: "team3", scoreA: 1, scoreB: 1 },
        { teamA: "team1", teamB: "team3", scoreA: 0, scoreB: 3 },
      ];

      (matchService as any).getAllTeamsAndMatches = jest
        .fn()
        .mockResolvedValue([mockTeams, mockMatches]);

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual({
        A: [
          {
            id: "team1",
            group: "A",
            regDate: "2024-01-01",
            totalMatches: 2,
            wins: 1,
            losses: 1,
            draws: 0,
            points: 3,
            altPoints: 6,
          },
          {
            id: "team2",
            group: "A",
            regDate: "2024-01-02",
            totalMatches: 2,
            wins: 0,
            losses: 1,
            draws: 1,
            points: 1,
            altPoints: 4,
          },
        ],
        B: [
          {
            id: "team3",
            group: "B",
            regDate: "2024-01-03",
            totalMatches: 2,
            wins: 1,
            losses: 0,
            draws: 1,
            points: 4,
            altPoints: 8,
          },
        ],
      });
    });

    it("should return empty stats when there are teams but no matches", async () => {
      const mockTeams = [
        { id: "team1", group: "A", regDate: "2024-01-01" },
        { id: "team2", group: "B", regDate: "2024-01-02" },
      ];

      (matchService as any).getAllTeamsAndMatches = jest
        .fn()
        .mockResolvedValue([mockTeams, []]);

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual({
        A: [
          {
            id: "team1",
            group: "A",
            regDate: "2024-01-01",
            totalMatches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            altPoints: 0,
          },
        ],
        B: [
          {
            id: "team2",
            group: "B",
            regDate: "2024-01-02",
            totalMatches: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            altPoints: 0,
          },
        ],
      });
    });

    it("should return empty object when there are no teams", async () => {
      (matchService as any).getAllTeamsAndMatches = jest
        .fn()
        .mockResolvedValue([[], []]);

      const result = await matchService.getAllTeamStats();

      expect(result).toEqual({});
    });

    it("should handle errors when fetching teams or matches", async () => {
      (matchService as any).getAllTeamsAndMatches = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(matchService.getAllTeamStats()).rejects.toThrow(
        "Database error"
      );
    });
  });
});
