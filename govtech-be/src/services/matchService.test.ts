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
});
