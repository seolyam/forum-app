import { createClient } from "@/lib/supabase/server";
import type { PostWithRelations, Category, Comment } from "@/lib/types";

export async function getPostsFromSupabase(): Promise<PostWithRelations[]> {
  const supabase = await createClient();

  try {
    const { data: posts, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url
        ),
        categories:category_id (
          id,
          name,
          slug
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    return (posts as PostWithRelations[]) || [];
  } catch (error) {
    console.error("Database connection error:", error);
    return [];
  }
}

export async function getCategoriesFromSupabase(): Promise<Category[]> {
  const supabase = await createClient();

  try {
    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      console.error("Supabase categories error:", error);
      return [];
    }

    return (categories as Category[]) || [];
  } catch (error) {
    console.error("Categories fetch error:", error);
    return [];
  }
}

export async function getCommentsForPost(postId: string): Promise<Comment[]> {
  const supabase = await createClient();

  try {
    // Get top-level comments
    const { data: comments, error } = await supabase
      .from("comments")
      .select(
        `
        id,
        content,
        created_at,
        parent_id,
        profiles:author_id (
          id,
          username,
          display_name,
          avatar_url
        )
      `
      )
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Comments query error:", error);
      return [];
    }

    if (!comments) return [];

    // Use 'unknown' first to safely cast the Supabase response
    const typedComments = comments as unknown as {
      id: string;
      content: string;
      created_at: string;
      parent_id: string | null;
      profiles: {
        id: string;
        username: string | null;
        display_name: string | null;
        avatar_url: string | null;
      } | null;
    }[];

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      typedComments.map(async (comment) => {
        const { data: replies } = await supabase
          .from("comments")
          .select(
            `
            id,
            content,
            created_at,
            parent_id,
            profiles:author_id (
              id,
              username,
              display_name,
              avatar_url
            )
          `
          )
          .eq("parent_id", comment.id)
          .order("created_at", { ascending: true });

        const typedReplies =
          (replies as unknown as {
            id: string;
            content: string;
            created_at: string;
            parent_id: string | null;
            profiles: {
              id: string;
              username: string | null;
              display_name: string | null;
              avatar_url: string | null;
            } | null;
          }[]) || [];

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          parent_id: comment.parent_id,
          author: comment.profiles,
          replies: typedReplies.map((reply) => ({
            id: reply.id,
            content: reply.content,
            created_at: reply.created_at,
            parent_id: reply.parent_id,
            author: reply.profiles,
          })),
        } as Comment;
      })
    );

    return commentsWithReplies;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}
