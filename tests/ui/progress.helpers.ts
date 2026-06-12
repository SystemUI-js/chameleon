import type { Page } from '@playwright/test';

const PLAYWRIGHT_PROGRESS_PATH = '/playwright-progress.html';
const PROGRESS_PLAYGROUND_TEST_ID = 'cprogress-playground';
const PROGRESS_BAR_TEST_ID = 'cprogress-bar';
const PROGRESS_CIRCLE_TEST_ID = 'cprogress-circle';
const PROGRESS_RING_TEST_ID = 'cprogress-ring';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

export type ProgressFixture = 'bar' | 'circle' | 'ring';

const waitForProgressHarness = async (page: Page): Promise<void> => {
  await page.getByTestId(PROGRESS_PLAYGROUND_TEST_ID).waitFor({ state: 'visible' });
};

export const gotoProgressFixture = async (page: Page, fixture: ProgressFixture): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_PROGRESS_PATH}?${searchParams.toString()}`);
  await waitForProgressHarness(page);
};

export const gotoProgressBar = async (page: Page): Promise<void> => {
  await gotoProgressFixture(page, 'bar');
};

export const gotoProgressCircle = async (page: Page): Promise<void> => {
  await gotoProgressFixture(page, 'circle');
};

export const gotoProgressRing = async (page: Page): Promise<void> => {
  await gotoProgressFixture(page, 'ring');
};

export {
  FIXTURE_ERROR_TEST_ID,
  PROGRESS_BAR_TEST_ID,
  PROGRESS_CIRCLE_TEST_ID,
  PROGRESS_PLAYGROUND_TEST_ID,
  PROGRESS_RING_TEST_ID,
};
