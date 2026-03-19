import { expect, test } from '@playwright/test';
import { dragLocatorBy, gotoWindowFixture, readFrameMetrics } from './window.helpers';

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type Case = {
  dir: ResizeDir;
  label: ResizeDir;
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
  { dir: 'e', label: 'e', dx: +20, dy: 0, expected: { x: 10, y: 20, width: 260, height: 160 } },
  { dir: 'w', label: 'w', dx: -20, dy: 0, expected: { x: -10, y: 20, width: 260, height: 160 } },
  { dir: 'n', label: 'n', dx: 0, dy: -10, expected: { x: 10, y: 10, width: 240, height: 170 } },
  { dir: 's', label: 's', dx: 0, dy: +10, expected: { x: 10, y: 20, width: 240, height: 170 } },
  { dir: 'ne', label: 'ne', dx: +20, dy: -10, expected: { x: 10, y: 10, width: 260, height: 170 } },
  {
    dir: 'nw',
    label: 'nw',
    dx: -20,
    dy: -10,
    expected: { x: -10, y: 10, width: 260, height: 170 },
  },
  { dir: 'se', label: 'se', dx: +20, dy: +10, expected: { x: 10, y: 20, width: 260, height: 170 } },
  {
    dir: 'sw',
    label: 'sw',
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
      await dragLocatorBy(handle, c.dx, c.dy);
      const actual = await readFrameMetrics(page);
      expect(actual.x).toBe(c.expected.x);
      expect(actual.y).toBe(c.expected.y);
      expect(actual.width).toBe(c.expected.width);
      expect(actual.height).toBe(c.expected.height);
    });
  }
});
