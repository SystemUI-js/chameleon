import type { Page } from '@playwright/test';

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

export const gotoCommonControlsFixture = async (page: Page, fixture: string): Promise<void> => {
  await page.goto(`${PLAYWRIGHT_COMMON_CONTROLS_PATH}?fixture=${encodeURIComponent(fixture)}`);
  await waitForCommonControlsHarness(page);
};

export const readCommonControlsRadioValue = async (page: Page): Promise<string | null> => {
  return page.getByTestId(RADIO_GROUP_TEST_ID).evaluate((element) => {
    const checkedRadio = element.querySelector<HTMLInputElement>('input[type="radio"]:checked');

    return checkedRadio?.value ?? null;
  });
};
