import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CLoading as PackageEntryCLoading } from '../src';
import { CLoading } from '../src/components/CLoading/CLoading';

describe('CLoading', () => {
  it('exports CLoading from package entry', () => {
    render(<PackageEntryCLoading data-testid="loading-package-entry" />);

    const loading = screen.getByTestId('loading-package-entry');

    expect(PackageEntryCLoading).toBe(CLoading);
    expect(loading).toBeInTheDocument();
    expect(loading).toHaveClass('cm-loading');
  });

  it('renders spinner variant by default', () => {
    render(<CLoading data-testid="spinner-default" />);

    const loading = screen.getByTestId('spinner-default');

    expect(loading).toHaveClass('cm-loading', 'cm-loading--spinner', 'cm-loading--medium');
    expect(loading).not.toHaveClass('cm-loading--dots');
    expect(loading).not.toHaveClass('cm-loading--bar');
    expect(loading).toHaveAttribute('role', 'status');
    expect(loading).toHaveAttribute('aria-live', 'polite');
  });

  it('renders dots variant', () => {
    render(<CLoading variant="dots" data-testid="dots-loading" />);

    const loading = screen.getByTestId('dots-loading');

    expect(loading).toHaveClass('cm-loading', 'cm-loading--dots');
    expect(loading).not.toHaveClass('cm-loading--spinner');
  });

  it('renders bar variant determinate with progress and aria values', () => {
    render(
      <CLoading variant="bar" progress={50} indeterminate={false} data-testid="bar-determinate" />,
    );

    const loading = screen.getByTestId('bar-determinate');
    const fill = screen.getByTestId('bar-determinate-fill');

    expect(loading).toHaveClass('cm-loading', 'cm-loading--bar');
    expect(loading).not.toHaveClass('cm-loading--indeterminate');
    expect(loading).toHaveAttribute('aria-valuemin', '0');
    expect(loading).toHaveAttribute('aria-valuemax', '100');
    expect(loading).toHaveAttribute('aria-valuenow', '50');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('renders bar variant indeterminate without aria-valuenow and with indeterminate class', () => {
    render(<CLoading variant="bar" indeterminate data-testid="bar-indeterminate" />);

    const loading = screen.getByTestId('bar-indeterminate');

    expect(loading).toHaveClass('cm-loading', 'cm-loading--bar', 'cm-loading--indeterminate');
    expect(loading).toHaveAttribute('aria-valuemin', '0');
    expect(loading).toHaveAttribute('aria-valuemax', '100');
    expect(loading).not.toHaveAttribute('aria-valuenow');
  });

  describe('progress clamping', () => {
    it('clamps progress -1 to 0', () => {
      render(<CLoading variant="bar" progress={-1} indeterminate={false} data-testid="bar-neg" />);

      const loading = screen.getByTestId('bar-neg');
      const fill = screen.getByTestId('bar-neg-fill');

      expect(loading).toHaveAttribute('aria-valuenow', '0');
      expect(fill).toHaveStyle({ width: '0%' });
    });

    it('keeps progress 50 as is', () => {
      render(<CLoading variant="bar" progress={50} indeterminate={false} data-testid="bar-mid" />);

      const loading = screen.getByTestId('bar-mid');
      const fill = screen.getByTestId('bar-mid-fill');

      expect(loading).toHaveAttribute('aria-valuenow', '50');
      expect(fill).toHaveStyle({ width: '50%' });
    });

    it('clamps progress 101 to 100', () => {
      render(
        <CLoading variant="bar" progress={101} indeterminate={false} data-testid="bar-over" />,
      );

      const loading = screen.getByTestId('bar-over');
      const fill = screen.getByTestId('bar-over-fill');

      expect(loading).toHaveAttribute('aria-valuenow', '100');
      expect(fill).toHaveStyle({ width: '100%' });
    });
  });

  describe('label prop', () => {
    it('renders string label visibly and sets aria-label', () => {
      render(<CLoading label="Loading data" data-testid="string-label" />);

      const loading = screen.getByTestId('string-label');

      expect(loading).toHaveAttribute('aria-label', 'Loading data');
      expect(screen.getByText('Loading data')).toBeInTheDocument();
    });

    it('renders non-string label visibly without aria-label', () => {
      render(
        <CLoading
          label={<span data-testid="non-string-label">Loading</span>}
          data-testid="node-label"
        />,
      );

      const loading = screen.getByTestId('node-label');

      expect(loading).not.toHaveAttribute('aria-label');
      expect(screen.getByTestId('non-string-label')).toBeInTheDocument();
    });

    it('does not render label wrapper when label is absent', () => {
      render(<CLoading data-testid="no-label" />);

      const loading = screen.getByTestId('no-label');

      expect(loading).not.toHaveAttribute('aria-label');
      expect(loading.querySelector('.cm-loading__label')).not.toBeInTheDocument();
    });
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CLoading theme="cm-theme--win98" data-testid="themed-loading" />);

      const loading = screen.getByTestId('themed-loading');

      expect(loading).toHaveClass('cm-loading');
      expect(loading).toHaveClass('cm-theme--win98');
    });
  });

  describe('size prop', () => {
    it('defaults to medium size', () => {
      render(<CLoading data-testid="default-size" />);

      expect(screen.getByTestId('default-size')).toHaveClass('cm-loading', 'cm-loading--medium');
    });

    it('applies named size classes', () => {
      const { rerender } = render(<CLoading size="small" data-testid="sized" />);

      expect(screen.getByTestId('sized')).toHaveClass('cm-loading--small');

      rerender(<CLoading size="large" data-testid="sized" />);
      expect(screen.getByTestId('sized')).toHaveClass('cm-loading--large');
    });

    it('sets --cm-loading-size CSS variable for numeric size', () => {
      render(<CLoading size={48} data-testid="numeric-size" />);

      expect(screen.getByTestId('numeric-size')).toHaveStyle({ '--cm-loading-size': '48px' });
      expect(screen.getByTestId('numeric-size')).not.toHaveClass('cm-loading--small');
      expect(screen.getByTestId('numeric-size')).not.toHaveClass('cm-loading--medium');
      expect(screen.getByTestId('numeric-size')).not.toHaveClass('cm-loading--large');
    });

    it('sets --cm-loading-size CSS variable for string size', () => {
      render(<CLoading size="3rem" data-testid="string-size" />);

      expect(screen.getByTestId('string-size')).toHaveStyle({ '--cm-loading-size': '3rem' });
    });
  });
});
