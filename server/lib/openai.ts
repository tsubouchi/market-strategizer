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
          role: "user",
          content: "Please provide the output in JSON format with the following structure: { summary: { key_points: string[], opportunities: string[], challenges: string[] } }. Here are the analyses: " + JSON.stringify(analyses),
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
          role: "user",
          content: "Please analyze the relationships between frameworks and extract potential issues and opportunities in JSON format with the following structure: { correlations: { insights: string[], opportunities: string[], risks: string[] } }. Here is the data: " + JSON.stringify({ summary, analyses }),
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
          role: "user",
          content: "Based on the analysis, generate three product concept proposals in JSON format with the following structure: { concepts: [{ title: string, value_proposition: string, target_customer: string, advantage: string }] }. Here is the data: " + JSON.stringify({ summary, correlation }),
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
          role: "user",
          content: "Please adjust the product concept according to the given conditions and output in JSON format with the following structure: { title: string, value_proposition: string, target_customer: string, advantage: string }. Here is the data: " + JSON.stringify({ conceptData, conditions }),
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
    // Step 1: 基本要件の生成
    const basicRequirementsResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
Generate a detailed web application requirements document in JSON format based on the following concept and conditions:

Concept:
${JSON.stringify(concept)}

Conditions:
${JSON.stringify(conditions)}

Include:
1. Overview and target users
2. Core features with priorities
3. Technical requirements
4. UI/UX guidelines
5. Development schedule

Output should match the WebAppRequirement interface structure.
          `,
        },
      ],
      response_format: { type: "json_object" },
    });

    const requirements = JSON.parse(basicRequirementsResponse.choices[0].message.content || "{}");

    // Step 2: 受け入れ基準の詳細化
    const detailedResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
Enhance the acceptance criteria for each feature in the requirements:

Requirements:
${JSON.stringify(requirements)}

Add detailed, testable acceptance criteria for each feature.
          `,
        },
      ],
      response_format: { type: "json_object" },
    });

    const detailedRequirements = JSON.parse(detailedResponse.choices[0].message.content || "{}");

    // Step 3: 技術スタックの最適化
    const techStackResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `
Optimize the technical stack based on the requirements and conditions:

Requirements:
${JSON.stringify(detailedRequirements)}

Conditions:
${JSON.stringify(conditions)}

Consider:
- Team size and expertise
- Budget constraints
- Timeline
- Scalability needs
          `,
        },
      ],
      response_format: { type: "json_object" },
    });

    const finalRequirements = JSON.parse(techStackResponse.choices[0].message.content || "{}");

    if (!finalRequirements.title || !finalRequirements.features) {
      throw new Error("要件書の生成に失敗しました");
    }

    return finalRequirements;
  } catch (error: any) {
    console.error("Error in requirements generation:", error);
    throw new Error(`要件書の生成中にエラーが発生しました: ${error.message}`);
  }
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
          role: "user",
          content: `
Please refine the web application requirements based on the proposed updates:

Current Requirements:
${JSON.stringify(requirements)}

Requested Updates:
${JSON.stringify(updates)}

Ensure consistency and maintain the overall structure while incorporating the changes.
          `,
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