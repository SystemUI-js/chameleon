import { expect, test } from '@playwright/test';
import {
  FIXTURE_ERROR_TEST_ID,
  gotoProgressBar,
  gotoProgressCircle,
  gotoProgressRing,
  PROGRESS_BAR_TEST_ID,
  PROGRESS_CIRCLE_TEST_ID,
  PROGRESS_PLAYGROUND_TEST_ID,
  PROGRESS_RING_TEST_ID,
} from './progress.helpers';

test('bar fixture renders playground and indeterminate progress', async ({ page }) => {
  await gotoProgressBar(page);

  await expect(page.getByTestId(PROGRESS_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(PROGRESS_BAR_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(PROGRESS_BAR_TEST_ID)).toHaveClass(/cm-cprogress--indeterminate/);
});

test('circle fixture renders playground and circle progress', async ({ page }) => {
  await gotoProgressCircle(page);

  await expect(page.getByTestId(PROGRESS_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(PROGRESS_CIRCLE_TEST_ID)).toBeVisible();
});

test('ring fixture renders playground and ring progress', async ({ page }) => {
  await gotoProgressRing(page);

  await expect(page.getByTestId(PROGRESS_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(PROGRESS_RING_TEST_ID)).toBeVisible();
});

test('unknown fixture shows explicit error', async ({ page }) => {
  await page.goto('/playwright-progress.html?theme=default&fixture=unknown');

  await expect(page.getByTestId(PROGRESS_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(FIXTURE_ERROR_TEST_ID)).toBeVisible();
});
