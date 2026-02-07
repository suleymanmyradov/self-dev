"use client";

import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Heart, Share2, Bookmark } from "lucide-react";

export type ArticleCardProps = {
  id?: string;
  href?: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  postedAt: string; // e.g., "11h" or formatted date
  likes?: number;
  shares?: number;
  saves?: number;
  className?: string;
};

export function ArticleCard({ id, href, title, excerpt, image, category, postedAt, likes = 0, shares = 0, saves = 0, className }: ArticleCardProps) {
  const link = href ?? (id ? `/article/${id}` : "#");
  return (
    <article>
      <Card className={cn("group overflow-hidden border border-border/70 bg-card/80 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur transition-transform duration-300 hover:-translate-y-1", className)}>
        {/* Banner image */}
        {image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              priority={false}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          </div>
        )}

        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {category ? (
              <Badge
                variant="secondary"
                className="rounded-full border border-border/60 bg-background/80 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/80"
              >
                {category}
              </Badge>
            ) : null}
            <span>•</span>
            <span>{postedAt}</span>
          </div>

          <h3 className="font-display mt-3 text-2xl font-semibold leading-snug text-foreground">
            <Link href={link} className="transition-colors hover:text-primary">
              {title}
            </Link>
          </h3>

          {excerpt ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {excerpt}
            </p>
          ) : null}

          <Separator className="my-4" />

          {/* Actions row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-colors hover:border-border/60 hover:text-foreground" aria-label="Like">
              <Heart className="h-4 w-4" />
              <span className="tabular-nums">{likes}</span>
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-colors hover:border-border/60 hover:text-foreground" aria-label="Share">
              <Share2 className="h-4 w-4" />
              <span className="tabular-nums">{shares}</span>
            </button>
            <button className="ml-auto inline-flex items-center gap-1 rounded-full border border-transparent px-2 py-1 transition-colors hover:border-border/60 hover:text-foreground" aria-label="Save">
              <Bookmark className="h-4 w-4" />
              {saves ? <span className="tabular-nums">{saves}</span> : null}
            </button>
          </div>
        </div>
      </Card>
    </article>
  );
}
