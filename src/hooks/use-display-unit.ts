import { useCallback, useEffect, useState } from 'react';
import { formatWeight as rawFormat, type DisplayUnit } from '@/lib/bag-planner/format';

const STORAGE_KEY = 'bagplanner:display-unit';
const EVENT = 'bagplanner:display-unit-change';

export const DISPLAY_UNITS: { value: DisplayUnit; label: string }[] = [
  { value: 'auto', label: 'Auto (g / kg)' },
  { value: 'g', label: 'Grams (g)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'lb', label: 'Pounds (lb)' },
  { value: 'oz', label: 'Ounces (oz)' },
];

function load(): DisplayUnit {
  if (typeof window === 'undefined') return 'auto';
  const v = window.localStorage.getItem(STORAGE_KEY) as DisplayUnit | null;
  if (v && DISPLAY_UNITS.some((u) => u.value === v)) return v;
  return 'auto';
}

export function useDisplayUnit() {
  const [unit, setUnitState] = useState<DisplayUnit>('auto');

  useEffect(() => {
    setUnitState(load());
    const onChange = () => setUnitState(load());
    window.addEventListener(EVENT, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setUnit = useCallback((u: DisplayUnit) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, u);
    window.dispatchEvent(new CustomEvent(EVENT));
  }, []);

  const format = useCallback((grams: number) => rawFormat(grams, unit), [unit]);

  return { unit, setUnit, format };
}
