import type { ThemeDefinition } from '@/system/types';
import './styles/index.scss';

export const win98ThemeDefinition = {
  id: 'win98',
  label: 'Windows 98',
  systemType: 'windows',
  className: 'cm-theme--win98',
} as const satisfies ThemeDefinition;
