import { pgTable, text, serial, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
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
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  analyses: many(analyses),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, {
    fields: [analyses.user_id],
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