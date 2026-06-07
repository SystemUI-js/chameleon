import { expect, test } from '@playwright/test';

test.describe('new component showcases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Input section is visible and interacts', async ({ page }) => {
    const section = page.getByTestId('catalog-section-input');
    await expect(section).toBeVisible();

    const input = page.getByTestId('input-demo');
    await expect(input).toBeVisible();

    await input.fill('hello');
    await expect(page.getByText('Value: hello')).toBeVisible();

    await page.getByTestId('input-demo-clear').click();
    await expect(page.getByText('Value: (empty)')).toBeVisible();

    await expect(page.getByTestId('input-demo-disabled')).toBeDisabled();
  });

  test('Tooltip section is visible and shows on hover', async ({ page }) => {
    const section = page.getByTestId('catalog-section-tooltip');
    await expect(section).toBeVisible();

    const tooltip = page.getByTestId('tooltip-demo-hover');
    await expect(tooltip).toBeVisible();

    const overlay = tooltip.locator('.cm-tooltip__overlay');
    await expect(overlay).toHaveClass(/cm-tooltip__overlay--hidden/);

    await tooltip.hover();
    await expect(overlay).toHaveClass(/cm-tooltip__overlay--visible/);
    await expect(overlay).toContainText('Hover tooltip');
  });

  test('TimePicker section is visible and changes time', async ({ page }) => {
    const section = page.getByTestId('catalog-section-time-picker');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const input = page.getByTestId('time-picker-demo__input');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('09:30');

    await input.click();

    const panel = page.getByTestId('time-picker-demo__panel');
    await expect(panel).toBeVisible();

    const hourOption = page.getByTestId('time-picker-demo__hour-option-14');
    await expect(hourOption).toBeVisible();
    await hourOption.click();

    await expect(input).toHaveValue('14:30');
    await expect(
      section.locator('.cm-catalog__value').filter({ hasText: 'Selected time:' }),
    ).toHaveText('Selected time: 14:30');

    await expect(page.getByTestId('time-picker-demo-disabled__input')).toBeDisabled();
  });

  test('Tree section is visible and checks nodes', async ({ page }) => {
    const section = page.getByTestId('catalog-section-tree');
    await expect(section).toBeVisible();

    const tree = page.getByTestId('tree-demo');
    await expect(tree).toBeVisible();

    const checkbox = tree.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();

    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await expect(page.locator('.cm-catalog__value').filter({ hasText: 'Checked:' })).toContainText(
      'root-1',
    );
  });

  test('Transfer section is visible and moves items', async ({ page }) => {
    const section = page.getByTestId('catalog-section-transfer');
    await expect(section).toBeVisible();

    const transfer = page.getByTestId('transfer-demo');
    await expect(transfer).toBeVisible();

    const sourcePanel = transfer.locator('.cm-transfer__panel--left');
    const firstItem = sourcePanel.locator('.cm-transfer__item-button').first();
    await expect(firstItem).toBeVisible();
    await firstItem.click();

    const moveRight = transfer.getByRole('button', { name: 'Move selected to target' });
    await moveRight.click();

    await expect(page.getByText(/Target keys:/)).not.toContainText('none');
  });

  test('Table section is visible and paginates', async ({ page }) => {
    const section = page.getByTestId('catalog-section-table');
    await expect(section).toBeVisible();

    const table = page.getByTestId('table-demo');
    await expect(table).toBeVisible();

    await expect(table.locator('tbody tr')).toHaveCount(4);

    const nextButton = table.getByRole('button', { name: 'Next' });
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(table.locator('tbody tr')).toHaveCount(2);
    await expect(table.getByText('Page 2 of 2')).toBeVisible();
  });

  test('DatePicker section opens panel, selects a cell, and clears value', async ({ page }) => {
    const section = page.getByTestId('catalog-section-date-picker');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const input = page.getByTestId('date-picker-demo__input');
    await expect(input).toBeVisible();
    await expect(input).toHaveValue('2026-01-15');

    await input.click();

    const panel = page.getByTestId('date-picker-demo__panel');
    await expect(panel).toBeVisible();

    const targetCell = page.getByTestId('date-picker-demo__cell-2026-01-20');
    await expect(targetCell).toBeVisible();
    await targetCell.click();

    await expect(panel).toBeHidden();
    await expect(input).toHaveValue('2026-01-20');
    await expect(section.locator('[data-testid="date-picker-demo-value"]')).toHaveText(
      'Selected date: 2026-01-20',
    );

    const clearButton = page.getByTestId('date-picker-demo__clear');
    await clearButton.click();
    await expect(input).toHaveValue('');
    await expect(section.locator('[data-testid="date-picker-demo-value"]')).toHaveText(
      'Selected date: (empty)',
    );
  });

  test('Modal section opens and closes via ESC, mask, and close button', async ({ page }) => {
    const section = page.getByTestId('catalog-section-modal');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const openButton = page.getByTestId('modal-demo-open');
    const modal = page.getByTestId('modal-demo');

    await openButton.click();
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('modal-demo__mask')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).toHaveCount(0);

    await openButton.click();
    await expect(modal).toBeVisible();
    await page.getByTestId('modal-demo__mask').click({ position: { x: 5, y: 5 } });
    await expect(modal).toHaveCount(0);

    await openButton.click();
    await expect(modal).toBeVisible();
    await page.getByTestId('modal-demo__close').click();
    await expect(modal).toHaveCount(0);
  });

  test('Confirm section: imperative confirm() resolves true on OK and false on Cancel/ESC', async ({
    page,
  }) => {
    const section = page.getByTestId('catalog-section-confirm');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();

    const trigger = page.getByTestId('confirm-demo-imperative-open');
    const resultLine = section.locator('[data-testid="confirm-demo-imperative-result"]');

    await expect(resultLine).toHaveText('Imperative result: none');

    await trigger.click();
    const confirmRoot = page.locator('.cm-confirm');
    await expect(confirmRoot).toBeVisible();
    await confirmRoot.locator('.cm-confirm__ok').click();
    await expect(resultLine).toHaveText('Imperative result: true');
    await expect(confirmRoot).toHaveCount(0);

    await trigger.click();
    await expect(confirmRoot).toBeVisible();
    await confirmRoot.locator('.cm-confirm__cancel').click();
    await expect(resultLine).toHaveText('Imperative result: false');
    await expect(confirmRoot).toHaveCount(0);

    await trigger.click();
    await expect(confirmRoot).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(resultLine).toHaveText('Imperative result: false');
    await expect(confirmRoot).toHaveCount(0);
  });
});
