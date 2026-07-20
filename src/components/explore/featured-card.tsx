import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Clock } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/category-styles';
import type { Article } from '@/api';

interface FeaturedCardProps {
  article: Article;
}

export function FeaturedCard({ article }: FeaturedCardProps) {
  return (
    <Card className="overflow-hidden border-growth/20 bg-growth-soft/20">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-growth" />
            <span className="text-xs font-medium text-growth uppercase tracking-wide">Featured</span>
          </div>
          <h3 className="text-lg font-semibold">{article.title}</h3>
          {article.excerpt && (
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
          )}
          <div className="mt-3 flex items-center gap-3">
            {article.category && (
              <Badge className={getCategoryBadgeClass(article.category.slug)}>
                {article.category.name}
              </Badge>
            )}
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> {article.readTime} min read
            </span>
          </div>
          <Button asChild size="sm" variant="growth" className="mt-4">
            <Link href={`/article/${article.id}`}>
              Read Article <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="hidden md:block w-48 bg-gradient-to-br from-growth/20 to-growth-soft/30" />
      </div>
    </Card>
  );
}
