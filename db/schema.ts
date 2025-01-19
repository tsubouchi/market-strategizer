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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(analyses),
  comments: many(comments),
  shared_analyses: many(shared_analyses),
}));

export const analysesRelations = relations(analyses, ({ one, many }) => ({
  user: one(users, {
    fields: [analyses.user_id],
    references: [users.id],
  }),
  comments: many(comments),
  shared_with: many(shared_analyses),
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

// Export schemas and types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertAnalysisSchema = createInsertSchema(analyses);
export const selectAnalysisSchema = createSelectSchema(analyses);
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export const insertCommentSchema = createInsertSchema(comments);
export const selectCommentSchema = createSelectSchema(comments);
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export const insertSharedAnalysisSchema = createInsertSchema(shared_analyses);
export const selectSharedAnalysisSchema = createSelectSchema(shared_analyses);
export type SharedAnalysis = typeof shared_analyses.$inferSelect;
export type NewSharedAnalysis = typeof shared_analyses.$inferInsert;