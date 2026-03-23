import {
  DEFAULT_SYSTEM_TYPE,
  DEFAULT_THEME_BY_SYSTEM,
  resolveSystemTypeDefinition,
  resolveThemeDefinition,
  SYSTEM_THEME_MATRIX,
  SYSTEM_TYPE,
  THEME,
} from '../src/system/registry';

describe('system type and theme registry', () => {
  it('resolves only legal system theme pairs', () => {
    expect(SYSTEM_THEME_MATRIX).toEqual({
      windows: ['win98', 'winxp'],
      default: ['default'],
    });
  });

  it('uses default as the shared default system type constant', () => {
    expect(DEFAULT_SYSTEM_TYPE).toBe(SYSTEM_TYPE.default);
  });

  it('defines deterministic default themes by system type', () => {
    expect(DEFAULT_THEME_BY_SYSTEM).toEqual({
      windows: THEME.win98,
      default: THEME.default,
    });
  });

  it('resolves windows system type metadata', () => {
    expect(resolveSystemTypeDefinition(SYSTEM_TYPE.windows)).toEqual({
      id: SYSTEM_TYPE.windows,
      label: 'Windows',
      className: 'cm-system--windows',
    });
  });

  it('resolves a legal windows theme definition', () => {
    expect(
      resolveThemeDefinition({
        systemType: SYSTEM_TYPE.windows,
        theme: THEME.winxp,
      }),
    ).toEqual({
      id: THEME.winxp,
      label: 'Windows XP',
      systemType: SYSTEM_TYPE.windows,
      className: 'cm-theme--winxp',
    });
  });

  it('resolves the default theme for the default system type', () => {
    expect(
      resolveThemeDefinition({
        systemType: SYSTEM_TYPE.default,
        theme: THEME.default,
      }),
    ).toEqual({
      id: THEME.default,
      label: 'Default',
      systemType: SYSTEM_TYPE.default,
      className: 'cm-theme--default',
    });
  });

  it('rejects invalid theme for system type', () => {
    expect(() =>
      resolveThemeDefinition({
        systemType: SYSTEM_TYPE.default,
        theme: THEME.winxp,
      }),
    ).toThrow('Invalid theme "winxp" for system type "default"');
  });
});
