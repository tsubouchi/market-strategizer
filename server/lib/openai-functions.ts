import OpenAI from "openai";
import type { WebAppRequirement } from './openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 既存の関数は維持したまま、新しい関数を追加
export async function analyzeBusinessStrategy(
  analysisType: string,
  content: Record<string, any>
): Promise<Record<string, any>> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "ビジネス戦略分析の専門家として、以下の情報を分析し、JSONで回答してください。"
        },
        {
          role: "user",
          content: JSON.stringify({
            type: analysisType,
            data: content
          })
        }
      ],
      model: "gpt-4-1106-preview",
    });

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      error: "分析中にエラーが発生しました",
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// 他の既存の関数はそのまま維持
export async function analyze3C(content: Record<string, any>): Promise<Record<string, any>> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "3C分析の専門家として、以下の情報を分析し、JSONで回答してください。"
      },
      {
        role: "user",
        content: JSON.stringify(content)
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function analyze4P(content: Record<string, any>): Promise<Record<string, any>> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "4P分析の専門家として、以下の情報を分析し、JSONで回答してください。"
      },
      {
        role: "user",
        content: JSON.stringify(content)
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function analyzePEST(content: Record<string, any>): Promise<Record<string, any>> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "PEST分析の専門家として、以下の情報を分析し、JSONで回答してください。"
      },
      {
        role: "user",
        content: JSON.stringify(content)
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function generateConcept(analyses: any[]): Promise<Record<string, any>> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "各種分析結果を基に、新しいコンセプトを生成してください。"
      },
      {
        role: "user",
        content: JSON.stringify(analyses)
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function refineConceptWithConditions(
  concept: Record<string, any>,
  conditions: Record<string, any>
): Promise<Record<string, any>> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "既存のコンセプトを与えられた条件に基づいて改善してください。"
      },
      {
        role: "user",
        content: JSON.stringify({ concept, conditions })
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}');
}

export async function generateWebAppRequirements(
  concept: Record<string, any>,
  conditions?: Record<string, any>
): Promise<WebAppRequirement> {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Webアプリケーションの要件定義書を生成してください。"
      },
      {
        role: "user",
        content: JSON.stringify({ concept, conditions })
      }
    ],
    model: "gpt-4-1106-preview",
  });

  return JSON.parse(completion.choices[0].message.content || '{}') as WebAppRequirement;
}

export function convertAnalysisToMarkdown(analysis: Record<string, any>): string {
  let markdown = `# 分析結果\n\n`;

  for (const [key, value] of Object.entries(analysis)) {
    markdown += `## ${key}\n`;
    if (Array.isArray(value)) {
      value.forEach(item => {
        markdown += `- ${item}\n`;
      });
    } else if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        markdown += `### ${subKey}\n${subValue}\n\n`;
      }
    } else {
      markdown += `${value}\n\n`;
    }
  }

  return markdown;
}