"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useSearch } from "@/hooks"
import type { SearchResultType } from "@/api"
import Link from "next/link"
import { FileText, Target, Repeat, MessageSquare, Search as SearchIcon } from "lucide-react"

function useDebounceValue<T>(value: T, delay: number): [T] {
  const [debouncedValue, setDebouncedValue] = React.useState(value)
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return [debouncedValue]
}

const typeIcons: Record<SearchResultType, typeof FileText> = {
  article: FileText,
  goal: Target,
  habit: Repeat,
  conversation: MessageSquare,
}

const typeRoutes: Record<SearchResultType, string> = {
  article: "/article/",
  goal: "/goals",
  habit: "/habits",
  conversation: "/ai-coach",
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("")
  const [debouncedQuery] = useDebounceValue(query, 300)
  const [filterType, setFilterType] = React.useState<SearchResultType | undefined>(undefined)

  const { data: results = [], isLoading } = useSearch({
    q: debouncedQuery,
    type: filterType,
    page: 1,
    limit: 20,
  })

  const handleFilterChange = (type?: SearchResultType) => {
    setFilterType(type)
  }

  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">Search</h1>

        <div className="mb-4">
          <Input
            placeholder="Search articles, goals, habits, conversations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => handleFilterChange(undefined)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              !filterType
                ? "bg-primary text-primary-foreground border-primary"
                : "border-muted-foreground/20 hover:bg-accent"
            }`}
          >
            All
          </button>
          {(["article", "goal", "habit", "conversation"] as SearchResultType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-3 py-1 text-xs rounded-full border capitalize transition-colors ${
                filterType === type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-muted-foreground/20 hover:bg-accent"
              }`}
            >
              {type}s
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-md p-3 border">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : debouncedQuery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <SearchIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Start typing to search...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No results found for "{debouncedQuery}".
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => {
              const Icon = typeIcons[result.type]
              const route = typeRoutes[result.type]
              const linkHref = result.type === "article" ? `${route}${result.id}` : route

              return (
                <Link
                  key={result.id}
                  href={linkHref}
                  className="flex items-start justify-between rounded-md p-3 hover:bg-accent border border-transparent hover:border-border transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="font-medium truncate">{result.title}</div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{result.description}</div>
                    {result.highlight && (
                      <div
                        className="text-xs text-muted-foreground mt-1 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: result.highlight }}
                      />
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 capitalize flex-shrink-0">
                    {result.type}
                  </Badge>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
