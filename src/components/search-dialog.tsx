"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { searchPosts } from "@/lib/search-actions";
import type { PostWithRelations } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchDialogProps {
  children: React.ReactNode;
}

export function SearchDialog({ children }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostWithRelations[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const searchDebounced = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const searchResults = await searchPosts(query);
          setResults(searchResults);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query]);

  const handleResultClick = (slug: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/discussion/${slug}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search Discussions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for discussions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-2">
                {results.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleResultClick(post.slug)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarImage
                            src={
                              post.profiles?.avatar_url || "/placeholder.svg"
                            }
                          />
                          <AvatarFallback className="text-xs">
                            {post.profiles?.username?.charAt(0).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {post.profiles?.display_name ||
                            post.profiles?.username ||
                            "Anonymous"}
                        </span>
                        {post.categories && (
                          <>
                            <span>•</span>
                            <Badge
                              variant="secondary"
                              className="text-xs px-2 py-0"
                            >
                              {post.categories.name}
                            </Badge>
                          </>
                        )}
                      </div>
                      <h4 className="font-medium text-sm leading-tight hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {(post.upvotes || 0) - (post.downvotes || 0)} votes
                        </span>
                        <span>{post.comment_count || 0} comments</span>
                        <span>{post.view_count || 0} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query.trim().length > 2 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            ) : query.trim().length > 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                  Type at least 3 characters to search
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
