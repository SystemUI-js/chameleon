import { expect, test, type Locator, type Page } from '@playwright/test';

const PLAYWRIGHT_CONTEXT_MENU_PATH = '/playwright-context-menu.html';
const PLAYGROUND_TEST_ID = 'ccontext-menu-playground';
const TARGET_TEST_ID = 'ccontext-menu-target';
const OVERLAY_TEST_ID = 'ccontext-menu-overlay';
const OPEN_ITEM_TEST_ID = 'ccontext-menu-item-open';
const DELETE_ITEM_TEST_ID = 'ccontext-menu-item-delete';
const OUTSIDE_TEST_ID = 'ccontext-menu-outside';
const SELECTION_VALUE_TEST_ID = 'ccontext-menu-selection-value';
const VIEWPORT_MARGIN_PX = 8;

type ContextMenuFixture = 'basic' | 'clamp';

type OverlayBounds = {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
};

const gotoContextMenuFixture = async (page: Page, fixture: ContextMenuFixture): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_CONTEXT_MENU_PATH}?${searchParams.toString()}`);
  await page.getByTestId(PLAYGROUND_TEST_ID).waitFor({ state: 'visible' });
};

const getOverlay = (page: Page): Locator => page.getByTestId(OVERLAY_TEST_ID);

const openWithRightClick = async (page: Page): Promise<void> => {
  await page.getByTestId(TARGET_TEST_ID).click({ button: 'right' });
  await expect(getOverlay(page)).toBeVisible();
};

const readOverlayBounds = async (overlay: Locator): Promise<OverlayBounds> => {
  return overlay.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
  });
};

test('right-click opens context menu and selecting open closes it', async ({ page }) => {
  await gotoContextMenuFixture(page, 'basic');
  await openWithRightClick(page);

  await expect(page.getByTestId(OPEN_ITEM_TEST_ID)).toBeVisible();
  await expect(page.getByTestId(DELETE_ITEM_TEST_ID)).toBeVisible();

  await page.getByTestId(OPEN_ITEM_TEST_ID).click();

  await expect(page.getByTestId(SELECTION_VALUE_TEST_ID)).toContainText('Open');
  await expect(getOverlay(page)).toBeHidden();
});

test('Shift+F10 opens context menu and Escape closes it', async ({ page }) => {
  await gotoContextMenuFixture(page, 'basic');

  await page.getByTestId(TARGET_TEST_ID).focus();
  await page.keyboard.press('Shift+F10');

  await expect(getOverlay(page)).toBeVisible();

  await page.keyboard.press('Escape');

  await expect(getOverlay(page)).toBeHidden();
  await expect(page.getByTestId(TARGET_TEST_ID)).toBeFocused();
});

test('touch long-press opens context menu with shortened demo delay', async ({ page }) => {
  await gotoContextMenuFixture(page, 'basic');

  const target = page.getByTestId(TARGET_TEST_ID);
  const targetBox = await target.boundingBox();
  expect(targetBox).not.toBeNull();

  if (targetBox === null) {
    return;
  }

  const clientX = targetBox.x + targetBox.width / 2;
  const clientY = targetBox.y + targetBox.height / 2;

  await target.dispatchEvent('pointerdown', {
    bubbles: true,
    clientX,
    clientY,
    isPrimary: true,
    pointerId: 1,
    pointerType: 'touch',
  });

  await expect(getOverlay(page)).toBeVisible({ timeout: 1000 });
});

test('clicking outside the overlay closes context menu', async ({ page }) => {
  await gotoContextMenuFixture(page, 'basic');
  await openWithRightClick(page);

  await page.getByTestId(OUTSIDE_TEST_ID).click();

  await expect(getOverlay(page)).toBeHidden();
});

test('context menu clamps inside bottom-right viewport margin', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 240 });
  await gotoContextMenuFixture(page, 'clamp');
  await openWithRightClick(page);

  const overlayBounds = await readOverlayBounds(getOverlay(page));
  const viewportSize = page.viewportSize();

  expect(viewportSize).not.toBeNull();

  if (viewportSize === null) {
    return;
  }

  expect(overlayBounds.left).toBeGreaterThanOrEqual(VIEWPORT_MARGIN_PX);
  expect(overlayBounds.top).toBeGreaterThanOrEqual(VIEWPORT_MARGIN_PX);
  expect(overlayBounds.right).toBeLessThanOrEqual(viewportSize.width - VIEWPORT_MARGIN_PX);
  expect(overlayBounds.bottom).toBeLessThanOrEqual(viewportSize.height - VIEWPORT_MARGIN_PX);
});
