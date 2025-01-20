import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

export interface AnalysisResult {
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

export {
  analyze3C,
  analyze4P,
  analyzePEST,
  convertAnalysisToMarkdown,
  generateConcept,
  refineConceptWithConditions,
  generateWebAppRequirements,
  generateMarkdownRequirements,
  refineRequirements,
  analyzeBusinessStrategy
} from './openai-functions';