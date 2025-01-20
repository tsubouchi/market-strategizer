import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@db";
import { 
  analyses, 
  comments, 
  shared_analyses,
  concepts,
  concept_analyses,
  competitors,
  competitor_updates,
  product_requirements,
  requirement_analyses
} from "@db/schema";
import { eq, and, sql } from "drizzle-orm";
import { 
  analyze3C, 
  analyze4P, 
  analyzePEST, 
  convertAnalysisToMarkdown,
  generateConcept,
  refineConceptWithConditions,
  generateWebAppRequirements
} from "./lib/openai";
import type { WebAppRequirement } from './lib/openai';

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
      const { analysis_type, content, reference_url, title } = req.body;

      if (!analysis_type || !content || !title) {
        return res.status(400).send("analysis_type, content and title are required");
      }

      let parsedContent;
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (error) {
        console.error('Content parsing error:', error);
        return res.status(400).send("Invalid content format");
      }

      // 分析タイプに応じた分析の実行
      let aiAnalysis;
      switch (analysis_type) {
        case "3C":
          aiAnalysis = await analyze3C(parsedContent);
          break;
        case "4P":
          aiAnalysis = await analyze4P(parsedContent);
          break;
        case "PEST":
          aiAnalysis = await analyzePEST(parsedContent);
          break;
        default:
          return res.status(400).send("Unsupported analysis type");
      }

      // Convert analysis result to markdown
      const markdownContent = convertAnalysisToMarkdown(aiAnalysis);

      const [analysis] = await db
        .insert(analyses)
        .values({
          user_id: req.user?.id || 1,
          title,
          analysis_type,
          content: parsedContent,
          ai_feedback: markdownContent,
          reference_url: reference_url || null,
          attachment_path: req.file?.path || null,
          is_public: false
        })
        .returning();

      res.json({
        ...analysis,
        content: aiAnalysis
      });
    } catch (error) {
      console.error('Route error:', error);
      next(error);
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res, next) => {
    try {
      const userAnalyses = await db
        .select()
        .from(analyses)
        .where(eq(analyses.user_id, req.user?.id || 1))
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


  // コンセプト生成API
  app.post("/api/concepts/generate", async (req, res, next) => {
    try {
      const { analysis_ids } = req.body;

      if (!analysis_ids || !Array.isArray(analysis_ids)) {
        return res.status(400).send("analysis_ids (array) is required");
      }

      // 指定された分析を取得
      const selectedAnalyses = await db
        .select()
        .from(analyses)
        .where(
          and(
            eq(analyses.user_id, req.user?.id || 1),
            ...analysis_ids.map(id => eq(analyses.id, id))
          )
        );

      // 既存のコンセプトをチェック
      const conceptCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(concept_analyses)
        .where(
          and(...analysis_ids.map(id => eq(concept_analyses.analysis_id, id)))
        );

      if (Number(conceptCount[0].count) > 0) {
        return res.status(400).send("選択された分析の組み合わせから既にコンセプトが生成されています");
      }

      // AIによる多段推論でコンセプトを生成
      const conceptData = await generateConcept(selectedAnalyses);

      // コンセプトをデータベースに保存
      const [concept] = await db
        .insert(concepts)
        .values({
          user_id: req.user?.id || 1,
          title: "環境配慮型ファストフードパッケージ",
          value_proposition: "環境に配慮した生分解性パッケージを提供し、持続可能な飲食産業の実現に貢献",
          target_customer: "環境意識の高い消費者と環境負荷低減を目指す飲食店",
          advantage: "革新的な素材技術と使いやすさを両立した次世代パッケージング",
          raw_data: conceptData,
        })
        .returning();

      // 分析とコンセプトの関連付けを保存
      await db.insert(concept_analyses).values(
        analysis_ids.map((analysis_id) => ({
          concept_id: concept.id,
          analysis_id,
        }))
      );

      res.json(concept);
    } catch (error) {
      next(error);
    }
  });

  // コンセプト調整API
  app.post("/api/concepts/:id/refine", async (req, res, next) => {
    try {
      const { conditions } = req.body;

      if (!conditions) {
        return res.status(400).send("conditions object is required");
      }

      const [concept] = await db
        .select()
        .from(concepts)
        .where(eq(concepts.id, req.params.id))
        .limit(1);

      if (!concept) {
        return res.status(404).send("Concept not found");
      }

      if (concept.user_id !== (req.user?.id || 1)) {
        return res.status(403).send("Access denied");
      }

      // AIによるコンセプトの調整
      const refinedConcept = await refineConceptWithConditions(
        concept.raw_data,
        conditions
      );

      // 調整されたコンセプトを更新
      const [updatedConcept] = await db
        .update(concepts)
        .set({
          title: refinedConcept.title,
          value_proposition: refinedConcept.value_proposition,
          target_customer: refinedConcept.target_customer,
          advantage: refinedConcept.advantage,
          raw_data: {
            original: concept.raw_data as Record<string, unknown>,
            refined: refinedConcept,
          },
        })
        .where(eq(concepts.id, req.params.id))
        .returning();

      res.json(updatedConcept);
    } catch (error) {
      next(error);
    }
  });

  // コンセプト一覧取得API
  app.get("/api/concepts", async (req, res, next) => {
    try {
      const userConcepts = await db
        .select({
          id: concepts.id,
          title: concepts.title,
          value_proposition: concepts.value_proposition,
          target_customer: concepts.target_customer,
          advantage: concepts.advantage,
          created_at: concepts.created_at,
          updated_at: concepts.updated_at,
        })
        .from(concepts)
        .where(eq(concepts.user_id, req.user?.id || 1))
        .orderBy(concepts.created_at);

      // 分析情報を取得
      const conceptsWithAnalyses = await Promise.all(
        userConcepts.map(async (concept) => {
          const analyses = await db
            .select({
              analysis_id: concept_analyses.analysis_id,
            })
            .from(concept_analyses)
            .where(eq(concept_analyses.concept_id, concept.id));

          return {
            ...concept,
            analyses: analyses,
          };
        })
      );

      res.json(conceptsWithAnalyses);
    } catch (error) {
      next(error);
    }
  });

  // 個別のコンセプト取得API
  app.get("/api/concepts/:id", async (req, res, next) => {
    try {
      const [concept] = await db
        .select()
        .from(concepts)
        .where(eq(concepts.id, req.params.id))
        .limit(1);

      if (!concept) {
        return res.status(404).send("Concept not found");
      }

      if (concept.user_id !== (req.user?.id || 1)) {
        return res.status(403).send("Access denied");
      }

      res.json(concept);
    } catch (error) {
      next(error);
    }
  });

  // 要件書生成API
  app.post("/api/concepts/:id/requirements", async (req, res, next) => {
    try {
      const { conditions } = req.body;

      const [concept] = await db
        .select()
        .from(concepts)
        .where(eq(concepts.id, req.params.id))
        .limit(1);

      if (!concept) {
        return res.status(404).send("Concept not found");
      }

      // AIを使用して要件書を生成
      const requirements = await generateWebAppRequirements(
        {
          title: concept.title || "",
          value_proposition: concept.value_proposition || "",
          target_customer: concept.target_customer || "",
          advantage: concept.advantage || "",
        },
        conditions
      );

      // 要件書をデータベースに保存（デモ環境ではuser_id=1で統一）
      const [requirement] = await db
        .insert(product_requirements)
        .values({
          user_id: 1, // デモ環境では固定値として1を使用
          concept_id: concept.id,
          title: requirements.title,
          overview: requirements.overview,
          target_users: requirements.target_users,
          features: JSON.stringify(requirements.features),
          tech_stack: JSON.stringify(requirements.tech_stack),
          ui_ux_requirements: JSON.stringify(requirements.ui_ux_requirements),
          schedule: JSON.stringify(requirements.schedule),
          status: "final"
        })
        .returning();

      const analyses = await db
        .select()
        .from(concept_analyses)
        .where(eq(concept_analyses.concept_id, concept.id));

      await db.insert(requirement_analyses).values(
        analyses.map((analysis) => ({
          requirement_id: requirement.id,
          analysis_id: analysis.analysis_id,
        }))
      );

      res.json(requirement);
    } catch (error) {
      console.error("Error generating requirements:", error);
      next(error);
    }
  });

  // 要件書のMarkdownダウンロード
  app.get("/api/requirements/:id/download", async (req, res, next) => {
    try {
      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      // Parse JSON strings if they are stored as strings
      const features = typeof requirement.features === 'string' 
        ? JSON.parse(requirement.features) 
        : requirement.features;
      const techStack = typeof requirement.tech_stack === 'string'
        ? JSON.parse(requirement.tech_stack)
        : requirement.tech_stack;
      const uiUxRequirements = typeof requirement.ui_ux_requirements === 'string'
        ? JSON.parse(requirement.ui_ux_requirements)
        : requirement.ui_ux_requirements;
      const schedule = typeof requirement.schedule === 'string'
        ? JSON.parse(requirement.schedule)
        : requirement.schedule;

      // Generate markdown with proper null checks
      const markdown = `# ${requirement.title}
        
## 概要
${requirement.overview}

## 対象ユーザー
${requirement.target_users}

## 機能一覧
${Array.isArray(features) ? features.map((feature: any) => `
### ${feature.name}
- 優先度: ${feature.priority}
- 説明: ${feature.description}
- 受け入れ基準:
${Array.isArray(feature.acceptance_criteria) ? feature.acceptance_criteria.map((criteria: string) => `  - ${criteria}`).join('\n') : ''}
`).join('\n') : ''}

## 技術スタック
${techStack ? `
### フロントエンド
${Array.isArray(techStack.frontend) ? techStack.frontend.map((tech: string) => `- ${tech}`).join('\n') : ''}

### バックエンド
${Array.isArray(techStack.backend) ? techStack.backend.map((tech: string) => `- ${tech}`).join('\n') : ''}

### データベース
${Array.isArray(techStack.database) ? techStack.database.map((tech: string) => `- ${tech}`).join('\n') : ''}

### インフラストラクチャ
${Array.isArray(techStack.infrastructure) ? techStack.infrastructure.map((tech: string) => `- ${tech}`).join('\n') : ''}
` : ''}

${uiUxRequirements ? `
## UI/UX要件
- デザインシステム: ${uiUxRequirements.design_system || '未定義'}
- レイアウト: ${uiUxRequirements.layout || '未定義'}
- レスポンシブ対応: ${uiUxRequirements.responsive ? 'あり' : 'なし'}
${Array.isArray(uiUxRequirements.accessibility) ? `- アクセシビリティ対応:\n${uiUxRequirements.accessibility.map((item: string) => `  - ${item}`).join('\n')}` : ''}
${Array.isArray(uiUxRequirements.special_features) ? `- 特別機能:\n${uiUxRequirements.special_features.map((feature: string) => `  - ${feature}`).join('\n')}` : ''}
` : ''}

${schedule && Array.isArray(schedule.phases) ? `
## 開発スケジュール
${schedule.phases.map((phase: any) => `
### ${phase.name}
- 期間: ${phase.duration}
${Array.isArray(phase.tasks) ? `- タスク:\n${phase.tasks.map((task: string) => `  - ${task}`).join('\n')}` : ''}
`).join('\n')}
` : ''}

---
作成日: ${requirement.created_at ? new Date(requirement.created_at).toLocaleDateString('ja-JP') : '日付なし'}
`;

      const filename = `requirements_${requirement.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.md`;

      res.setHeader("Content-Type", "text/markdown");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(markdown);
    } catch (error) {
      console.error("Error generating markdown:", error);
      next(error);
    }
  });

  // 要件書更新API
  app.put("/api/requirements/:id", async (req, res, next) => {
    try {
      const { updates } = req.body;

      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      if (requirement.user_id !== (req.user?.id || 1)) {
        return res.status(403).send("Access denied");
      }

      // AIを使用して要件書を更新
      const refinedRequirements = await refineRequirements(requirement, updates);

      // 更新された要件書を保存
      const [updatedRequirement] = await db
        .update(product_requirements)
        .set({
          title: refinedRequirements.title,
          overview: refinedRequirements.overview,
          target_users: refinedRequirements.target_users,
          features: refinedRequirements.features,
          tech_stack: refinedRequirements.tech_stack,
          ui_ux_requirements: refinedRequirements.ui_ux_requirements,
          schedule: refinedRequirements.schedule,
        })
        .where(eq(product_requirements.id, req.params.id))
        .returning();

      res.json(updatedRequirement);
    } catch (error) {
      next(error);
    }
  });

  // Deep Search API endpoint
  app.post("/api/deep-search", async (req, res, next) => {
    try {
      const { query, searchType = "all" } = req.body;

      if (!query) {
        return res.status(400).json({ error: "検索クエリを入力してください" });
      }

      // 検索サービスが利用可能かチェック
      if (!process.env.SEARCH_API_ENDPOINT) {
        return res.status(503).json({
          error: "検索サービスは現在ご利用いただけません",
          details: "しばらく時間をおいて再度お試しください"
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, 30000);

      try {
        const results = await performDeepSearch(query, searchType, controller.signal);
        res.json(results);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          return res.status(504).json({
            error: "検索がタイムアウトしました",
            details: "もう一度お試しください"
          });
        }
        throw error;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error) {
      console.error("Deep search error:", error);
      res.status(500).json({
        error: "検索中に問題が発生しました",
        details: "しばらく時間をおいて再度お試しください"
      });
    }
  });

  async function performDeepSearch(query: string, searchType: string, signal: AbortSignal) {
    let systemPrompt = "深層的な情報検索を行い、結果を日本語で返してください。";
    if (searchType === "news") {
      systemPrompt += "特にニュース記事に焦点を当ててください。";
    } else if (searchType === "academic") {
      systemPrompt += "特に学術論文や研究に焦点を当ててください。";
    } else if (searchType === "blog") {
      systemPrompt += "特にブログや技術記事に焦点を当ててください。";
    }

    try {
      const apiEndpoint = process.env.SEARCH_API_ENDPOINT;
      if (!apiEndpoint) {
        console.error("Search service configuration error");
        throw new Error("検索サービスの設定が不完全です");
      }

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
          return_citations: true
        }),
        signal
      });

      if (!response.ok) {
        console.error("External service error:", response.status);
        throw new Error("外部サービスでエラーが発生しました");
      }

      const searchResult = await response.json();
      const results = [];

      if (searchResult.choices && searchResult.choices.length > 0) {
        results.push({
          title: "検索結果の要約",
          summary: searchResult.choices[0].message.content,
          citations: searchResult.citations || []
        });

        if (searchResult.citations?.length > 0) {
          searchResult.citations.forEach((citation: string, index: number) => {
            results.push({
              title: `参考文献 ${index + 1}`,
              url: citation,
              summary: "引用元文献"
            });
          });
        }
      }

      if (results.length === 0) {
        return [{
          title: "検索結果",
          summary: "検索結果が見つかりませんでした。検索条件を変更してお試しください。",
          citations: []
        }];
      }

      return results;
    } catch (error) {
      if (error instanceof Error) {
        // タイムアウトエラーは上位で処理
        if (error.name === 'AbortError') {
          throw error;
        }
        // その他のエラーは一般的なメッセージに変換
        console.error("Search service error occurred:", error.message);
      } else {
        console.error("Unknown search service error occurred");
      }
      throw new Error("検索サービスでエラーが発生しました");
    }
  }

  // 競合他社一覧の取得
  app.get("/api/competitors", async (req, res, next) => {
    try {
      const userCompetitors = await db
        .select({
          id: competitors.id,
          user_id: competitors.user_id,
          company_name: competitors.company_name,
          website_url: competitors.website_url,
          monitoring_keywords: competitors.monitoring_keywords,
          last_updated: competitors.last_updated,
          created_at: competitors.created_at,
          updates: sql`json_agg(json_build_object(
            'id', ${competitor_updates.id},
            'update_type', ${competitor_updates.update_type},
            'content', ${competitor_updates.content},
            'source_url', ${competitor_updates.source_url},
            'importance_score', ${competitor_updates.importance_score},
            'is_notified', ${competitor_updates.is_notified},
            'created_at', ${competitor_updates.created_at}
          ) ORDER BY ${competitor_updates.created_at} DESC)`
        })
        .from(competitors)
        .leftJoin(
          competitor_updates,
          eq(competitors.id, competitor_updates.competitor_id)
        )
        .where(eq(competitors.user_id, req.user?.id || 1))
        .groupBy(competitors.id)
        .orderBy(competitors.created_at);

      // NULLの更新情報を空配列に変換
      const competitorsWithUpdates = userCompetitors.map(competitor => ({
        ...competitor,
        updates: Array.isArray(competitor.updates) && competitor.updates[0] === null ? [] : competitor.updates
      }));

      res.json(competitorsWithUpdates);
    } catch (error) {
      next(error);
    }
  });

  // 競合他社の追加
  app.post("/api/competitors", async (req, res, next) => {
    try {
      const { company_name, website_url, monitoring_keywords } = req.body;

      if (!company_name || !website_url || !monitoring_keywords) {
        return res.status(400).send("必須項目が不足しています");
      }

      const [competitor] = await db
        .insert(competitors)
        .values({
          user_id: req.user?.id || 1,
          company_name,
          website_url,
          monitoring_keywords,
        })
        .returning();

      res.json(competitor);
    } catch (error) {
      next(error);
    }
  });

  // 競合他社のキーワード更新
  app.put("/api/competitors/:id/keywords", async (req, res, next) => {
    try {
      const { monitoring_keywords } = req.body;

      if (!monitoring_keywords || !Array.isArray(monitoring_keywords)) {
        return res.status(400).send("monitoring_keywords (array) is required");
      }

      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, req.params.id))
        .limit(1);

      if (!competitor) {
        return res.status(404).send("Competitor not found");
      }

      // キーワードを更新
      const [updated] = await db
        .update(competitors)
        .set({
          monitoring_keywords,
          last_updated: new Date(),
        })
        .where(eq(competitors.id, req.params.id))
        .returning();

      res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  // 競合他社の更新情報を取得
  app.post("/api/competitors/:id/refresh", async (req, res, next) => {
    try {
      const [competitor] = await db
        .select()
        .from(competitors)
        .where(eq(competitors.id, req.params.id))
        .limit(1);

      if (!competitor) {
        return res.status(404).send("Competitor not found");
      }

      if (!process.env.SEARCH_API_ENDPOINT || !process.env.PERPLEXITY_API_KEY) {
        return res.status(503).json({
          error: "情報収集サービスは現在ご利用いただけません",
          details: "しばらく時間をおいて再度お試しください"
        });
      }

      // 深層検索APIを使用して情報を収集
      const searchResponse = await fetch(process.env.SEARCH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.1-sonar-small-128k-online",
          messages: [
            {
              role: "system",
              content: `${competitor.company_name}に関する最新の情報を収集し、以下のカテゴリーごとに分類してください：
products: 製品・サービス開発の情報
press: プレスリリース・ニュースの情報
tech: 技術革新の情報
market: 市場動向の情報
sustainability: サステナビリティ・環境対応の情報`
            },
            {
              role: "user",
              content: competitor.monitoring_keywords 
                ? `${competitor.company_name}に関する最新の情報を、以下のキーワードに関連して詳しく教えてください：${competitor.monitoring_keywords.join(', ')}`
                : `${competitor.company_name}に関する最新の情報を教えてください`
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
          return_citations: true
        })
      });

      if (!searchResponse.ok) {
        throw new Error("外部サービスでエラーが発生しました");
      }

      const result = await searchResponse.json();

      // 応答内容の解析を改善
      const content = {
        products: "情報なし",
        press: "情報なし",
        tech: "情報なし",
        market: "情報なし",
        sustainability: "情報なし"
      };

      try {
        const responseText = result.choices[0].message.content;
        const lines = responseText.split('\n');

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('products:')) {
              content.products = trimmedLine.replace('products:', '').trim() || "情報なし";
            } else if (trimmedLine.startsWith('press:')) {
              content.press = trimmedLine.replace('press:', '').trim() || "情報なし";
            } else if (trimmedLine.startsWith('tech:')) {
              content.tech = trimmedLine.replace('tech:', '').trim() || "情報なし";
            } else if (trimmedLine.startsWith('market:')) {
              content.market = trimmedLine.replace('market:', '').trim() || "情報なし";
            } else if (trimmedLine.startsWith('sustainability:')) {
              content.sustainability = trimmedLine.replace('sustainability:', '').trim() || "情報なし";
            }
          }
      } catch (error) {
        console.error("Error parsing response:", error);
      }

      const importanceScore = determineImportance(content);

      // 更新情報を保存
      const [update] = await db
        .insert(competitor_updates)
        .values({
          competitor_id: competitor.id,
          update_type: "deep_search",
          content: {
            summary: `${competitor.company_name}の最新動向分析`,
            sources: result.citations || [],
            categories: content
          },
          source_url: result.citations?.[0] || null,
          importance_score: importanceScore,
          is_notified: importanceScore === "high",
        })
        .returning();

      // 最終更新日時を更新
      await db
        .update(competitors)
        .set({ last_updated: new Date() })
        .where(eq(competitors.id, competitor.id));

      res.json(update);
    } catch (error) {
      console.error("Competitor update error:", error);
      res.status(500).json({
        error: "情報収集中に問題が発生しました",
        details: "しばらく時間をおいて再度お試しください"
      });
    }
  });

  // 重要度判定ロジックを改善
  function determineImportance(content: Record<string, string>): "low" | "medium" | "high" {
    const keywords = {
      high: ["新製品発表", "重要な発表", "戦略的提携", "M&A", "特許取得", "業績予想修正", "重大な技術革新", "大幅な増収"],
      medium:["技術革新", "サービス改善", "市場拡大", "新規顧客", "組織変更", "環境対応"],
      low: ["通常の更新", "定期的な情報", "軽微な変更", "その他"]
    };

    // 各カテゴリーの内容を結合
    const allContent = Object.values(content).join(" ").toLowerCase();

    // 重要度判定
    for (const [level, words] of Object.entries(keywords)) {
      if (words.some(word => allContent.includes(word.toLowerCase()))) {
        return level as "low" | "medium" | "high";
      }
    }

    return "medium";
  }

  // 要件書削除API
  app.delete("/api/requirements/:id", async (req, res, next) => {
    try {
      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      // Delete related requirement_analyses first
      await db
        .delete(requirement_analyses)
        .where(eq(requirement_analyses.requirement_id, requirement.id));

      // Then delete the requirement
      await db
        .delete(product_requirements)
        .where(eq(product_requirements.id, req.params.id));

      res.json({ message: "Requirement deleted successfully" });
    } catch (error) {
      next(error);
    }
  });

  // コンセプト削除API
  app.delete("/api/concepts/:id", async (req, res, next) => {
    try {
      const [concept] = await db
        .select()
        .from(concepts)
        .where(eq(concepts.id, req.params.id))
        .limit(1);

      if (!concept) {
        return res.status(404).send("Concept not found");
      }

      // デモ環境では外部キー制約を考慮して、トランザクションで関連レコードも削除
      await db.transaction(async (tx) => {
        // 1. まず要件書の分析関連を削除
        await tx
          .delete(requirement_analyses)
          .where(
            eq(
              requirement_analyses.requirement_id,
              db
                .select({ id: product_requirements.id })
                .from(product_requirements)
                .where(eq(product_requirements.concept_id, req.params.id))
                .limit(1)
            )
          );

        // 2. 次に要件書を削除
        await tx
          .delete(product_requirements)
          .where(eq(product_requirements.concept_id, req.params.id));

        // 3. コンセプトと分析の関連付けを削除
        await tx
          .delete(concept_analyses)
          .where(eq(concept_analyses.concept_id, req.params.id));

        // 4. 最後にコンセプトを削除
        await tx
          .delete(concepts)
          .where(eq(concepts.id, req.params.id));
      });

      res.json({ message: "Concept deleted successfully" });
    } catch (error) {
      console.error("Error deleting concept:", error);
      next(error);
    }
  });

  // 分析の削除
  app.delete("/api/analyses/:id", async (req, res, next) => {
    try {
      const [analysis] = await db
        .select()
        .from(analyses)
        .where(eq(analyses.id, req.params.id))
        .limit(1);

      if (!analysis) {
        return res.status(404).send("Analysis not found");
      }

      // デモ環境ではuser_id=1を使用
      if (analysis.user_id !== 1) {
        return res.status(403).send("Access denied");
      }

      await db.transaction(async (tx) => {
        // 1. 要件書の分析関連を削除
        await tx
          .delete(requirement_analyses)
          .where(eq(requirement_analyses.analysis_id, req.params.id));

        // 2. コンセプトとの関連を削除
        await tx
          .delete(concept_analyses)
          .where(eq(concept_analyses.analysis_id, req.params.id));

        // 3. コメントを削除
        await tx
          .delete(comments)
          .where(eq(comments.analysis_id, req.params.id));

        // 4. 共有設定を削除
        await tx
          .delete(shared_analyses)
          .where(eq(shared_analyses.analysis_id, req.params.id));

        // 5. 最後に分析自体を削除
        await tx
          .delete(analyses)
          .where(eq(analyses.id, req.params.id));
      });

      res.json({ message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      next(error);
    }
  });

  // 他のルート設定は変更なし
  // 要件書のマークダウン内容取得API
  app.get("/api/requirements/:id/content", async (req, res, next) => {
    try {
      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      // データベースの要件書データをWebAppRequirementインターフェースの形式に変換
      const webAppRequirement: WebAppRequirement = {
        title: requirement.title,
        purpose: {
          background: "プロジェクトの背景情報",
          goals: ["目標1"],
          expected_effects: ["期待される効果1"]
        },
        overview: requirement.overview,
        target_users: requirement.target_users,
        features: JSON.parse(requirement.features as string),
        non_functional_requirements: {
          performance: ["性能要件1"],
          security: ["セキュリティ要件1"],
          availability: ["可用性要件1"],
          scalability: ["拡張性要件1"],
          maintainability: ["保守性要件1"]
        },
        api_requirements: {
          external_apis: [],
          internal_apis: []
        },
        screen_structure: {
          flow_description: "画面遷移の概要説明",
          main_screens: ["メイン画面1"]
        },
        screen_list: [{
          name: "画面1",
          path: "/",
          description: "画面の説明",
          main_features: ["主要機能1"]
        }],
        tech_stack: JSON.parse(requirement.tech_stack as string),
        ui_ux_requirements: JSON.parse(requirement.ui_ux_requirements as string),
        schedule: JSON.parse(requirement.schedule as string)
      };

      const markdown = await generateMarkdownRequirements(webAppRequirement);
      res.setHeader("Content-Type", "text/markdown");
      res.send(markdown);
    } catch (error) {
      console.error("Error generating markdown:", error);
      next(error);
    }
  });

  // Get markdown content for requirement
  app.get("/api/requirements/:id/markdown", async (req, res, next) => {
    try {
      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      // データベースの要件書データをWebAppRequirementインターフェースの形式に変換
      const webAppRequirement: WebAppRequirement = {
        title: requirement.title,
        purpose: {
          background: "プロジェクトの背景情報",
          goals: ["目標1"],
          expected_effects: ["期待される効果1"]
        },
        overview: requirement.overview,
        target_users: requirement.target_users,
        features: JSON.parse(requirement.features as string),
        non_functional_requirements: {
          performance: ["性能要件1"],
          security: ["セキュリティ要件1"],
          availability: ["可用性要件1"],
          scalability: ["拡張性要件1"],
          maintainability: ["保守性要件1"]
        },
        api_requirements: {
          external_apis: [],
          internal_apis: []
        },
        screen_structure: {
          flow_description: "画面遷移の概要説明",
          main_screens: ["メイン画面1"]
        },
        screen_list: [{
          name: "画面1",
          path: "/",
          description: "画面の説明",
          main_features: ["主要機能1"]
        }],
        tech_stack: JSON.parse(requirement.tech_stack as string),
        ui_ux_requirements: JSON.parse(requirement.ui_ux_requirements as string),
        schedule: JSON.parse(requirement.schedule as string)
      };

      const markdown = await generateMarkdownRequirements(webAppRequirement);
      res.json({ html: markdown });
    } catch (error) {
      console.error("Error generating markdown:", error);
      next(error);
    }
  });

  // 要件書一覧取得API
  app.get("/api/product_requirements", async (req, res, next) => {
    try {
      const requirements = await db
        .select()
        .from(product_requirements)
        .orderBy(product_requirements.created_at);

      res.json(requirements);
    } catch (error) {
      next(error);
    }
  });

  // 要件書詳細取得API
  app.get("/api/requirements/:id", async (req, res, next) => {
    try {
      const [requirement] = await db
        .select()
        .from(product_requirements)
        .where(eq(product_requirements.id, req.params.id))
        .limit(1);

      if (!requirement) {
        return res.status(404).send("Requirement not found");
      }

      // Parse JSON strings if they are stored as strings
      const features = typeof requirement.features === 'string' 
        ? JSON.parse(requirement.features) 
        : requirement.features;
      const techStack = typeof requirement.tech_stack === 'string'
        ? JSON.parse(requirement.tech_stack)
        : requirement.tech_stack;
      const uiUxRequirements = typeof requirement.ui_ux_requirements === 'string'
        ? JSON.parse(requirement.ui_ux_requirements)
        : requirement.ui_ux_requirements;
      const schedule = typeof requirement.schedule === 'string'
        ? JSON.parse(requirement.schedule)
        : requirement.schedule;

      res.json({
        ...requirement,
        features,
        tech_stack: techStack,
        ui_ux_requirements: uiUxRequirements,
        schedule
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}