"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGoals } from "@/store/goals";
import { createHabit as apiCreateHabit } from "@/api/growthapi";
import type { ContentPost } from "@/lib/types-data";

const mockArticles: ContentPost[] = [
  {
    id: "deep-work",
    title: "Deep Work: Focus that Delivers",
    excerpt: "How to carve out focused time blocks to achieve meaningful progress.",
    category: "productivity",
    readTime: 6,
    image: "/placeholder/deep-work.jpg",
  },
  {
    id: "atomic-habits",
    title: "Atomic Habits in Practice",
    excerpt: "Small habits compound. Here’s a starter kit to get going.",
    category: "health",
    readTime: 7,
    image: "/placeholder/atomic-habits.jpg",
  },
  {
    id: "mindful-minutes",
    title: "Mindful Minutes: Daily Calm",
    excerpt: "Quick mindfulness breaks that reduce stress and improve clarity.",
    category: "mindfulness",
    readTime: 5,
    image: "/placeholder/mindful.jpg",
  },
];

const habitTemplates = [
  { name: "Morning Walk", description: "15-minute walk to start the day fresh", category: "health" },
  { name: "Read 10 pages", description: "Non-fiction personal growth", category: "productivity" },
  { name: "Meditate", description: "5–10 minutes of mindfulness", category: "mindfulness" },
];

const goalTemplates = [
  { title: "Ship a side project", description: "MVP within 4 weeks", category: "productivity", progress: 0 },
  { title: "Run 5K", description: "Train 3x weekly for 6 weeks", category: "health", progress: 0 },
  { title: "30-day meditation", description: "Daily 10 minutes", category: "mindfulness", progress: 0 },
];

export default function ExplorePage() {
  const { add: addGoal } = useGoals();
  const createHabitMutation = useMutation({ mutationFn: apiCreateHabit });

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockArticles;
    return mockArticles.filter((a) =>
      [a.title, a.excerpt, a.category].some((f) => f.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 md:py-8">
          <header className="mb-5">
            <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
            <p className="text-sm text-muted-foreground">Discover articles, quick-start habits and goals, and join the community.</p>
          </header>

          {/* Quick search that filters Articles tab */}
          <div className="mb-5 flex items-center gap-3">
            <Input
              placeholder="Search articles, habits, goals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 300); }}>
              Refresh
            </Button>
          </div>

          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="habits">Habits</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            {/* Articles */}
            <TabsContent value="articles" className="space-y-4">
              {/* Featured */}
              <Card>
                <CardHeader>
                  <CardTitle>Featured</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-semibold">Deep Work: Focus that Delivers</h3>
                      <p className="text-sm text-muted-foreground">How to carve out focused time blocks to achieve meaningful progress.</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary">productivity</Badge>
                        <span className="text-xs text-muted-foreground">6 min read</span>
                      </div>
                      <div className="mt-3">
                        <Button asChild size="sm">
                          <Link href="/article/deep-work">Read</Link>
                        </Button>
                      </div>
                    </div>
                    <div className="hidden md:block rounded-md bg-secondary h-32" />
                  </div>
                </CardContent>
              </Card>

              {/* List */}
              <div className="grid gap-4 md:grid-cols-2">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-24" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  filteredArticles.map((a) => (
                    <Card key={a.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{a.title}</CardTitle>
                          <Badge variant="secondary">{a.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{a.excerpt}</p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{a.readTime} min read</span>
                        <Button asChild size="sm">
                          <Link href={`/article/${a.id}`}>Read</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Habits */}
            <TabsContent value="habits">
              <div className="grid gap-4 md:grid-cols-2">
                {habitTemplates.map((h) => (
                  <Card key={h.name}>
                    <CardHeader>
                      <CardTitle className="text-base">{h.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{h.description}</p>
                      <div className="mt-2"><Badge variant="secondary">{h.category}</Badge></div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end">
                      <Button
                        size="sm"
                        onClick={() =>
                          createHabitMutation.mutate({
                            name: h.name,
                            description: h.description,
                            category: h.category,
                          })
                        }
                      >
                        Add to Habits
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Goals */}
            <TabsContent value="goals">
              <div className="grid gap-4 md:grid-cols-2">
                {goalTemplates.map((g) => (
                  <Card key={g.title}>
                    <CardHeader>
                      <CardTitle className="text-base">{g.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{g.description}</p>
                      <div className="mt-2"><Badge variant="secondary">{g.category}</Badge></div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end">
                      <Button size="sm" onClick={() => addGoal({ title: g.title, description: g.description, category: g.category, progress: g.progress })}>
                        Add to Goals
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Community */}
            <TabsContent value="community">
              <Card>
                <CardHeader>
                  <CardTitle>Connect with us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button asChild size="lg" className="justify-start">
                      <Link href="https://discord.com/invite/your-server" target="_blank" rel="noopener noreferrer">
                        Join us on Discord
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="justify-start">
                      <Link href="https://x.com/your-handle" target="_blank" rel="noopener noreferrer">
                        Follow us on X
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary" className="justify-start sm:col-span-2">
                      <Link href="https://t.me/your-channel" target="_blank" rel="noopener noreferrer">
                        Join our Telegram
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
