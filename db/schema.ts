import { pgTable, text, serial, timestamp, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  analysis_type: text("analysis_type").notNull(), // '3C', '4P', 'PEST'
  content: jsonb("content").notNull(),
  ai_feedback: text("ai_feedback"),
  reference_url: text("reference_url"),
  attachment_path: text("attachment_path"),
  is_public: boolean("is_public").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const concepts = pgTable("concepts", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  value_proposition: text("value_proposition"),
  target_customer: text("target_customer"),
  advantage: text("advantage"),
  raw_data: jsonb("raw_data"), // 多段推論の中間結果などを保存
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const concept_analyses = pgTable("concept_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  concept_id: uuid("concept_id").references(() => concepts.id).notNull(),
  analysis_id: uuid("analysis_id").references(() => analyses.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  analysis_id: uuid("analysis_id").references(() => analyses.id).notNull(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const shared_analyses = pgTable("shared_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  analysis_id: uuid("analysis_id").references(() => analyses.id).notNull(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  can_comment: boolean("can_comment").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const product_requirements = pgTable("product_requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  concept_id: uuid("concept_id").references(() => concepts.id).notNull(),
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  target_users: text("target_users").notNull(),
  features: jsonb("features").notNull(), // 機能一覧、優先度などを含むJSON
  tech_stack: jsonb("tech_stack"), // 技術スタック情報
  ui_ux_requirements: jsonb("ui_ux_requirements"), // UI/UX要件
  schedule: jsonb("schedule"), // 開発スケジュール
  status: text("status").default("draft"), // draft, final など
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const requirement_analyses = pgTable("requirement_analyses", {
  id: uuid("id").defaultRandom().primaryKey(),
  requirement_id: uuid("requirement_id").references(() => product_requirements.id).notNull(),
  analysis_id: uuid("analysis_id").references(() => analyses.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// 競合他社モニタリングテーブル
export const competitors = pgTable("competitors", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: serial("user_id").references(() => users.id).notNull(),
  company_name: text("company_name").notNull(),
  website_url: text("website_url"),
  monitoring_keywords: jsonb("monitoring_keywords").$type<string[]>(),
  last_updated: timestamp("last_updated").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

export const competitor_updates = pgTable("competitor_updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitor_id: uuid("competitor_id").references(() => competitors.id).notNull(),
  update_type: text("update_type").notNull(), // 'news', 'product', 'social'
  content: jsonb("content").notNull(),
  source_url: text("source_url"),
  importance_score: text("importance_score"),
  is_notified: boolean("is_notified").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(analyses),
  comments: many(comments),
  shared_analyses: many(shared_analyses),
  concepts: many(concepts),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  user: one(users, {
    fields: [analyses.user_id],
    references: [users.id],
  }),
  comments: many(comments),
  shared_with: many(shared_analyses),
  used_in_concepts: many(concept_analyses),
}));

export const conceptsRelations = relations(concepts, ({ one, many }) => ({
  user: one(users, {
    fields: [concepts.user_id],
    references: [users.id],
  }),
  analyses: many(concept_analyses),
}));

export const conceptAnalysesRelations = relations(concept_analyses, ({ one }) => ({
  concept: one(concepts, {
    fields: [concept_analyses.concept_id],
    references: [concepts.id],
  }),
  analysis: one(analyses, {
    fields: [concept_analyses.analysis_id],
    references: [analyses.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  analysis: one(analyses, {
    fields: [comments.analysis_id],
    references: [analyses.id],
  }),
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
}));

export const sharedAnalysesRelations = relations(shared_analyses, ({ one }) => ({
  analysis: one(analyses, {
    fields: [shared_analyses.analysis_id],
    references: [analyses.id],
  }),
  user: one(users, {
    fields: [shared_analyses.user_id],
    references: [users.id],
  }),
}));

export const productRequirementsRelations = relations(product_requirements, ({ one, many }) => ({
  user: one(users, {
    fields: [product_requirements.user_id],
    references: [users.id],
  }),
  concept: one(concepts, {
    fields: [product_requirements.concept_id],
    references: [concepts.id],
  }),
  analyses: many(requirement_analyses),
}));

export const requirementAnalysesRelations = relations(requirement_analyses, ({ one }) => ({
  requirement: one(product_requirements, {
    fields: [requirement_analyses.requirement_id],
    references: [product_requirements.id],
  }),
  analysis: one(analyses, {
    fields: [requirement_analyses.analysis_id],
    references: [analyses.id],
  }),
}));

// Relations
export const competitorsRelations = relations(competitors, ({ one, many }) => ({
  user: one(users, {
    fields: [competitors.user_id],
    references: [users.id],
  }),
  updates: many(competitor_updates),
}));

export const competitorUpdatesRelations = relations(competitor_updates, ({ one }) => ({
  competitor: one(competitors, {
    fields: [competitor_updates.competitor_id],
    references: [competitors.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertAnalysisSchema = createInsertSchema(analyses);
export const selectAnalysisSchema = createSelectSchema(analyses);
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export const insertConceptSchema = createInsertSchema(concepts);
export const selectConceptSchema = createSelectSchema(concepts);
export type Concept = typeof concepts.$inferSelect;
export type NewConcept = typeof concepts.$inferInsert;

export const insertConceptAnalysisSchema = createInsertSchema(concept_analyses);
export const selectConceptAnalysisSchema = createSelectSchema(concept_analyses);
export type ConceptAnalysis = typeof concept_analyses.$inferSelect;
export type NewConceptAnalysis = typeof concept_analyses.$inferInsert;

export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export const insertSharedAnalysisSchema = createInsertSchema(shared_analyses);
export const selectSharedAnalysisSchema = createSelectSchema(shared_analyses);
export type SharedAnalysis = typeof shared_analyses.$inferSelect;
export type NewSharedAnalysis = typeof shared_analyses.$inferInsert;

export const insertProductRequirementSchema = createInsertSchema(product_requirements);
export const selectProductRequirementSchema = createSelectSchema(product_requirements);
export type ProductRequirement = typeof product_requirements.$inferSelect;
export type NewProductRequirement = typeof product_requirements.$inferInsert;

export const insertRequirementAnalysisSchema = createInsertSchema(requirement_analyses);
export const selectRequirementAnalysisSchema = createSelectSchema(requirement_analyses);
export type RequirementAnalysis = typeof requirement_analyses.$inferSelect;
export type NewRequirementAnalysis = typeof requirement_analyses.$inferInsert;

export const insertCompetitorSchema = createInsertSchema(competitors);
export const selectCompetitorSchema = createSelectSchema(competitors);
export type Competitor = typeof competitors.$inferSelect;
export type NewCompetitor = typeof competitors.$inferInsert;

export const insertCompetitorUpdateSchema = createInsertSchema(competitor_updates);
export const selectCompetitorUpdateSchema = createSelectSchema(competitor_updates);
export type CompetitorUpdate = typeof competitor_updates.$inferSelect;
export type NewCompetitorUpdate = typeof competitor_updates.$inferInsert;