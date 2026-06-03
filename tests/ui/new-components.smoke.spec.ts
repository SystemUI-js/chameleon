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
    await expect(section).toBeVisible();

    const hourSelect = page.getByTestId('time-picker-demo__hour');
    await expect(hourSelect).toBeVisible();

    await hourSelect.selectOption('14');
    await expect(page.getByText('Selected time: 14:30')).toBeVisible();

    await expect(page.getByTestId('time-picker-demo-disabled__hour')).toBeDisabled();
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
});
