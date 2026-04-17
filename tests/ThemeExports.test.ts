import { defaultThemeDefinition, win98ThemeDefinition, winXpThemeDefinition } from '../src';
import { defaultThemeDefinition as directDefaultThemeDefinition } from '../src/theme/default';
import { win98ThemeDefinition as directWin98ThemeDefinition } from '../src/theme/win98';
import { winXpThemeDefinition as directWinXpThemeDefinition } from '../src/theme/winxp';

describe('theme exports', () => {
  it('re-exports canonical theme definitions from the package entry', () => {
    expect(defaultThemeDefinition).toBe(directDefaultThemeDefinition);
    expect(win98ThemeDefinition).toBe(directWin98ThemeDefinition);
    expect(winXpThemeDefinition).toBe(directWinXpThemeDefinition);
  });

  it('does not expose legacy system metadata on package theme definitions', () => {
    expect(defaultThemeDefinition).not.toHaveProperty('systemType');
    expect(win98ThemeDefinition).not.toHaveProperty('systemType');
    expect(winXpThemeDefinition).not.toHaveProperty('systemType');
  });
});
