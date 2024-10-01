import { Get, Query, Route } from "tsoa";
import { LogEntry } from "../models/logModel";
import { LogService } from "../services/logService";

@Route("logs")
export class LogController {
  private logService: LogService;

  constructor() {
    this.logService = new LogService();
  }

  /**
   * Get all logs with pagination.
   * @param limit - Number of logs to retrieve (default: 10)
   * @param lastDoc - ID of the last document from the previous request for pagination
   * @returns An array of log entries and the next document ID for pagination
   */
  @Get()
  public async getAllLogs(
    @Query() limit: number = 10,
    @Query() lastDoc?: string
  ): Promise<{ logs: LogEntry[]; nextDoc?: string }> {
    return this.logService.getAllLogs(limit, lastDoc);
  }
}
