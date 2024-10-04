import { db } from "../configs/firebase";
import { LogEntry } from "../models/logModel";
import { LogService } from "./logService";

jest.mock("../configs/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("LogService", () => {
  let logService: LogService;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockStartAfter: jest.Mock;
  let mockGet: jest.Mock;

  beforeEach(() => {
    mockOrderBy = jest.fn().mockReturnThis();
    mockLimit = jest.fn().mockReturnThis();
    mockStartAfter = jest.fn().mockReturnThis();
    mockGet = jest.fn();

    (db.collection as jest.Mock).mockReturnValue({
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
      get: mockGet,
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
      }),
    });

    logService = new LogService();
  });

  describe("getAllLogs", () => {
    it("should fetch logs without pagination", async () => {
      const mockLogs: LogEntry[] = [
        {
          id: "log1",
          user: "user1",
          method: "GET",
          url: "/api/resource",
          requestBody: {},
          responseStatus: 200,
          timestamp: "2023-05-01T12:00:00Z",
        },
        {
          id: "log2",
          user: "user2",
          method: "POST",
          url: "/api/resource",
          requestBody: { key: "value" },
          responseStatus: 201,
          timestamp: "2023-05-01T12:01:00Z",
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockLogs.map((log) => ({
          id: log.id,
          data: () => ({ ...log, id: log.id }),
        })),
      });

      const result = await logService.getAllLogs(2);

      expect(result.logs).toEqual(mockLogs);
      expect(result.nextDoc).toBe("log2");
      expect(mockOrderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(mockLimit).toHaveBeenCalledWith(2);
      expect(mockStartAfter).not.toHaveBeenCalled();
    });

    it("should fetch logs with pagination", async () => {
      const mockLogs: LogEntry[] = [
        {
          id: "log3",
          user: "user3",
          method: "PUT",
          url: "/api/resource/1",
          requestBody: { key: "updated" },
          responseStatus: 200,
          timestamp: "2023-05-01T12:02:00Z",
        },
        {
          id: "log4",
          user: "user4",
          method: "DELETE",
          url: "/api/resource/2",
          requestBody: {},
          responseStatus: 204,
          timestamp: "2023-05-01T12:03:00Z",
        },
      ];

      const mockLastDoc = {
        exists: true,
      };

      (db.collection("logs").doc("log2").get as jest.Mock).mockResolvedValue(
        mockLastDoc
      );

      mockGet.mockResolvedValue({
        docs: mockLogs.map((log) => ({
          id: log.id,
          data: () => ({ ...log, id: log.id }),
        })),
      });

      const result = await logService.getAllLogs(2, "log2");

      expect(result.logs).toEqual(mockLogs);
      expect(result.nextDoc).toBe("log4");
      expect(mockOrderBy).toHaveBeenCalledWith("timestamp", "desc");
      expect(mockLimit).toHaveBeenCalledWith(2);
      expect(mockStartAfter).toHaveBeenCalled();
    });

    it("should handle when there are no more logs", async () => {
      const mockLogs: LogEntry[] = [
        {
          id: "log5",
          user: "user5",
          method: "GET",
          url: "/api/resource/3",
          requestBody: {},
          responseStatus: 200,
          timestamp: "2023-05-01T12:04:00Z",
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockLogs.map((log) => ({
          id: log.id,
          data: () => ({ ...log, id: "log5" }),
        })),
      });

      const result = await logService.getAllLogs(2);

      expect(result.logs).toEqual(mockLogs);
      expect(result.nextDoc).toBeUndefined();
    });

    it("should throw an error if the last document for pagination is not found", async () => {
      (
        db.collection("logs").doc("nonexistent").get as jest.Mock
      ).mockResolvedValue({
        exists: false,
      });

      await expect(logService.getAllLogs(2, "nonexistent")).rejects.toThrow(
        "Document with ID nonexistent not found for pagination."
      );
    });
  });
});
