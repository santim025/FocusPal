export type Appearance = 'light' | 'dark' | 'system';

export interface Neutral {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  track: string;
  danger: string;
}

export const neutrals: { light: Neutral; dark: Neutral } = {
  light: {
    background: '#F4F5FA',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEEF6',
    text: '#1A1B25',
    textMuted: '#6B7280',
    border: '#E2E5EE',
    track: '#E5E8F1',
    danger: '#E5484D',
  },
  dark: {
    background: '#0E0F14',
    surface: '#191B22',
    surfaceAlt: '#23262F',
    text: '#F2F3F7',
    textMuted: '#9AA0AD',
    border: '#2A2D38',
    track: '#262934',
    danger: '#FF6166',
  },
};

export interface Accent {
  key: string;
  name: string;
  work: string;
  shortBreak: string;
  longBreak: string;
}

export const accents: Accent[] = [
  { key: 'tomato', name: 'Tomate', work: '#E1493B', shortBreak: '#2BB673', longBreak: '#2C7BE0' },
  { key: 'indigo', name: 'Índigo', work: '#5B5BD6', shortBreak: '#0EA5A4', longBreak: '#7C3AED' },
  { key: 'forest', name: 'Bosque', work: '#2E8B57', shortBreak: '#3FA796', longBreak: '#8FA31E' },
  { key: 'sunset', name: 'Atardecer', work: '#F4724F', shortBreak: '#F2B705', longBreak: '#D6336C' },
  { key: 'ocean', name: 'Océano', work: '#2C7BE0', shortBreak: '#16B1C7', longBreak: '#5B5BD6' },
  { key: 'graphite', name: 'Grafito', work: '#4B5563', shortBreak: '#0EA5A4', longBreak: '#7C3AED' },
  { key: 'rose', name: 'Rosa', work: '#E11D74', shortBreak: '#2BB673', longBreak: '#6D28D9' },
  { key: 'teal', name: 'Turquesa', work: '#0D9488', shortBreak: '#22C55E', longBreak: '#6366F1' },
  { key: 'amber', name: 'Ámbar', work: '#D97706', shortBreak: '#16A34A', longBreak: '#2563EB' },
  { key: 'violet', name: 'Violeta', work: '#7C3AED', shortBreak: '#06B6D4', longBreak: '#DB2777' },
  { key: 'lime', name: 'Lima', work: '#65A30D', shortBreak: '#0EA5A4', longBreak: '#CA8A04' },
  { key: 'cyan', name: 'Cian', work: '#0891B2', shortBreak: '#10B981', longBreak: '#6366F1' },
  { key: 'coral', name: 'Coral', work: '#FF5A5F', shortBreak: '#21BF73', longBreak: '#2D9CDB' },
  { key: 'midnight', name: 'Medianoche', work: '#3949AB', shortBreak: '#0EA5A4', longBreak: '#8E24AA' },
  { key: 'cherry', name: 'Cereza', work: '#B91C1C', shortBreak: '#15803D', longBreak: '#1D4ED8' },
  { key: 'emerald', name: 'Esmeralda', work: '#059669', shortBreak: '#0EA5A4', longBreak: '#7C3AED' },
  { key: 'lavender', name: 'Lavanda', work: '#7C6CF0', shortBreak: '#34C3A0', longBreak: '#E36FB0' },
];

export interface CardShadow {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
}

/** Subtle, consistent card elevation shared across screens. */
export function cardShadow(dark: boolean): CardShadow {
  return {
    shadowColor: '#161828',
    shadowOpacity: dark ? 0.35 : 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  };
}

export const defaultAccentKey = 'tomato';

export const customAccentKey = 'custom';
export const defaultCustomColor = '#FF7A00';

function adjust(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) =>
    amount >= 0 ? c + (255 - c) * amount : c * (1 + amount);
  return rgbToHex(mix(r), mix(g), mix(b));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

/** Builds a full accent (with subtly distinct break phases) from a single user color. */
export function buildCustomAccent(hex: string): Accent {
  return {
    key: customAccentKey,
    name: 'Custom',
    work: hex,
    shortBreak: adjust(hex, 0.22),
    longBreak: adjust(hex, -0.22),
  };
}
