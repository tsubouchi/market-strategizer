import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeBusinessStrategy(
  analysisType: string,
  content: Record<string, any>
): Promise<string> {
  try {
    // Step 1: Initial Analysis
    const initialAnalysisPrompt = createInitialAnalysisPrompt(analysisType, content);
    const initialAnalysis = await getOpenAIResponse(initialAnalysisPrompt);

    // Step 2: Deep Analysis
    const deepAnalysisPrompt = createDeepAnalysisPrompt(analysisType, initialAnalysis);
    const deepAnalysis = await getOpenAIResponse(deepAnalysisPrompt);

    // Step 3: Generate Recommendations
    const recommendationsPrompt = createRecommendationsPrompt(analysisType, deepAnalysis);
    const recommendations = await getOpenAIResponse(recommendationsPrompt);

    // Combine all analyses into a single JSON object
    const result = {
      initial_analysis: JSON.parse(initialAnalysis),
      deep_analysis: JSON.parse(deepAnalysis),
      recommendations: JSON.parse(recommendations)
    };

    return JSON.stringify(result, null, 2);
  } catch (error) {
    console.error('Analysis error:', error);
    return JSON.stringify({
      initial_analysis: { error: "分析中にエラーが発生しました" },
      deep_analysis: { error: "詳細分析を実行できませんでした" },
      recommendations: { error: "提案を生成できませんでした" }
    }, null, 2);
  }
}

async function getOpenAIResponse(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "あなたはビジネス分析の専門家です。JSON形式で回答してください。"
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    if (!response.choices[0].message.content) {
      throw new Error("OpenAIからの応答が空でした");
    }

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI APIでエラーが発生しました');
  }
}

function createInitialAnalysisPrompt(analysisType: string, content: Record<string, any>): string {
  switch (analysisType) {
    case "3C":
      return `
以下の3C分析データの初期分析を行い、JSONで出力してください：

会社（Company）: ${content.company}
顧客（Customer）: ${content.customer}
競合（Competitors）: ${content.competitors}

以下の形式で出力してください：
{
  "概要": "全体的な状況の要約（文字列）",
  "企業の強み": ["強み1", "強み2", "強み3"],
  "市場機会": ["機会1", "機会2", "機会3"],
  "競争上の課題": ["課題1", "課題2", "課題3"]
}`;

    case "4P":
      return `
以下の4P分析データの初期分析を行い、JSONで出力してください：

製品（Product）: ${content.product}
価格（Price）: ${content.price}
流通（Place）: ${content.place}
プロモーション（Promotion）: ${content.promotion}

以下の形式で出力してください：
{
  "概要": "マーケティングミックスの現状（文字列）",
  "製品評価": "製品の特徴と市場適合性の分析（文字列）",
  "価格戦略の評価": "価格設定の妥当性の分析（文字列）",
  "流通チャネルの分析": "現在の流通戦略の評価（文字列）",
  "プロモーション効果": "現在のプロモーション施策の評価（文字列）"
}`;

    case "PEST":
      return `
以下のPEST分析データの初期分析を行い、JSONで出力してください：

政治的要因（Political）: ${content.political}
経済的要因（Economic）: ${content.economic}
社会的要因（Social）: ${content.social}
技術的要因（Technological）: ${content.technological}

以下の形式で出力してください：
{
  "概要": "マクロ環境の全体像（文字列）",
  "重要な環境要因": ["要因1", "要因2", "要因3"],
  "事業機会": ["機会1", "機会2", "機会3"],
  "潜在的リスク": ["リスク1", "リスク2", "リスク3"]
}`;

    default:
      throw new Error("未対応の分析タイプです");
  }
}

function createDeepAnalysisPrompt(analysisType: string, initialAnalysis: string): string {
  return `
前段階の分析結果を基に、より深い洞察を導き出し、JSONで出力してください：

初期分析結果:
${initialAnalysis}

以下の形式で出力してください：
{
  "長期的影響": "現状の取り組みが将来に与える影響の分析（文字列）",
  "相互関係": "各要素間の関連性と相乗効果の分析（文字列）",
  "市場動向との整合性": "業界トレンドとの適合性分析（文字列）",
  "改善必要領域": ["改善ポイント1", "改善ポイント2", "改善ポイント3"]
}`;
}

function createRecommendationsPrompt(analysisType: string, deepAnalysis: string): string {
  return `
深堀分析の結果を基に、具体的な提案をJSONで出力してください：

詳細分析結果:
${deepAnalysis}

以下の形式で出力してください：
{
  "短期的アクション": ["具体的なアクション1", "具体的なアクション2", "具体的なアクション3"],
  "中期的施策": ["施策1", "施策2", "施策3"],
  "長期的戦略": ["戦略1", "戦略2", "戦略3"],
  "優先度の高い取り組み": "最も重要な施策の説明（文字列）",
  "期待される効果": "提案実施による具体的な期待効果（文字列）"
}`;
}