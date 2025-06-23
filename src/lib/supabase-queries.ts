import { createClient } from "@/lib/supabase/server";
import type { PostWithRelations, Category } from "@/lib/types";

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
