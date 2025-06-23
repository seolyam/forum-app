"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowUp, ArrowDown, Eye, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DiscussionCardProps {
  id: string;
  title: string;
  content: string;
  author: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  category: {
    name: string;
    slug: string;
  };
  stats: {
    upvotes: number;
    comments: number;
    views: number;
  };
  createdAt: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

export function DiscussionCard({
  id,
  title,
  content,
  author,
  category,
  stats,
  createdAt,
  isUpvoted = false,
  isDownvoted = false,
}: DiscussionCardProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Format date consistently on client side only
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      setTimeAgo("just now");
    } else if (diffInHours < 24) {
      setTimeAgo(`${diffInHours}h ago`);
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      setTimeAgo(`${days}d ago`);
    } else {
      setTimeAgo(date.toLocaleDateString());
    }
  }, [createdAt]);

  // Show placeholder during hydration
  if (!mounted) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <Button
                variant={isUpvoted ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{stats.upvotes}</span>
              <Button
                variant={isDownvoted ? "destructive" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{category.name}</Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={author.avatarUrl || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {author.displayName || author.username}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs text-muted-foreground">
                    loading...
                  </span>
                </div>
              </div>

              <Link href={`/discussion/${id}`} className="block group">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                  {content}
                </p>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{stats.comments} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{stats.views} views</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button
              variant={isUpvoted ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">{stats.upvotes}</span>
            <Button
              variant={isDownvoted ? "destructive" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{category.name}</Badge>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={author.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {author.displayName || author.username}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">•</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>
            </div>

            <Link href={`/discussion/${id}`} className="block group">
              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors mb-2">
                {title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {content}
              </p>
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{stats.comments} comments</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{stats.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
