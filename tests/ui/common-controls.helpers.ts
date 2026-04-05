import type { Page } from '@playwright/test';
import type { DevThemeId } from '@/dev/themeSwitcher';

const PLAYWRIGHT_COMMON_CONTROLS_PATH = '/playwright-common-controls.html';
const BUTTON_TEST_ID = 'button-demo-primary';
const RADIO_GROUP_TEST_ID = 'radio-demo-fruit';
const SELECT_TEST_ID = 'select-demo-size';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';
const GROUPED_BUTTON_GROUP_TEST_ID = 'button-group-demo';
const GROUPED_BUTTON_SEPARATOR_TEST_ID = 'button-group-separator';
const GROUPED_BUTTON_VERTICAL_GROUP_TEST_ID = 'button-group-vertical-demo';
const GROUPED_BUTTON_DISABLED_GROUP_TEST_ID = 'button-group-disabled-demo';
const GROUPED_BUTTON_DISABLED_SEPARATOR_TEST_ID = 'button-group-disabled-separator';
const GROUPED_BUTTON_VERTICAL_DISABLED_GROUP_TEST_ID = 'button-group-vertical-disabled-demo';

const waitForStandardControlsHarness = async (page: Page): Promise<void> => {
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

const waitForGroupedButtonsHarness = async (
  page: Page,
  selection: {
    groupTestId: string;
    separatorTestId: string;
    secondaryGroupTestId?: string;
  },
): Promise<void> => {
  await page.waitForFunction(
    ({ fixtureErrorTestId, groupTestId, separatorTestId, secondaryGroupTestId }) => {
      const fixtureError = document.querySelector(`[data-testid="${fixtureErrorTestId}"]`);
      const group = document.querySelector(`[data-testid="${groupTestId}"]`);
      const separator = document.querySelector(`[data-testid="${separatorTestId}"]`);
      const secondaryGroup =
        secondaryGroupTestId === undefined
          ? true
          : document.querySelector(`[data-testid="${secondaryGroupTestId}"]`) instanceof
            HTMLElement;

      if (fixtureError) {
        return true;
      }

      return (
        group instanceof HTMLElement &&
        group.querySelector('button') !== null &&
        separator instanceof HTMLElement &&
        secondaryGroup
      );
    },
    {
      fixtureErrorTestId: FIXTURE_ERROR_TEST_ID,
      groupTestId: selection.groupTestId,
      separatorTestId: selection.separatorTestId,
      secondaryGroupTestId: selection.secondaryGroupTestId,
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

  if (fixture === 'grouped-buttons') {
    await waitForGroupedButtonsHarness(page, {
      groupTestId: GROUPED_BUTTON_GROUP_TEST_ID,
      separatorTestId: GROUPED_BUTTON_SEPARATOR_TEST_ID,
      secondaryGroupTestId: GROUPED_BUTTON_VERTICAL_GROUP_TEST_ID,
    });
    return;
  }

  if (fixture === 'grouped-buttons-disabled') {
    await waitForGroupedButtonsHarness(page, {
      groupTestId: GROUPED_BUTTON_DISABLED_GROUP_TEST_ID,
      separatorTestId: GROUPED_BUTTON_DISABLED_SEPARATOR_TEST_ID,
      secondaryGroupTestId: GROUPED_BUTTON_VERTICAL_DISABLED_GROUP_TEST_ID,
    });
    return;
  }

  await waitForStandardControlsHarness(page);
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

  if (selection.fixture === 'grouped-buttons') {
    await waitForGroupedButtonsHarness(page, {
      groupTestId: GROUPED_BUTTON_GROUP_TEST_ID,
      separatorTestId: GROUPED_BUTTON_SEPARATOR_TEST_ID,
      secondaryGroupTestId: GROUPED_BUTTON_VERTICAL_GROUP_TEST_ID,
    });
    return;
  }

  if (selection.fixture === 'grouped-buttons-disabled') {
    await waitForGroupedButtonsHarness(page, {
      groupTestId: GROUPED_BUTTON_DISABLED_GROUP_TEST_ID,
      separatorTestId: GROUPED_BUTTON_DISABLED_SEPARATOR_TEST_ID,
      secondaryGroupTestId: GROUPED_BUTTON_VERTICAL_DISABLED_GROUP_TEST_ID,
    });
    return;
  }

  await waitForWin98ThemedControls(page);
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

export const gotoGroupedButtonsFixture = async (page: Page): Promise<void> => {
  await gotoCommonControlsFixture(page, 'grouped-buttons');
};

export const gotoDisabledGroupedButtonsFixture = async (page: Page): Promise<void> => {
  await gotoCommonControlsFixture(page, 'grouped-buttons-disabled');
};

export const gotoWin98GroupedButtons = async (page: Page): Promise<void> => {
  await gotoThemedCommonControls(page, {
    theme: 'win98',
    fixture: 'grouped-buttons',
  });
};

export const readCommonControlsRadioValue = async (page: Page): Promise<string | null> => {
  return page.getByTestId(RADIO_GROUP_TEST_ID).evaluate((element) => {
    const checkedRadio = element.querySelector<HTMLInputElement>('input[type="radio"]:checked');

    return checkedRadio?.value ?? null;
  });
};
