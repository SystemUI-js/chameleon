import { expect, test } from '@playwright/test';
import { dragLocatorBy, gotoWindowFixture, readFrameMetrics } from './window.helpers';

test('title drag moves window from (10,20) to (30,60)', async ({ page }) => {
  await gotoWindowFixture(page, 'default');

  const titleLocator = page.getByTestId('window-title');
  await expect(titleLocator).toBeVisible();

  await dragLocatorBy(titleLocator, 20, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 60,
    width: 240,
    height: 160,
  });
});

test('window content drag is a no-op (does not move window)', async ({ page }) => {
  await gotoWindowFixture(page, 'default');

  const contentLocator = page.getByTestId('window-content');
  await expect(contentLocator).toBeVisible();

  const contentBox = await contentLocator.boundingBox();

  if (contentBox === null) {
    throw new Error('Expected window content to have a visible bounding box.');
  }

  const centerTestId = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.getAttribute('data-testid') ?? null,
    {
      x: contentBox.x + contentBox.width / 2,
      y: contentBox.y + contentBox.height / 2,
    },
  );

  expect(centerTestId).not.toBe('window-title');

  await dragLocatorBy(contentLocator, 40, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
});
