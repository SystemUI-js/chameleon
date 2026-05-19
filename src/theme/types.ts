export type ThemeId = 'win98' | 'winxp' | 'win7' | 'default';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  className: string;
}
