import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeBusinessStrategy } from "./openai";
import { db } from "@db";
import { analyses } from "@db/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
  })
});

export function registerRoutes(app: Express): Server {
  // Create new analysis
  app.post("/api/analyses", upload.single("attachment"), async (req, res, next) => {
    try {
      const analysis_type = req.body.analysis_type;
      const content = JSON.parse(req.body.content);
      const reference_url = req.body.reference_url;

      // Get AI feedback
      const aiFeedback = await analyzeBusinessStrategy(analysis_type, content);

      const [analysis] = await db
        .insert(analyses)
        .values({
          user_id: 1, // デモユーザー
          analysis_type,
          content,
          ai_feedback: aiFeedback,
          reference_url: reference_url || null,
          attachment_path: req.file?.path || null
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

  // Serve uploaded files
  app.get("/api/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), "uploads", filename);
    res.sendFile(filePath);
  });

  const httpServer = createServer(app);
  return httpServer;
}