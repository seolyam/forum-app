import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Eye, MessageSquare } from "lucide-react";
import { TimeAgo } from "@/components/time-ago";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { PostVoting } from "@/components/post-voting";
import { getCommentsForPost } from "@/lib/supabase-queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DiscussionPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
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
    .eq("slug", slug)
    .single();

  if (error || !post) {
    notFound();
  }

  // Get user's vote for this post
  let userVote = null;
  if (user) {
    const { data: vote } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .single();

    userVote = vote?.vote_type || null;
  }

  // Get comments for this post with user vote information
  const comments = await getCommentsForPost(post.id, user?.id);

  // Increment view count
  await supabase
    .from("posts")
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq("id", post.id);

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader className="pb-4">
            {/* Post metadata */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Avatar className="h-5 w-5">
                <AvatarImage
                  src={post.profiles?.avatar_url || "/placeholder.svg"}
                />
                <AvatarFallback className="text-xs">
                  {post.profiles?.username?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {post.profiles?.display_name ||
                  post.profiles?.username ||
                  "Anonymous"}
              </span>
              <span>•</span>
              {post.categories && (
                <>
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    {post.categories.name}
                  </Badge>
                  <span>•</span>
                </>
              )}
              <TimeAgo date={post.created_at} />
            </div>

            {/* Post title */}
            <h1 className="text-2xl font-bold leading-tight mb-4">
              {post.title}
            </h1>

            {/* Post stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatCount((post.view_count || 0) + 1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{formatCount(post.comment_count || 0)}</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Post content */}
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                {post.content}
              </p>
            </div>

            {/* Post actions */}
            <div className="pt-4 border-t">
              <PostVoting
                postId={post.id}
                upvotes={post.upvotes || 0}
                downvotes={post.downvotes || 0}
                userVote={userVote}
              />
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-8 space-y-6">
          <CommentForm postId={post.id} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {formatCount(post.comment_count || 0)} Comments
              </h2>
            </div>
            <CommentList postId={post.id} initialComments={comments} />
          </div>
        </div>
      </main>
    </div>
  );
}
