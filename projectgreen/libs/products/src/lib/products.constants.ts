export const UNIT_TYPES: { [index: string]: { label: string; value: string; } } = {
  0: {
    label: 'Gram',
    value: 'Gram'
  },
  1: {
    label: 'Item',
    value: 'Item'
  },
  2: {
    label: 'Package',
    value: 'Package'
  }
};

export const FLOWER_AMOUNTS: string[] = [
  'eighth',
  'quarter',
  'half',
  'ounce',
  'quarterPound',
  'halfPound',
  'pound',
]

export const GRAMS: { [key: string]: number } = {
  pound: 453.59,
  ounce: 28.35
}
