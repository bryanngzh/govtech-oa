import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";
import { LogEntry } from "src/models/logModel";

const logMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user ? (req as any).user.email : "Admin";

  const logEntry: LogEntry = {
    user,
    method: req.method,
    url: req.originalUrl,
    requestBody: req.body,
    responseStatus: 0,
    timestamp: new Date().toISOString(),
  };

  if (logEntry.method != "GET") {
    // Listen for the response finish event
    res.on("finish", async () => {
      logEntry.responseStatus = res.statusCode;
      try {
        await admin.firestore().collection("logs").add(logEntry);
      } catch (error) {
        console.error("Error logging request:", error);
      }
    });
  }

  next();
};

export default logMiddleware;
