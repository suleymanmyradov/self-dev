import { useState, useCallback } from 'react';

export function useConfirmDelete<T = string>() {
  const [open, setOpen] = useState(false);
  const [targetId, setTargetId] = useState<T | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<T>>(new Set());

  const confirmDelete = useCallback((id: T) => {
    setTargetId(id);
    setOpen(true);
  }, []);

  const startDeleting = useCallback(() => {
    if (targetId) {
      setDeletingIds(prev => new Set(prev).add(targetId));
      setOpen(false);
    }
    return targetId;
  }, [targetId]);

  const stopDeleting = useCallback((id: T) => {
    setDeletingIds(prev => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });
  }, []);

  const isDeleting = useCallback((id: T) => deletingIds.has(id), [deletingIds]);

  return {
    open,
    setOpen,
    targetId,
    deletingIds,
    confirmDelete,
    startDeleting,
    stopDeleting,
    isDeleting,
  };
}
