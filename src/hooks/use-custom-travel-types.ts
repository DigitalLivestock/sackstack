import { useCallback, useEffect, useState } from 'react';
import type { CustomTravelType } from '@/lib/bag-planner/types';

const STORAGE_KEY = 'bagplanner:custom-travel-types';

export function loadCustomTravelTypes(): CustomTravelType[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CustomTravelType[]) : [];
  } catch {
    return [];
  }
}

function saveAll(types: CustomTravelType[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useCustomTravelTypes() {
  const [types, setTypes] = useState<CustomTravelType[]>(() => loadCustomTravelTypes());

  useEffect(() => {
    const l = () => setTypes(loadCustomTravelTypes());
    listeners.add(l);
    l();
    return () => {
      listeners.delete(l);
    };
  }, []);

  const add = useCallback((ct: Omit<CustomTravelType, 'id'>) => {
    const next = [...loadCustomTravelTypes(), { ...ct, id: crypto.randomUUID() }];
    saveAll(next);
    emit();
  }, []);

  const remove = useCallback((id: string) => {
    saveAll(loadCustomTravelTypes().filter((c) => c.id !== id));
    emit();
  }, []);

  return { types, add, remove };
}
