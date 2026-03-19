import { expect, test } from '@playwright/test';
import { dragLocatorBy, gotoWindowFixture, readFrameMetrics } from './window.helpers';

test('drag-only fixture hides resize handles when resizable={false} and title drag still moves frame exactly', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'drag-only');

  await expect(page.locator('[data-testid^="window-resize-"]')).toHaveCount(0);

  const titleLocator = page.getByTestId('window-title');
  await expect(titleLocator).toBeVisible();

  await dragLocatorBy(titleLocator, 30, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 42,
    y: 64,
    width: 200,
    height: 120,
  });
});

test('min-clamp fixture clamps east and south shrink to 1px', async ({ page }) => {
  await gotoWindowFixture(page, 'min-clamp');

  await dragLocatorBy(page.getByTestId('window-resize-e'), -60, 0);
  await dragLocatorBy(page.getByTestId('window-resize-s'), 0, -70);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 1,
    height: 1,
  });
});

test('max-clamp fixture clamps east growth and north-west anchor behavior', async ({ page }) => {
  await gotoWindowFixture(page, 'max-clamp');

  await dragLocatorBy(page.getByTestId('window-resize-e'), 100, 0);
  await dragLocatorBy(page.getByTestId('window-resize-nw'), -70, -80);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 50,
    y: 50,
    width: 150,
    height: 110,
  });
});
