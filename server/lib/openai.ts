import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

import { 
  analyze3C,
  analyze4P,
  analyzePEST,
  convertAnalysisToMarkdown,
  generateConcept,
  refineConceptWithConditions,
  generateWebAppRequirements,
  analyzeBusinessStrategy
} from './openai-functions';

export interface Analysis {
  id: string;
  title: string;
  analysis_type: string;
  content: Record<string, any>;
  reference_url: string | null;
  created_at: Date | null;
  user_id: number;
  ai_feedback: string | null;
  attachment_path: string | null;
  is_public: boolean | null;
  updated_at: Date | null;
}

export interface ConceptStage {
  title: string;
  value_proposition: string;
  target_customer: string;
  advantage: string;
}

export interface WebAppRequirement {
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

export function generateMarkdownRequirements(requirement: WebAppRequirement): string {
  return `# ${requirement.title}
  
## 概要
${requirement.overview}

## 目的
### 背景
${requirement.purpose.background}

### 目標
${requirement.purpose.goals.map(goal => `- ${goal}`).join('\n')}

### 期待される効果
${requirement.purpose.expected_effects.map(effect => `- ${effect}`).join('\n')}

## 対象ユーザー
${requirement.target_users}

## 機能一覧
${requirement.features.map(feature => `
### ${feature.name}
- 優先度: ${feature.priority}
- 説明: ${feature.description}
- 受け入れ基準:
${feature.acceptance_criteria.map(criteria => `  - ${criteria}`).join('\n')}`).join('\n')}

## 非機能要件
### パフォーマンス
${requirement.non_functional_requirements.performance.map(item => `- ${item}`).join('\n')}

### セキュリティ
${requirement.non_functional_requirements.security.map(item => `- ${item}`).join('\n')}

### 可用性
${requirement.non_functional_requirements.availability.map(item => `- ${item}`).join('\n')}

### スケーラビリティ
${requirement.non_functional_requirements.scalability.map(item => `- ${item}`).join('\n')}

### 保守性
${requirement.non_functional_requirements.maintainability.map(item => `- ${item}`).join('\n')}

## API要件
### 外部API
${requirement.api_requirements.external_apis.map(api => `
#### ${api.name}
- 目的: ${api.purpose}
- エンドポイント: ${api.endpoint}
- 認証方式: ${api.auth_method}`).join('\n')}

### 内部API
${requirement.api_requirements.internal_apis.map(api => `
#### ${api.name}
- 目的: ${api.purpose}
- エンドポイント: ${api.endpoint}
- リクエスト/レスポンス: ${api.request_response}`).join('\n')}

## 画面構成
### フロー
${requirement.screen_structure.flow_description}

### メイン画面
${requirement.screen_structure.main_screens.map(screen => `- ${screen}`).join('\n')}

## 画面一覧
${requirement.screen_list.map(screen => `
### ${screen.name}
- パス: ${screen.path}
- 説明: ${screen.description}
- 主な機能:
${screen.main_features.map(feature => `  - ${feature}`).join('\n')}`).join('\n')}

## 技術スタック
### フロントエンド
${requirement.tech_stack.frontend.map(tech => `- ${tech}`).join('\n')}

### バックエンド
${requirement.tech_stack.backend.map(tech => `- ${tech}`).join('\n')}

### データベース
${requirement.tech_stack.database.map(tech => `- ${tech}`).join('\n')}

### インフラストラクチャ
${requirement.tech_stack.infrastructure.map(tech => `- ${tech}`).join('\n')}

## UI/UX要件
- デザインシステム: ${requirement.ui_ux_requirements.design_system}
- レイアウト: ${requirement.ui_ux_requirements.layout}
- レスポンシブ対応: ${requirement.ui_ux_requirements.responsive ? 'あり' : 'なし'}
${requirement.ui_ux_requirements.accessibility.length > 0 ? `- アクセシビリティ対応:\n${requirement.ui_ux_requirements.accessibility.map(item => `  - ${item}`).join('\n')}` : ''}
${requirement.ui_ux_requirements.special_features.length > 0 ? `- 特別機能:\n${requirement.ui_ux_requirements.special_features.map(feature => `  - ${feature}`).join('\n')}` : ''}

## 開発スケジュール
${requirement.schedule.phases.map(phase => `
### ${phase.name}
- 期間: ${phase.duration}
- タスク:
${phase.tasks.map(task => `  - ${task}`).join('\n')}`).join('\n')}`;
}

export async function refineRequirements(requirement: WebAppRequirement, updates: Record<string, any>): Promise<WebAppRequirement> {
  // 既存の要件を更新
  const refinedRequirement: WebAppRequirement = {
    ...requirement,
    ...updates,
  };

  return refinedRequirement;
}

export {
  analyze3C,
  analyze4P,
  analyzePEST,
  convertAnalysisToMarkdown,
  generateConcept,
  refineConceptWithConditions,
  generateWebAppRequirements,
  analyzeBusinessStrategy
};