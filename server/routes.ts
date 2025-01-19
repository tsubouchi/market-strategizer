import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "@db";
import { analyses, comments, shared_analyses, concepts, concept_analyses, product_requirements, requirement_analyses, competitors, competitor_updates } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { generateConcept, refineConceptWithConditions, generateWebAppRequirements, refineRequirements, generateMarkdownRequirements } from "./lib/openai";
import fetch from "node-fetch";
import * as cheerio from 'cheerio';

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

interface WebAppRequirement {
  title: string;
  purpose: {
    background: string;
    goals: string[];
    expected_effects: string[];
  };
  overview: string;
  target_users: string;
  features: string[];
  non_functional_requirements: {
    performance: string[];
    security: string[];
    availability: string[];
    scalability: string[];
    maintainability: string[];
  };
  api_requirements: {
    external_apis: string[];
    internal_apis: string[];
  };
  screen_structure: {
    flow_description: string;
    main_screens: string[];
  };
  screen_list: {
    name: string;
    path: string;
    description: string;
    main_features: string[];
  }[];
  tech_stack: string[];
  ui_ux_requirements: string;
  schedule: string;
}


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
        .where(eq(analyses.user_id, req.user?.id || 1));

      // 既存のコンセプトをチェック
      const existingConceptAnalyses = await db
        .select()
        .from(concept_analyses)
        .where(
          and(
            ...analysis_ids.map(id => eq(concept_analyses.analysis_id, id))
          )
        );

      if (existingConceptAnalyses.length > 0) {
        return res.status(400).send("選択された分析の組み合わせから既にコンセプトが生成されています");
      }

      // AIによる多段推論でコンセプトを生成
      const conceptData = await generateConcept(selectedAnalyses);

      // コンセプトをデータベースに保存
      const [concept] = await db
        .insert(concepts)
        .values({
          user_id: req.user?.id || 1,
          title: conceptData.concepts[0].title,
          value_proposition: conceptData.concepts[0].value_proposition,
          target_customer: conceptData.concepts[0].target_customer,
          advantage: conceptData.concepts[0].advantage,
          raw_data: conceptData,
        })
        .returning();

      // 分析とコンセプトの関連付けを保存
      await Promise.all(
        analysis_ids.map((analysis_id) =>
          db
            .insert(concept_analyses)
            .values({
              concept_id: concept.id,
              analysis_id,
            })
        )
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
            ...concept.raw_data,
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
          concept: concepts,
          analyses: concept_analyses,
        })
        .from(concepts)
        .leftJoin(
          concept_analyses,
          eq(concepts.id, concept_analyses.concept_id)
        )
        .where(eq(concepts.user_id, req.user?.id || 1))
        .orderBy(concepts.created_at);

      res.json(userConcepts.map(({ concept }) => concept));
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

      // 要件書をデータベースに保存
      const [requirement] = await db
        .insert(product_requirements)
        .values({
          user_id: req.user?.id || 1,
          concept_id: concept.id,
          title: requirements.title,
          overview: requirements.overview,
          target_users: requirements.target_users,
          features: requirements.features,
          tech_stack: requirements.tech_stack,
          ui_ux_requirements: requirements.ui_ux_requirements,
          schedule: requirements.schedule,
        })
        .returning();

      // 要件書と分析の関連付けを作成
      const analyses = await db
        .select()
        .from(concept_analyses)
        .where(eq(concept_analyses.concept_id, concept.id));

      await Promise.all(
        analyses.map((analysis) =>
          db
            .insert(requirement_analyses)
            .values({
              requirement_id: requirement.id,
              analysis_id: analysis.analysis_id,
            })
        )
      );

      res.json(requirement);
    } catch (error) {
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
        features: requirement.features as WebAppRequirement["features"],
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
        tech_stack: requirement.tech_stack as WebAppRequirement["tech_stack"],
        ui_ux_requirements: requirement.ui_ux_requirements as WebAppRequirement["ui_ux_requirements"],
        schedule: requirement.schedule as WebAppRequirement["schedule"]
      };

      const markdown = await generateMarkdownRequirements(webAppRequirement);
      const filename = `basic_design_${requirement.title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.md`;

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
        return res.status(400).send("Search query is required");
      }

      // Perplexity APIの設定
      const headers = {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      };

      // 検索タイプに基づいてシステムプロンプトを設定
      let systemPrompt = "深層的な情報検索を行い、結果を日本語で返してください。";
      if (searchType === "news") {
        systemPrompt += "特にニュース記事に焦点を当ててください。";
      } else if (searchType === "academic") {
        systemPrompt += "特に学術論文や研究に焦点を当ててください。";
      } else if (searchType === "blog") {
        systemPrompt += "特にブログや技術記事に焦点を当ててください。";
      }

      const response = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers,
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
        })
      });

      if (!response.ok) {
        throw new Error(`Search API error: ${response.statusText}`);
      }

      const searchResult = await response.json();

      // 検索結果を整形
      const results = [];
      if (searchResult.choices && searchResult.choices.length > 0) {
        const mainResult = {
          title: "検索結果の要約",
          summary: searchResult.choices[0].message.content,
          citations: searchResult.citations || []
        };
        results.push(mainResult);

        // 引用元の情報を別々の結果として追加
        searchResult.citations?.forEach((citation: string, index: number) => {
          results.push({
            title: `参考文献 ${index + 1}`,
            url: citation,
            summary: "引用元文献"
          });
        });
      }

      res.json(results);
    } catch (error) {
      console.error("Deep search error:", error);
      next(error);
    }
  });

  // 競合他社一覧の取得
  app.get("/api/competitors", async (req, res, next) => {
    try {
      const userCompetitors = await db
        .select()
        .from(competitors)
        .where(eq(competitors.user_id, req.user?.id || 1))
        .orderBy(competitors.created_at);

      res.json(userCompetitors);
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

      // ボンギンカン株式会社のWebサイトからニュースを取得
      console.log("Fetching news from bonginkan.ai...");
      const response = await fetch("https://bonginkan.ai/news/");
      if (!response.ok) {
        throw new Error(`ニュースの取得に失敗しました: ${response.statusText}`);
      }

      const html = await response.text();
      console.log("Parsing HTML content...");
      const $ = cheerio.load(html);
      const newsItems: Array<{
        title: string;
        url: string;
        content: string;
        date: string;
        category: string;
      }> = [];

      // ニュース一覧を取得
      $('.news-article').each((_, element) => {
        const $item = $(element);
        newsItems.push({
          title: $item.find('h2').text().trim(),
          url: new URL($item.find('a').attr('href') || '', 'https://bonginkan.ai').toString(),
          content: $item.find('.article-content').text().trim(),
          date: $item.find('.article-date').text().trim(),
          category: $item.find('.article-category').text().trim(),
        });
      });

      console.log(`Found ${newsItems.length} news items`);

      // 競合他社に関連するニュースをフィルタリング
      const relevantNews = newsItems.filter(news => {
        const keywords = competitor.monitoring_keywords || [];
        return keywords.some(keyword =>
          news.title.toLowerCase().includes(keyword.toLowerCase()) ||
          news.content.toLowerCase().includes(keyword.toLowerCase())
        );
      });

      console.log(`Found ${relevantNews.length} relevant news items`);

      // 更新情報を保存
      const updates = await Promise.all(relevantNews.map(async (news) => {
        const importanceScore = determineImportance(news.content);
        const [update] = await db
          .insert(competitor_updates)
          .values({
            competitor_id: competitor.id,
            update_type: news.category || "news",
            content: {
              summary: news.title,
              sources: [news.url],
              categories: {
                products: categorizeNews(news, "product"),
                press: categorizeNews(news, "press"),
                tech: categorizeNews(news, "technology"),
                market: categorizeNews(news, "market"),
                sustainability: categorizeNews(news, "sustainability"),
              }
            },
            source_url: news.url,
            importance_score: importanceScore,
            is_notified: importanceScore === "high",
          })
          .returning();
        return update;
      }));

      // 最終更新日時を更新
      await db
        .update(competitors)
        .set({ last_updated: new Date() })
        .where(eq(competitors.id, competitor.id));

      console.log(`Saved ${updates.length} updates to database`);
      res.json(updates);
    } catch (error) {
      console.error("Error refreshing competitor data:", error);
      next(error);
    }
  });

  // ヘルパー関数
  function categorizeNews(news: { category: string, content: string }, targetCategory: string): string {
    if (news.category.toLowerCase().includes(targetCategory.toLowerCase())) {
      return news.content;
    }
    return "情報なし";
  }

  function determineImportance(content: string): "low" | "medium" | "high" {
    const keywords = {
      high: ["新製品発表", "重要な発表", "戦略的提携", "M&A", "特許取得", "業績予想修正"],
      medium: ["技術革新", "サービス改善", "市場拡大", "新規顧客", "組織変更"],
      low: ["通常の更新", "定期的な情報", "軽微な変更"]
    };

    for (const [level, words] of Object.entries(keywords)) {
      if (words.some(word => content.toLowerCase().includes(word.toLowerCase()))) {
        return level as "low" | "medium" | "high";
      }
    }

    return "medium";
  }

  async function analyzeBusinessStrategy(analysis_type: string, content: any): Promise<string> {
    //  This is a placeholder.  Replace with your actual AI analysis logic.
    return JSON.stringify({ initial_analysis: "Initial Analysis", deep_analysis: "Deep Analysis", recommendations: "Recommendations" });
  }


  const httpServer = createServer(app);
  return httpServer;
}