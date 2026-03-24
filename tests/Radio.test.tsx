import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CRadio as PackageEntryCRadio, CRadioGroup as PackageEntryCRadioGroup } from '../src';
import { CRadio } from '../src/components/Radio/Radio';
import { CRadioGroup } from '../src/components/Radio/RadioGroup';

describe('CRadioGroup', () => {
  it('exports CRadio and CRadioGroup from package entry', () => {
    render(
      <PackageEntryCRadioGroup data-testid="radio-package-entry" name="fruit" defaultValue="apple">
        <PackageEntryCRadio data-testid="radio-package-entry-apple" value="apple">
          Apple
        </PackageEntryCRadio>
      </PackageEntryCRadioGroup>,
    );

    const radioGroup = screen.getByTestId('radio-package-entry');
    const radio = screen.getByTestId('radio-package-entry-apple');

    expect(PackageEntryCRadio).toBe(CRadio);
    expect(PackageEntryCRadioGroup).toBe(CRadioGroup);
    expect(radioGroup).toHaveClass('cm-radio-group');
    expect(radio).toBeChecked();
  });

  it('shares the same name across grouped radios', () => {
    render(
      <CRadioGroup
        aria-label="Favorite fruit"
        data-testid="radio-group"
        name="fruit"
        defaultValue="apple"
      >
        <CRadio data-testid="radio-apple" value="apple">
          Apple
        </CRadio>
        <CRadio data-testid="radio-orange" value="orange">
          Orange
        </CRadio>
      </CRadioGroup>,
    );

    expect(screen.getByRole('radiogroup', { name: 'Favorite fruit' })).toHaveClass(
      'cm-radio-group',
    );
    expect(screen.getByTestId('radio-group')).toHaveAttribute('role', 'radiogroup');
    expect(screen.getByTestId('radio-apple')).toHaveAttribute('name', 'fruit');
    expect(screen.getByTestId('radio-orange')).toHaveAttribute('name', 'fruit');
  });

  it('initializes uncontrolled state from defaultValue and ignores later defaultValue changes', () => {
    const { rerender } = render(
      <CRadioGroup name="size" defaultValue="medium">
        <CRadio value="small">Small</CRadio>
        <CRadio value="medium">Medium</CRadio>
      </CRadioGroup>,
    );

    const smallRadio = screen.getByRole('radio', { name: 'Small' });
    const mediumRadio = screen.getByRole('radio', { name: 'Medium' });

    expect(mediumRadio).toBeChecked();
    expect(smallRadio).not.toBeChecked();

    rerender(
      <CRadioGroup name="size" defaultValue="small">
        <CRadio value="small">Small</CRadio>
        <CRadio value="medium">Medium</CRadio>
      </CRadioGroup>,
    );

    expect(mediumRadio).toBeChecked();
    expect(smallRadio).not.toBeChecked();
  });

  it('updates the selected value in uncontrolled mode after click', () => {
    render(
      <CRadioGroup name="theme" defaultValue="light">
        <CRadio value="light">Light</CRadio>
        <CRadio value="dark">Dark</CRadio>
      </CRadioGroup>,
    );

    const lightRadio = screen.getByRole('radio', { name: 'Light' });
    const darkRadio = screen.getByRole('radio', { name: 'Dark' });

    expect(lightRadio).toBeChecked();
    expect(darkRadio).not.toBeChecked();

    fireEvent.click(darkRadio);

    expect(darkRadio).toBeChecked();
    expect(lightRadio).not.toBeChecked();
  });

  it('lets controlled value take precedence after switching from uncontrolled mode', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <CRadioGroup name="mode" defaultValue="basic" onChange={handleChange}>
        <CRadio value="basic">Basic</CRadio>
        <CRadio value="advanced">Advanced</CRadio>
      </CRadioGroup>,
    );

    const basicRadio = screen.getByRole('radio', { name: 'Basic' });
    const advancedRadio = screen.getByRole('radio', { name: 'Advanced' });

    fireEvent.click(advancedRadio);

    expect(advancedRadio).toBeChecked();
    expect(basicRadio).not.toBeChecked();

    rerender(
      <CRadioGroup name="mode" value="basic" onChange={handleChange}>
        <CRadio value="basic">Basic</CRadio>
        <CRadio value="advanced">Advanced</CRadio>
      </CRadioGroup>,
    );

    expect(basicRadio).toBeChecked();
    expect(advancedRadio).not.toBeChecked();

    fireEvent.click(advancedRadio);

    expect(handleChange).toHaveBeenLastCalledWith('advanced');
    expect(basicRadio).toBeChecked();
    expect(advancedRadio).not.toBeChecked();
  });

  it('prevents selection for disabled radio items and disabled groups', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <CRadioGroup name="availability" onChange={handleChange}>
        <CRadio value="enabled">Enabled</CRadio>
        <CRadio value="disabled" disabled>
          Disabled
        </CRadio>
      </CRadioGroup>,
    );

    const disabledRadio = screen.getByRole('radio', { name: 'Disabled' }) as HTMLInputElement;

    expect(disabledRadio).toBeDisabled();

    disabledRadio.click();

    expect(disabledRadio).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();

    rerender(
      <CRadioGroup name="availability" disabled onChange={handleChange}>
        <CRadio value="enabled">Enabled</CRadio>
        <CRadio value="disabled">Disabled</CRadio>
      </CRadioGroup>,
    );

    const groupDisabledEnabledRadio = screen.getByRole('radio', {
      name: 'Enabled',
    }) as HTMLInputElement;
    const groupDisabledDisabledRadio = screen.getByRole('radio', {
      name: 'Disabled',
    }) as HTMLInputElement;

    expect(groupDisabledEnabledRadio).toBeDisabled();
    expect(groupDisabledDisabledRadio).toBeDisabled();

    groupDisabledEnabledRadio.click();

    expect(groupDisabledEnabledRadio).not.toBeChecked();
    expect(handleChange).not.toHaveBeenCalled();
  });
});
