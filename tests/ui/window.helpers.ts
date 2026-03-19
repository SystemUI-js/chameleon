import type { Locator, Page } from '@playwright/test';

export type FrameMetrics = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const WINDOW_FRAME_TEST_ID = 'window-frame';
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

export const gotoWindowFixture = async (page: Page, fixture: string): Promise<void> => {
  await page.goto(`/playwright-window.html?fixture=${encodeURIComponent(fixture)}`);
  await page.waitForFunction(
    ({ frameTestId, titleTestId, contentTestId, resizeTestIdPrefix, fixtureErrorTestId }) => {
      const frame = document.querySelector(`[data-testid="${frameTestId}"]`);
      const title = document.querySelector(`[data-testid="${titleTestId}"]`);
      const content = document.querySelector(`[data-testid="${contentTestId}"]`);
      const resizeHandle = document.querySelector(`[data-testid^="${resizeTestIdPrefix}"]`);
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);

      return Boolean(
        (frame && title) || (frame && content) || (frame && resizeHandle) || fixtureError,
      );
    },
    {
      frameTestId: WINDOW_FRAME_TEST_ID,
      titleTestId: WINDOW_TITLE_TEST_ID,
      contentTestId: WINDOW_CONTENT_TEST_ID,
      resizeTestIdPrefix: WINDOW_RESIZE_TEST_ID_PREFIX,
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
    },
  );
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

export const dragLocatorBy = async (locator: Locator, dx: number, dy: number): Promise<void> => {
  await locator.scrollIntoViewIfNeeded();

  const box = await locator.boundingBox();

  if (box === null) {
    throw new Error('Cannot drag a locator without a visible bounding box.');
  }

  const page = locator.page();
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endX = startX + dx;
  const endY = startY + dy;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 4);

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps });
  await page.mouse.up();
};
