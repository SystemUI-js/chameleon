import { expect, type Locator, test } from '@playwright/test';
import { gotoWindowSelection, switchWindowSelection } from './window.helpers';

type StartBarComputedStyle = {
  backgroundColor: string;
  backgroundImage: string;
  bottom: string;
  position: string;
};

const readStartBarComputedStyle = async (locator: Locator): Promise<StartBarComputedStyle> =>
  locator.evaluate((element) => {
    const style = window.getComputedStyle(element);

    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      bottom: style.bottom,
      position: style.position,
    };
  });

test.describe('start bar', () => {
  test('keeps windows start bar visible across themes and omits it on default system', async ({
    page,
  }) => {
    await gotoWindowSelection(page, { systemType: 'windows', theme: 'win98' });

    const screenRoot = page.getByTestId('screen-root');
    const startBar = page.getByTestId('windows-start-bar');
    const startButton = page.getByTestId('windows-start-bar-button');

    await expect(screenRoot).toBeVisible();
    await expect(startBar).toBeVisible();
    await expect(startButton).toBeVisible();
    await expect(startButton).toHaveText('Start');

    const win98Style = await readStartBarComputedStyle(startBar);

    expect(win98Style.position).toBe('absolute');
    expect(win98Style.bottom).toBe('0px');
    expect(win98Style.backgroundColor).toBe('rgb(192, 192, 192)');
    expect(win98Style.backgroundImage).toBe('none');

    await switchWindowSelection(page, { systemType: 'windows', theme: 'winxp' });

    await expect(screenRoot).toBeVisible();
    await expect(startBar).toBeVisible();
    await expect(startButton).toBeVisible();

    const winxpStyle = await readStartBarComputedStyle(startBar);

    expect(winxpStyle.position).toBe('absolute');
    expect(winxpStyle.bottom).toBe('0px');
    expect(winxpStyle.backgroundColor).not.toBe(win98Style.backgroundColor);
    expect(winxpStyle.backgroundImage).not.toBe(win98Style.backgroundImage);
    expect(winxpStyle.backgroundImage).toContain('linear-gradient');

    await switchWindowSelection(page, { systemType: 'default', theme: 'default' });

    await expect(screenRoot).toBeVisible();
    await expect(screenRoot).toHaveAttribute('data-system-type', 'default');
    await expect(screenRoot).toHaveAttribute('data-theme', 'default');
    await expect(startBar).toHaveCount(0);
  });
});
