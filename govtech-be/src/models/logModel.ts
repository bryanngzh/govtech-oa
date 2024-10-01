export interface LogEntry {
  id?: string;
  user: string;
  method: string;
  url: string;
  requestBody: object;
  responseStatus: number;
  timestamp: string;
}
