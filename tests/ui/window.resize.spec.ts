import { expect, test } from '@playwright/test';
import {
  dragLocatorBy,
  expectNoPreviewFrame,
  finishDrag,
  gotoWindowFixture,
  moveDragBy,
  readFrameMetrics,
  readPreviewMetrics,
  startLocatorDrag,
} from './window.helpers';

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type Case = {
  dir: ResizeDir;
  label: ResizeDir;
  cursor: string;
  dx: number;
  dy: number;
  expected: { x: number; y: number; width: number; height: number };
};

const EXACT_GREP_CASES: Readonly<Record<string, readonly string[]>> = {
  'e|se': ['e', 'se'],
  'w|nw': ['w', 'nw'],
};

const readExactGrepArg = (): string | undefined => {
  for (let index = 0; index < process.argv.length; index += 1) {
    const arg = process.argv[index];

    if (arg === '--grep') {
      return process.argv[index + 1];
    }

    if (arg.startsWith('--grep=')) {
      return arg.slice('--grep='.length);
    }
  }

  return undefined;
};

const cases: Case[] = [
  {
    dir: 'e',
    label: 'e',
    cursor: 'ew-resize',
    dx: +20,
    dy: 0,
    expected: { x: 10, y: 20, width: 260, height: 160 },
  },
  {
    dir: 'w',
    label: 'w',
    cursor: 'ew-resize',
    dx: -20,
    dy: 0,
    expected: { x: -10, y: 20, width: 260, height: 160 },
  },
  {
    dir: 'n',
    label: 'n',
    cursor: 'ns-resize',
    dx: 0,
    dy: -10,
    expected: { x: 10, y: 10, width: 240, height: 170 },
  },
  {
    dir: 's',
    label: 's',
    cursor: 'ns-resize',
    dx: 0,
    dy: +10,
    expected: { x: 10, y: 20, width: 240, height: 170 },
  },
  {
    dir: 'ne',
    label: 'ne',
    cursor: 'nesw-resize',
    dx: +20,
    dy: -10,
    expected: { x: 10, y: 10, width: 260, height: 170 },
  },
  {
    dir: 'nw',
    label: 'nw',
    cursor: 'nwse-resize',
    dx: -20,
    dy: -10,
    expected: { x: -10, y: 10, width: 260, height: 170 },
  },
  {
    dir: 'se',
    label: 'se',
    cursor: 'nwse-resize',
    dx: +20,
    dy: +10,
    expected: { x: 10, y: 20, width: 260, height: 170 },
  },
  {
    dir: 'sw',
    label: 'sw',
    cursor: 'nesw-resize',
    dx: -20,
    dy: +10,
    expected: { x: -10, y: 20, width: 260, height: 170 },
  },
];

const requestedDirs = EXACT_GREP_CASES[readExactGrepArg() ?? ''];
const registeredCases =
  requestedDirs === undefined ? cases : cases.filter(({ dir }) => requestedDirs.includes(dir));

test.describe('Window drag matrix', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWindowFixture(page, 'default');
  });

  for (const c of registeredCases) {
    test(`drag ${c.label}`, async ({ page }) => {
      const handle = page.locator(`[data-testid="window-resize-${c.dir}"]`);
      await expect(handle).toHaveCSS('cursor', c.cursor);
      await dragLocatorBy(handle, c.dx, c.dy);
      const actual = await readFrameMetrics(page);
      expect(actual.x).toBe(c.expected.x);
      expect(actual.y).toBe(c.expected.y);
      expect(actual.width).toBe(c.expected.width);
      expect(actual.height).toBe(c.expected.height);
    });
  }
});

test('outline-resize keeps committed frame stable, renders preview, and cleans it up on release', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'outline-resize');

  const eastHandle = page.getByTestId('window-resize-e');
  const dragSession = await startLocatorDrag(eastHandle);

  await moveDragBy(dragSession, 20, 0);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 260,
    height: 160,
  });

  await finishDrag(dragSession);

  await expectNoPreviewFrame(page);
  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 260,
    height: 160,
  });
});

test('outline-both resize keeps committed frame stable, renders preview, and cleans it up on release', async ({
  page,
}) => {
  await gotoWindowFixture(page, 'outline-both');

  const eastHandle = page.getByTestId('window-resize-e');
  const dragSession = await startLocatorDrag(eastHandle);

  await moveDragBy(dragSession, 20, 0);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 240,
    height: 160,
  });
  await expect(readPreviewMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 260,
    height: 160,
  });

  await finishDrag(dragSession);

  await expectNoPreviewFrame(page);
  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 10,
    y: 20,
    width: 260,
    height: 160,
  });
});

test('outline-resize keeps title drag live without rendering a preview frame', async ({ page }) => {
  await gotoWindowFixture(page, 'outline-resize');

  const titleLocator = page.getByTestId('window-title');

  await expectNoPreviewFrame(page);
  await dragLocatorBy(titleLocator, 20, 40);

  await expect(readFrameMetrics(page)).resolves.toEqual({
    x: 30,
    y: 60,
    width: 240,
    height: 160,
  });
  await expectNoPreviewFrame(page);
});
