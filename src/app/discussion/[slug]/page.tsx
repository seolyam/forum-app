import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Clock, Eye, MessageSquare } from "lucide-react";
import { TimeAgo } from "@/components/time-ago";
import { CommentForm } from "@/components/comment-form";
import { CommentList } from "@/components/comment-list";
import { getCommentsForPost } from "@/lib/supabase-queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DiscussionPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

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

  // Get comments for this post
  const comments = await getCommentsForPost(post.id);

  // Increment view count
  await supabase
    .from("posts")
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq("id", post.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              {post.categories && (
                <Badge variant="secondary">{post.categories.name}</Badge>
              )}
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage
                    src={post.profiles?.avatar_url || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-xs">
                    {post.profiles?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {post.profiles?.display_name ||
                    post.profiles?.username ||
                    "Anonymous"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <TimeAgo date={post.created_at} />
              </div>
            </div>

            <CardTitle className="text-2xl">{post.title}</CardTitle>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{(post.view_count || 0) + 1} views</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{comments.length} comments</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-foreground">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Comments ({comments.length})
            </h2>
          </div>

          <CommentForm postId={post.id} />

          <CommentList postId={post.id} initialComments={comments} />
        </div>
      </main>
    </div>
  );
}
