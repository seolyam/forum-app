"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Share } from "lucide-react";
import { voteOnPost } from "@/lib/voting-actions";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface PostVotingProps {
  postId: string;
  upvotes: number;
  downvotes: number;
  userVote?: number | null;
}

export function PostVoting({
  postId,
  upvotes,
  downvotes,
  userVote = null,
}: PostVotingProps) {
  const [currentVote, setCurrentVote] = useState(userVote);
  const [voteStats, setVoteStats] = useState({ upvotes, downvotes });
  const [isVoting, setIsVoting] = useState(false);
  const { user } = useAuth();
  const { error, success } = useToast();

  const handleVote = async (voteType: number) => {
    if (!user) {
      error("You must be logged in to vote");
      return;
    }

    if (isVoting) return;

    setIsVoting(true);

    try {
      const result = await voteOnPost(postId, voteType);

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
          upvotes: newUpvotes,
          downvotes: newDownvotes,
        });
      } else {
        error(result.error || "Failed to vote");
      }
    } catch {
      error("Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      success("Link copied to clipboard!");
    } catch {
      error("Failed to copy link");
    }
  };

  const netVotes = voteStats.upvotes - voteStats.downvotes;
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Combined Voting Container */}
      <div className="flex items-center border rounded-md bg-muted/30">
        <Button
          variant={currentVote === 1 ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 rounded-r-none border-0"
          onClick={() => handleVote(1)}
          disabled={isVoting}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <div className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center border-x">
          {formatCount(netVotes)}
        </div>
        <Button
          variant={currentVote === -1 ? "destructive" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0 rounded-l-none border-0"
          onClick={() => handleVote(-1)}
          disabled={isVoting}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-3"
        onClick={handleShare}
      >
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
}
