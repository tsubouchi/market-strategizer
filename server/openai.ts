import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeBusinessStrategy(
  analysisType: string,
  content: Record<string, any>
): Promise<string> {
  // Step 1: Initial Analysis
  const initialAnalysisPrompt = createInitialAnalysisPrompt(analysisType, content);
  const initialAnalysis = await getOpenAIResponse(initialAnalysisPrompt);

  // Step 2: Deep Analysis
  const deepAnalysisPrompt = createDeepAnalysisPrompt(analysisType, initialAnalysis);
  const deepAnalysis = await getOpenAIResponse(deepAnalysisPrompt);

  // Step 3: Generate Recommendations
  const recommendationsPrompt = createRecommendationsPrompt(analysisType, deepAnalysis);
  const recommendations = await getOpenAIResponse(recommendationsPrompt);

  return JSON.stringify({
    initial_analysis: JSON.parse(initialAnalysis),
    deep_analysis: JSON.parse(deepAnalysis),
    recommendations: JSON.parse(recommendations)
  }, null, 2);
}

async function getOpenAIResponse(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  if (!response.choices[0].message.content) {
    throw new Error("No response from OpenAI");
  }

  return response.choices[0].message.content;
}

function createInitialAnalysisPrompt(analysisType: string, content: Record<string, any>): string {
  switch (analysisType) {
    case "3C":
      return `
以下の3C分析データの初期分析を行ってください：

会社（Company）: ${content.company}
顧客（Customer）: ${content.customer}
競合（Competitors）: ${content.competitors}

以下のJSON形式で出力してください：
{
  "概要": "全体的な状況の要約",
  "企業の強み": ["強み1", "強み2"],
  "市場機会": ["機会1", "機会2"],
  "競争上の課題": ["課題1", "課題2"]
}`;

    case "4P":
      return `
以下の4P分析データの初期分析を行ってください：

製品（Product）: ${content.product}
価格（Price）: ${content.price}
流通（Place）: ${content.place}
プロモーション（Promotion）: ${content.promotion}

以下のJSON形式で出力してください：
{
  "概要": "マーケティングミックスの現状",
  "製品評価": "製品の特徴と市場適合性",
  "価格戦略の評価": "価格設定の妥当性",
  "流通チャネルの分析": "現在の流通戦略の評価",
  "プロモーション効果": "現在のプロモーション施策の評価"
}`;

    case "PEST":
      return `
以下のPEST分析データの初期分析を行ってください：

政治的要因（Political）: ${content.political}
経済的要因（Economic）: ${content.economic}
社会的要因（Social）: ${content.social}
技術的要因（Technological）: ${content.technological}

以下のJSON形式で出力してください：
{
  "概要": "マクロ環境の全体像",
  "重要な環境要因": ["要因1", "要因2"],
  "事業機会": ["機会1", "機会2"],
  "潜在的リスク": ["リスク1", "リスク2"]
}`;
    default:
      throw new Error("Unsupported analysis type");
  }
}

function createDeepAnalysisPrompt(analysisType: string, initialAnalysis: string): string {
  return `
前段階の分析結果を基に、より深い洞察を導き出してください：

初期分析結果:
${initialAnalysis}

以下の観点で深堀分析を行い、JSON形式で出力してください：
{
  "長期的影響": "現状の取り組みが将来に与える影響の分析",
  "相互関係": "各要素間の関連性と相乗効果",
  "市場動向との整合性": "業界トレンドとの適合性分析",
  "改善必要領域": ["改善ポイント1", "改善ポイント2"]
}`;
}

function createRecommendationsPrompt(analysisType: string, deepAnalysis: string): string {
  return `
深堀分析の結果を基に、具体的な提案を生成してください：

詳細分析結果:
${deepAnalysis}

以下のJSON形式で具体的な提案を出力してください：
{
  "短期的アクション": ["具体的なアクション1", "具体的なアクション2"],
  "中期的施策": ["施策1", "施策2"],
  "長期的戦略": ["戦略1", "戦略2"],
  "優先度の高い取り組み": "最も重要な施策の説明",
  "期待される効果": "提案実施による具体的な期待効果"
}`;
}