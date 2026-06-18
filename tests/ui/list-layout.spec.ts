import { expect, test, type Locator } from '@playwright/test';
import {
  CLIST_HORIZONTAL_ITEM_1_TEST_ID,
  CLIST_HORIZONTAL_ITEM_2_TEST_ID,
  CLIST_HORIZONTAL_ITEM_3_TEST_ID,
  CLIST_HORIZONTAL_TEST_ID,
  CLIST_NUMERIC_GAP_TEST_ID,
  CLIST_OBJECT_GAP_TEST_ID,
  CLIST_WRAP_TEST_ID,
  FIXTURE_ERROR_TEST_ID,
  gotoListLayoutHorizontal,
  gotoListLayoutNumericGap,
  gotoListLayoutObjectGap,
  gotoListLayoutWrap,
  LIST_LAYOUT_PLAYGROUND_TEST_ID,
  PLAYWRIGHT_LIST_LAYOUT_PATH,
} from './list-layout.helpers';

type LocatorBox = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;

const getVisibleBox = async (locator: Locator, label: string): Promise<LocatorBox> => {
  const box = await locator.boundingBox();

  expect(box, `${label} should have a rendered bounding box`).not.toBeNull();

  return box as LocatorBox;
};

test('horizontal fixture lays out items from left to right', async ({ page }) => {
  await gotoListLayoutHorizontal(page);

  const root = page.getByTestId(CLIST_HORIZONTAL_TEST_ID);
  await expect(page.getByTestId(LIST_LAYOUT_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(root).toHaveClass(/cm-clist--direction-horizontal/);
  await expect(root).toHaveClass(/cm-clist--wrap/);

  const firstBox = await getVisibleBox(
    page.getByTestId(CLIST_HORIZONTAL_ITEM_1_TEST_ID),
    'first item',
  );
  const secondBox = await getVisibleBox(
    page.getByTestId(CLIST_HORIZONTAL_ITEM_2_TEST_ID),
    'second item',
  );
  const thirdBox = await getVisibleBox(
    page.getByTestId(CLIST_HORIZONTAL_ITEM_3_TEST_ID),
    'third item',
  );

  expect(secondBox.x).toBeGreaterThan(firstBox.x);
  expect(thirdBox.x).toBeGreaterThan(secondBox.x);
  expect(Math.abs(secondBox.y - firstBox.y)).toBeLessThan(2);
});

test('wrap fixture exposes wrap-reverse modifier class', async ({ page }) => {
  await gotoListLayoutWrap(page);

  const root = page.getByTestId(CLIST_WRAP_TEST_ID);
  await expect(root).toBeVisible();
  await expect(root).toHaveClass(/cm-clist--direction-horizontal/);
  await expect(root).toHaveClass(/cm-clist--wrap-reverse/);
});

test('numeric gap fixture normalizes gap into row and column CSS variables', async ({ page }) => {
  await gotoListLayoutNumericGap(page);

  const root = page.getByTestId(CLIST_NUMERIC_GAP_TEST_ID);
  await expect(root).toBeVisible();
  await expect(root).toHaveClass(/cm-clist--nowrap/);
  await expect(root).toHaveCSS('--cm-clist-row-gap', '18px');
  await expect(root).toHaveCSS('--cm-clist-column-gap', '18px');
});

test('object gap fixture maps row and column values independently', async ({ page }) => {
  await gotoListLayoutObjectGap(page);

  const root = page.getByTestId(CLIST_OBJECT_GAP_TEST_ID);
  await expect(root).toBeVisible();
  await expect(root).toHaveClass(/cm-clist--nowrap/);
  await expect(root).toHaveCSS('--cm-clist-row-gap', '10px');
  await expect(root).toHaveCSS('--cm-clist-column-gap', '24px');
});

test('unknown fixture shows explicit error', async ({ page }) => {
  await page.goto(`${PLAYWRIGHT_LIST_LAYOUT_PATH}?theme=default&fixture=unknown`);

  await expect(page.getByTestId(LIST_LAYOUT_PLAYGROUND_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(FIXTURE_ERROR_TEST_ID)).toBeVisible();
});
