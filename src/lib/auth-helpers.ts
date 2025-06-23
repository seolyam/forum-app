import { createClient } from "@/lib/supabase/server";

export async function createUserProfile(
  userId: string,
  userData: {
    username?: string;
    display_name?: string;
    email?: string;
  }
) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        username: userData.username || userData.email?.split("@")[0] || "user",
        display_name:
          userData.display_name || userData.username || "Anonymous User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Profile creation failed:", error);
    return null;
  }
}

export async function ensureUserProfile(userId: string, userEmail?: string) {
  const supabase = await createClient();

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Create profile if it doesn't exist
  return await createUserProfile(userId, {
    email: userEmail,
    username: userEmail?.split("@")[0] || "user",
  });
}
