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
  placeholder = "Join the conversation...",
  buttonText = "Comment",
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
        success("Comment posted!");
        setContent("");
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
      <Card className="border-dashed">
        <CardContent className="py-4 text-center">
          <p className="text-muted-foreground text-sm">
            <a
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </a>{" "}
            to join the conversation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            maxLength={2000}
            className="resize-none border-0 bg-muted/50 focus-visible:ring-1"
          />
          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              size="sm"
            >
              {isSubmitting && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              {isSubmitting ? "Posting..." : buttonText}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
