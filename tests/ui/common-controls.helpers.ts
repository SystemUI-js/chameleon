import type { Page } from '@playwright/test';
import type { DevThemeId } from '@/dev/themeSwitcher';

const PLAYWRIGHT_COMMON_CONTROLS_PATH = '/playwright-common-controls.html';
const BUTTON_TEST_ID = 'button-demo-primary';
const RADIO_GROUP_TEST_ID = 'radio-demo-fruit';
const SELECT_TEST_ID = 'select-demo-size';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';

const waitForCommonControlsHarness = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    ({ buttonTestId, radioGroupTestId, selectTestId, fixtureErrorTestId }) => {
      const button = document.querySelector(`[data-testid="${buttonTestId}"]`);
      const radioGroup = document.querySelector(`[data-testid="${radioGroupTestId}"]`);
      const select = document.querySelector(`[data-testid="${selectTestId}"]`);
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);

      if (fixtureError) {
        return true;
      }

      return Boolean(
        button instanceof HTMLButtonElement &&
          radioGroup instanceof HTMLElement &&
          radioGroup.querySelector('input[type="radio"]') !== null &&
          select instanceof HTMLSelectElement,
      );
    },
    {
      buttonTestId: BUTTON_TEST_ID,
      radioGroupTestId: RADIO_GROUP_TEST_ID,
      selectTestId: SELECT_TEST_ID,
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
    },
  );
};

const waitForWin98ThemedControls = async (page: Page): Promise<void> => {
  await page.waitForFunction(
    ({ buttonTestId, radioGroupTestId, selectTestId }) => {
      const button = document.querySelector(`[data-testid="${buttonTestId}"]`);
      const radioGroup = document.querySelector(`[data-testid="${radioGroupTestId}"]`);
      const select = document.querySelector(`[data-testid="${selectTestId}"]`);

      return Boolean(
        button instanceof HTMLButtonElement &&
          radioGroup instanceof HTMLElement &&
          radioGroup.querySelector('input[type="radio"]') !== null &&
          select instanceof HTMLSelectElement,
      );
    },
    {
      buttonTestId: BUTTON_TEST_ID,
      radioGroupTestId: RADIO_GROUP_TEST_ID,
      selectTestId: SELECT_TEST_ID,
    },
  );
};

export const gotoCommonControlsFixture = async (page: Page, fixture: string): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: 'default',
    fixture,
  });

  await page.goto(`${PLAYWRIGHT_COMMON_CONTROLS_PATH}?${searchParams.toString()}`);
  await waitForCommonControlsHarness(page);
};

export type CommonControlsHarnessSelection = {
  theme: DevThemeId;
  fixture?: string;
};

export const gotoThemedCommonControls = async (
  page: Page,
  selection: CommonControlsHarnessSelection,
): Promise<void> => {
  const searchParams = new URLSearchParams({
    theme: selection.theme,
  });

  if (selection.fixture !== undefined) {
    searchParams.set('fixture', selection.fixture);
  }

  await page.goto(`${PLAYWRIGHT_COMMON_CONTROLS_PATH}?${searchParams.toString()}`);
  await waitForWin98ThemedControls(page);
  await page.locator(`.cm-theme--${selection.theme}`).first().waitFor({ state: 'attached' });
};

export const gotoWin98CommonControls = async (page: Page): Promise<void> => {
  await gotoThemedCommonControls(page, { theme: 'win98' });
};

export const gotoWin98DisabledCommonControls = async (page: Page): Promise<void> => {
  await gotoThemedCommonControls(page, {
    theme: 'win98',
    fixture: 'disabled',
  });
};

export const readCommonControlsRadioValue = async (page: Page): Promise<string | null> => {
  return page.getByTestId(RADIO_GROUP_TEST_ID).evaluate((element) => {
    const checkedRadio = element.querySelector<HTMLInputElement>('input[type="radio"]:checked');

    return checkedRadio?.value ?? null;
  });
};
