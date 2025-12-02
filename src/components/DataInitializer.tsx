'use client';

import { useEffect } from 'react';
import { initializeFakeData } from '@/lib/mock-data';

export default function DataInitializer() {
  useEffect(() => {
    initializeFakeData();
  }, []);

  return null;
}
