import { useState, useCallback } from 'react';

export function useConfirmDelete<T = string>() {
  const [targetId, setTargetId] = useState<T | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<T>>(new Set());

  const open = targetId !== null;

  const setOpen = useCallback((value: boolean) => {
    if (!value) setTargetId(null);
  }, []);

  const confirmDelete = useCallback((id: T) => {
    setTargetId(id);
  }, []);

  const startDeleting = useCallback(() => {
    if (targetId) {
      setDeletingIds(prev => new Set(prev).add(targetId));
      setTargetId(null);
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
