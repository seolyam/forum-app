"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth-provider";
import { UserNav } from "@/components/user-nav";
import { MessageSquare, Search, Plus } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { SearchDialog } from "@/components/search-dialog";

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center">
        {/* Logo */}
        <div className="mr-6 flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              NeedToKnow
            </span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <SearchDialog>
            <div className="relative w-full cursor-pointer">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 cursor-pointer"
                readOnly
              />
            </div>
          </SearchDialog>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-4 ml-6">
          <Button variant="ghost" asChild className="hover:text-primary">
            <Link href="/topics">Topics</Link>
          </Button>
          <Button variant="ghost" asChild className="hover:text-primary">
            <Link href="/trending">Trending</Link>
          </Button>

          <ModeToggle />

          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <Button
                asChild
                className="bg-primary hover:bg-primary/90 transition-all"
              >
                <Link href="/ask">
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Link>
              </Button>
              <UserNav user={user} />
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild className="hover:text-primary">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
