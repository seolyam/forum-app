export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  category_id: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  categories?: Category | null;
}

export interface PostWithRelations extends Post {
  profiles: Profile | null;
  categories: Category | null;
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  author: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
}

// This is what Supabase actually returns - profiles is a single object, not an array
export interface SupabaseCommentResponse {
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
}
