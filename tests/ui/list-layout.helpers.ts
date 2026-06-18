import type { Page } from '@playwright/test';

const PLAYWRIGHT_LIST_LAYOUT_PATH = '/playwright-list-layout.html';
const LIST_LAYOUT_PLAYGROUND_TEST_ID = 'clist-layout-playground';
const CLIST_HORIZONTAL_TEST_ID = 'clist-horizontal';
const CLIST_HORIZONTAL_ITEM_1_TEST_ID = 'clist-horizontal-item-1';
const CLIST_HORIZONTAL_ITEM_2_TEST_ID = 'clist-horizontal-item-2';
const CLIST_HORIZONTAL_ITEM_3_TEST_ID = 'clist-horizontal-item-3';
const CLIST_WRAP_TEST_ID = 'clist-wrap';
const CLIST_NUMERIC_GAP_TEST_ID = 'clist-numeric-gap';
const CLIST_OBJECT_GAP_TEST_ID = 'clist-object-gap';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

export type ListLayoutFixture = 'horizontal' | 'wrap' | 'numeric-gap' | 'object-gap';

const waitForListLayoutHarness = async (page: Page): Promise<void> => {
  await page.getByTestId(LIST_LAYOUT_PLAYGROUND_TEST_ID).waitFor({ state: 'visible' });
};

export const gotoListLayoutFixture = async (
  page: Page,
  fixture: ListLayoutFixture,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_LIST_LAYOUT_PATH}?${searchParams.toString()}`);
  await waitForListLayoutHarness(page);
};

export const gotoListLayoutHorizontal = async (page: Page): Promise<void> => {
  await gotoListLayoutFixture(page, 'horizontal');
};

export const gotoListLayoutWrap = async (page: Page): Promise<void> => {
  await gotoListLayoutFixture(page, 'wrap');
};

export const gotoListLayoutNumericGap = async (page: Page): Promise<void> => {
  await gotoListLayoutFixture(page, 'numeric-gap');
};

export const gotoListLayoutObjectGap = async (page: Page): Promise<void> => {
  await gotoListLayoutFixture(page, 'object-gap');
};

export {
  CLIST_HORIZONTAL_ITEM_1_TEST_ID,
  CLIST_HORIZONTAL_ITEM_2_TEST_ID,
  CLIST_HORIZONTAL_ITEM_3_TEST_ID,
  CLIST_HORIZONTAL_TEST_ID,
  CLIST_NUMERIC_GAP_TEST_ID,
  CLIST_OBJECT_GAP_TEST_ID,
  CLIST_WRAP_TEST_ID,
  FIXTURE_ERROR_TEST_ID,
  LIST_LAYOUT_PLAYGROUND_TEST_ID,
  PLAYWRIGHT_LIST_LAYOUT_PATH,
};
