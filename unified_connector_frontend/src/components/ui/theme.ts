export const oceanTheme = {
  // Ocean Professional palette and tokens
  colors: {
    primary: '#2563EB', // blue-600
    primaryHover: '#1D4ED8', // blue-700
    secondary: '#F59E0B', // amber-500
    secondaryHover: '#D97706', // amber-600
    error: '#EF4444', // red-500
    errorBg: 'rgba(239, 68, 68, 0.08)',
    surface: '#ffffff',
    background: '#f9fafb',
    text: '#111827',
    subtleText: '#6B7280',
    border: '#E5E7EB',
    focus: '#93C5FD',
  },
  radius: {
    sm: '0.375rem', // rounded-md
    md: '0.5rem',   // rounded-lg
    lg: '0.75rem',  // rounded-xl
  },
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

// Small helper for classnames merging without extra deps
export function cx(...classes: Array<string | false | undefined | null>): string {
  return classes.filter(Boolean).join(' ');
}
