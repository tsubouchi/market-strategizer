import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface Analysis {
  id: string;
  analysis_type: string;
  content: Record<string, any>;
}

interface ConceptStage {
  title: string;
  value_proposition: string;
  target_customer: string;
  advantage: string;
}

interface WebAppRequirement {
  title: string;
  purpose: {
    background: string;
    goals: string[];
    expected_effects: string[];
  };
  overview: string;
  target_users: string;
  features: {
    name: string;
    priority: "high" | "medium" | "low";
    description: string;
    acceptance_criteria: string[];
  }[];
  non_functional_requirements: {
    performance: string[];
    security: string[];
    availability: string[];
    scalability: string[];
    maintainability: string[];
  };
  api_requirements: {
    external_apis: {
      name: string;
      purpose: string;
      endpoint: string;
      auth_method: string;
    }[];
    internal_apis: {
      name: string;
      purpose: string;
      endpoint: string;
      request_response: string;
    }[];
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
  tech_stack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  ui_ux_requirements: {
    design_system: string;
    layout: string;
    responsive: boolean;
    accessibility: string[];
    special_features: string[];
  };
  schedule: {
    phases: {
      name: string;
      duration: string;
      tasks: string[];
    }[];
  };
}

interface AnalysisResult {
  initial_analysis: {
    key_points: string[];
    opportunities: string[];
    challenges: string[];
  };
  deep_analysis: {
    company_insights: string[];
    market_insights: string[];
    competitive_insights: string[];
    recommendations: string[];
  };
  final_recommendations: {
    strategic_moves: string[];
    action_items: string[];
    risk_factors: string[];
  };
}

export async function generateConcept(analyses: Analysis[]) {
  try {
    // Step 1: 統合準備 - 各分析の要点を抽出・要約
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You will be generating a JSON response containing analysis summaries, insights, and concept proposals.",
        },
        {
          role: "user",
          content: `Please analyze the following business analyses and provide a summary in JSON format with the following structure: { summary: { key_points: string[], opportunities: string[], challenges: string[] } }.\n\nAnalyses: ${JSON.stringify(analyses)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const summary = JSON.parse(summaryResponse.choices[0].message.content || "{}");

    // Step 2: 関連性分析 - フレームワーク間の関連性を分析
    const correlationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You will be generating a JSON response analyzing relationships between frameworks.",
        },
        {
          role: "user",
          content: `Please analyze the relationships between frameworks and extract potential issues and opportunities in JSON format with the following structure: { correlations: { insights: string[], opportunities: string[], risks: string[] } }.\n\nData: ${JSON.stringify({ summary, analyses })}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const correlation = JSON.parse(correlationResponse.choices[0].message.content || "{}");

    // Step 3: コンセプト候補生成 - 複数の商品コンセプト案を生成
    const conceptsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You will be generating a JSON response containing product concept proposals.",
        },
        {
          role: "user",
          content: `Based on the analysis, generate three product concept proposals in JSON format with the following structure: { concepts: [{ title: string, value_proposition: string, target_customer: string, advantage: string }] }.\n\nData: ${JSON.stringify({ summary, correlation })}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const concepts = JSON.parse(conceptsResponse.choices[0].message.content || "{}");

    if (!concepts.concepts || !concepts.concepts[0]) {
      throw new Error("コンセプト生成に失敗しました");
    }

    return {
      summary,
      correlation,
      concepts: concepts.concepts,
    };
  } catch (error: any) {
    console.error("Error in concept generation:", error);
    throw new Error(`コンセプト生成中にエラーが発生しました: ${error.message}`);
  }
}

export async function refineConceptWithConditions(
  conceptData: any,
  conditions: {
    budget?: string;
    timeline?: string;
    resources?: string;
    preferences?: string;
  }
): Promise<ConceptStage> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You will be generating a JSON response containing a refined product concept.",
        },
        {
          role: "user",
          content: `Please adjust the product concept according to the given conditions. Return the result in JSON format with the following structure: { title: string, value_proposition: string, target_customer: string, advantage: string }.\n\nData: ${JSON.stringify({ conceptData, conditions })}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!result.title) {
      throw new Error("コンセプト調整に失敗しました");
    }

    return result;
  } catch (error: any) {
    console.error("Error in concept refinement:", error);
    throw new Error(`コンセプト調整中にエラーが発生しました: ${error.message}`);
  }
}

export async function generateWebAppRequirements(
  concept: ConceptStage,
  conditions: {
    timeline?: string;
    budget_range?: string;
    team_size?: string;
    technical_constraints?: string[];
  }
): Promise<WebAppRequirement> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "WebAppRequirementインターフェースの構造に従って、日本語で要件定義書を生成してください。",
        },
        {
          role: "user",
          content: `以下のコンセプトと条件に基づいて、Webアプリケーションの要件定義書を生成してください。以下のJSON形式で出力してください：
{
  "title": "プロジェクト名",
  "purpose": {
    "background": "プロジェクトの背景",
    "goals": ["目標1", "目標2"],
    "expected_effects": ["期待される効果1", "期待される効果2"]
  },
  "overview": "プロジェクト概要",
  "target_users": "対象ユーザー",
  "features": [
    {
      "name": "機能名",
      "priority": "high" | "medium" | "low",
      "description": "機能の詳細説明",
      "acceptance_criteria": ["受け入れ基準1", "受け入れ基準2"]
    }
  ],
  "non_functional_requirements": {
    "performance": ["性能要件1", "性能要件2"],
    "security": ["セキュリティ要件1", "セキュリティ要件2"],
    "availability": ["可用性要件1", "可用性要件2"],
    "scalability": ["拡張性要件1", "拡張性要件2"],
    "maintainability": ["保守性要件1", "保守性要件2"]
  },
  "api_requirements": {
    "external_apis": [
      {
        "name": "API名",
        "purpose": "利用目的",
        "endpoint": "エンドポイント",
        "auth_method": "認証方式"
      }
    ],
    "internal_apis": [
      {
        "name": "API名",
        "purpose": "利用目的",
        "endpoint": "エンドポイント",
        "request_response": "リクエスト/レスポンス形式"
      }
    ]
  },
  "screen_structure": {
    "flow_description": "画面遷移の概要説明",
    "main_screens": ["メイン画面1", "メイン画面2"]
  },
  "screen_list": [
    {
      "name": "画面名",
      "path": "パス",
      "description": "画面説明",
      "main_features": ["主要機能1", "主要機能2"]
    }
  ],
  "tech_stack": {
    "frontend": ["フロントエンド技術"],
    "backend": ["バックエンド技術"],
    "database": ["データベース技術"],
    "infrastructure": ["インフラ技術"]
  },
  "ui_ux_requirements": {
    "design_system": "デザインシステム",
    "layout": "レイアウト構成",
    "responsive": true/false,
    "accessibility": ["アクセシビリティ要件"],
    "special_features": ["特別な機能要件"]
  },
  "schedule": {
    "phases": [
      {
        "name": "フェーズ名",
        "duration": "期間",
        "tasks": ["タスク1", "タスク2"]
      }
    ]
  }
}

コンセプト: ${JSON.stringify(concept)}
条件: ${JSON.stringify(conditions)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const requirements = JSON.parse(response.choices[0].message.content || "{}");

    if (!requirements.title || !requirements.features) {
      console.error("Invalid requirements format:", requirements);
      throw new Error("要件書の生成に失敗しました");
    }

    return requirements;
  } catch (error: any) {
    console.error("Error in requirements generation:", error);
    throw new Error(`要件書の生成中にエラーが発生しました: ${error.message}`);
  }
}

export async function generateMarkdownRequirements(requirements: WebAppRequirement): Promise<string> {
  const md = `# ${requirements.title} 要件定義書
## 1. プロジェクトの目的
### 背景
${requirements.purpose.background}

### 目標
${requirements.purpose.goals.map(goal => `- ${goal}`).join('\n')}

### 期待される効果
${requirements.purpose.expected_effects.map(effect => `- ${effect}`).join('\n')}

## 2. プロジェクト概要
${requirements.overview}

## 3. 対象ユーザー
${requirements.target_users}

## 4. 機能要件
${requirements.features.map(feature => `
### ${feature.name}
- 優先度: ${feature.priority === 'high' ? '高' : feature.priority === 'medium' ? '中' : '低'}
- 説明: ${feature.description}

受け入れ基準:
${feature.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}
`).join('\n')}

## 5. 非機能要件
### 性能要件
${requirements.non_functional_requirements.performance.map(req => `- ${req}`).join('\n')}

### セキュリティ要件
${requirements.non_functional_requirements.security.map(req => `- ${req}`).join('\n')}

### 可用性要件
${requirements.non_functional_requirements.availability.map(req => `- ${req}`).join('\n')}

### 拡張性要件
${requirements.non_functional_requirements.scalability.map(req => `- ${req}`).join('\n')}

### 保守性要件
${requirements.non_functional_requirements.maintainability.map(req => `- ${req}`).join('\n')}

## 6. API要件
### 外部API連携
${requirements.api_requirements.external_apis.map(api => `
#### ${api.name}
- 目的: ${api.purpose}
- エンドポイント: ${api.endpoint}
- 認証方式: ${api.auth_method}
`).join('\n')}

### 内部API
${requirements.api_requirements.internal_apis.map(api => `
#### ${api.name}
- 目的: ${api.purpose}
- エンドポイント: ${api.endpoint}
- リクエスト/レスポンス: ${api.request_response}
`).join('\n')}

## 7. 画面構成
### 画面遷移の概要
${requirements.screen_structure.flow_description}

### メイン画面一覧
${requirements.screen_structure.main_screens.map(screen => `- ${screen}`).join('\n')}

## 8. 画面一覧
${requirements.screen_list.map(screen => `
### ${screen.name}
- パス: ${screen.path}
- 説明: ${screen.description}
- 主要機能:
${screen.main_features.map(feature => `  - ${feature}`).join('\n')}
`).join('\n')}

## 9. 技術スタック
### フロントエンド
${requirements.tech_stack.frontend.map(tech => `- ${tech}`).join('\n')}

### バックエンド
${requirements.tech_stack.backend.map(tech => `- ${tech}`).join('\n')}

### データベース
${requirements.tech_stack.database.map(tech => `- ${tech}`).join('\n')}

### インフラストラクチャ
${requirements.tech_stack.infrastructure.map(tech => `- ${tech}`).join('\n')}

## 10. UI/UX要件
- デザインシステム: ${requirements.ui_ux_requirements.design_system}
- レイアウト構成: ${requirements.ui_ux_requirements.layout}
- レスポンシブ対応: ${requirements.ui_ux_requirements.responsive ? '必要' : '不要'}

### アクセシビリティ要件
${requirements.ui_ux_requirements.accessibility.map(req => `- ${req}`).join('\n')}

### 特別な機能要件
${requirements.ui_ux_requirements.special_features.map(feature => `- ${feature}`).join('\n')}

## 11. 開発スケジュール
${requirements.schedule.phases.map(phase => `
### ${phase.name} (${phase.duration})
${phase.tasks.map(task => `- ${task}`).join('\n')}
`).join('\n')}

---
生成日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
`;

  return md;
}

export async function refineRequirements(
  requirements: WebAppRequirement,
  updates: {
    features?: { id: string; changes: Partial<WebAppRequirement["features"][0]> }[];
    tech_stack?: Partial<WebAppRequirement["tech_stack"]>;
    ui_ux_requirements?: Partial<WebAppRequirement["ui_ux_requirements"]>;
    schedule?: Partial<WebAppRequirement["schedule"]>;
  }
): Promise<WebAppRequirement> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You will be generating a JSON response with refined web application requirements that match the WebAppRequirement interface structure.",
        },
        {
          role: "user",
          content: `Refine the web application requirements based on the proposed updates. Return the result in JSON format matching the WebAppRequirement interface structure.\n\nCurrent Requirements: ${JSON.stringify(requirements)}\n\nRequested Updates: ${JSON.stringify(updates)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const refinedRequirements = JSON.parse(response.choices[0].message.content || "{}");

    if (!refinedRequirements.title || !refinedRequirements.features) {
      throw new Error("要件書の更新に失敗しました");
    }

    return refinedRequirements;
  } catch (error: any) {
    console.error("Error in requirements refinement:", error);
    throw new Error(`要件書の更新中にエラーが発生しました: ${error.message}`);
  }
}

export async function analyze3C(formData: Record<string, string>): Promise<AnalysisResult> {
  try {
    // Step 1: 分析データの統合と初期分析
    const initialAnalysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "3C分析の初期評価を行います。Company（自社）、Customer（顧客）、Competitor（競合）の基本的な分析を行い、主要なポイント、機会、課題を抽出してください。",
        },
        {
          role: "user",
          content: `以下の3C分析データを基に、初期分析を行ってください：

Company分析:
${formData.company}

Customer分析:
${formData.customer}

Competitor分析:
${formData.competitors}

JSONフォーマットで以下の構造で出力してください：
{
  "key_points": ["主要なポイント1", "主要なポイント2", ...],
  "opportunities": ["機会1", "機会2", ...],
  "challenges": ["課題1", "課題2", ...]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const initialAnalysis = JSON.parse(initialAnalysisResponse.choices[0].message.content || "{}");

    // Step 2: 詳細分析
    const deepAnalysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "初期分析結果を基に、より深い洞察を導き出します。各要素の関連性や影響を分析し、具体的な示唆を提供してください。",
        },
        {
          role: "user",
          content: `初期分析結果と元データを基に、詳細な分析を行ってください：

初期分析結果:
${JSON.stringify(initialAnalysis, null, 2)}

元データ:
${JSON.stringify(formData, null, 2)}

JSONフォーマットで以下の構造で出力してください：
{
  "company_insights": ["自社に関する洞察1", "自社に関する洞察2", ...],
  "market_insights": ["市場に関する洞察1", "市場に関する洞察2", ...],
  "competitive_insights": ["競争環境に関する洞察1", "競争環境に関する洞察2", ...],
  "recommendations": ["戦略的示唆1", "戦略的示唆2", ...]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const deepAnalysis = JSON.parse(deepAnalysisResponse.choices[0].message.content || "{}");

    // Step 3: 最終提案生成
    const finalRecommendationsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "これまでの分析結果を統合し、具体的なアクションプランと提案を作成します。実行可能な戦略とリスク要因も含めて提示してください。",
        },
        {
          role: "user",
          content: `これまでの分析結果を基に、最終的な提案を作成してください：

初期分析:
${JSON.stringify(initialAnalysis, null, 2)}

詳細分析:
${JSON.stringify(deepAnalysis, null, 2)}

JSONフォーマットで以下の構造で出力してください：
{
  "strategic_moves": ["戦略的アクション1", "戦略的アクション2", ...],
  "action_items": ["具体的なアクション1", "具体的なアクション2", ...],
  "risk_factors": ["リスク要因1", "リスク要因2", ...]
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const finalRecommendations = JSON.parse(finalRecommendationsResponse.choices[0].message.content || "{}");

    return {
      initial_analysis: initialAnalysis,
      deep_analysis: deepAnalysis,
      final_recommendations: finalRecommendations,
    };
  } catch (error: any) {
    console.error("Error in 3C analysis:", error);
    throw new Error(`分析中にエラーが発生しました: ${error.message}`);
  }
}

// Markdown形式に変換するヘルパー関数
export function convertAnalysisToMarkdown(result: AnalysisResult): string {
  return `# 3C分析結果

## 初期分析
### 主要なポイント
${result.initial_analysis.key_points.map(point => `- ${point}`).join('\n')}

### 機会
${result.initial_analysis.opportunities.map(opp => `- ${opp}`).join('\n')}

### 課題
${result.initial_analysis.challenges.map(challenge => `- ${challenge}`).join('\n')}

## 詳細分析
### 自社の洞察
${result.deep_analysis.company_insights.map(insight => `- ${insight}`).join('\n')}

### 市場の洞察
${result.deep_analysis.market_insights.map(insight => `- ${insight}`).join('\n')}

### 競争環境の洞察
${result.deep_analysis.competitive_insights.map(insight => `- ${insight}`).join('\n')}

### 戦略的示唆
${result.deep_analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

## 最終提案
### 戦略的アクション
${result.final_recommendations.strategic_moves.map(move => `- ${move}`).join('\n')}

### 具体的なアクションプラン
${result.final_recommendations.action_items.map(item => `- ${item}`).join('\n')}

### リスク要因
${result.final_recommendations.risk_factors.map(risk => `- ${risk}`).join('\n')}

---
生成日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
`;
}