import { expect, test } from '@playwright/test';
import { gotoCommonControlsFixture, readCommonControlsRadioValue } from './common-controls.helpers';

test('default fixture exposes baseline controls state', async ({ page }) => {
  await gotoCommonControlsFixture(page, 'default');

  await expect(page.getByTestId('button-demo-primary')).toBeVisible();
  await expect(readCommonControlsRadioValue(page)).resolves.toBe('apple');
  await expect(page.getByTestId('select-demo-size')).toHaveValue('medium');
});

test('disabled fixture exposes disabled controls state', async ({ page }) => {
  await gotoCommonControlsFixture(page, 'disabled');

  await expect(page.getByTestId('button-demo-primary')).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'Orange' })).toBeDisabled();
  await expect(page.getByTestId('select-demo-size')).toBeDisabled();
});

test('unknown fixture shows explicit error', async ({ page }) => {
  await gotoCommonControlsFixture(page, 'unknown-mode');

  const error = page.getByTestId('fixture-error');

  await expect(error).toBeVisible();
  await expect(error).toContainText('Unknown fixture:');
});
