import { LogEntry } from "src/models/logModel";
import { db } from "../configs/firebase";

/**
 * Service for managing logs-related operations.
 */
export class LogService {
  /**
   * Fetch logs with pagination.
   * @param limit - Number of logs to retrieve
   * @param lastDoc - Optional last document snapshot for pagination
   * @returns An array of log entries and the next document snapshot if available
   */
  public async getAllLogs(
    limit: number,
    lastDoc?: string
  ): Promise<{ logs: LogEntry[]; nextDoc?: string }> {
    let query = db.collection("logs").orderBy("timestamp").limit(limit);

    if (lastDoc) {
      const lastSnapshot = await db.collection("logs").doc(lastDoc).get();
      if (!lastSnapshot.exists) {
        throw new Error(
          `Document with ID ${lastDoc} not found for pagination.`
        );
      }
      query = query.startAfter(lastSnapshot);
    }

    const snapshot = await query.get();

    const logs: LogEntry[] = snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as LogEntry)
    );

    const nextDoc =
      logs.length === limit
        ? snapshot.docs[snapshot.docs.length - 1].id
        : undefined;

    return { logs, nextDoc };
  }
}
