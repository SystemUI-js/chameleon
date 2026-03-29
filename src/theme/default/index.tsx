import type { ThemeDefinition } from '@/theme/types';
import './styles/index.scss';

export const defaultThemeDefinition = {
  id: 'default',
  label: 'Default',
  className: 'cm-theme--default',
} as const satisfies ThemeDefinition;
