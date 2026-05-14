import { expect, test } from '@playwright/test';
import {
  FIXTURE_ERROR_TEST_ID,
  gotoClickMenu,
  gotoHoverMenu,
  gotoMenuFixture,
  MENU_DEMO_POPUP_TEST_ID,
  MENU_DEMO_ROOT_TEST_ID,
  MENU_DEMO_TRIGGER_TEST_ID,
  MENU_ITEM_FILE_NEW_TEST_ID,
  MENU_ITEM_FILE_TEST_ID,
  MENU_SELECTION_VALUE_TEST_ID,
} from './menu.helpers';

test('click fixture exposes menu trigger', async ({ page }) => {
  await gotoClickMenu(page);

  await expect(page.getByTestId(MENU_DEMO_TRIGGER_TEST_ID)).toBeVisible();
});

test('hover fixture exposes menu trigger', async ({ page }) => {
  await gotoHoverMenu(page);

  await expect(page.getByTestId(MENU_DEMO_TRIGGER_TEST_ID)).toBeVisible();
});

test('click fixture renders trigger as direct root child', async ({ page }) => {
  await gotoClickMenu(page);

  const rootMenu = page.getByTestId(MENU_DEMO_ROOT_TEST_ID);
  const isDirectChild = await rootMenu.evaluate(
    (menuElement, { triggerTestId }) => {
      const trigger = menuElement.querySelector(`[data-testid="${triggerTestId}"]`);

      return (
        trigger?.parentElement === menuElement &&
        menuElement.querySelector('.cm-menu__trigger') === null
      );
    },
    { triggerTestId: MENU_DEMO_TRIGGER_TEST_ID },
  );

  expect(isDirectChild).toBe(true);
});

test('unknown fixture shows explicit error', async ({ page }) => {
  await gotoMenuFixture(page, 'unknown-mode');

  const error = page.getByTestId(FIXTURE_ERROR_TEST_ID);

  await expect(error).toBeVisible();
  await expect(error).toContainText('Unknown fixture:');
});

test.describe('Menu interactions', () => {
  test('clicking menu trigger opens popup', async ({ page }) => {
    await gotoClickMenu(page);

    const trigger = page.getByTestId(MENU_DEMO_TRIGGER_TEST_ID);
    await trigger.click();

    const popup = page.getByTestId(MENU_DEMO_POPUP_TEST_ID);
    await expect(popup).toBeVisible();
  });

  test('clicking parent item opens submenu', async ({ page }) => {
    await gotoClickMenu(page);

    const trigger = page.getByTestId(MENU_DEMO_TRIGGER_TEST_ID);
    await trigger.click();

    const fileItem = page.getByTestId(MENU_ITEM_FILE_TEST_ID);
    await fileItem.click();

    const newItem = page.getByTestId(MENU_ITEM_FILE_NEW_TEST_ID);
    await expect(newItem).toBeVisible();
  });

  test('selection value shows selected item title', async ({ page }) => {
    await gotoClickMenu(page);

    const trigger = page.getByTestId(MENU_DEMO_TRIGGER_TEST_ID);
    await trigger.click();

    const fileItem = page.getByTestId(MENU_ITEM_FILE_TEST_ID);
    await fileItem.click();

    const newItem = page.getByTestId(MENU_ITEM_FILE_NEW_TEST_ID);
    await expect(newItem).toBeVisible();
    await newItem.click({ force: true });

    await expect(page.getByTestId(MENU_SELECTION_VALUE_TEST_ID)).toContainText('New');
  });
});
