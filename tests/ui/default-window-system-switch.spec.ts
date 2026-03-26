import { expect, test } from '@playwright/test';
import { gotoWindowSelection } from './window.helpers';

test.describe('default window system switch', () => {
  test('switches to windows from title bar dropdown with url and screen sync', async ({ page }) => {
    await gotoWindowSelection(page, { systemType: 'default', theme: 'default' });

    const screenRoot = page.getByTestId('screen-root');
    const systemSwitch = page.getByLabel('切换系统');
    const windowsStartBar = page.getByTestId('windows-start-bar');
    const defaultWindowBody = page.getByTestId('default-window-body');

    await expect(screenRoot).toHaveAttribute('data-system-type', 'default');
    await expect(screenRoot).toHaveAttribute('data-theme', 'default');
    await expect(defaultWindowBody).toBeVisible();
    await expect(windowsStartBar).toHaveCount(0);

    await systemSwitch.selectOption('windows');

    await expect(page).toHaveURL(/systemType=windows/);
    await expect(page).toHaveURL(/theme=win98/);
    await expect(screenRoot).toHaveAttribute('data-system-type', 'windows');
    await expect(screenRoot).toHaveAttribute('data-theme', 'win98');
    await expect(windowsStartBar).toBeVisible();
    await expect(defaultWindowBody).toHaveCount(0);
  });
});
