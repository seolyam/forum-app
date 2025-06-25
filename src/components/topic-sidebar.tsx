"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, MessageSquare } from "lucide-react";
import Link from "next/link";

const popularTopics = [
  { name: "General Discussion", count: 2134, trending: true },
  { name: "Technology", count: 1856, trending: true },
  { name: "Health & Fitness", count: 1243, trending: false },
  { name: "Travel", count: 967, trending: true },
  { name: "Food & Cooking", count: 832, trending: false },
  { name: "Movies & TV", count: 721, trending: false },
  { name: "Books", count: 654, trending: false },
  { name: "Sports", count: 543, trending: true },
];

const trendingDiscussions = [
  {
    title: "What's your favorite productivity tip that actually works?",
    comments: 89,
    category: "Lifestyle",
  },
  {
    title: "Best budget travel destinations for 2024?",
    comments: 67,
    category: "Travel",
  },
  {
    title: "Healthy meal prep ideas for busy people",
    comments: 54,
    category: "Health",
  },
];

export function TopicSidebar() {
  return (
    <div className="space-y-6">
      {/* Popular Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Popular Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularTopics.map((topic) => (
            <div key={topic.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link
                  href={`/topic/${topic.name
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/&/g, "and")}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {topic.name}
                </Link>
                {topic.trending && (
                  <Badge
                    variant="destructive"
                    className="text-xs px-1 py-0 bg-primary/20 text-primary border-primary/30"
                  >
                    Hot
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {topic.count}
              </span>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 hover:text-primary"
          >
            View All Topics
          </Button>
        </CardContent>
      </Card>

      {/* Trending Discussions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Trending Now
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trendingDiscussions.map((discussion, index) => (
            <div key={index} className="space-y-1">
              <Link
                href="#"
                className="text-sm font-medium leading-tight hover:text-primary transition-colors line-clamp-2"
              >
                {discussion.title}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge
                  variant="outline"
                  className="text-xs border-primary/30 text-primary"
                >
                  {discussion.category}
                </Badge>
                <span>{discussion.comments} comments</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Community
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Members</span>
            <span className="text-sm font-medium text-primary">45,678</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Online Now</span>
            <span className="text-sm font-medium text-primary">1,234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Discussions</span>
            <span className="text-sm font-medium text-primary">23,456</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
