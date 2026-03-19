import { expect, test } from '@playwright/test';
import { gotoWindowFixture, readFrameMetrics } from './window.helpers';

test('default fixture exposes baseline metrics', async ({ page }) => {
  await gotoWindowFixture(page, 'default');

  await expect(page.getByTestId('window-frame')).toBeVisible();
  await expect(page.getByTestId('window-title')).toHaveText('Default Window');

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
});

test('unknown fixture shows explicit error', async ({ page }) => {
  await gotoWindowFixture(page, 'unknown-mode');

  const error = page.getByTestId('fixture-error');

  await expect(error).toBeVisible();
  await expect(error).toHaveText('Unknown fixture: unknown-mode');
});
