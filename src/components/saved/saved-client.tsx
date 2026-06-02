"use client";

import { useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import Link from "next/link";
import { FileText, Target, Repeat, Trash2 } from "lucide-react";
import { useSavedItemsDetailed, useRemoveSavedItem } from "@/hooks";
import type { SavedItemDetailed, Article, Habit, Goal } from "@/api";
import { useSearchParamState } from "@/lib/url-state";

export function SavedClient() {
  const [tab, setTab] = useSearchParamState("tab", "articles");
  const { data: savedItems, isLoading } = useSavedItemsDetailed({ page: 1, limit: 100 });
  const removeSaved = useRemoveSavedItem();

  const items = savedItems ?? [];
  const articles = items
    .filter((item: SavedItemDetailed) => item.itemType === "article")
    .map((item: SavedItemDetailed) => item.article)
    .filter((a): a is Article => Boolean(a));
  const habits = items
    .filter((item: SavedItemDetailed) => item.itemType === "habit")
    .map((item: SavedItemDetailed) => item.habit)
    .filter((h): h is Habit => Boolean(h));
  const goals = items
    .filter((item: SavedItemDetailed) => item.itemType === "goal")
    .map((item: SavedItemDetailed) => item.goal)
    .filter((g): g is Goal => Boolean(g));

  const handleRemove = useCallback(async (savedItemId: string, itemType: string) => {
    try {
      await removeSaved.mutateAsync(savedItemId);
      toast.success(`${itemType} removed from saved`);
    } catch {
      toast.error("Failed to remove saved item");
    }
  }, [removeSaved]);

  const renderArticles = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No saved articles yet.</p>
          <p className="text-xs mt-1">Articles you save will appear here.</p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link href="/explore">Explore articles</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {articles.map((article) => (
          <Card key={article!.id}>
            <CardHeader>
              <CardTitle className="text-base">{article!.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{article!.excerpt}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{article!.category?.name ?? "Uncategorized"}</span>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm"><Link href={`/article/${article!.id}`}>Read</Link></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const savedItem = savedItems?.find((s) => s.itemId === article!.id);
                      if (savedItem) handleRemove(savedItem.id, "Article");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderHabits = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (habits.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Repeat className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No saved habits yet.</p>
          <p className="text-xs mt-1">Habits you save will appear here.</p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link href="/explore">Explore habits</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {habits.map((habit) => (
          <Card key={habit!.id}>
            <CardHeader>
              <CardTitle className="text-base">{habit!.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{habit!.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{habit!.category}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const savedItem = savedItems?.find((s) => s.itemId === habit!.id);
                    if (savedItem) handleRemove(savedItem.id, "Habit");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderGoals = () => {
    if (isLoading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (goals.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Target className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No saved goals yet.</p>
          <p className="text-xs mt-1">Goals you save will appear here.</p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link href="/explore">Explore goals</Link>
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <Card key={goal!.id}>
            <CardHeader>
              <CardTitle className="text-base">{goal!.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{goal!.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{goal!.category}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const savedItem = savedItems?.find((s) => s.itemId === goal!.id);
                    if (savedItem) handleRemove(savedItem.id, "Goal");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 md:py-8">
          <header className="mb-4">
            <h1 className="text-2xl font-bold tracking-tight">Saved</h1>
            <p className="text-sm text-muted-foreground">Your saved articles, habits, and goals.</p>
          </header>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="articles">{renderArticles()}</TabsContent>
            <TabsContent value="habits">{renderHabits()}</TabsContent>
            <TabsContent value="goals">{renderGoals()}</TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
