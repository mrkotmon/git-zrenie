import { createTheme } from '@mui/material/styles';

export const FONT_FAMILY = "'IBM Plex Sans Variable', 'IBM Plex Sans', system-ui, sans-serif";

/**
 * Токены дизайна: значения вытащены из макета landing.png (2x).
 * CSS получает их через переменные --gz-*, которые ставит CssBaseline.
 */
export const tokens = {
  bg: '#0f1115',
  surface: '#15181e',
  surfaceRaised: '#1a1e27',
  surfaceHero: '#101318',
  border: '#272c36',
  borderStrong: '#3a4150',
  text: '#ffffff',
  textSecondary: '#9ba2ac',
  textMuted: '#7b828c',
  accent: '#d0302a',
  accentHover: '#b82823',
  ctaBg: '#1a1214',
  footer: '#000000',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: tokens.accent, contrastText: tokens.text },
    background: { default: tokens.bg, paper: tokens.surface },
    text: { primary: tokens.text, secondary: tokens.textSecondary },
    divider: tokens.border,
  },
  typography: {
    fontFamily: FONT_FAMILY,
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: FONT_FAMILY,
          borderRadius: 8,
          letterSpacing: 0,
        },
        sizeLarge: { height: 52, padding: '0 24px', fontSize: 16 },
        sizeMedium: { height: 40, padding: '0 18px', fontSize: 15 },
        containedPrimary: {
          backgroundColor: tokens.accent,
          '&:hover': { backgroundColor: tokens.accentHover },
        },
        outlinedPrimary: {
          borderColor: 'rgba(208, 48, 42, 0.6)',
          color: tokens.text,
          '&:hover': {
            borderColor: tokens.accent,
            backgroundColor: 'rgba(208, 48, 42, 0.12)',
          },
        },
        outlinedInherit: {
          borderColor: tokens.border,
          color: tokens.text,
          '&:hover': { borderColor: tokens.borderStrong, backgroundColor: tokens.surfaceRaised },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: tokens.text,
          '&:hover': { backgroundColor: tokens.surfaceRaised },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { backgroundColor: tokens.surfaceHero, backgroundImage: 'none' },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--gz-bg': tokens.bg,
          '--gz-surface': tokens.surface,
          '--gz-surface-raised': tokens.surfaceRaised,
          '--gz-surface-hero': tokens.surfaceHero,
          '--gz-border': tokens.border,
          '--gz-border-strong': tokens.borderStrong,
          '--gz-text': tokens.text,
          '--gz-text-secondary': tokens.textSecondary,
          '--gz-text-muted': tokens.textMuted,
          '--gz-accent': tokens.accent,
          '--gz-cta-bg': tokens.ctaBg,
          '--gz-footer': tokens.footer,
          '--gz-container': '1328px',
          '--gz-radius-card': '16px',
          '--gz-radius-panel': '12px',
          '--gz-radius-control': '8px',
        },
        html: { scrollBehavior: 'smooth' },
        body: {
          margin: 0,
          backgroundColor: tokens.bg,
          color: tokens.text,
          fontFamily: FONT_FAMILY,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        'section[id]': { scrollMarginTop: '96px' },
        '::selection': { backgroundColor: 'rgba(208, 48, 42, 0.4)' },
      },
    },
  },
});
