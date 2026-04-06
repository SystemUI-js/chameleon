export type SystemTypeId = 'windows' | 'default';

export type ThemeId = 'win98' | 'winxp' | 'default';

export interface ThemeDefinition {
  id: ThemeId;
  label: string;
  systemType: SystemTypeId;
  className: string;
}

export interface SystemTypeDefinition {
  id: SystemTypeId;
  label: string;
  className: string;
}

export interface SystemThemeSelection {
  systemType: SystemTypeId;
  theme: ThemeId;
}
