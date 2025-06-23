"use client";

import { useEffect, useState } from "react";

interface TimeAgoProps {
  date: string;
}

export function TimeAgo({ date }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const formatTimeAgo = () => {
      const now = new Date();
      const postDate = new Date(date);
      const diffInSeconds = Math.floor(
        (now.getTime() - postDate.getTime()) / 1000
      );

      if (diffInSeconds < 60) {
        setTimeAgo("just now");
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes}m ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`${hours}h ago`);
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        setTimeAgo(`${days}d ago`);
      } else {
        setTimeAgo(postDate.toLocaleDateString());
      }
    };

    formatTimeAgo();

    // Update every minute for recent posts
    const interval = setInterval(formatTimeAgo, 60000);
    return () => clearInterval(interval);
  }, [date]);

  if (!mounted) {
    return <span className="text-xs text-muted-foreground">loading...</span>;
  }

  return <span className="text-xs text-muted-foreground">{timeAgo}</span>;
}
