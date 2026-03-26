import type { ThemeDefinition } from '@/system/types';
import './styles/index.scss';

export const winXpThemeDefinition = {
  id: 'winxp',
  label: 'Windows XP',
  systemType: 'windows',
  className: 'cm-theme--winxp',
} as const satisfies ThemeDefinition;
