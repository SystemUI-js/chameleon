import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  CRadio as PackageEntryCRadio,
  CRadioGroup as PackageEntryCRadioGroup,
  Theme,
} from '../src/legacy-web';
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
      <CRadioGroup data-testid="radio-group" name="fruit" defaultValue="apple">
        <CRadio data-testid="radio-apple" value="apple">
          Apple
        </CRadio>
        <CRadio data-testid="radio-orange" value="orange">
          Orange
        </CRadio>
      </CRadioGroup>,
    );

    expect(screen.getByTestId('radio-group')).toHaveClass('cm-radio-group');
    expect(screen.getByTestId('radio-apple')).toHaveAttribute('name', 'fruit');
    expect(screen.getByTestId('radio-orange')).toHaveAttribute('name', 'fruit');
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
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

  describe('CRadioGroup theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(
        <CRadioGroup name="fruit" theme="cm-theme--win98">
          <CRadio value="apple">Apple</CRadio>
        </CRadioGroup>,
      );

      const radioGroup = screen.getByRole('radio', { name: 'Apple' }).closest('.cm-radio-group');

      expect(radioGroup).toHaveClass('cm-radio-group');
      expect(radioGroup).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CRadioGroup data-testid="provider-themed" name="fruit">
            <CRadio value="apple">Apple</CRadio>
          </CRadioGroup>
        </Theme>,
      );

      const radioGroup = screen.getByTestId('provider-themed');

      expect(radioGroup).toHaveClass('cm-radio-group');
      expect(radioGroup).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CRadioGroup theme="cm-theme--winxp" data-testid="override-themed" name="fruit">
            <CRadio value="apple">Apple</CRadio>
          </CRadioGroup>
        </Theme>,
      );

      const radioGroup = screen.getByTestId('override-themed');

      expect(radioGroup).toHaveClass('cm-radio-group');
      expect(radioGroup).toHaveClass('cm-theme--winxp');
      expect(radioGroup).not.toHaveClass('cm-theme--win98');
    });

    it('merges className with theme following correct order', () => {
      render(
        <CRadioGroup name="fruit" className="custom-class" theme="cm-theme--win98">
          <CRadio value="apple">Apple</CRadio>
        </CRadioGroup>,
      );

      const radioGroup = screen.getByRole('radio', { name: 'Apple' }).closest('.cm-radio-group');

      expect(radioGroup).toHaveClass('cm-radio-group');
      expect(radioGroup).toHaveClass('cm-theme--win98');
      expect(radioGroup).toHaveClass('custom-class');
    });
  });

  describe('CRadio theme prop', () => {
    it('applies explicit theme prop on the radio root while keeping provider theme on the group', () => {
      render(
        <Theme name="win98">
          <CRadioGroup name="fruit">
            <CRadio data-testid="radio-with-theme" value="apple" theme="cm-theme--winxp">
              Apple
            </CRadio>
          </CRadioGroup>
        </Theme>,
      );

      const radioInput = screen.getByTestId('radio-with-theme');
      const radioLabel = radioInput.closest('.cm-radio');
      const radioGroup = radioLabel?.closest('.cm-radio-group');

      expect(radioGroup).toHaveClass('cm-theme--win98');
      expect(radioLabel).toHaveClass('cm-radio');
      expect(radioLabel).toHaveClass('cm-theme--winxp');
    });

    it('supports provider inheritance without explicit prop', () => {
      render(
        <Theme name="win98">
          <CRadioGroup name="fruit">
            <CRadio data-testid="radio-provider-themed" value="apple">
              Apple
            </CRadio>
          </CRadioGroup>
        </Theme>,
      );

      const radioInput = screen.getByTestId('radio-provider-themed');
      const radioLabel = radioInput.closest('.cm-radio');
      const radioGroup = radioLabel?.closest('.cm-radio-group');

      expect(radioGroup).toHaveClass('cm-theme--win98');
      expect(radioLabel).toHaveClass('cm-radio');
      expect(radioLabel).toHaveClass('cm-theme--win98');
    });

    it('RadioGroupContext remains unchanged with theme support', () => {
      const handleChange = jest.fn();

      render(
        <Theme name="win98">
          <CRadioGroup name="theme" value="light" onChange={handleChange}>
            <CRadio value="light">Light</CRadio>
            <CRadio value="dark">Dark</CRadio>
          </CRadioGroup>
        </Theme>,
      );

      const lightRadio = screen.getByRole('radio', { name: 'Light' });
      const darkRadio = screen.getByRole('radio', { name: 'Dark' });

      expect(lightRadio).toBeChecked();
      expect(darkRadio).not.toBeChecked();

      fireEvent.click(darkRadio);

      expect(handleChange).toHaveBeenCalledWith('dark');
    });
  });
});
