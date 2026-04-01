import { defaultThemeDefinition, win98ThemeDefinition, winXpThemeDefinition } from '../src';

describe('theme exports', () => {
  it('exports pure theme definitions from the package entry', () => {
    expect(defaultThemeDefinition).toEqual({
      id: 'default',
      label: 'Default',
      className: 'cm-theme--default',
    });

    expect(win98ThemeDefinition).toEqual({
      id: 'win98',
      label: 'Windows 98',
      className: 'cm-theme--win98',
    });

    expect(winXpThemeDefinition).toEqual({
      id: 'winxp',
      label: 'Windows XP',
      className: 'cm-theme--winxp',
    });
  });
});
