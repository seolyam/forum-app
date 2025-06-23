import { db } from "./index";
import { categories, posts, comments, profiles } from "./schema";
import { desc, eq, and, isNull, sql } from "drizzle-orm";

// Category queries
export async function getCategories() {
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryBySlug(slug: string) {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return result[0] || null;
}

// Post queries with author and category info
export async function getPosts(limit = 10, offset = 0) {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      slug: posts.slug,
      authorId: posts.authorId,
      categoryId: posts.categoryId,
      isPinned: posts.isPinned,
      isLocked: posts.isLocked,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostBySlug(slug: string) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      slug: posts.slug,
      authorId: posts.authorId,
      categoryId: posts.categoryId,
      isPinned: posts.isPinned,
      isLocked: posts.isLocked,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.slug, slug))
    .limit(1);

  return result[0] || null;
}

// Get posts with comment counts - Fixed version
export async function getPostsWithStats(limit = 10, offset = 0) {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      slug: posts.slug,
      authorId: posts.authorId,
      categoryId: posts.categoryId,
      isPinned: posts.isPinned,
      isLocked: posts.isLocked,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
      commentCount: sql<number>`count(${comments.id})`.as("comment_count"),
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(comments, eq(posts.id, comments.postId))
    .groupBy(
      posts.id,
      posts.title,
      posts.content,
      posts.slug,
      posts.authorId,
      posts.categoryId,
      posts.isPinned,
      posts.isLocked,
      posts.viewCount,
      posts.createdAt,
      posts.updatedAt,
      profiles.id,
      profiles.username,
      profiles.displayName,
      profiles.avatarUrl,
      categories.id,
      categories.name,
      categories.slug
    )
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

// Comment queries
export async function getCommentsByPostId(postId: string) {
  return await db
    .select({
      id: comments.id,
      content: comments.content,
      authorId: comments.authorId,
      postId: comments.postId,
      parentId: comments.parentId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(comments)
    .leftJoin(profiles, eq(comments.authorId, profiles.id))
    .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
    .orderBy(comments.createdAt);
}

// Profile queries
export async function getProfileById(id: string) {
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createProfile(data: {
  id: string;
  username?: string;
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}) {
  const result = await db.insert(profiles).values(data).returning();
  return result[0];
}

// Create a new post
export async function createPost(data: {
  title: string;
  content: string;
  slug: string;
  authorId: string;
  categoryId?: string;
}) {
  const result = await db.insert(posts).values(data).returning();
  return result[0];
}

// Simpler version without comment count for now
export async function getPostsSimple(limit = 10, offset = 0) {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      slug: posts.slug,
      authorId: posts.authorId,
      categoryId: posts.categoryId,
      isPinned: posts.isPinned,
      isLocked: posts.isLocked,
      viewCount: posts.viewCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      author: {
        id: profiles.id,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      },
      category: {
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      },
    })
    .from(posts)
    .leftJoin(profiles, eq(posts.authorId, profiles.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.isPinned), desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}
