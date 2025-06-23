import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Posts table
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull().unique(),
  authorId: uuid("author_id").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  isPinned: boolean("is_pinned").default(false),
  isLocked: boolean("is_locked").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  authorId: uuid("author_id").notNull(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id"), // For nested comments
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User profiles table (extends Supabase auth.users)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // This will match auth.users.id
  username: text("username").unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(profiles, {
    fields: [comments.authorId],
    references: [profiles.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
}));
