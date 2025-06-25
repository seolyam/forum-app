"use server";

import { createClient } from "@/lib/supabase/server";
import type { PostWithRelations } from "@/lib/types";

export async function searchPosts(query: string): Promise<PostWithRelations[]> {
  if (!query.trim()) {
    return [];
  }

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
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Search error:", error);
      return [];
    }

    return (posts as PostWithRelations[]) || [];
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}
