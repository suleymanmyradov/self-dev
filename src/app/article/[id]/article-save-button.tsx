import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleSaveButtonProps {
  isSaved: boolean;
  onToggleSave: () => void;
}

export default function ArticleSaveButton({ isSaved, onToggleSave }: ArticleSaveButtonProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onToggleSave}
      aria-label={isSaved ? "Remove from saved" : "Save article"}
      className="shrink-0"
    >
      {isSaved ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}