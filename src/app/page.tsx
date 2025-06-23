import { Header } from "@/components/layout/header";
import { DiscussionCard } from "@/components/discussion-card";
import { TopicSidebar } from "@/components/topic-sidebar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageSquare } from "lucide-react";
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Latest Discussions
                </h1>
                <p className="text-muted-foreground mt-1">
                  Ask questions, share knowledge, and connect with the community
                </p>
              </div>
              <Button asChild size="lg">
                <Link href="/ask">
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Link>
              </Button>
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue="latest" className="mb-6">
              <TabsList className="grid w-full grid-cols-4">
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
                  <div className="text-center py-16">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No discussions yet
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Be the first to start a conversation!
                    </p>
                    <Button asChild size="lg">
                      <Link href="/ask">Ask the First Question</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4 mt-6">
                {posts.length > 0 ? (
                  posts
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
                    ))
                ) : (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground mb-4">
                      No trending discussions yet!
                    </p>
                    <Button asChild>
                      <Link href="/ask">Start a Discussion</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="unanswered" className="space-y-4 mt-6">
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    No unanswered questions yet!
                  </p>
                  <Button asChild>
                    <Link href="/ask">Ask a Question</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="following" className="space-y-4 mt-6">
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    Sign in to see discussions from people you follow
                  </p>
                  <Button asChild>
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
