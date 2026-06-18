import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const baseUrl = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5673/';
const evidenceDir = '.omo/evidence';

const screenshots = {
  loading: `${evidenceDir}/f3-real-manual-qa-loading.png`,
  input: `${evidenceDir}/f3-real-manual-qa-input-suggestions.png`,
  splitBefore: `${evidenceDir}/f3-real-manual-qa-splitarea-unlocked.png`,
  splitAfter: `${evidenceDir}/f3-real-manual-qa-splitarea-locked.png`,
  slider: `${evidenceDir}/f3-real-manual-qa-slider.png`,
};

const results = [];
const consoleMessages = [];

function pass(name, details = {}) {
  results.push({ status: 'PASS', name, details });
}

function fail(name, error, details = {}) {
  results.push({
    status: 'FAIL',
    name,
    details: {
      ...details,
      error: error instanceof Error ? error.message : String(error),
    },
  });
}

async function expectVisible(page, testId) {
  const locator = page.getByTestId(testId);
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: 'visible', timeout: 10_000 });
  return locator;
}

async function getFirstPanelWidth(splitArea) {
  const firstPanel = splitArea.locator(':scope > .cm-split-area__panel').first();
  await firstPanel.waitFor({ state: 'visible', timeout: 5_000 });
  const box = await firstPanel.boundingBox();
  if (!box) {
    throw new Error('First split-area panel has no bounding box.');
  }
  return box.width;
}

async function dragLocatorBy(locator, deltaX, deltaY) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Cannot drag locator without a bounding box.');
  }

  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;

  await locator.page().mouse.move(startX, startY);
  await locator.page().mouse.down();
  await locator.page().mouse.move(startX + deltaX, startY + deltaY, { steps: 8 });
  await locator.page().mouse.up();
}

async function run() {
  await mkdir(evidenceDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  page.on('console', (message) => {
    consoleMessages.push({ type: message.type(), text: message.text() });
  });
  page.on('pageerror', (error) => {
    consoleMessages.push({ type: 'pageerror', text: error.message });
  });

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    await expectVisible(page, 'component-catalog');
    pass('Component catalog loads', { url: baseUrl });

    try {
      const loadingSection = await expectVisible(page, 'catalog-section-loading');
      await expectVisible(page, 'loading-demo-spinner');
      await expectVisible(page, 'loading-demo-dots');
      await expectVisible(page, 'loading-demo-bar');
      await loadingSection.screenshot({ path: screenshots.loading });
      pass('CLoading demo shows spinner, dots, and determinate bar', {
        screenshot: screenshots.loading,
      });
    } catch (error) {
      fail('CLoading demo shows spinner, dots, and determinate bar', error);
    }

    try {
      const input = await expectVisible(page, 'input-demo-suggestions');
      await input.fill('ap');
      await page.waitForTimeout(450);

      const searchValue = page.getByTestId('input-demo-search-value');
      await searchValue.waitFor({ state: 'visible', timeout: 5_000 });
      const searchText = (await searchValue.textContent()) ?? '';
      if (!searchText.includes('ap')) {
        throw new Error(`Expected debounced search text to include "ap", got "${searchText}".`);
      }

      const appleOption = page.getByTestId('catalog-section-input').getByRole('option', {
        name: 'Apple',
      });
      await appleOption.waitFor({ state: 'visible', timeout: 5_000 });
      await appleOption.click();

      const selectedValue = page.getByTestId('input-demo-selected-value');
      const selectedText = (await selectedValue.textContent()) ?? '';
      if (!selectedText.includes('apple')) {
        throw new Error(`Expected selected value to include "apple", got "${selectedText}".`);
      }

      await page.getByTestId('catalog-section-input').screenshot({ path: screenshots.input });
      pass('CInput suggestions accept "ap", show dropdown, select Apple, and update selected value', {
        searchText,
        selectedText,
        screenshot: screenshots.input,
      });
    } catch (error) {
      fail('CInput suggestions accept "ap", show dropdown, select Apple, and update selected value', error);
    }

    try {
      const splitSection = await expectVisible(page, 'catalog-section-split-area');
      const currentToggle = await expectVisible(page, 'split-area-demo-lock-current-toggle');
      const recursiveToggle = await expectVisible(page, 'split-area-demo-lock-toggle');
      const currentDemo = await expectVisible(page, 'split-area-demo-lock-current');
      await expectVisible(page, 'split-area-demo-lock-recursive');

      const currentSeparator = currentDemo.locator(':scope > .cm-split-area__separator').first();
      await currentSeparator.waitFor({ state: 'visible', timeout: 5_000 });
      const unlockedCursor = await currentSeparator.evaluate((element) => getComputedStyle(element).cursor);
      const unlockedClass = (await currentSeparator.getAttribute('class')) ?? '';
      const widthBeforeUnlockedDrag = await getFirstPanelWidth(currentDemo);
      await dragLocatorBy(currentSeparator, 80, 0);
      await page.waitForTimeout(100);
      const widthAfterUnlockedDrag = await getFirstPanelWidth(currentDemo);
      await splitSection.screenshot({ path: screenshots.splitBefore });

      if (Math.abs(widthAfterUnlockedDrag - widthBeforeUnlockedDrag) < 5) {
        throw new Error(
          `Expected unlocked SplitArea drag to move before locking, width stayed near ${widthBeforeUnlockedDrag}.`,
        );
      }

      if (!(await currentToggle.isChecked())) {
        await currentToggle.click();
      }
      if (!(await recursiveToggle.isChecked())) {
        await recursiveToggle.click();
      }

      const lockedCursor = await currentSeparator.evaluate((element) => getComputedStyle(element).cursor);
      const lockedClass = (await currentSeparator.getAttribute('class')) ?? '';
      if (!lockedClass.includes('cm-split-area__separator--locked')) {
        throw new Error(`Expected locked separator class, got "${lockedClass}".`);
      }
      if (lockedCursor !== 'default') {
        throw new Error(`Expected locked separator cursor "default", got "${lockedCursor}".`);
      }

      const widthBeforeLockedDrag = await getFirstPanelWidth(currentDemo);
      await dragLocatorBy(currentSeparator, 80, 0);
      await page.waitForTimeout(100);
      const widthAfterLockedDrag = await getFirstPanelWidth(currentDemo);

      if (Math.abs(widthAfterLockedDrag - widthBeforeLockedDrag) > 1) {
        throw new Error(
          `Expected locked SplitArea drag to be ignored, width changed from ${widthBeforeLockedDrag} to ${widthAfterLockedDrag}.`,
        );
      }

      await splitSection.screenshot({ path: screenshots.splitAfter });
      pass('CSplitArea lock demo toggles locks, changes cursor, and blocks current separator drag', {
        unlockedCursor,
        lockedCursor,
        unlockedClass,
        lockedClass,
        widthBeforeUnlockedDrag,
        widthAfterUnlockedDrag,
        widthBeforeLockedDrag,
        widthAfterLockedDrag,
        screenshots: [screenshots.splitBefore, screenshots.splitAfter],
      });
    } catch (error) {
      fail('CSplitArea lock demo toggles locks, changes cursor, and blocks current separator drag', error);
    }

    try {
      const sliderDemo = await expectVisible(page, 'slider-demo');
      const sliderValue = await expectVisible(page, 'slider-demo-value');
      const initialText = (await sliderValue.textContent()) ?? '';
      if (!initialText.includes('Volume: 40')) {
        throw new Error(`Expected initial slider value "Volume: 40", got "${initialText}".`);
      }

      const slider = sliderDemo.getByRole('slider');
      await slider.focus();
      await slider.press('ArrowRight');
      const steppedText = (await sliderValue.textContent()) ?? '';
      if (!steppedText.includes('Volume: 45')) {
        throw new Error(`Expected ArrowRight to step by 5 to "Volume: 45", got "${steppedText}".`);
      }

      await page.getByTestId('catalog-section-slider').screenshot({ path: screenshots.slider });
      pass('CSlider demo with step={5} is visible and steps from 40 to 45', {
        initialText,
        steppedText,
        screenshot: screenshots.slider,
      });
    } catch (error) {
      fail('CSlider demo with step={5} is visible and steps from 40 to 45', error);
    }

    const consoleErrors = consoleMessages.filter((message) =>
      ['error', 'pageerror'].includes(message.type),
    );
    if (consoleErrors.length === 0) {
      pass('No browser console errors', { consoleErrors });
    } else {
      fail('No browser console errors', new Error(`${consoleErrors.length} console error(s)`), {
        consoleErrors,
      });
    }
  } finally {
    await browser.close();
  }

  const summary = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    screenshots,
    consoleMessages,
    results,
    verdict: results.every((result) => result.status === 'PASS') ? 'APPROVE' : 'REJECT',
  };

  await writeFile(
    `${evidenceDir}/f3-real-manual-qa-results.json`,
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  console.log(JSON.stringify(summary, null, 2));

  if (summary.verdict !== 'APPROVE') {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
