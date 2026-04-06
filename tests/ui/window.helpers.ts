import { expect, type Locator, type Page } from '@playwright/test';
import type { DevThemeId } from '@/dev/themeSwitcher';

export type FrameMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DragSession = {
  page: Page;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

const PLAYWRIGHT_WINDOW_PATH = '/playwright-window.html';
const WINDOW_FRAME_TEST_ID = 'window-frame';
const WINDOW_PREVIEW_FRAME_TEST_ID = 'window-preview-frame';
const WINDOW_TITLE_TEST_ID = 'window-title';
const WINDOW_CONTENT_TEST_ID = 'window-content';
const WINDOW_RESIZE_TEST_ID_PREFIX = 'window-resize-';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

const parsePixelValue = (value: string, property: string): number => {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Expected ${property} to be a pixel value, received: ${value}`);
  }

  return parsed;
};

type WindowHarnessNavigationSelection = {
  theme: DevThemeId;
  fixture?: string;
};

type WindowHarnessNavigationOptions = {
  allowFixtureError?: boolean;
};

const readWindowFixtureErrorText = async (page: Page): Promise<string | null> => {
  return page.evaluate((fixtureErrorTestId) => {
    const fixtureError = document.querySelector<HTMLElement>(
      `[data-testid="${fixtureErrorTestId}"]`,
    );

    return fixtureError?.textContent?.trim() ?? null;
  }, FIXTURE_ERROR_TEST_ID);
};

const waitForWindowHarness = async (page: Page): Promise<void> => {
  try {
    await page.waitForFunction(
      ({ frameTestId, titleTestId, contentTestId, resizeTestIdPrefix }) => {
        const frame = document.querySelector(`[data-testid="${frameTestId}"]`);
        const title = document.querySelector(`[data-testid="${titleTestId}"]`);
        const content = document.querySelector(`[data-testid="${contentTestId}"]`);
        const resizeHandle = document.querySelector(`[data-testid^="${resizeTestIdPrefix}"]`);

        return Boolean((frame && title) || (frame && content) || (frame && resizeHandle));
      },
      {
        frameTestId: WINDOW_FRAME_TEST_ID,
        titleTestId: WINDOW_TITLE_TEST_ID,
        contentTestId: WINDOW_CONTENT_TEST_ID,
        resizeTestIdPrefix: WINDOW_RESIZE_TEST_ID_PREFIX,
      },
    );
  } catch (error) {
    const fixtureErrorText = await readWindowFixtureErrorText(page);

    if (fixtureErrorText !== null) {
      throw new Error(`Window harness rendered fixture error: ${fixtureErrorText}`);
    }

    throw error;
  }

  const fixtureErrorText = await readWindowFixtureErrorText(page);

  if (fixtureErrorText !== null) {
    throw new Error(`Window harness rendered fixture error: ${fixtureErrorText}`);
  }
};

const buildWindowFixtureUrl = (selection: WindowHarnessNavigationSelection): string => {
  const searchParams = new URLSearchParams({
    theme: selection.theme,
  });

  if (selection.fixture !== undefined) {
    searchParams.set('fixture', selection.fixture);
  }

  return `${PLAYWRIGHT_WINDOW_PATH}?${searchParams.toString()}`;
};

const gotoWindowHarness = async (
  page: Page,
  selection: WindowHarnessNavigationSelection,
  options: WindowHarnessNavigationOptions = {},
): Promise<void> => {
  await page.goto(buildWindowFixtureUrl(selection));

  if (options.allowFixtureError === true) {
    return;
  }

  await waitForWindowHarness(page);
};

export const gotoWindowFixture = async (page: Page, fixture: string): Promise<void> => {
  await gotoWindowHarness(page, {
    theme: 'default',
    fixture,
  });
};

export const gotoWindowFixtureAllowingError = async (
  page: Page,
  fixture: string,
): Promise<void> => {
  await gotoWindowHarness(
    page,
    {
      theme: 'default',
      fixture,
    },
    { allowFixtureError: true },
  );
};

export type WindowHarnessSelection = {
  theme: DevThemeId;
  fixture?: string;
};

export const gotoThemedWindowFixture = async (
  page: Page,
  selection: WindowHarnessSelection,
): Promise<void> => {
  await gotoWindowHarness(page, selection);
};

export const readFrameMetrics = async (page: Page): Promise<FrameMetrics> => {
  const inlineStyle = await page.getByTestId(WINDOW_FRAME_TEST_ID).evaluate((element) => {
    const frame = element as HTMLElement;

    return {
      left: frame.style.left,
      top: frame.style.top,
      width: frame.style.width,
      height: frame.style.height,
    };
  });

  return {
    x: parsePixelValue(inlineStyle.left, 'left'),
    y: parsePixelValue(inlineStyle.top, 'top'),
    width: parsePixelValue(inlineStyle.width, 'width'),
    height: parsePixelValue(inlineStyle.height, 'height'),
  };
};

export const startLocatorDrag = async (locator: Locator): Promise<DragSession> => {
  await locator.scrollIntoViewIfNeeded();

  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error('Cannot drag a locator without a visible bounding box.');
  }

  const page = locator.page();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  return {
    page,
    startX,
    startY,
    currentX: startX,
    currentY: startY,
  };
};

export const moveDragBy = async (session: DragSession, dx: number, dy: number): Promise<void> => {
  const endX = session.currentX + dx;
  const endY = session.currentY + dy;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 4);

  await session.page.mouse.move(endX, endY, { steps });

  session.currentX = endX;
  session.currentY = endY;
};

export const finishDrag = async (session: DragSession): Promise<void> => {
  await session.page.mouse.up();
};

export const dragLocatorBy = async (locator: Locator, dx: number, dy: number): Promise<void> => {
  const session = await startLocatorDrag(locator);
  await moveDragBy(session, dx, dy);
  await finishDrag(session);
};

export const readPreviewMetrics = async (page: Page): Promise<FrameMetrics | null> => {
  const previewLocator = page.getByTestId(WINDOW_PREVIEW_FRAME_TEST_ID);
  const count = await previewLocator.count();

  if (count === 0) {
    return null;
  }

  const inlineStyle = await previewLocator.evaluate((element) => {
    const frame = element as HTMLElement;

    return {
      left: frame.style.left,
      top: frame.style.top,
      width: frame.style.width,
      height: frame.style.height,
    };
  });

  return {
    x: parsePixelValue(inlineStyle.left, 'left'),
    y: parsePixelValue(inlineStyle.top, 'top'),
    width: parsePixelValue(inlineStyle.width, 'width'),
    height: parsePixelValue(inlineStyle.height, 'height'),
  };
};

export const expectNoPreviewFrame = async (page: Page): Promise<void> => {
  const previewLocator = page.getByTestId(WINDOW_PREVIEW_FRAME_TEST_ID);
  await expect(previewLocator).toHaveCount(0);
};
