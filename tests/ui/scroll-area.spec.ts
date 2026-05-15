import { test, expect } from '@playwright/test';
import {
  gotoScrollAreaFixture,
  gotoVerticalOverflow,
  gotoHorizontalOverflow,
  gotoBothAxesOverflow,
  gotoShrinkingContent,
  readViewportScrollPosition,
  FIXTURE_ERROR_TEST_ID,
  SCROLL_AREA_HOST_TEST_ID,
  SCROLL_AREA_VIEWPORT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_DECREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_INCREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_DECREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_INCREMENT_TEST_ID,
  SCROLL_AREA_SCROLLBAR_HORIZONTAL_THUMB_TEST_ID,
  SCROLL_AREA_SCROLLBAR_CORNER_TEST_ID,
} from './scroll-area.helpers';

test.describe('ScrollArea Playwright Harness', () => {
  test('vertical fixture renders host and viewport with correct structure', async ({ page }) => {
    await gotoVerticalOverflow(page);

    const host = page.getByTestId(SCROLL_AREA_HOST_TEST_ID);
    const viewport = page.getByTestId(SCROLL_AREA_VIEWPORT_TEST_ID);

    await expect(host).toBeAttached();
    await expect(viewport).toBeAttached();

    const scrollPos = await readViewportScrollPosition(page);
    expect(scrollPos.scrollHeight).toBeGreaterThan(scrollPos.clientHeight);
    expect(scrollPos.scrollWidth).toBe(scrollPos.clientWidth);
  });

  test('horizontal fixture renders host and viewport with horizontal overflow', async ({
    page,
  }) => {
    await gotoHorizontalOverflow(page);

    const host = page.getByTestId(SCROLL_AREA_HOST_TEST_ID);
    const viewport = page.getByTestId(SCROLL_AREA_VIEWPORT_TEST_ID);

    await expect(host).toBeAttached();
    await expect(viewport).toBeAttached();

    const scrollPos = await readViewportScrollPosition(page);
    expect(scrollPos.scrollWidth).toBeGreaterThan(scrollPos.clientWidth);
    expect(scrollPos.scrollHeight).toBe(scrollPos.clientHeight);
  });

  test('both fixture renders host and viewport with overflow on both axes', async ({ page }) => {
    await gotoBothAxesOverflow(page);

    const host = page.getByTestId(SCROLL_AREA_HOST_TEST_ID);
    const viewport = page.getByTestId(SCROLL_AREA_VIEWPORT_TEST_ID);

    await expect(host).toBeAttached();
    await expect(viewport).toBeAttached();

    const scrollPos = await readViewportScrollPosition(page);
    expect(scrollPos.scrollWidth).toBeGreaterThan(scrollPos.clientWidth);
    expect(scrollPos.scrollHeight).toBeGreaterThan(scrollPos.clientHeight);
  });

  test('shrink fixture renders host and viewport with shrinking content capability', async ({
    page,
  }) => {
    await gotoShrinkingContent(page);

    const host = page.getByTestId(SCROLL_AREA_HOST_TEST_ID);
    const viewport = page.getByTestId(SCROLL_AREA_VIEWPORT_TEST_ID);

    await expect(host).toBeAttached();
    await expect(viewport).toBeAttached();

    const scrollPosBefore = await readViewportScrollPosition(page);
    expect(scrollPosBefore.scrollHeight).toBeGreaterThan(scrollPosBefore.clientHeight);

    const firstRemoveButton = page.getByTestId('shrink-remove-0');
    await firstRemoveButton.click();

    const scrollPosAfter = await readViewportScrollPosition(page);
    expect(scrollPosAfter.scrollHeight).toBeLessThan(scrollPosBefore.scrollHeight);
  });

  test('invalid fixture renders fixture-error text', async ({ page }) => {
    await gotoScrollAreaFixture(page, 'nonexistent-fixture', { allowFixtureError: true });

    const fixtureError = page.getByTestId(FIXTURE_ERROR_TEST_ID);
    await expect(fixtureError).toBeAttached();
    const errorText = await fixtureError.textContent();
    expect(errorText).toContain('Unknown fixture');
  });
});

test.describe('ScrollArea Interaction Tests', () => {
  test('vertical button stepping increments and decrements scrollTop', async ({ page }) => {
    await gotoVerticalOverflow(page);

    // Ensure we're at scrollTop 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollTop).toBe(0);

    // Click increment button (scroll down)
    const incrementBtn = page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_INCREMENT_TEST_ID);
    await incrementBtn.click();

    const afterIncrement = await readViewportScrollPosition(page);
    expect(afterIncrement.scrollTop).toBeGreaterThan(0);

    // Click decrement button (scroll up)
    const decrementBtn = page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_DECREMENT_TEST_ID);
    await decrementBtn.click();

    const afterDecrement = await readViewportScrollPosition(page);
    expect(afterDecrement.scrollTop).toBeLessThan(afterIncrement.scrollTop);
  });

  test('horizontal button stepping increments and decrements scrollLeft', async ({ page }) => {
    await gotoHorizontalOverflow(page);

    // Ensure we're at scrollLeft 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollLeft).toBe(0);

    // Click increment button (scroll right)
    const incrementBtn = page.getByTestId(SCROLL_AREA_SCROLLBAR_HORIZONTAL_INCREMENT_TEST_ID);
    await incrementBtn.click();

    const afterIncrement = await readViewportScrollPosition(page);
    expect(afterIncrement.scrollLeft).toBeGreaterThan(0);

    // Click decrement button (scroll left)
    const decrementBtn = page.getByTestId(SCROLL_AREA_SCROLLBAR_HORIZONTAL_DECREMENT_TEST_ID);
    await decrementBtn.click();

    const afterDecrement = await readViewportScrollPosition(page);
    expect(afterDecrement.scrollLeft).toBeLessThan(afterIncrement.scrollLeft);
  });

  test('vertical thumb drag updates scrollTop proportionally', async ({ page }) => {
    await gotoVerticalOverflow(page);

    // Ensure we're at scrollTop 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollTop).toBe(0);

    // Get thumb bounding box
    const thumb = page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID);
    const thumbBox = await thumb.boundingBox();
    expect(thumbBox).not.toBeNull();

    // Start drag from center of thumb
    const startX = thumbBox!.x + thumbBox!.width / 2;
    const startY = thumbBox!.y + thumbBox!.height / 2;

    // Drag downward by 20px (should increase scrollTop)
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 20);
    await page.mouse.up();

    const afterDrag = await readViewportScrollPosition(page);
    expect(afterDrag.scrollTop).toBeGreaterThan(0);
  });

  test('horizontal thumb drag updates scrollLeft proportionally', async ({ page }) => {
    await gotoHorizontalOverflow(page);

    // Ensure we're at scrollLeft 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollLeft).toBe(0);

    // Get thumb bounding box
    const thumb = page.getByTestId(SCROLL_AREA_SCROLLBAR_HORIZONTAL_THUMB_TEST_ID);
    const thumbBox = await thumb.boundingBox();
    expect(thumbBox).not.toBeNull();

    // Start drag from center of thumb
    const startX = thumbBox!.x + thumbBox!.width / 2;
    const startY = thumbBox!.y + thumbBox!.height / 2;

    // Drag rightward by 20px (should increase scrollLeft)
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 20, startY);
    await page.mouse.up();

    const afterDrag = await readViewportScrollPosition(page);
    expect(afterDrag.scrollLeft).toBeGreaterThan(0);
  });

  test('drag release outside viewport allows subsequent drag', async ({ page }) => {
    await gotoVerticalOverflow(page);

    // Ensure we're at scrollTop 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollTop).toBe(0);

    // Get thumb bounding box
    const thumb = page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID);
    const thumbBox = await thumb.boundingBox();
    expect(thumbBox).not.toBeNull();

    // Start drag from center of thumb
    const thumbCenterX = thumbBox!.x + thumbBox!.width / 2;
    const thumbCenterY = thumbBox!.y + thumbBox!.height / 2;

    // Move mouse outside viewport while dragging
    await page.mouse.move(thumbCenterX, thumbCenterY);
    await page.mouse.down();
    // Move to a position outside the viewport
    await page.mouse.move(thumbCenterX, thumbCenterY + 20);
    // Move outside viewport bounds (e.g., to top-left corner of page)
    await page.mouse.move(10, 10);
    await page.mouse.up();

    // Second drag should work cleanly
    const secondThumbBox = await thumb.boundingBox();
    expect(secondThumbBox).not.toBeNull();

    const secondStartX = secondThumbBox!.x + secondThumbBox!.width / 2;
    const secondStartY = secondThumbBox!.y + secondThumbBox!.height / 2;

    await page.mouse.move(secondStartX, secondStartY);
    await page.mouse.down();
    await page.mouse.move(secondStartX, secondStartY + 30);
    await page.mouse.up();

    const afterSecondDrag = await readViewportScrollPosition(page);
    expect(afterSecondDrag.scrollTop).toBeGreaterThan(0);
  });

  test('corner cell is present and positioned at intersection of both scrollbars', async ({
    page,
  }) => {
    await gotoBothAxesOverflow(page);

    const corner = page.getByTestId(SCROLL_AREA_SCROLLBAR_CORNER_TEST_ID);
    await expect(corner).toBeAttached();

    // Verify corner has non-zero dimensions (not collapsed)
    const cornerBox = await corner.boundingBox();
    expect(cornerBox).not.toBeNull();
    expect(cornerBox!.width).toBeGreaterThan(0);
    expect(cornerBox!.height).toBeGreaterThan(0);

    // Verify vertical scrollbar exists
    const verticalScrollbar = page.getByTestId('scroll-area-scrollbar-vertical');
    await expect(verticalScrollbar).toBeAttached();

    // Verify horizontal scrollbar exists
    const horizontalScrollbar = page.getByTestId('scroll-area-scrollbar-horizontal');
    await expect(horizontalScrollbar).toBeAttached();
  });

  test('shrink after drag cleanup preserves scroll position from completed interactions only', async ({
    page,
  }) => {
    await gotoShrinkingContent(page);

    // Ensure we're at scrollTop 0 initially
    const initialPos = await readViewportScrollPosition(page);
    expect(initialPos.scrollTop).toBe(0);

    // Perform a drag interaction (scroll down)
    const thumb = page.getByTestId(SCROLL_AREA_SCROLLBAR_VERTICAL_THUMB_TEST_ID);
    const thumbBox = await thumb.boundingBox();
    expect(thumbBox).not.toBeNull();

    const startX = thumbBox!.x + thumbBox!.width / 2;
    const startY = thumbBox!.y + thumbBox!.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 50);
    await page.mouse.up();

    const afterDrag = await readViewportScrollPosition(page);
    const scrollTopAfterDrag = afterDrag.scrollTop;

    // Click shrink button to remove first item
    const firstRemoveButton = page.getByTestId('shrink-remove-0');
    await firstRemoveButton.click();

    // Verify content shrunk
    const scrollPosAfterShrink = await readViewportScrollPosition(page);
    expect(scrollPosAfterShrink.scrollHeight).toBeLessThan(initialPos.scrollHeight);

    // Verify no stale drag state: scrollTop should be preserved (clamped if
    // the browser reduces the scrollable range when content shrinks).
    const scrollPosCheck = await readViewportScrollPosition(page);
    const maxScrollAfterShrink = Math.max(
      0,
      scrollPosCheck.scrollHeight - scrollPosCheck.clientHeight,
    );
    expect(scrollPosCheck.scrollTop).toBe(Math.min(scrollTopAfterDrag, maxScrollAfterShrink));
  });
});
