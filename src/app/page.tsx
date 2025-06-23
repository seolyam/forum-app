import { Header } from "@/components/layout/header";
import { DiscussionCard } from "@/components/discussion-card";
import { TopicSidebar } from "@/components/topic-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getPostsFromSupabase } from "@/lib/supabase-queries";
import type { PostWithRelations } from "@/lib/types";

export default async function HomePage() {
  const posts = await getPostsFromSupabase();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Latest Discussions</h1>
                <p className="text-muted-foreground">
                  Join the conversation and share your experiences
                </p>
              </div>
              <Button asChild>
                <Link href="/ask">
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Link>
              </Button>
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="latest" className="mb-6">
              <TabsList>
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="unanswered">Unanswered</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>

              <TabsContent value="latest" className="space-y-4 mt-6">
                {posts.length > 0 ? (
                  posts.map((post: PostWithRelations) => (
                    <DiscussionCard
                      key={post.id}
                      id={post.slug}
                      title={post.title}
                      content={post.content}
                      author={{
                        username: post.profiles?.username || "Anonymous",
                        displayName:
                          post.profiles?.display_name || "Anonymous User",
                        avatarUrl: post.profiles?.avatar_url || undefined,
                      }}
                      category={{
                        name: post.categories?.name || "General",
                        slug: post.categories?.slug || "general",
                      }}
                      stats={{
                        upvotes: 0,
                        comments: 0,
                        views: post.view_count || 0,
                      }}
                      createdAt={post.created_at}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      No discussions yet. Be the first to start one!
                    </p>
                    <Button asChild>
                      <Link href="/ask">Ask the First Question</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4 mt-6">
                {posts
                  .sort(
                    (a: PostWithRelations, b: PostWithRelations) =>
                      (b.view_count || 0) - (a.view_count || 0)
                  )
                  .map((post: PostWithRelations) => (
                    <DiscussionCard
                      key={post.id}
                      id={post.slug}
                      title={post.title}
                      content={post.content}
                      author={{
                        username: post.profiles?.username || "Anonymous",
                        displayName:
                          post.profiles?.display_name || "Anonymous User",
                        avatarUrl: post.profiles?.avatar_url || undefined,
                      }}
                      category={{
                        name: post.categories?.name || "General",
                        slug: post.categories?.slug || "general",
                      }}
                      stats={{
                        upvotes: 0,
                        comments: 0,
                        views: post.view_count || 0,
                      }}
                      createdAt={post.created_at}
                    />
                  ))}
              </TabsContent>

              <TabsContent value="unanswered" className="space-y-4 mt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No unanswered questions yet!
                  </p>
                  <Button asChild>
                    <Link href="/ask">Ask a Question</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="following" className="space-y-4 mt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Sign in to see discussions from people you follow
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TopicSidebar />
          </div>
        </div>
      </main>
    </div>
  );
}
