import type { ThemeDefinition } from '@/theme/types';
import './styles/index.scss';

export const win98ThemeDefinition = {
  id: 'win98',
  label: 'Windows 98',
  className: 'cm-theme--win98',
} as const satisfies ThemeDefinition;
