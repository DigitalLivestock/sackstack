export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`;
  }
  return `${Math.round(grams)} g`;
}

export function parseWeightInput(value: string, unit: 'g' | 'kg'): number {
  const n = parseFloat(value.replace(',', '.'));
  if (!isFinite(n) || n < 0) return 0;
  return unit === 'kg' ? Math.round(n * 1000) : Math.round(n);
}
