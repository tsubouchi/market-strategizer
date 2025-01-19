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

export async function generateConcept(analyses: Analysis[]) {
  try {
    // Step 1: 統合準備 - 各分析の要点を抽出・要約
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "3C分析、4P分析、PEST分析の結果を要約し、重要なポイントを抽出してJSON形式で出力してください。以下のような形式で返してください：{ summary: { key_points: string[], opportunities: string[], challenges: string[] } }",
        },
        {
          role: "user",
          content: JSON.stringify(analyses),
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
          content: "各分析フレームワーク間の関連性を分析し、潜在的な課題や機会を抽出してJSON形式で出力してください。以下のような形式で返してください：{ correlations: { insights: string[], opportunities: string[], risks: string[] } }",
        },
        {
          role: "user",
          content: JSON.stringify({ summary, analyses }),
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
          content: "分析結果に基づいて、以下のJSONフォーマットで3つの商品コンセプト案を生成してください：\n" +
            "{\n" +
            '  "concepts": [{\n' +
            '    "title": "コンセプトのタイトル",\n' +
            '    "value_proposition": "提供価値の説明",\n' +
            '    "target_customer": "対象顧客の定義",\n' +
            '    "advantage": "競合優位性の説明"\n' +
            "  }]\n" +
            "}"
        },
        {
          role: "user",
          content: JSON.stringify({ summary, correlation }),
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
          content: `ユーザーの条件を考慮して、最適な商品コンセプトを調整し、以下のJSONフォーマットで出力してください：
{
  "title": "コンセプトのタイトル",
  "value_proposition": "提供価値の説明",
  "target_customer": "対象顧客の定義",
  "advantage": "競合優位性の説明"
}`
        },
        {
          role: "user",
          content: JSON.stringify({ conceptData, conditions }),
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