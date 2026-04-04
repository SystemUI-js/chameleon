import { expect, test } from '@playwright/test';
import {
  dragLocatorBy,
  expectNoPreviewFrame,
  finishDrag,
  gotoWindowFixture,
  moveDragBy,
  readFrameMetrics,
  readPreviewMetrics,
  startLocatorDrag,
} from './window.helpers';

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
  await expectNoPreviewFrame(page);
});

test('outline-move title drag keeps committed frame stable, renders preview, and cleans it up on release', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'outline-move');

  const titleLocator = page.getByTestId('window-title');
  const dragSession = await startLocatorDrag(titleLocator);

  await moveDragBy(dragSession, 20, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 30,
    y: 60,
    width: 240,
    height: 160,
  });

  await finishDrag(dragSession);

  await expectNoPreviewFrame(page);
  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 60,
    width: 240,
    height: 160,
  });
});

test('outline-both title drag keeps committed frame stable, renders preview, and cleans it up on release', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'outline-both');

  const titleLocator = page.getByTestId('window-title');
  const dragSession = await startLocatorDrag(titleLocator);

  await moveDragBy(dragSession, 20, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 30,
    y: 60,
    width: 240,
    height: 160,
  });

  await finishDrag(dragSession);

  await expectNoPreviewFrame(page);
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
  await expectNoPreviewFrame(page);
});

test('outline-move keeps resize live without rendering a preview frame', async ({ page }) => {
  await gotoWindowFixture(page, 'outline-move');

  const eastHandle = page.getByTestId('window-resize-e');

  await expectNoPreviewFrame(page);
  await dragLocatorBy(eastHandle, 20, 0);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 260,
    height: 160,
  });
  await expectNoPreviewFrame(page);
});
