import type { Request, Response, NextFunction } from "express";
import { db } from "@db";
import { error_logs } from "@db/schema";

export interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export async function errorLogger(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Extract relevant request information
    const metadata = {
      url: req.url,
      user_agent: req.headers["user-agent"],
      request_path: req.path,
      request_method: req.method,
      request_body: req.body,
      additional_info: {
        query: req.query,
        params: req.params,
        headers: req.headers,
      },
    };

    // Log error to database
    await db.insert(error_logs).values({
      level: "error",
      message: err.message,
      stack_trace: err.stack,
      metadata,
      is_resolved: false,
    });

    // Continue to the next error handler
    next(err);
  } catch (error) {
    console.error("Error in errorLogger middleware:", error);
    next(err); // Continue to next error handler even if logging fails
  }
}

export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
    },
  });
}
