import { expect, test } from '@playwright/test';

test('Show/Hide code toggles code region visibility in Button showcase', async ({ page }) => {
  await page.goto('/');

  // Independence assertion: Window section code region should be hidden before any interaction
  const windowCodeRegion = page.locator('#catalog-section-window-code-region');
  await expect(windowCodeRegion).toBeHidden();

  // Target Button Showcase section
  const buttonSection = page.getByTestId('catalog-section-button');
  await expect(buttonSection).toBeVisible();

  // Verify code region is initially hidden
  const buttonCodeRegion = page.locator('#catalog-section-button-code-region');
  await expect(buttonCodeRegion).toBeHidden();

  // Click "Show code" button within Button section
  const showCodeButton = buttonSection.getByRole('button', { name: 'Show code' });
  await showCodeButton.click();

  // Verify code region is now visible and contains representative snippet text
  await expect(buttonCodeRegion).toBeVisible();
  await expect(buttonCodeRegion).toContainText('CButton');

  // Click "Hide code" button
  const hideCodeButton = buttonSection.getByRole('button', { name: 'Hide code' });
  await hideCodeButton.click();

  // Verify code region is hidden again
  await expect(buttonCodeRegion).toBeHidden();
});
