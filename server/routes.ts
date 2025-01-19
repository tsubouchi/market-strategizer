import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeBusinessStrategy } from "./openai";
import { db } from "@db";
import { analyses } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Create new analysis
  app.post("/api/analyses", async (req, res, next) => {
    try {
      const { analysis_type, content } = req.body;

      // Get AI feedback
      const aiFeedback = await analyzeBusinessStrategy(analysis_type, content);

      const [analysis] = await db
        .insert(analyses)
        .values({
          user_id: 1, // デモユーザー
          analysis_type,
          content,
          ai_feedback: aiFeedback
        })
        .returning();

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (_req, res, next) => {
    try {
      const userAnalyses = await db
        .select()
        .from(analyses)
        .where(eq(analyses.user_id, 1)) // デモユーザー
        .orderBy(analyses.created_at);

      res.json(userAnalyses);
    } catch (error) {
      next(error);
    }
  });

  // Get specific analysis
  app.get("/api/analyses/:id", async (req, res, next) => {
    try {
      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, req.params.id))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}