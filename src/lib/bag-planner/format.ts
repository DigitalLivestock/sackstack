export type DisplayUnit = 'auto' | 'g' | 'kg' | 'lb' | 'oz';

const GRAMS_PER_LB = 453.59237;
const GRAMS_PER_OZ = 28.349523125;

export function formatWeight(grams: number, unit: DisplayUnit = 'auto'): string {
  const g = grams || 0;
  switch (unit) {
    case 'g':
      return `${Math.round(g)} g`;
    case 'kg': {
      const kg = g / 1000;
      return `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`;
    }
    case 'lb': {
      const lb = g / GRAMS_PER_LB;
      return `${lb.toFixed(lb >= 10 ? 1 : 2)} lb`;
    }
    case 'oz': {
      const oz = g / GRAMS_PER_OZ;
      if (oz >= 16) {
        const lb = g / GRAMS_PER_LB;
        return `${lb.toFixed(lb >= 10 ? 1 : 2)} lb`;
      }
      return `${oz.toFixed(oz >= 10 ? 1 : 2)} oz`;
    }
    case 'auto':
    default:
      if (g >= 1000) {
        const kg = g / 1000;
        return `${kg.toFixed(kg >= 10 ? 1 : 2)} kg`;
      }
      return `${Math.round(g)} g`;
  }
}

export function parseWeightInput(value: string, unit: 'g' | 'kg' | 'lb' | 'oz'): number {
  const n = parseFloat(value.replace(',', '.'));
  if (!isFinite(n) || n < 0) return 0;
  switch (unit) {
    case 'kg':
      return Math.round(n * 1000);
    case 'lb':
      return Math.round(n * GRAMS_PER_LB);
    case 'oz':
      return Math.round(n * GRAMS_PER_OZ);
    case 'g':
    default:
      return Math.round(n);
  }
}
