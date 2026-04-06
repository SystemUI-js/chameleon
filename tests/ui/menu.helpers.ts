import type { Page } from '@playwright/test';
import type { DevThemeId } from '@/dev/themeSwitcher';

const PLAYWRIGHT_MENU_PATH = '/playwright-menu.html';
const MENU_DEMO_ROOT_TEST_ID = 'menu-demo';
const MENU_DEMO_TRIGGER_TEST_ID = 'menu-demo-trigger';
const MENU_DEMO_POPUP_TEST_ID = 'menu-demo-popup';
const MENU_ITEM_FILE_TEST_ID = 'menu-item-file';
const MENU_ITEM_FILE_NEW_TEST_ID = 'menu-item-file-new';
const MENU_ITEM_FILE_OPEN_TEST_ID = 'menu-item-file-open';
const MENU_ITEM_VIEW_TEST_ID = 'menu-item-view';
const MENU_ITEM_VIEW_ZOOM_TEST_ID = 'menu-item-view-zoom';
const MENU_SELECTION_VALUE_TEST_ID = 'menu-selection-value';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

const waitForMenuHarness = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    ({ menuDemoTriggerTestId, fixtureErrorTestId }) => {
      const trigger = document.querySelector(`[data-testid="${menuDemoTriggerTestId}"]`);
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);

      if (fixtureError) {
        return true;
      }

      return Boolean(trigger instanceof HTMLButtonElement);
    },
    {
      menuDemoTriggerTestId: MENU_DEMO_TRIGGER_TEST_ID,
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
    },
  );
};

export const gotoMenuFixture = async (page: Page, fixture: string): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_MENU_PATH}?${searchParams.toString()}`);
  await waitForMenuHarness(page);
};

export type MenuHarnessSelection = {
  theme: DevThemeId;
  fixture?: string;
};

export const gotoThemedMenu = async (
  page: Page,
  selection: MenuHarnessSelection,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: selection.theme,
  });

  if (selection.fixture !== undefined) {
    searchParams.set('fixture', selection.fixture);
  }

  await page.goto(`${PLAYWRIGHT_MENU_PATH}?${searchParams.toString()}`);
  await waitForMenuHarness(page);
};

export const gotoClickMenu = async (page: Page): Promise<void> => {
  await gotoThemedMenu(page, { theme: 'default', fixture: 'click' });
};

export const gotoHoverMenu = async (page: Page): Promise<void> => {
  await gotoThemedMenu(page, { theme: 'default', fixture: 'hover' });
};

export const readMenuSelectionValue = async (page: Page): Promise<string | null> => {
  return page.getByTestId(MENU_SELECTION_VALUE_TEST_ID).evaluate((element) => {
    return element.textContent;
  });
};

export {
  FIXTURE_ERROR_TEST_ID,
  MENU_DEMO_POPUP_TEST_ID,
  MENU_DEMO_ROOT_TEST_ID,
  MENU_DEMO_TRIGGER_TEST_ID,
  MENU_ITEM_FILE_NEW_TEST_ID,
  MENU_ITEM_FILE_OPEN_TEST_ID,
  MENU_ITEM_FILE_TEST_ID,
  MENU_ITEM_VIEW_TEST_ID,
  MENU_ITEM_VIEW_ZOOM_TEST_ID,
  MENU_SELECTION_VALUE_TEST_ID,
};
