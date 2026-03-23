import type { ThemeDefinition } from '@/system/types';
import './styles/index.scss';

export const defaultThemeDefinition = {
  id: 'default',
  label: 'Default',
  systemType: 'default',
  className: 'cm-theme--default',
} as const satisfies ThemeDefinition;
