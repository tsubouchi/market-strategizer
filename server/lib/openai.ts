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
  overview: string;
  target_users: string;
  features: {
    name: string;
    priority: "high" | "medium" | "low";
    description: string;
    acceptance_criteria: string[];
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
          content: "You will be generating a JSON response containing detailed web application requirements that match the WebAppRequirement interface structure.",
        },
        {
          role: "user",
          content: `Generate a web application requirements document based on the following concept and conditions. Format the response as JSON with the following structure:
{
  "title": "string",
  "overview": "string",
  "target_users": "string",
  "features": [
    {
      "name": "string",
      "priority": "high" | "medium" | "low",
      "description": "string",
      "acceptance_criteria": ["string"]
    }
  ],
  "tech_stack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "infrastructure": ["string"]
  },
  "ui_ux_requirements": {
    "design_system": "string",
    "layout": "string",
    "responsive": boolean,
    "accessibility": ["string"],
    "special_features": ["string"]
  },
  "schedule": {
    "phases": [
      {
        "name": "string",
        "duration": "string",
        "tasks": ["string"]
      }
    ]
  }
}

Concept: ${JSON.stringify(concept)}
Conditions: ${JSON.stringify(conditions)}`,
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

## 1. 概要
${requirements.overview}

## 2. ターゲットユーザー
${requirements.target_users}

## 3. 機能要件
${requirements.features.map(feature => `
### ${feature.name} (優先度: ${feature.priority})
${feature.description}

受け入れ基準:
${feature.acceptance_criteria.map(criteria => `- ${criteria}`).join('\n')}
`).join('\n')}

## 4. 技術スタック
### フロントエンド
${requirements.tech_stack.frontend.map(tech => `- ${tech}`).join('\n')}

### バックエンド
${requirements.tech_stack.backend.map(tech => `- ${tech}`).join('\n')}

### データベース
${requirements.tech_stack.database.map(tech => `- ${tech}`).join('\n')}

### インフラストラクチャ
${requirements.tech_stack.infrastructure.map(tech => `- ${tech}`).join('\n')}

## 5. UI/UX要件
- デザインシステム: ${requirements.ui_ux_requirements.design_system}
- レイアウト: ${requirements.ui_ux_requirements.layout}
- レスポンシブ対応: ${requirements.ui_ux_requirements.responsive ? '必要' : '不要'}

### アクセシビリティ要件
${requirements.ui_ux_requirements.accessibility.map(req => `- ${req}`).join('\n')}

### 特別な機能要件
${requirements.ui_ux_requirements.special_features.map(feature => `- ${feature}`).join('\n')}

## 6. 開発スケジュール
${requirements.schedule.phases.map(phase => `
### ${phase.name} (${phase.duration})
${phase.tasks.map(task => `- ${task}`).join('\n')}
`).join('\n')}

---
生成日時: ${new Date().toLocaleString('ja-JP')}
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