/**
 * @deprecated Web-first 组件导出属于过渡公开面，优先使用显式平台入口。
 */
export * as legacyWeb from './legacy-web';
export type { ThemeDefinition as PureThemeDefinition, ThemeId as PureThemeId } from './theme/types';
export {
  defaultThemeDefinition,
  defaultThemeDefinition as pureDefaultThemeDefinition,
} from './theme/default';
export {
  win98ThemeDefinition,
  win98ThemeDefinition as pureWin98ThemeDefinition,
} from './theme/win98';
export {
  winXpThemeDefinition,
  winXpThemeDefinition as pureWinXpThemeDefinition,
} from './theme/winxp';
