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

    fireEvent.click(checkbox);

    expect(checkbox).not.toBeChecked();
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
});
