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
  await expectNoPreviewFrame(page);
});

test('min-clamp fixture clamps outline preview and committed size to 1px', async ({ page }) => {
  await gotoWindowFixture(page, 'min-clamp');

  const eastDrag = await startLocatorDrag(page.getByTestId('window-resize-e'));
  await moveDragBy(eastDrag, -60, 0);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 40,
    height: 30,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 1,
    height: 30,
  });

  await finishDrag(eastDrag);
  await expectNoPreviewFrame(page);

  const southDrag = await startLocatorDrag(page.getByTestId('window-resize-s'));
  await moveDragBy(southDrag, 0, -70);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 1,
    height: 30,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 1,
    height: 1,
  });

  await finishDrag(southDrag);
  await expectNoPreviewFrame(page);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 30,
    width: 1,
    height: 1,
  });
});

test('max-clamp fixture clamps outline preview and preserves north-west anchor behavior', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'max-clamp');

  const eastDrag = await startLocatorDrag(page.getByTestId('window-resize-e'));
  await moveDragBy(eastDrag, 100, 0);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 50,
    y: 60,
    width: 120,
    height: 100,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 50,
    y: 60,
    width: 150,
    height: 100,
  });

  await finishDrag(eastDrag);
  await expectNoPreviewFrame(page);

  const northWestDrag = await startLocatorDrag(page.getByTestId('window-resize-nw'));
  await moveDragBy(northWestDrag, -70, -80);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 50,
    y: 60,
    width: 150,
    height: 100,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 50,
    y: 50,
    width: 150,
    height: 110,
  });

  await finishDrag(northWestDrag);
  await expectNoPreviewFrame(page);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 50,
    y: 50,
    width: 150,
    height: 110,
  });
});
