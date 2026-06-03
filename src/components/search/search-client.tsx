"use client"

import { useMemo, useState, useEffect } from "react"
import DOMPurify from "isomorphic-dompurify"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useSearch } from "@/hooks"
import type { SearchResultType } from "@/api"
import Link from "next/link"
import { FileText, Target, Repeat, MessageSquare, Search as SearchIcon } from "lucide-react"
import { useSearchParamState } from "@/lib/url-state"
import { useDebounceValue } from "@/hooks/use-debounce"

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

export function SearchClient() {
  const [urlQuery, setUrlQuery] = useSearchParamState("q")
  const [urlType, setUrlType] = useSearchParamState("type")

  // Local input state for responsiveness; sync to URL after debounce
  const [inputValue, setInputValue] = useState(urlQuery)
  const debouncedInput = useDebounceValue(inputValue, 300)

  // Push debounced input to URL
  useEffect(() => {
    if (debouncedInput !== urlQuery) {
      setUrlQuery(debouncedInput)
    }
  }, [debouncedInput, urlQuery, setUrlQuery])

  // Sync input from URL on external changes (back/forward, bookmark)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputValue((prev) => {
      if (urlQuery !== prev) return urlQuery
      return prev
    })
  }, [urlQuery])

  const filterType = (urlType as SearchResultType) || undefined

  const searchParams = useMemo(() => ({
    q: urlQuery,
    type: filterType,
    page: 1,
    limit: 20,
  }), [urlQuery, filterType])

  const { data: results = [], isLoading } = useSearch(searchParams)

  const handleFilterChange = (type?: SearchResultType) => {
    setUrlType(type ?? "")
  }

  return (
    <div className="h-full w-full bg-background text-foreground">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-xl font-semibold mb-4">Search</h1>

        <div className="mb-4">
          <Input
            placeholder="Search articles, goals, habits, conversations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            type="button"
            onClick={() => handleFilterChange(undefined)}
            aria-pressed={!filterType}
            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
              !filterType
                ? "bg-primary text-primary-foreground border-primary"
                : "border-muted-foreground/20 hover:bg-accent"
            }`}
          >
            All
          </button>
          {(["article", "goal", "habit", "conversation"] as SearchResultType[]).map((type) => (
            <button
              type="button"
              key={type}
              onClick={() => handleFilterChange(type)}
              aria-pressed={filterType === type}
              className={`px-3 py-1 text-xs rounded-lg border capitalize transition-colors ${
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
        ) : urlQuery.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <SearchIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Start typing to search...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            No results found for &quot;{urlQuery}&quot;.
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
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(result.highlight, {
                            ALLOWED_TAGS: ["b", "em", "strong", "mark", "span"],
                            ALLOWED_ATTR: ["class"],
                          }),
                        }}
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
