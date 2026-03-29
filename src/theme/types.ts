export type ThemeId = 'win98' | 'winxp' | 'default';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  className: string;
}
