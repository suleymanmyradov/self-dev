import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCategoryBadgeClass } from '@/lib/category-styles';
import type { HabitTemplate, GoalTemplate } from '@/types/explore';

interface HabitTemplateCardProps {
  template: HabitTemplate;
  onAdd: (data: { name: string; description: string; category: string }) => void;
}

interface GoalTemplateCardProps {
  template: GoalTemplate;
  onAdd: (data: { title: string; description: string; category: string }) => void;
}

export function HabitTemplateCard({ template, onAdd }: HabitTemplateCardProps) {
  return (
    <Card className="hover-lift transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{template.name}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
        <Badge className={cn('mt-3', getCategoryBadgeClass(template.category))}>
          {template.category}
        </Badge>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          size="sm"
          variant="growth"
          onClick={() =>
            onAdd({
              name: template.name,
              description: template.description,
              category: template.category,
            })
          }
        >
          Add to Habits
        </Button>
      </CardFooter>
    </Card>
  );
}

export function GoalTemplateCard({ template, onAdd }: GoalTemplateCardProps) {
  return (
    <Card className="hover-lift transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{template.title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
        <Badge className={cn('mt-3', getCategoryBadgeClass(template.category))}>
          {template.category}
        </Badge>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          size="sm"
          variant="energy"
          onClick={() =>
            onAdd({
              title: template.title,
              description: template.description,
              category: template.category,
            })
          }
        >
          Add to Goals
        </Button>
      </CardFooter>
    </Card>
  );
}
