import { expect, test } from '@playwright/test';
import {
  expectNoPreviewFrame,
  finishDrag,
  gotoWindowFixture,
  moveDragBy,
  readFrameMetrics,
  startLocatorDrag,
} from './window.helpers';

test('right fixture renders title controls to the right of the title text', async ({ page }) => {
  await gotoWindowFixture(page, 'action-buttons-right');

  const titleText = page.getByTestId('window-title-text');
  const controls = page.getByTestId('window-title-controls');

  await expect(titleText).toBeVisible();
  await expect(controls).toBeVisible();
  await expect(controls).toHaveClass(/cm-window__title-bar__controls--right/);

  const titleTextBox = await titleText.boundingBox();
  const controlsBox = await controls.boundingBox();

  expect(titleTextBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();

  if (titleTextBox === null || controlsBox === null) {
    throw new Error('Expected title text and controls to have visible bounding boxes.');
  }

  expect(controlsBox.x).toBeGreaterThan(titleTextBox.x);
});

test('left fixture renders title controls to the left of the title text', async ({ page }) => {
  await gotoWindowFixture(page, 'action-buttons-left');

  const titleText = page.getByTestId('window-title-text');
  const controls = page.getByTestId('window-title-controls');

  await expect(titleText).toBeVisible();
  await expect(controls).toBeVisible();
  await expect(controls).toHaveClass(/cm-window__title-bar__controls--left/);

  const titleTextBox = await titleText.boundingBox();
  const controlsBox = await controls.boundingBox();

  expect(titleTextBox).not.toBeNull();
  expect(controlsBox).not.toBeNull();

  if (titleTextBox === null || controlsBox === null) {
    throw new Error('Expected title text and controls to have visible bounding boxes.');
  }

  expect(controlsBox.x).toBeLessThan(titleTextBox.x);
});

test('no-op button clicks keep frame metrics unchanged', async ({ page }) => {
  await gotoWindowFixture(page, 'action-buttons-left');

  const initialUrl = page.url();
  const initialMetrics = await readFrameMetrics(page);

  await page.getByTestId('window-demo-minimize').click();
  await expect(readFrameMetrics(page)).resolves.toEqual(initialMetrics);

  await page.getByTestId('window-demo-maximize').click();
  await expect(readFrameMetrics(page)).resolves.toEqual(initialMetrics);

  await page.getByTestId('window-demo-close').click();
  await expect(readFrameMetrics(page)).resolves.toEqual(initialMetrics);

  await expect(page.getByTestId('window-frame')).toBeVisible();
  expect(page.url()).toBe(initialUrl);
});

test('dragging from an action button does not move the window', async ({ page }) => {
  await gotoWindowFixture(page, 'action-buttons-right');

  const initialMetrics = await readFrameMetrics(page);
  const dragSession = await startLocatorDrag(page.getByTestId('window-demo-close'));

  await moveDragBy(dragSession, 18, 10);
  await finishDrag(dragSession);

  await expect(readFrameMetrics(page)).resolves.toEqual(initialMetrics);
  await expectNoPreviewFrame(page);
});
