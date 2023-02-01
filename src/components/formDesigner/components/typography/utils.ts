export const FONT_SIZES = {
  'text-xs': { fontSize: '0.75rem', lineHeight: '1rem' },
  'text-sm': { fontSize: '0.875rem', lineHeight: '1.25rem' },
  'text-base': { fontSize: '1rem', lineHeight: '1.5rem' },
  'text-lg': { fontSize: '1.125rem', lineHeight: '1.75rem' },
  'text-xl': { fontSize: '1.25rem', lineHeight: '1.75rem' },
  'text-2xl': { fontSize: '1.5rem;', lineHeight: '2rem' },
  'text-3xl': { fontSize: '1.875rem', lineHeight: '2.25rem' },
  'text-4xl': { fontSize: '2.25rem', lineHeight: '2.5rem' },
  'text-5xl': { fontSize: '3rem', lineHeight: 1 },
  'text-6xl': { fontSize: '3.75rem;', lineHeight: 1 },
  'text-7xl': { fontSize: '4.5rem', lineHeight: 1 },
  'text-8xl': { fontSize: '6rem', lineHeight: 1 },
  'text-9xl': { fontSize: '8rem', lineHeight: 1 },
};

export type TypographyFontSize = keyof typeof FONT_SIZES;

export const getFontSizeStyle = (key: TypographyFontSize) => FONT_SIZES[key];
