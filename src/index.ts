import { SYSTEM_TYPE, THEME, resolveThemeDefinition } from './system/registry';

export * from './components';
export { CButton, CRadio, CRadioGroup, CSelect } from './components';
export * from './system/registry';
export * from './system/SystemHost';
export * from './system/types';

export const defaultThemeDefinition = resolveThemeDefinition({
  systemType: SYSTEM_TYPE.default,
  theme: THEME.default,
});

export const win98ThemeDefinition = resolveThemeDefinition({
  systemType: SYSTEM_TYPE.windows,
  theme: THEME.win98,
});

export const winXpThemeDefinition = resolveThemeDefinition({
  systemType: SYSTEM_TYPE.windows,
  theme: THEME.winxp,
});
