import type { Express } from "express";
import { createServer, type Server } from "http";
import { analyzeBusinessStrategy } from "./openai";
import { db } from "@db";
import { analyses, comments, shared_analyses } from "@db/schema";
import { eq, and } from "drizzle-orm";
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
          user_id: req.user?.id || 1, // デモユーザー
          analysis_type,
          content: parsedContent,
          ai_feedback: aiFeedback,
          reference_url: reference_url || null,
          attachment_path: req.file?.path || null,
          is_public: false //added is_public field
        })
        .returning();

      res.json(analysis);
    } catch (error) {
      console.error('Route error:', error);
      next(error);
    }
  });

  // Get all analyses (including shared ones)
  app.get("/api/analyses", async (req, res, next) => {
    try {
      const userAnalyses = await db
        .select({
          analysis: analyses,
          shared: shared_analyses,
        })
        .from(analyses)
        .leftJoin(
          shared_analyses,
          and(
            eq(analyses.id, shared_analyses.analysis_id),
            eq(shared_analyses.user_id, req.user?.id || 1)
          )
        )
        .where(
          req.user?.id 
            ? and(
                eq(analyses.user_id, req.user.id),
                eq(analyses.is_public, true)
              )
            : eq(analyses.user_id, 1) // デモユーザー
        )
        .orderBy(analyses.created_at);

      res.json(userAnalyses.map(({ analysis }) => analysis));
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

      // Check if user has access
      if (analysis.user_id !== (req.user?.id || 1)) {
        const [shared] = await db
          .select()
          .from(shared_analyses)
          .where(
            and(
              eq(shared_analyses.analysis_id, analysis.id),
              eq(shared_analyses.user_id, req.user?.id || 1)
            )
          )
          .limit(1);

        if (!shared && !analysis.is_public) {
          return res.status(403).send("Access denied");
        }
      }

      res.json(analysis);
    } catch (error) {
      next(error);
    }
  });

  // Share analysis with another user
  app.post("/api/analyses/:id/share", async (req, res, next) => {
    try {
      const { user_id, can_comment = true } = req.body;

      if (!user_id) {
        return res.status(400).send("user_id is required");
      }

      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, req.params.id))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      if (analysis.user_id !== (req.user?.id || 1)) {
        return res.status(403).send("Access denied");
      }

      const [shared] = await db
        .insert(shared_analyses)
        .values({
          analysis_id: req.params.id,
          user_id,
          can_comment,
        })
        .returning();

      res.json(shared);
    } catch (error) {
      next(error);
    }
  });

  // Toggle analysis public/private
  app.post("/api/analyses/:id/visibility", async (req, res, next) => {
    try {
      const { is_public } = req.body;

      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, req.params.id))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      if (analysis.user_id !== (req.user?.id || 1)) {
        return res.status(403).send("Access denied");
      }

      const [updated] = await db
        .update(analyses)
        .set({ is_public })
        .where(eq(analyses.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // Get comments for an analysis
  app.get("/api/analyses/:id/comments", async (req, res, next) => {
    try {
      const analysis_comments = await db
        .select()
        .from(comments)
        .where(eq(comments.analysis_id, req.params.id))
        .orderBy(comments.created_at);

      res.json(analysis_comments);
    } catch (error) {
      next(error);
    }
  });

  // Add a comment to an analysis
  app.post("/api/analyses/:id/comments", async (req, res, next) => {
    try {
      const { content } = req.body;

      if (!content) {
        return res.status(400).send("content is required");
      }

      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, req.params.id))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      // Check if user can comment
      if (analysis.user_id !== (req.user?.id || 1)) {
        const [shared] = await db
          .select()
          .from(shared_analyses)
          .where(
            and(
              eq(shared_analyses.analysis_id, analysis.id),
              eq(shared_analyses.user_id, req.user?.id || 1),
              eq(shared_analyses.can_comment, true)
            )
          )
          .limit(1);

        if (!shared) {
          return res.status(403).send("Comments not allowed");
        }
      }

      const [comment] = await db
        .insert(comments)
        .values({
          analysis_id: req.params.id,
          user_id: req.user?.id || 1,
          content,
        })
        .returning();

      res.json(comment);
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