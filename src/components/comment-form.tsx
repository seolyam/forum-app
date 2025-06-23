"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { createCommentAction } from "@/lib/actions";

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  buttonText?: string;
}

export function CommentForm({
  postId,
  parentId,
  onSuccess,
  placeholder = "Write your comment...",
  buttonText = "Post Comment",
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      error("You must be logged in to comment");
      return;
    }

    if (!content.trim()) {
      error("Please write a comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("postId", postId);
      if (parentId) {
        formData.append("parentId", parentId);
      }

      const result = await createCommentAction(formData);

      if (result.success) {
        success("Comment posted successfully!");
        setContent("");
        // Wait a moment for the database to update, then refresh
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        error(result.error || "Failed to post comment");
      }
    } catch {
      error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>{" "}
            to join the discussion
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {content.length}/2000 characters
            </p>
            <Button type="submit" disabled={isSubmitting || !content.trim()}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isSubmitting ? "Posting..." : buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
