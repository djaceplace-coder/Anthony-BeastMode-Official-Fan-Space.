/**
 * Design Tokens & Theme Configuration
 * Bandcamp-inspired clean, calm, restrained aesthetic with WCAG AA compliance.
 */

export const THEME = {
  colors: {
    dark: {
      bgPrimary: '#0B0C10',
      bgSecondary: '#14161D',
      bgElevated: '#1F222E',
      borderSubtle: '#2A2E3D',
      borderFocus: '#E5A93C',
      textPrimary: '#F5F5F7',
      textSecondary: '#A0A5B5',
      textMuted: '#6B7280',
      accentPrimary: '#E5A93C', // Warm brass / outlaw amber
      accentHover: '#F3BE58',
      accentMuted: 'rgba(229, 169, 60, 0.15)',
      statusOnSale: '#10B981',
      statusLowTickets: '#F59E0B',
      statusSoldOut: '#EF4444',
      statusCancelled: '#9CA3AF',
    },
    light: {
      bgPrimary: '#F9FAFB',
      bgSecondary: '#FFFFFF',
      bgElevated: '#F3F4F6',
      borderSubtle: '#E5E7EB',
      borderFocus: '#C48218',
      textPrimary: '#111827',
      textSecondary: '#4B5563',
      textMuted: '#9CA3AF',
      accentPrimary: '#B87714',
      accentHover: '#985F08',
      accentMuted: 'rgba(184, 119, 20, 0.12)',
      statusOnSale: '#059669',
      statusLowTickets: '#D97706',
      statusSoldOut: '#DC2626',
      statusCancelled: '#6B7280',
    },
  },
  typography: {
    fontDisplay: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontBody: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    full: '9999px',
  },
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
