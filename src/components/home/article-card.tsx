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
      <Card className={cn("overflow-hidden border bg-background", className)}>
        {/* Banner image */}
        {image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              priority={false}
            />
          </div>
        )}

        <div className="p-4 md:p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {category ? <Badge variant="secondary" className="rounded-full px-2 py-0.5">{category}</Badge> : null}
            <span>•</span>
            <span>{postedAt}</span>
          </div>

          <h3 className="mt-2 text-xl font-semibold leading-snug text-foreground">
            <Link href={link} className="hover:underline">
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
            <button className="inline-flex items-center gap-1 hover:text-foreground" aria-label="Like">
              <Heart className="h-4 w-4" />
              <span className="tabular-nums">{likes}</span>
            </button>
            <button className="inline-flex items-center gap-1 hover:text-foreground" aria-label="Share">
              <Share2 className="h-4 w-4" />
              <span className="tabular-nums">{shares}</span>
            </button>
            <button className="inline-flex items-center gap-1 hover:text-foreground ml-auto" aria-label="Save">
              <Bookmark className="h-4 w-4" />
              {saves ? <span className="tabular-nums">{saves}</span> : null}
            </button>
            <span className="text-xs">{postedAt}</span>
          </div>
        </div>
      </Card>
    </article>
  );
}
