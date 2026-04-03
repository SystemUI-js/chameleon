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

test('Show/Hide code toggles code region visibility in Theme showcase', async ({ page }) => {
  await page.goto('/');

  // Theme section code region should be hidden before any interaction
  const themeCodeRegion = page.locator('#catalog-section-theme-code-region');
  await expect(themeCodeRegion).toBeHidden();

  // Target Theme Showcase section
  const themeSection = page.getByTestId('catalog-section-theme');
  await expect(themeSection).toBeVisible();

  // Verify code region is initially hidden
  await expect(themeCodeRegion).toBeHidden();

  // Click "Show code" button within Theme section
  const showCodeButton = themeSection.getByRole('button', { name: 'Show code' });
  await showCodeButton.click();

  // Verify code region is now visible and contains representative snippet text
  await expect(themeCodeRegion).toBeVisible();
  await expect(themeCodeRegion).toContainText('cm-theme--win98');

  // Verify code region does NOT contain nesting hint text
  await expect(themeCodeRegion).not.toContainText('Inner wins');
  await expect(themeCodeRegion).not.toContainText('nearest nested provider wins');

  // Click "Hide code" button
  const hideCodeButton = themeSection.getByRole('button', { name: 'Hide code' });
  await hideCodeButton.click();

  // Verify code region is hidden again
  await expect(themeCodeRegion).toBeHidden();
});
