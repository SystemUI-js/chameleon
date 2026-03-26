import { expect, test } from '@playwright/test';
import {
  dragLocatorBy,
  gotoWindowSelection,
  readFrameMetrics,
  switchWindowSelection,
} from './window.helpers';

test.describe('system/theme switch', () => {
  test('preserves dragged metrics on same-system theme switch', async ({ page }) => {
    await gotoWindowSelection(page, { systemType: 'windows', theme: 'win98' });

    const screenRoot = page.getByTestId('screen-root');
    const titleLocator = page.getByTestId('window-title');
    const contentLocator = page.getByTestId('window-content');

    await expect(screenRoot).toHaveClass(/cm-theme--win98/);
    await expect(titleLocator).toHaveText('Windows Window');
    await expect(contentLocator).toContainText('Windows content');

    await dragLocatorBy(titleLocator, 36, 44);

    const draggedMetrics = {
      x: 60,
      y: 68,
      width: 320,
      height: 220,
    };

    await expect(readFrameMetrics(page)).resolves.toEqual(draggedMetrics);

    const uuidBeforeSwitch = await contentLocator.getAttribute('data-window-uuid');

    if (uuidBeforeSwitch === null) {
      throw new Error(
        'Expected windows content to expose a runtime window UUID before theme switch.',
      );
    }

    await switchWindowSelection(page, { systemType: 'windows', theme: 'winxp' });

    await expect(screenRoot).toHaveAttribute('data-system-type', 'windows');
    await expect(screenRoot).toHaveAttribute('data-theme', 'winxp');
    await expect(screenRoot).toHaveClass(/cm-theme--winxp/);
    await expect(titleLocator).toHaveText('Windows Window');
    await expect(contentLocator).toContainText('Windows content');
    await expect(readFrameMetrics(page)).resolves.toEqual(draggedMetrics);
    await expect(contentLocator).toHaveAttribute('data-window-uuid', uuidBeforeSwitch);
  });

  test('reboots to default boot layout on cross-system switch', async ({ page }) => {
    await gotoWindowSelection(page, { systemType: 'windows', theme: 'winxp' });

    const screenRoot = page.getByTestId('screen-root');
    const titleLocator = page.getByTestId('window-title');
    const contentLocator = page.getByTestId('window-content');

    await expect(screenRoot).toHaveClass(/cm-theme--winxp/);
    await expect(titleLocator).toHaveText('Windows Window');
    await expect(contentLocator).toContainText('Windows content');

    await dragLocatorBy(titleLocator, 18, 26);

    await expect(readFrameMetrics(page)).resolves.toEqual({
      x: 42,
      y: 50,
      width: 320,
      height: 220,
    });

    const uuidBeforeSwitch = await contentLocator.getAttribute('data-window-uuid');

    if (uuidBeforeSwitch === null) {
      throw new Error(
        'Expected windows content to expose a runtime window UUID before system switch.',
      );
    }

    await switchWindowSelection(page, { systemType: 'default', theme: 'default' });

    await expect(screenRoot).toHaveAttribute('data-system-type', 'default');
    await expect(screenRoot).toHaveAttribute('data-theme', 'default');
    await expect(screenRoot).toHaveClass(/cm-system--default/);
    await expect(screenRoot).toHaveClass(/cm-theme--default/);
    await expect(titleLocator).toContainText('Default Window');
    await expect(contentLocator).toContainText('Default content');
    await expect(readFrameMetrics(page)).resolves.toEqual({
      x: 32,
      y: 28,
      width: 332,
      height: 228,
    });

    const uuidAfterSwitch = await contentLocator.getAttribute('data-window-uuid');

    expect(uuidAfterSwitch).not.toBeNull();
    expect(uuidAfterSwitch).not.toBe(uuidBeforeSwitch);
  });
});
