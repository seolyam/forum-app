"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Reply, ThumbsUp } from "lucide-react";
import { TimeAgo } from "@/components/time-ago";
import { CommentForm } from "@/components/comment-form";
import { getCommentsForPostClient } from "@/lib/supabase-client-queries";
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

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
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
      <div className="text-center py-8">
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
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={comment.author?.avatar_url || "/placeholder.svg"}
                />
                <AvatarFallback>
                  {comment.author?.username?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {comment.author?.display_name ||
                      comment.author?.username ||
                      "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <TimeAgo date={comment.created_at} />
                </div>

                <p className="text-sm whitespace-pre-wrap mb-3">
                  {comment.content}
                </p>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    <span className="text-xs">0</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment.id ? null : comment.id
                      )
                    }
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                </div>

                {replyingTo === comment.id && (
                  <div className="mt-4">
                    <CommentForm
                      postId={postId}
                      parentId={comment.id}
                      onSuccess={handleReplySuccess}
                      placeholder="Write your reply..."
                      buttonText="Post Reply"
                    />
                  </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-muted space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={reply.author?.avatar_url || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {reply.author?.username?.charAt(0).toUpperCase() ||
                              "A"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-xs">
                              {reply.author?.display_name ||
                                reply.author?.username ||
                                "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <TimeAgo date={reply.created_at} />
                          </div>
                          <p className="text-xs whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
