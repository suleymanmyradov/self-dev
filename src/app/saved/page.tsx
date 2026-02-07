"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type SavedArticle = { id: string; title: string; excerpt: string; category: string };
type SavedHabit = { id: string; name: string; description: string; category: string };
type SavedGoal = { id: string; title: string; description: string; category: string };

const mockArticles: SavedArticle[] = [
  { id: "deep-work", title: "Deep Work: Focus that Delivers", excerpt: "Focused blocks for meaningful progress.", category: "productivity" },
  { id: "mindful-minutes", title: "Mindful Minutes: Daily Calm", excerpt: "Quick mindfulness breaks.", category: "mindfulness" },
];

const mockHabits: SavedHabit[] = [
  { id: "h_read", name: "Read 10 pages", description: "Non-fiction growth", category: "productivity" },
];

const mockGoals: SavedGoal[] = [
  { id: "g_side", title: "Ship a side project", description: "MVP in 4 weeks", category: "productivity" },
];

export default function SavedPage() {
  const [tab, setTab] = useState("articles");

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

            <TabsContent value="articles">
              <div className="grid gap-4 md:grid-cols-2">
                {mockArticles.map((a) => (
                  <Card key={a.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{a.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{a.excerpt}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{a.category}</span>
                        <Button asChild size="sm"><Link href={`/article/${a.id}`}>Read</Link></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="habits">
              <div className="grid gap-4 md:grid-cols-2">
                {mockHabits.map((h) => (
                  <Card key={h.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{h.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{h.description}</p>
                      <div className="mt-3 text-xs text-muted-foreground">{h.category}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="goals">
              <div className="grid gap-4 md:grid-cols-2">
                {mockGoals.map((g) => (
                  <Card key={g.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{g.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                      <div className="mt-3 text-xs text-muted-foreground">{g.category}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
