import { createClient } from "@/lib/supabase/server";
import type { PostWithRelations, Category, Comment } from "@/lib/types";

export async function getPostsFromSupabase(
  userId?: string
): Promise<PostWithRelations[]> {
  const supabase = await createClient();

  try {
    const query = supabase
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

    const { data: posts, error } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      return [];
    }

    if (!posts) return [];

    // Get user votes if userId is provided
    let userVotes: { [key: string]: number } = {};
    if (userId) {
      const { data: votes } = await supabase
        .from("post_votes")
        .select("post_id, vote_type")
        .eq("user_id", userId)
        .in(
          "post_id",
          posts.map((p) => p.id)
        );

      if (votes) {
        userVotes = votes.reduce((acc, vote) => {
          acc[vote.post_id] = vote.vote_type;
          return acc;
        }, {} as { [key: string]: number });
      }
    }

    return posts.map((post) => ({
      ...post,
      user_vote: userVotes[post.id] || null,
    })) as PostWithRelations[];
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

export async function getCommentsForPost(
  postId: string,
  userId?: string
): Promise<Comment[]> {
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
        upvotes,
        downvotes,
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

    // Get user votes for comments if userId is provided
    let userVotes: { [key: string]: number } = {};
    if (userId) {
      const { data: votes } = await supabase
        .from("comment_votes")
        .select("comment_id, vote_type")
        .eq("user_id", userId)
        .in(
          "comment_id",
          comments.map((c) => c.id)
        );

      if (votes) {
        userVotes = votes.reduce((acc, vote) => {
          acc[vote.comment_id] = vote.vote_type;
          return acc;
        }, {} as { [key: string]: number });
      }
    }

    // Use 'unknown' first to safely cast the Supabase response
    const typedComments = comments as unknown as {
      id: string;
      content: string;
      created_at: string;
      parent_id: string | null;
      upvotes: number;
      downvotes: number;
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
            upvotes,
            downvotes,
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
            upvotes: number;
            downvotes: number;
            profiles: {
              id: string;
              username: string | null;
              display_name: string | null;
              avatar_url: string | null;
            } | null;
          }[]) || [];

        // Get user votes for replies
        let replyVotes: { [key: string]: number } = {};
        if (userId && typedReplies.length > 0) {
          const { data: votes } = await supabase
            .from("comment_votes")
            .select("comment_id, vote_type")
            .eq("user_id", userId)
            .in(
              "comment_id",
              typedReplies.map((r) => r.id)
            );

          if (votes) {
            replyVotes = votes.reduce((acc, vote) => {
              acc[vote.comment_id] = vote.vote_type;
              return acc;
            }, {} as { [key: string]: number });
          }
        }

        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          parent_id: comment.parent_id,
          upvotes: comment.upvotes,
          downvotes: comment.downvotes,
          author: comment.profiles,
          user_vote: userVotes[comment.id] || null,
          replies: typedReplies.map((reply) => ({
            id: reply.id,
            content: reply.content,
            created_at: reply.created_at,
            parent_id: reply.parent_id,
            upvotes: reply.upvotes,
            downvotes: reply.downvotes,
            author: reply.profiles,
            user_vote: replyVotes[reply.id] || null,
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
