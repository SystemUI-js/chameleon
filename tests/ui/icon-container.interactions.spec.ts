import { expect, test, type Page } from '@playwright/test';
import {
  dragLocatorBy,
  ensureDedicatedWindowHarnessServer,
  gotoWindowFixtureAtBaseUrl,
  stopDedicatedWindowHarnessServer,
} from './window.helpers';

type IconMetrics = {
  x: number;
  y: number;
};

const PLAYWRIGHT_WINDOW_PATH = '/playwright-window.html';

let dedicatedWindowHarnessBaseUrl = '';

test.beforeAll(async () => {
  dedicatedWindowHarnessBaseUrl = await ensureDedicatedWindowHarnessServer();
});

test.afterAll(() => {
  stopDedicatedWindowHarnessServer();
});

const gotoIconContainerHarness = async (page: Page): Promise<void> => {
  await gotoWindowFixtureAtBaseUrl(
    page,
    PLAYWRIGHT_WINDOW_PATH,
    'icon-container',
    dedicatedWindowHarnessBaseUrl,
  );

  await expect(page.getByTestId('fixture-error')).toHaveCount(0);
  await expect(page.getByTestId('icon-container')).toBeVisible();
  await expect(page.getByTestId('icon-item-0')).toBeVisible();
  await expect(page.getByTestId('icon-item-1')).toBeVisible();
};

const readIconMetrics = async (page: Page, testId: string): Promise<IconMetrics> => {
  return await page.getByTestId(testId).evaluate((element) => {
    const icon = element as HTMLElement;

    return {
      x: Number.parseFloat(icon.style.left || '0') || 0,
      y: Number.parseFloat(icon.style.top || '0') || 0,
    };
  });
};

test('drag moves only the targeted icon and leaves siblings untouched', async ({ page }) => {
  await gotoIconContainerHarness(page);

  const firstBefore = await readIconMetrics(page, 'icon-item-0');
  const secondBefore = await readIconMetrics(page, 'icon-item-1');

  await dragLocatorBy(page.getByTestId('icon-item-1'), 20, 30);

  await expect(readIconMetrics(page, 'icon-item-0')).resolves.toEqual(firstBefore);
  await expect(readIconMetrics(page, 'icon-item-1')).resolves.toEqual({
    x: secondBefore.x + 20,
    y: secondBefore.y + 30,
  });
});

test('catalog icon showcase updates status and drag coordinates', async ({ page }) => {
  await page.goto(dedicatedWindowHarnessBaseUrl);
  await page.waitForLoadState('networkidle');

  const componentCatalog = page.getByTestId('component-catalog');
  await expect(componentCatalog).toBeVisible({ timeout: 10000 });

  const iconSection = page.getByTestId('catalog-section-icon');
  await iconSection.scrollIntoViewIfNeeded();
  await expect(iconSection).toBeVisible();

  const iconContainer = iconSection.getByTestId('icon-container');
  await expect(iconContainer).toBeVisible();

  const iconItem0 = iconSection.getByTestId('icon-item-0');
  const iconItem1 = iconSection.getByTestId('icon-item-1');
  await expect(iconItem0).toBeVisible();
  await expect(iconItem1).toBeVisible();

  const coordsDisplay = iconSection.getByTestId('icon-coords-display');
  await expect(coordsDisplay).toBeVisible();

  const initialCoordsText = await coordsDisplay.textContent();

  await dragLocatorBy(iconItem1, 25, 35);

  await iconItem0.click();

  await page.waitForFunction(
    (previousCoords) => {
      const display = document.querySelector('[data-testid="icon-coords-display"]');
      return display && display.textContent !== previousCoords;
    },
    initialCoordsText,
    { timeout: 5000 },
  );

  const afterDragCoordsText = await coordsDisplay.textContent();
  expect(afterDragCoordsText).not.toBe(initialCoordsText);
});
