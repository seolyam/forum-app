"use client";

import type React from "react";

import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, ArrowUp, ArrowDown, Eye, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { voteOnPost } from "@/lib/voting-actions";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
    downvotes: number;
    comments: number;
    views: number;
  };
  createdAt: string;
  userVote?: number | null;
}

export function DiscussionCard({
  id,
  title,
  content,
  author,
  category,
  stats,
  createdAt,
  userVote = null,
}: DiscussionCardProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [mounted, setMounted] = useState(false);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [voteStats, setVoteStats] = useState(stats);
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { error } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const date = new Date(createdAt);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      setTimeAgo("now");
    } else if (diffInHours < 24) {
      setTimeAgo(`${diffInHours}h`);
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      setTimeAgo(`${days}d`);
    } else {
      setTimeAgo(date.toLocaleDateString());
    }
  }, [createdAt]);

  const handleVote = async (e: React.MouseEvent, voteType: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      error("You must be logged in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      // Use the slug (id prop) to vote - the server action will handle slug-to-ID conversion
      const result = await voteOnPost(id, voteType);

      if (result.success) {
        const newVote = currentVote === voteType ? null : voteType;
        const oldVote = currentVote;

        setCurrentVote(newVote);

        let newUpvotes = voteStats.upvotes;
        let newDownvotes = voteStats.downvotes;

        if (oldVote === 1) newUpvotes--;
        if (oldVote === -1) newDownvotes--;
        if (newVote === 1) newUpvotes++;
        if (newVote === -1) newDownvotes++;

        setVoteStats({
          ...voteStats,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
        });
      } else {
        error(result.error || "Failed to vote");
      }
    } catch (err) {
      console.error("Voting error:", err);
      error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/discussion/${id}`);
  };

  const netVotes = voteStats.upvotes - voteStats.downvotes;
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (!mounted) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          {/* Vertical Voting */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <Button
              variant={currentVote === 1 ? "default" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => handleVote(e, 1)}
              disabled={isVoting}
            >
              {isVoting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
            <span className="text-sm font-medium">{formatCount(netVotes)}</span>
            <Button
              variant={currentVote === -1 ? "destructive" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => handleVote(e, -1)}
              disabled={isVoting}
            >
              {isVoting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage src={author.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {author.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">
                {author.displayName || author.username}
              </span>
              <span>•</span>
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20"
              >
                {category.name}
              </Badge>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
              {content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-4">
                {/* Comments */}
                <div className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">
                    {formatCount(voteStats.comments)} comments
                  </span>
                </div>

                {/* Views */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">
                    {formatCount(voteStats.views)} views
                  </span>
                </div>
              </div>

              {/* Share */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigator.clipboard.writeText(
                    `${window.location.origin}/discussion/${id}`
                  );
                }}
              >
                <Share className="h-3 w-3 mr-1" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
