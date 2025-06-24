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
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
  categories?: Category | null;
}

export interface PostWithRelations extends Post {
  profiles: Profile | null;
  categories: Category | null;
  user_vote?: number | null; // Current user's vote (-1, 0, 1)
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  upvotes: number;
  downvotes: number;
  author: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  replies?: Comment[];
  user_vote?: number | null; // Current user's vote (-1, 0, 1)
}

export interface Vote {
  id: string;
  post_id?: string;
  comment_id?: string;
  user_id: string;
  vote_type: number; // -1 or 1
  created_at: string;
  updated_at: string;
}
