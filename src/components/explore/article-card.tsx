import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { getCategoryBadgeClass } from '@/lib/category-styles';
import type { Article } from '@/api';

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="hover-lift transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{article.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2">
          <Badge className={getCategoryBadgeClass(article.category)}>{article.category}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {article.readTime} min
          </span>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/article/${article.id}`}>Read</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
