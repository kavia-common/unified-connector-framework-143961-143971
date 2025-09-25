'use client';

/**
 * Centralized Ocean Professional theme tokens used by UI primitives and pages.
 * Keep values in sync with assets/style_guide.md.
 */
export const theme = {
  meta: {
    name: 'Ocean Professional',
    description: 'Blue primary with amber accents; modern cards with subtle gradients and shadows.',
  },
  colors: {
    primary: '#2563EB', // blue-600
    primarySoft: 'rgb(37 99 235 / 0.12)',
    primaryHover: '#1D4ED8', // blue-700
    secondary: '#F59E0B', // amber-500
    secondaryHover: '#D97706', // amber-600
    success: '#10B981', // emerald-500
    error: '#EF4444', // red-500
    warning: '#F59E0B',
    info: '#0EA5E9', // sky-500
    gradientFrom: 'rgba(59,130,246,0.06)',
    gradientTo: '#F9FAFB',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F6',
    border: '#E5E7EB',
    text: '#111827',
    textMuted: '#6B7280',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    pill: '9999px',
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    md: '0 4px 10px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.06)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
    glowPrimary: '0 0 0 6px rgba(37, 99, 235, 0.1)',
  },
  spacing: {
    sectionY: '2.5rem',
    cardGap: '1rem',
  },
  transition: {
    base: 'all 200ms ease',
    slow: 'all 350ms ease',
  },
};

/** Small helper for classnames merging without extra deps. */
export function cx(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}
