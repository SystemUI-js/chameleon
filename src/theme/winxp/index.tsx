import type { ThemeDefinition } from '@/theme/types';
import './styles/index.scss';

export const winXpThemeDefinition = {
  id: 'winxp',
  label: 'Windows XP',
  className: 'cm-theme--winxp',
} as const satisfies ThemeDefinition;
