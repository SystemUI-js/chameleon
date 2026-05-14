import { expect, test } from '@playwright/test';
import {
  gotoCommonControlsFixture,
  gotoDisabledGroupedButtonsFixture,
  gotoGroupedButtonsFixture,
  gotoWin98CommonControls,
  gotoWin98DisabledCommonControls,
  gotoWin98GroupedButtons,
  readCommonControlsRadioValue,
} from './common-controls.helpers';

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

test.describe('grouped buttons', () => {
  test('grouped buttons default theme applies grouped edge styling', async ({ page }) => {
    await gotoGroupedButtonsFixture(page);

    const firstButton = page.getByTestId('button-group-first');
    const secondButton = page.getByTestId('button-group-second');

    const firstButtonStyles = await firstButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      return {
        borderTopRightRadius: styles.borderTopRightRadius,
        borderBottomRightRadius: styles.borderBottomRightRadius,
      };
    });
    const secondButtonStyles = await secondButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      return {
        marginLeft: styles.marginLeft,
      };
    });

    expect(firstButtonStyles.borderTopRightRadius).toBe('0px');
    expect(firstButtonStyles.borderBottomRightRadius).toBe('0px');
    expect(secondButtonStyles.marginLeft).toBe('-1px');
  });

  test('grouped buttons fixture renders grouped buttons and separators', async ({ page }) => {
    await gotoGroupedButtonsFixture(page);

    await expect(page.getByTestId('button-group-demo')).toBeVisible();
    await expect(page.getByTestId('button-group-separator')).toBeVisible();
    await expect(page.getByTestId('button-group-first')).toHaveClass(/cm-button--group-first/);
    await expect(page.getByTestId('button-group-second')).toHaveClass(/cm-button--group-last/);
    await expect(page.getByTestId('button-group-third')).toHaveClass(/cm-button--group-single/);
    await expect(page.getByTestId('button-group-vertical-separator')).toHaveClass(
      /cm-button-separator--horizontal/,
    );
  });

  test('grouped buttons disabled fixture enforces disabled state', async ({ page }) => {
    await gotoDisabledGroupedButtonsFixture(page);

    await expect(page.getByTestId('button-group-disabled-first')).toBeDisabled();
    await expect(page.getByTestId('button-group-disabled-second')).toBeDisabled();
    await expect(page.getByTestId('button-group-disabled-third')).toBeDisabled();
    await expect(page.getByTestId('button-group-vertical-disabled-first')).toBeDisabled();
    await expect(page.getByTestId('button-group-vertical-disabled-second')).toBeDisabled();
    await expect(page.getByTestId('button-group-vertical-disabled-separator')).toBeVisible();
    await expect(page.getByTestId('button-group-disabled-separator')).toBeVisible();
  });

  test('grouped buttons Win98 theme applies grouped edge and separator styling', async ({
    page,
  }) => {
    await gotoWin98GroupedButtons(page);

    const secondButton = page.getByTestId('button-group-second');
    const separator = page.getByTestId('button-group-separator');

    const secondButtonStyles = await secondButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      return {
        marginLeft: styles.marginLeft,
        borderRadius: styles.borderRadius,
      };
    });
    const separatorStyles = await separator.evaluate((el) => {
      const styles = window.getComputedStyle(el);

      return {
        backgroundColor: styles.backgroundColor,
        boxShadow: styles.boxShadow,
      };
    });

    expect(secondButtonStyles.marginLeft).toBe('-1px');
    expect(secondButtonStyles.borderRadius).toBe('0px');
    expect(separatorStyles.backgroundColor).toMatch(/rgb?\(\s*128,\s*128,\s*128\s*\)|#808080/i);
    expect(separatorStyles.boxShadow).toContain('rgb(255, 255, 255)');
  });
});

test.describe('Win98 controls', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWin98CommonControls(page);
  });

  test('applies Win98 theme classes to container', async ({ page }) => {
    const container = page.locator('.cm-theme--win98').first();

    await expect(container).toBeVisible();
  });

  test.describe('Button', () => {
    test('has correct Win98 background color', async ({ page }) => {
      const button = page.getByTestId('button-demo-primary');

      const backgroundColor = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundColor;
      });

      expect(backgroundColor).toMatch(/rgb?\(\s*192,\s*192,\s*192\s*\)|#c0c0c0/i);
    });

    test('has focus dotted outline', async ({ page }) => {
      const button = page.getByTestId('button-demo-primary');

      await button.focus();

      const outline = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outlineStyle: styles.outlineStyle,
          outlineColor: styles.outlineColor,
          outlineWidth: styles.outlineWidth,
          outlineOffset: styles.outlineOffset,
        };
      });

      expect(outline.outlineStyle).toBe('dotted');
      expect(outline.outlineColor).toMatch(/rgb?\(\s*0,\s*0,\s*0\s*\)|#000/i);
    });

    test('has min-width 75px and min-height 23px', async ({ page }) => {
      const button = page.getByTestId('button-demo-primary');

      const dimensions = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          minWidth: styles.minWidth,
          minHeight: styles.minHeight,
        };
      });

      expect(dimensions.minWidth).toBe('75px');
      expect(dimensions.minHeight).toBe('23px');
    });

    test('has border-radius 0', async ({ page }) => {
      const button = page.getByTestId('button-demo-primary');

      const borderRadius = await button.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderRadius;
      });

      expect(borderRadius).toBe('0px');
    });
  });

  test.describe('Radio', () => {
    test('has correct Win98 radio appearance', async ({ page }) => {
      const radioInput = page
        .locator('[data-testid="radio-demo-fruit"] input[type="radio"]')
        .first();

      const borderColor = await radioInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderColor;
      });
      const background = await radioInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.background;
      });

      expect(borderColor).toMatch(/rgb?\(\s*0,\s*0,\s*0\s*\)|#000/i);
      expect(background).toMatch(/rgb?\(\s*255,\s*255,\s*255\s*\)|#fff/i);
    });

    test('checked radio shows centered black dot', async ({ page }) => {
      const radioApple = page
        .locator('[data-testid="radio-demo-fruit"] input[type="radio"]')
        .first();

      await expect(radioApple).toBeChecked();

      const backgroundImage = await radioApple.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundImage;
      });

      expect(backgroundImage).toContain('radial-gradient');
      expect(backgroundImage).toContain('rgb(0, 0, 0)');
    });

    test('has 12px size', async ({ page }) => {
      const radioInput = page
        .locator('[data-testid="radio-demo-fruit"] input[type="radio"]')
        .first();

      const dimensions = await radioInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          width: styles.width,
          height: styles.height,
        };
      });

      expect(dimensions.width).toBe('12px');
      expect(dimensions.height).toBe('12px');
    });

    test('has 6px label gap', async ({ page }) => {
      const radioLabel = page.locator('[data-testid="radio-demo-fruit"] .cm-radio').first();

      const gap = await radioLabel.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.gap;
      });

      expect(gap).toBe('6px');
    });

    test('has focus outline', async ({ page }) => {
      const radioInput = page
        .locator('[data-testid="radio-demo-fruit"] input[type="radio"]')
        .first();

      await radioInput.focus();

      const outline = await radioInput.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
        };
      });

      expect(outline.outlineStyle).toBe('dotted');
      expect(outline.outlineWidth).toBe('1px');
    });
  });

  test.describe('Select', () => {
    test('has Win98 sunken border style', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const borderTopColor = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderTopColor;
      });
      const borderBottomColor = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderBottomColor;
      });

      expect(borderTopColor).toMatch(/rgb?\(\s*128,\s*128,\s*128\s*\)|#808080/i);
      expect(borderBottomColor).toMatch(/rgb?\(\s*255,\s*255,\s*255\s*\)|#fff/i);
    });

    test('has white background', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const backgroundColor = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundColor;
      });

      expect(backgroundColor).toMatch(/rgb?\(\s*255,\s*255,\s*255\s*\)|#fff/i);
    });

    test('has dropdown arrow background', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const backgroundImage = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.backgroundImage;
      });

      expect(backgroundImage).toContain('linear-gradient');
    });

    test('has 21px height', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const height = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.height;
      });

      expect(height).toBe('21px');
    });

    test('has border-radius 0', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const borderRadius = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.borderRadius;
      });

      expect(borderRadius).toBe('0px');
    });

    test('has arrow reserve area', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      const paddingRight = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.paddingRight;
      });

      expect(paddingRight).toMatch(/16px|17px/);
    });

    test('has focus inner dotted outline', async ({ page }) => {
      const select = page.getByTestId('select-demo-size');

      await select.focus();

      const outline = await select.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outlineStyle: styles.outlineStyle,
          outlineWidth: styles.outlineWidth,
        };
      });

      expect(outline.outlineStyle).toBe('dotted');
      expect(outline.outlineWidth).toBe('1px');
    });
  });
});

test.describe('Win98 disabled controls', () => {
  test.beforeEach(async ({ page }) => {
    await gotoWin98DisabledCommonControls(page);
  });

  test('applies Win98 theme classes to container', async ({ page }) => {
    const container = page.locator('.cm-theme--win98').first();

    await expect(container).toBeVisible();
  });

  test('Button is disabled with Win98 styling', async ({ page }) => {
    const button = page.getByTestId('button-demo-primary');

    await expect(button).toBeDisabled();

    const color = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.color;
    });

    expect(color).toMatch(/rgb?\(\s*128,\s*128,\s*128\s*\)|#808080/i);
  });

  test('Radio disabled option is greyed out', async ({ page }) => {
    const radioOrange = page.getByRole('radio', { name: 'Orange' });

    await expect(radioOrange).toBeDisabled();
  });

  test('Select is disabled with Win98 styling', async ({ page }) => {
    const select = page.getByTestId('select-demo-size');

    await expect(select).toBeDisabled();
  });
});
