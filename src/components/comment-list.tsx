"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Reply, ArrowUp, ArrowDown } from "lucide-react";
import { TimeAgo } from "@/components/time-ago";
import { CommentForm } from "@/components/comment-form";
import { getCommentsForPostClient } from "@/lib/supabase-client-queries";
import { voteOnComment } from "@/lib/voting-actions";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import type { Comment } from "@/lib/types";

interface CommentListProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentList({
  postId,
  initialComments = [],
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [votingStates, setVotingStates] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { user } = useAuth();
  const { error } = useToast();

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const refreshComments = useCallback(async () => {
    setLoading(true);
    try {
      const newComments = await getCommentsForPostClient(postId);
      setComments(newComments);
    } catch (error) {
      console.error("Failed to refresh comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (initialComments.length === 0) {
      refreshComments();
    }
  }, [initialComments.length, refreshComments]);

  const handleReplySuccess = () => {
    setReplyingTo(null);
    refreshComments();
  };

  const handleVote = async (commentId: string, voteType: number) => {
    if (!user) {
      error("You must be logged in to vote");
      return;
    }

    if (votingStates[commentId]) return;

    setVotingStates((prev) => ({ ...prev, [commentId]: true }));

    try {
      const result = await voteOnComment(commentId, voteType);

      if (result.success) {
        // Update local state optimistically
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment.id === commentId) {
              const newVote = comment.user_vote === voteType ? null : voteType;
              const oldVote = comment.user_vote;

              let newUpvotes = comment.upvotes;
              let newDownvotes = comment.downvotes;

              // Remove old vote effect
              if (oldVote === 1) newUpvotes--;
              if (oldVote === -1) newDownvotes--;

              // Add new vote effect
              if (newVote === 1) newUpvotes++;
              if (newVote === -1) newDownvotes++;

              return {
                ...comment,
                user_vote: newVote,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
              };
            }

            // Handle replies
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map((reply) => {
                  if (reply.id === commentId) {
                    const newVote =
                      reply.user_vote === voteType ? null : voteType;
                    const oldVote = reply.user_vote;

                    let newUpvotes = reply.upvotes;
                    let newDownvotes = reply.downvotes;

                    // Remove old vote effect
                    if (oldVote === 1) newUpvotes--;
                    if (oldVote === -1) newDownvotes--;

                    // Add new vote effect
                    if (newVote === 1) newUpvotes++;
                    if (newVote === -1) newDownvotes++;

                    return {
                      ...reply,
                      user_vote: newVote,
                      upvotes: newUpvotes,
                      downvotes: newDownvotes,
                    };
                  }
                  return reply;
                }),
              };
            }

            return comment;
          })
        );
      } else {
        error(result.error || "Failed to vote");
      }
    } catch {
      error("Failed to vote");
    } finally {
      setVotingStates((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment.id}>
          <CardContent className="py-4">
            <div className="space-y-3">
              {/* Comment header */}
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage
                    src={comment.author?.avatar_url || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-xs">
                    {comment.author?.username?.charAt(0).toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {comment.author?.display_name ||
                    comment.author?.username ||
                    "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <TimeAgo date={comment.created_at} />
              </div>

              {/* Comment content */}
              <p className="text-sm whitespace-pre-wrap leading-relaxed pl-9">
                {comment.content}
              </p>

              {/* Comment actions */}
              <div className="flex items-center gap-4 pl-9">
                <div className="flex items-center gap-1">
                  <Button
                    variant={comment.user_vote === 1 ? "default" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleVote(comment.id, 1)}
                    disabled={votingStates[comment.id]}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium min-w-[1rem] text-center">
                    {formatCount(comment.upvotes - comment.downvotes)}
                  </span>
                  <Button
                    variant={comment.user_vote === -1 ? "destructive" : "ghost"}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleVote(comment.id, -1)}
                    disabled={votingStates[comment.id]}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="pl-9">
                  <CommentForm
                    postId={postId}
                    parentId={comment.id}
                    onSuccess={handleReplySuccess}
                    placeholder="Write your reply..."
                    buttonText="Post Reply"
                  />
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="pl-9 space-y-3 border-l-2 border-muted ml-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="pl-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={reply.author?.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {reply.author?.username?.charAt(0).toUpperCase() ||
                              "A"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs">
                          {reply.author?.display_name ||
                            reply.author?.username ||
                            "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <TimeAgo date={reply.created_at} />
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed pl-8">
                        {reply.content}
                      </p>
                      <div className="flex items-center gap-1 pl-8">
                        <Button
                          variant={reply.user_vote === 1 ? "default" : "ghost"}
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleVote(reply.id, 1)}
                          disabled={votingStates[reply.id]}
                        >
                          <ArrowUp className="h-2 w-2" />
                        </Button>
                        <span className="text-xs font-medium min-w-[1rem] text-center">
                          {formatCount(reply.upvotes - reply.downvotes)}
                        </span>
                        <Button
                          variant={
                            reply.user_vote === -1 ? "destructive" : "ghost"
                          }
                          size="sm"
                          className="h-5 w-5 p-0"
                          onClick={() => handleVote(reply.id, -1)}
                          disabled={votingStates[reply.id]}
                        >
                          <ArrowDown className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
