"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function voteOnPost(postIdOrSlug: string, voteType: number) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to vote" };
  }

  try {
    // First, get the actual post ID if we received a slug
    let postId = postIdOrSlug;

    // Check if this looks like a slug (contains hyphens and is longer than a typical UUID)
    if (postIdOrSlug.includes("-") && postIdOrSlug.length > 36) {
      const { data: post, error: postError } = await supabase
        .from("posts")
        .select("id")
        .eq("slug", postIdOrSlug)
        .single();

      if (postError || !post) {
        console.error("Post lookup error:", postError);
        return { success: false, error: "Post not found" };
      }

      postId = post.id;
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("post_votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote
        const { error: deleteError } = await supabase
          .from("post_votes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (deleteError) {
          console.error("Delete vote error:", deleteError);
          return { success: false, error: "Failed to remove vote" };
        }
      } else {
        // Update vote if clicking different vote
        const { error: updateError } = await supabase
          .from("post_votes")
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Update vote error:", updateError);
          return { success: false, error: "Failed to update vote" };
        }
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase.from("post_votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      });

      if (insertError) {
        console.error("Insert vote error:", insertError);
        return { success: false, error: "Failed to cast vote" };
      }
    }

    // Revalidate the page to show updated vote counts
    revalidatePath("/");
    revalidatePath("/discussion/[slug]", "page");

    return { success: true };
  } catch (error) {
    console.error("Error voting on post:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}

export async function voteOnComment(commentId: string, voteType: number) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to vote" };
  }

  try {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from("comment_votes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", user.id)
      .single();

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote
        const { error: deleteError } = await supabase
          .from("comment_votes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);

        if (deleteError) {
          return { success: false, error: "Failed to remove vote" };
        }
      } else {
        // Update vote if clicking different vote
        const { error: updateError } = await supabase
          .from("comment_votes")
          .update({ vote_type: voteType, updated_at: new Date().toISOString() })
          .eq("comment_id", commentId)
          .eq("user_id", user.id);

        if (updateError) {
          return { success: false, error: "Failed to update vote" };
        }
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from("comment_votes")
        .insert({
          comment_id: commentId,
          user_id: user.id,
          vote_type: voteType,
        });

      if (insertError) {
        return { success: false, error: "Failed to cast vote" };
      }
    }

    // Revalidate the discussion page to show updated vote counts
    revalidatePath("/discussion/[slug]", "page");

    return { success: true };
  } catch (error) {
    console.error("Error voting on comment:", error);
    return { success: false, error: "Failed to cast vote" };
  }
}
