import type { ThemeDefinition } from '@/theme/types';
import './styles/index.scss';

export const win7ThemeDefinition = {
  id: 'win7',
  label: 'Windows 7',
  className: 'cm-theme--win7',
} as const satisfies ThemeDefinition;
