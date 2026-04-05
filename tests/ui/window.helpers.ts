import { spawn, type ChildProcess } from 'node:child_process';
import { join } from 'node:path';
import process from 'node:process';
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
const DEDICATED_WINDOW_HARNESS_PORT_CANDIDATES = [5674, 5675, 5676, 5677, 5678, 5679, 5680];
const WINDOW_FRAME_TEST_ID = 'window-frame';
const WINDOW_PREVIEW_FRAME_TEST_ID = 'window-preview-frame';
const WINDOW_TITLE_TEST_ID = 'window-title';
const WINDOW_CONTENT_TEST_ID = 'window-content';
const WINDOW_RESIZE_TEST_ID_PREFIX = 'window-resize-';
const ICON_CONTAINER_TEST_ID = 'icon-container';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

const parsePixelValue = (value: string, property: string): number => {
  const parsed = Number.parseFloat(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Expected ${property} to be a pixel value, received: ${value}`);
  }

  return parsed;
};

const dedicatedWindowHarnessServers = new Map<number, ChildProcess>();

const delay = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

const hasRequiredIconContainerFixture = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}/src/dev/playwright/windowHarness.tsx`);

    if (!response.ok) {
      return false;
    }

    const source = await response.text();
    return source.includes('icon-container') && source.includes('CIconContainer');
  } catch {
    return false;
  }
};

const hasAnyWindowHarnessResponse = async (baseUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(`${baseUrl}${PLAYWRIGHT_WINDOW_PATH}`);
    return response.ok;
  } catch {
    return false;
  }
};

const waitForDedicatedWindowHarness = async (baseUrl: string, timeoutMs = 20000): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (await hasRequiredIconContainerFixture(baseUrl)) {
      return;
    }

    await delay(200);
  }

  throw new Error(`Timed out waiting for current worktree Playwright harness at ${baseUrl}.`);
};

export const ensureDedicatedWindowHarnessServer = async (): Promise<string> => {
  for (const port of DEDICATED_WINDOW_HARNESS_PORT_CANDIDATES) {
    const baseUrl = `http://127.0.0.1:${port}`;

    if (await hasRequiredIconContainerFixture(baseUrl)) {
      return baseUrl;
    }

    if (await hasAnyWindowHarnessResponse(baseUrl)) {
      continue;
    }

    const existingProcess = dedicatedWindowHarnessServers.get(port);

    if (!existingProcess || existingProcess.killed) {
      const viteBinaryPath = join(process.cwd(), 'node_modules', '.bin', 'vite');
      const childProcess = spawn(viteBinaryPath, ['--port', String(port), '--host', '127.0.0.1'], {
        cwd: process.cwd(),
        stdio: 'ignore',
      });

      dedicatedWindowHarnessServers.set(port, childProcess);
    }

    await waitForDedicatedWindowHarness(baseUrl);
    return baseUrl;
  }

  throw new Error('Could not find or start a dedicated current-worktree Playwright harness port.');
};

export const stopDedicatedWindowHarnessServer = (): void => {
  for (const [port, childProcess] of dedicatedWindowHarnessServers.entries()) {
    if (!childProcess.killed) {
      childProcess.kill('SIGTERM');
    }

    dedicatedWindowHarnessServers.delete(port);
  }
};

const waitForWindowHarness = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    ({
      frameTestId,
      titleTestId,
      contentTestId,
      resizeTestIdPrefix,
      iconContainerTestId,
      fixtureErrorTestId,
    }) => {
      const frame = document.querySelector(`[data-testid="${frameTestId}"]`);
      const title = document.querySelector(`[data-testid="${titleTestId}"]`);
      const content = document.querySelector(`[data-testid="${contentTestId}"]`);
      const resizeHandle = document.querySelector(`[data-testid^="${resizeTestIdPrefix}"]`);
      const iconContainer = document.querySelector(`[data-testid="${iconContainerTestId}"]`);
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);

      return Boolean(
        (frame && title) ||
          (frame && content) ||
          (frame && resizeHandle) ||
          iconContainer ||
          fixtureError,
      );
    },
    {
      frameTestId: WINDOW_FRAME_TEST_ID,
      titleTestId: WINDOW_TITLE_TEST_ID,
      contentTestId: WINDOW_CONTENT_TEST_ID,
      resizeTestIdPrefix: WINDOW_RESIZE_TEST_ID_PREFIX,
      iconContainerTestId: ICON_CONTAINER_TEST_ID,
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
    },
  );
};

export const gotoWindowFixture = async (page: Page, fixture: string): Promise<void> => {
  await gotoWindowFixtureAtBaseUrl(page, PLAYWRIGHT_WINDOW_PATH, fixture, 'http://127.0.0.1:5673');
};

export const gotoWindowFixtureAtBaseUrl = async (
  page: Page,
  path: string,
  fixture: string,
  baseUrl: string,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${baseUrl}${path}?${searchParams.toString()}`);
  await waitForWindowHarness(page);
};

export type WindowHarnessSelection = {
  theme: DevThemeId;
  fixture?: string;
};

export const gotoThemedWindowFixture = async (
  page: Page,
  selection: WindowHarnessSelection,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: selection.theme,
  });

  if (selection.fixture !== undefined) {
    searchParams.set('fixture', selection.fixture);
  }

  await page.goto(`${PLAYWRIGHT_WINDOW_PATH}?${searchParams.toString()}`);
  await waitForWindowHarness(page);
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
