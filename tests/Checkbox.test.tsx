import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { CCheckbox as PackageEntryCCheckbox, Theme } from '../src';
import { CCheckbox } from '../src/components/Checkbox/Checkbox';

describe('CCheckbox', () => {
  it('exports CCheckbox from package entry', () => {
    render(
      <PackageEntryCCheckbox data-testid="checkbox-package-entry">
        Package entry
      </PackageEntryCCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-package-entry');

    expect(PackageEntryCCheckbox).toBe(CCheckbox);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveClass('cm-checkbox__input');
  });

  it('initializes uncontrolled state from defaultChecked and toggles on click', () => {
    render(<CCheckbox defaultChecked>Uncontrolled</CCheckbox>);

    const checkbox = screen.getByRole('checkbox', { name: 'Uncontrolled' });

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
  });

  it('uses controlled checked state and reports the latest boolean onChange value', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <CCheckbox checked={false} onChange={handleChange}>
        Controlled
      </CCheckbox>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Controlled' });

    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenLastCalledWith(true);
    expect(checkbox).not.toBeChecked();

    rerender(
      <CCheckbox checked={true} onChange={handleChange}>
        Controlled
      </CCheckbox>,
    );

    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenLastCalledWith(false);
    expect(checkbox).toBeChecked();
  });

  it('keeps disabled checkboxes inert', () => {
    const handleChange = jest.fn();

    render(
      <CCheckbox disabled onChange={handleChange}>
        Disabled
      </CCheckbox>,
    );

    const checkbox = screen.getByRole('checkbox', { name: 'Disabled' });

    expect(checkbox).toBeDisabled();

    fireEvent.click(screen.getByText('Disabled'));

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('prefers children for the accessible name and falls back to label', () => {
    render(
      <>
        <CCheckbox label="Label text">Children text</CCheckbox>
        <CCheckbox label="Label only" />
      </>,
    );

    expect(screen.getByRole('checkbox', { name: 'Children text' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Label only' })).toBeInTheDocument();
  });

  it('keeps base, theme, custom, input and label classes together', () => {
    render(
      <CCheckbox className="custom-class" data-testid="checkbox-classnames" theme="cm-theme--win98">
        Themed
      </CCheckbox>,
    );

    const input = screen.getByTestId('checkbox-classnames');
    const root = input.closest('.cm-checkbox');
    const label = root?.querySelector('.cm-checkbox__label');

    expect(root).toHaveClass('cm-checkbox');
    expect(root).toHaveClass('cm-theme--win98');
    expect(root).toHaveClass('custom-class');
    expect(input).toHaveClass('cm-checkbox__input');
    expect(label).toHaveClass('cm-checkbox__label');
  });

  it('inherits theme class from Theme provider', () => {
    render(
      <Theme name="win98">
        <CCheckbox data-testid="checkbox-provider-theme">Provider themed</CCheckbox>
      </Theme>,
    );

    const root = screen.getByTestId('checkbox-provider-theme').closest('.cm-checkbox');

    expect(root).toHaveClass('cm-checkbox');
    expect(root).toHaveClass('cm-theme--win98');
  });

  it('sets native input.indeterminate when indeterminate prop is true', () => {
    render(
      <CCheckbox indeterminate data-testid="checkbox-indet">
        Indeterminate
      </CCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-indet') as HTMLInputElement;

    expect(checkbox.indeterminate).toBe(true);
  });

  it('sets aria-checked="mixed" when indeterminate is true', () => {
    render(
      <CCheckbox indeterminate data-testid="checkbox-aria">
        Mixed state
      </CCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-aria');

    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('does not set aria-checked when indeterminate is false or unset', () => {
    render(<CCheckbox data-testid="checkbox-no-indet">Normal</CCheckbox>);

    const checkbox = screen.getByTestId('checkbox-no-indet');

    expect(checkbox).not.toHaveAttribute('aria-checked');
  });

  it('allows checked and indeterminate to coexist', () => {
    render(
      <CCheckbox checked indeterminate data-testid="checkbox-coexist">
        Both
      </CCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-coexist') as HTMLInputElement;

    expect(checkbox).toBeChecked();
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
  });

  it('adds cm-checkbox--indeterminate class hook when indeterminate is true', () => {
    render(
      <CCheckbox indeterminate data-testid="checkbox-class-indet">
        Indet class
      </CCheckbox>,
    );

    const root = screen.getByTestId('checkbox-class-indet').closest('.cm-checkbox');

    expect(root).toHaveClass('cm-checkbox--indeterminate');
  });

  it('removes indeterminate class and aria-checked when indeterminate becomes false', () => {
    const { rerender } = render(
      <CCheckbox indeterminate data-testid="checkbox-toggle-indet">
        Toggle
      </CCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-toggle-indet') as HTMLInputElement;
    const root = checkbox.closest('.cm-checkbox');

    expect(checkbox.indeterminate).toBe(true);
    expect(root).toHaveClass('cm-checkbox--indeterminate');

    rerender(<CCheckbox data-testid="checkbox-toggle-indet">Toggle</CCheckbox>);

    expect(checkbox.indeterminate).toBe(false);
    expect(root).not.toHaveClass('cm-checkbox--indeterminate');
    expect(checkbox).not.toHaveAttribute('aria-checked');
  });

  it('preserves existing boolean onChange when indeterminate is set', () => {
    const handleChange = jest.fn();

    render(
      <CCheckbox indeterminate onChange={handleChange} data-testid="checkbox-indet-change">
        Indet click
      </CCheckbox>,
    );

    const checkbox = screen.getByTestId('checkbox-indet-change');

    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(typeof handleChange.mock.calls[0][0]).toBe('boolean');
  });
});
