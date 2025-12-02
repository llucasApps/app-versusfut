'use client';

import { useState, useEffect } from 'react';

export type ViewMode = 'owner' | 'player';

export function useViewMode() {
  const [viewMode, setViewMode] = useState<ViewMode>('owner');

  useEffect(() => {
    // Carregar modo do localStorage
    const savedMode = localStorage.getItem('viewMode') as ViewMode | null;
    if (savedMode) {
      setViewMode(savedMode);
    }

    // Escutar mudanças no modo de visualização
    const handleViewModeChange = (event: CustomEvent<ViewMode>) => {
      setViewMode(event.detail);
    };

    window.addEventListener('viewModeChange', handleViewModeChange as EventListener);

    return () => {
      window.removeEventListener('viewModeChange', handleViewModeChange as EventListener);
    };
  }, []);

  const isOwnerMode = viewMode === 'owner';
  const isPlayerMode = viewMode === 'player';

  return { viewMode, isOwnerMode, isPlayerMode };
}
