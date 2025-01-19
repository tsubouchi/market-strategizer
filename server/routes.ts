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
      const { analysis_type, content, reference_url } = req.body;

      if (!analysis_type || !content) {
        return res.status(400).send("analysis_type and content are required");
      }

      let parsedContent;
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (error) {
        console.error('Content parsing error:', error);
        return res.status(400).send("Invalid content format");
      }

      // Get AI feedback
      let aiFeedback;
      try {
        aiFeedback = await analyzeBusinessStrategy(analysis_type, parsedContent);
      } catch (error) {
        console.error('AI analysis error:', error);
        aiFeedback = JSON.stringify({
          initial_analysis: { error: "AI分析中にエラーが発生しました" },
          deep_analysis: { error: "詳細分析を実行できませんでした" },
          recommendations: { error: "提案を生成できませんでした" }
        });
      }

      const [analysis] = await db
        .insert(analyses)
        .values({
          user_id: 1, // デモユーザー
          analysis_type,
          content: parsedContent,
          ai_feedback: aiFeedback,
          reference_url: reference_url || null,
          attachment_path: req.file?.path || null
        })
        .returning();

      res.json(analysis);
    } catch (error) {
      console.error('Route error:', error);
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
      if (req.params.id === 'new') {
        return res.status(404).send("Analysis not found");
      }

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