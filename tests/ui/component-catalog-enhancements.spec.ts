import { expect, type Locator, type Page, test } from '@playwright/test';
import { dragLocatorBy } from './window.helpers';

const SPLIT_AREA_LOCK_CURRENT_TEST_ID = 'split-area-demo-lock-current';
const SPLIT_AREA_LOCK_RECURSIVE_TEST_ID = 'split-area-demo-lock-recursive';

const gotoComponentCatalog = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByTestId('component-catalog')).toBeVisible();
};

const getFirstSplitAreaPanelWidth = async (splitArea: Locator): Promise<number> => {
  const firstPanel = splitArea.locator(':scope > .cm-split-area__panel').first();
  await expect(firstPanel).toBeVisible();

  const box = await firstPanel.boundingBox();

  if (box === null) {
    throw new Error('Expected the first SplitArea panel to have a visible bounding box.');
  }

  return box.width;
};

test('ComponentCatalog exposes CLoading demo spinner', async ({ page }) => {
  await gotoComponentCatalog(page);

  const loadingSection = page.getByTestId('catalog-section-loading');
  await loadingSection.scrollIntoViewIfNeeded();

  await expect(loadingSection).toBeVisible();
  await expect(page.getByTestId('loading-demo-spinner')).toBeVisible();
});

test('ComponentCatalog CInput suggestions can select Apple', async ({ page }) => {
  await gotoComponentCatalog(page);

  const suggestionInput = page.getByTestId('input-demo-suggestions');
  await suggestionInput.scrollIntoViewIfNeeded();
  await suggestionInput.fill('ap');

  await expect(page.getByTestId('input-demo-search-value')).toContainText('ap');

  const appleOption = page.getByTestId('catalog-section-input').getByRole('option', {
    name: 'Apple',
  });
  await expect(appleOption).toBeVisible();
  await appleOption.click();

  await expect(page.getByTestId('input-demo-selected-value')).toContainText('apple');
});

test('ComponentCatalog locked SplitArea ignores current-level drag attempts', async ({ page }) => {
  await gotoComponentCatalog(page);

  const lockToggle = page.getByTestId('split-area-demo-lock-current-toggle');
  await lockToggle.scrollIntoViewIfNeeded();
  await lockToggle.click();
  await expect(lockToggle).toBeChecked();

  const splitArea = page.getByTestId(SPLIT_AREA_LOCK_CURRENT_TEST_ID);
  const separator = splitArea.locator(':scope > .cm-split-area__separator').first();
  await expect(separator).toHaveClass(/cm-split-area__separator--locked/);

  const widthBeforeDrag = await getFirstSplitAreaPanelWidth(splitArea);
  await dragLocatorBy(separator, 80, 0);
  const widthAfterDrag = await getFirstSplitAreaPanelWidth(splitArea);

  expect(widthAfterDrag).toBeCloseTo(widthBeforeDrag, 1);

  await page.screenshot({
    path: '.omo/evidence/task-7-splitarea-locked-browser.png',
    fullPage: true,
  });

  await expect(page.getByTestId(SPLIT_AREA_LOCK_RECURSIVE_TEST_ID)).toBeVisible();
});

test('ComponentCatalog exposes stepped CSlider demo value', async ({ page }) => {
  await gotoComponentCatalog(page);

  const sliderDemo = page.getByTestId('slider-demo');
  const slider = sliderDemo.getByRole('slider');
  const sliderValue = page.getByTestId('slider-demo-value');

  await sliderDemo.scrollIntoViewIfNeeded();

  await slider.scrollIntoViewIfNeeded();

  await expect(sliderDemo).toBeVisible();
  await expect(sliderValue).toContainText('Volume: 40');

  await slider.focus();
  await slider.press('ArrowRight');

  await expect(sliderValue).toContainText('Volume: 45');
});
