"use server";

import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 100);
}

export async function createPostAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to create a post" };
  }

  // Ensure user profile exists
  const profile = await ensureUserProfile(user.id, user.email);
  if (!profile) {
    return { success: false, error: "Failed to create user profile" };
  }

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!title?.trim() || !content?.trim()) {
    return { success: false, error: "Title and content are required" };
  }

  try {
    const slug = generateSlug(title);

    // Use Supabase directly instead of Drizzle for now
    const { data: post, error: insertError } = await supabase
      .from("posts")
      .insert({
        title: title.trim(),
        content: content.trim(),
        slug,
        author_id: user.id,
        category_id: categoryId || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Post creation error:", insertError);
      return {
        success: false,
        error: "Failed to create post: " + insertError.message,
      };
    }

    // Redirect on success - this will throw and exit the function
    redirect(`/discussion/${post.slug}`);
  } catch (error) {
    // Check if this is a redirect (which is expected)
    if (error && typeof error === "object" && "digest" in error) {
      // This is a Next.js redirect, re-throw it
      throw error;
    }

    console.error("Error creating post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function createCommentAction(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "You must be logged in to comment" };
  }

  // Ensure user profile exists
  const profile = await ensureUserProfile(user.id, user.email);
  if (!profile) {
    return { success: false, error: "Failed to create user profile" };
  }

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string;

  if (!content?.trim()) {
    return { success: false, error: "Comment content is required" };
  }

  if (!postId) {
    return { success: false, error: "Post ID is required" };
  }

  try {
    const { data: comment, error: insertError } = await supabase
      .from("comments")
      .insert({
        content: content.trim(),
        author_id: user.id,
        post_id: postId,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Comment creation error:", insertError);
      return {
        success: false,
        error: "Failed to create comment: " + insertError.message,
      };
    }

    // Revalidate the discussion page to show new comment
    revalidatePath(`/discussion/[slug]`, "page");

    return { success: true, comment };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}
