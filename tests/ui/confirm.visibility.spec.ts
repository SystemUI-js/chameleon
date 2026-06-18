import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVIDENCE_PATH = resolve(HERE, '../../.omo/evidence/task-2-confirm-visible.png');

mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });

test.describe('CConfirm visibility regression (Task 2 evidence)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
  });

  test('imperative confirm() renders body and actions with measurable nonzero height', async ({
    page,
  }) => {
    const section = page.getByTestId('catalog-section-confirm');
    await section.scrollIntoViewIfNeeded();

    await page.getByTestId('confirm-demo-imperative-open').click();

    const confirmRoot = page.locator('.cm-confirm');
    await expect(confirmRoot).toBeVisible();

    const frame = confirmRoot.locator('[data-testid="window-frame"]');
    const body = confirmRoot.locator('.cm-confirm__body');
    const actions = confirmRoot.locator('.cm-confirm__actions');

    await expect(frame).toBeVisible();
    await expect(body).toBeVisible();
    await expect(actions).toBeVisible();
    await expect(body).toHaveText('Are you sure you want to delete this item?');

    const frameBox = await frame.boundingBox();
    const bodyBox = await body.boundingBox();
    const actionsBox = await actions.boundingBox();

    expect(frameBox).not.toBeNull();
    expect(bodyBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();

    expect(frameBox!.height).toBeGreaterThan(60);
    expect(bodyBox!.height).toBeGreaterThan(20);
    expect(actionsBox!.height).toBeGreaterThan(20);

    await page.screenshot({ path: EVIDENCE_PATH, fullPage: false });

    await confirmRoot.locator('.cm-confirm__cancel').click();
    await expect(confirmRoot).toHaveCount(0);
  });

  test('declarative <CConfirm> renders body and actions with measurable nonzero height', async ({
    page,
  }) => {
    const section = page.getByTestId('catalog-section-confirm');
    await section.scrollIntoViewIfNeeded();

    await page.getByTestId('confirm-demo-inline-open').click();

    const confirmRoot = page.getByTestId('confirm-demo-inline');
    await expect(confirmRoot).toBeVisible();

    const frame = confirmRoot.locator('[data-testid="window-frame"]');
    const body = confirmRoot.locator('.cm-confirm__body');
    const actions = confirmRoot.locator('.cm-confirm__actions');

    await expect(body).toHaveText('Click OK or Cancel to dismiss.');

    const frameBox = await frame.boundingBox();
    const bodyBox = await body.boundingBox();
    const actionsBox = await actions.boundingBox();

    expect(frameBox!.height).toBeGreaterThan(60);
    expect(bodyBox!.height).toBeGreaterThan(20);
    expect(actionsBox!.height).toBeGreaterThan(20);

    await confirmRoot.locator('.cm-confirm__ok').click();
  });
});
