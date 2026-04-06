import { SYSTEM_TYPE, THEME, resolveThemeDefinition } from './system/registry';

export * from './components';
export {
  CButton,
  CButtonGroup,
  CButtonSeparator,
  CIcon,
  CIconContainer,
  CMenu,
  CRadio,
  CRadioGroup,
  CSelect,
  Theme,
} from './components';
export * from './system/registry';
export * from './system/SystemHost';
export type {
  SystemThemeSelection,
  SystemTypeDefinition,
  SystemTypeId,
  ThemeDefinition,
  ThemeId,
} from './system/types';
export type { ThemeDefinition as PureThemeDefinition, ThemeId as PureThemeId } from './theme/types';
export { defaultThemeDefinition as pureDefaultThemeDefinition } from './theme/default';
export { win98ThemeDefinition as pureWin98ThemeDefinition } from './theme/win98';
export { winXpThemeDefinition as pureWinXpThemeDefinition } from './theme/winxp';

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
