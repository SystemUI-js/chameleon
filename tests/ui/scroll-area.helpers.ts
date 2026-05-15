import type { Page } from '@playwright/test';
import type { DevThemeId } from '@/dev/themeSwitcher';

const PLAYWRIGHT_SCROLL_AREA_PATH = '/playwright-scroll-area.html';

// Stable test ids for ScrollArea harness
const SCROLL_AREA_HOST_TEST_ID = 'scroll-area-host';
const SCROLL_AREA_VIEWPORT_TEST_ID = 'scroll-area-viewport';
const SCROLL_AREA_SCROLLBAR_VERTICAL_TEST_ID = 'scroll-area-scrollbar-vertical';
const SCROLL_AREA_SCROLLBAR_VERTICAL_DECREMENT_TEST_ID = 'scroll-area-scrollbar-vertical-decrement';
const SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID = 'scroll-area-scrollbar-vertical-thumb';
const SCROLL_AREA_SCROLLBAR_VERTICAL_INCREMENT_TEST_ID = 'scroll-area-scrollbar-vertical-increment';
const SCROLL_AREA_SCROLLBAR_HORIZONTAL_TEST_ID = 'scroll-area-scrollbar-horizontal';
const SCROLL_AREA_SCROLLBAR_HORIZONTAL_DECREMENT_TEST_ID =
  'scroll-area-scrollbar-horizontal-decrement';
const SCROLL_AREA_SCROLLBAR_HORIZONTAL_THUMB_TEST_ID = 'scroll-area-scrollbar-horizontal-thumb';
const SCROLL_AREA_SCROLLBAR_HORIZONTAL_INCREMENT_TEST_ID =
  'scroll-area-scrollbar-horizontal-increment';
const SCROLL_AREA_SCROLLBAR_CORNER_TEST_ID = 'scroll-area-scrollbar-corner';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

export type ScrollAreaHarnessSelection = {
  theme: DevThemeId;
  fixture?: string;
};

const waitForScrollAreaHarness = async (
  page: Page,
  options: { allowFixtureError?: boolean } = {},
): Promise<void> => {
  // Collect console errors during page load
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  const result = await page.waitForFunction(
    ({ hostTestId, viewportTestId, fixtureErrorTestId }) => {
      const host = document.querySelector(`[data-testid="${hostTestId}"]`);
      const viewport = document.querySelector(`[data-testid="${viewportTestId}"]`);
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);

      if (host && viewport) return 'harness-ready';
      if (fixtureError) return `fixture-error:${fixtureError.textContent}`;
      return null;
    },
    {
      hostTestId: SCROLL_AREA_HOST_TEST_ID,
      viewportTestId: SCROLL_AREA_VIEWPORT_TEST_ID,
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
    },
    { polling: 'raf', timeout: 30_000 },
  );

  const resultValue = await result.jsonValue();

  if (resultValue === 'harness-ready') {
    return;
  }

  if (typeof resultValue === 'string' && resultValue.startsWith('fixture-error:')) {
    if (!options.allowFixtureError) {
      throw new Error(`ScrollArea harness rendered fixture error: ${resultValue.slice(14)}`);
    }
    return;
  }

  const pageHtml = await page.content().catch(() => '<failed to read page content>');
  throw new Error(
    [
      'ScrollArea harness did not render expected elements.',
      `Console errors: ${consoleErrors.length > 0 ? JSON.stringify(consoleErrors) : 'none'}`,
      `Page body HTML: ${pageHtml}`,
    ].join('\n'),
  );
};

export const gotoScrollAreaFixture = async (
  page: Page,
  fixture: string,
  options: { allowFixtureError?: boolean } = {},
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_SCROLL_AREA_PATH}?${searchParams.toString()}`);
  await waitForScrollAreaHarness(page, options);
};

export const gotoThemedScrollAreaFixture = async (
  page: Page,
  selection: ScrollAreaHarnessSelection,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: selection.theme,
  });

  if (selection.fixture !== undefined) {
    searchParams.set('fixture', selection.fixture);
  }

  await page.goto(`${PLAYWRIGHT_SCROLL_AREA_PATH}?${searchParams.toString()}`);
  await waitForScrollAreaHarness(page);
};

export const gotoVerticalOverflow = async (page: Page): Promise<void> => {
  await gotoScrollAreaFixture(page, 'vertical');
};

export const gotoHorizontalOverflow = async (page: Page): Promise<void> => {
  await gotoScrollAreaFixture(page, 'horizontal');
};

export const gotoBothAxesOverflow = async (page: Page): Promise<void> => {
  await gotoScrollAreaFixture(page, 'both');
};

export const gotoShrinkingContent = async (page: Page): Promise<void> => {
  await gotoScrollAreaFixture(page, 'shrink');
};

export type ViewportScrollPosition = {
  scrollTop: number;
  scrollLeft: number;
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
};

export const readViewportScrollPosition = async (page: Page): Promise<ViewportScrollPosition> => {
  return page.getByTestId(SCROLL_AREA_VIEWPORT_TEST_ID).evaluate((element) => {
    const viewport = element as HTMLElement;
    return {
      scrollTop: viewport.scrollTop,
      scrollLeft: viewport.scrollLeft,
      scrollWidth: viewport.scrollWidth,
      scrollHeight: viewport.scrollHeight,
      clientWidth: viewport.clientWidth,
      clientHeight: viewport.clientHeight,
    };
  });
};

export type ThumbGeometry = {
  offsetTop: number;
  offsetLeft: number;
  offsetWidth: number;
  offsetHeight: number;
};

export const readVerticalThumbGeometry = async (page: Page): Promise<ThumbGeometry> => {
  return page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID).evaluate((element) => {
    const thumb = element as HTMLElement;
    return {
      offsetTop: thumb.offsetTop,
      offsetLeft: thumb.offsetLeft,
      offsetWidth: thumb.offsetWidth,
      offsetHeight: thumb.offsetHeight,
    };
  });
};

export const readHorizontalThumbGeometry = async (page: Page): Promise<ThumbGeometry> => {
  return page.getByTestId(SCROLL_AREA_SCROLLBAR_HORIZONTAL_THUMB_TEST_ID).evaluate((element) => {
    const thumb = element as HTMLElement;
    return {
      offsetTop: thumb.offsetTop,
      offsetLeft: thumb.offsetLeft,
      offsetWidth: thumb.offsetWidth,
      offsetHeight: thumb.offsetHeight,
    };
  });
};

export {
  FIXTURE_ERROR_TEST_ID,
  SCROLL_AREA_HOST_TEST_ID,
  SCROLL_AREA_SCROLLBAR_CORNER_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_DECREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_INCREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_THUMB_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_DECREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_INCREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID,
  SCROLL_AREA_VIEWPORT_TEST_ID,
};
