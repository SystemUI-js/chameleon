import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CProgress as PackageEntryCProgress, Theme } from '../src';
import { CProgress } from '../src/components/CProgress/CProgress';

describe('CProgress', () => {
  it('exports CProgress from package entry', () => {
    render(<PackageEntryCProgress data-testid="progress-package-entry" />);

    const progress = screen.getByTestId('progress-package-entry');

    expect(PackageEntryCProgress).toBe(CProgress);
    expect(progress).toBeInTheDocument();
    expect(progress).toHaveClass('cm-cprogress');
  });

  it('renders bar variant by default with medium size and default status', () => {
    render(<CProgress data-testid="progress-default" />);

    const progress = screen.getByTestId('progress-default');

    expect(progress).toHaveClass(
      'cm-cprogress',
      'cm-cprogress--bar',
      'cm-cprogress--size-medium',
      'cm-cprogress--status-default',
    );
    expect(progress).toHaveAttribute('role', 'progressbar');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).not.toHaveAttribute('aria-valuenow');
  });

  describe('variant rendering', () => {
    it('renders bar variant', () => {
      render(<CProgress variant="bar" value={50} data-testid="bar-progress" />);

      const progress = screen.getByTestId('bar-progress');

      expect(progress).toHaveClass('cm-cprogress--bar');
      expect(screen.getByTestId('bar-progress-track')).toBeInTheDocument();
      expect(screen.getByTestId('bar-progress-fill')).toBeInTheDocument();
    });

    it('renders circle variant', () => {
      render(<CProgress variant="circle" value={50} data-testid="circle-progress" />);

      expect(screen.getByTestId('circle-progress')).toHaveClass('cm-cprogress--circle');
      expect(screen.getByTestId('circle-progress-circle')).toBeInTheDocument();
    });

    it('renders ring variant', () => {
      render(<CProgress variant="ring" value={50} data-testid="ring-progress" />);

      expect(screen.getByTestId('ring-progress')).toHaveClass('cm-cprogress--ring');
      expect(screen.getByTestId('ring-progress-circle')).toBeInTheDocument();
    });
  });

  describe('determinate state', () => {
    it('renders bar with correct fill width and aria values', () => {
      render(<CProgress variant="bar" value={50} data-testid="bar-determinate" />);

      const progress = screen.getByTestId('bar-determinate');
      const fill = screen.getByTestId('bar-determinate-fill');

      expect(progress).toHaveAttribute('aria-valuenow', '50');
      expect(progress).toHaveAttribute('aria-valuemax', '100');
      expect(fill).toHaveStyle({ width: '50%' });
    });

    it('renders circle with conic-gradient background', () => {
      render(<CProgress variant="circle" value={25} data-testid="circle-determinate" />);

      const circle = screen.getByTestId('circle-determinate-circle');

      expect(circle).toHaveStyle({
        background: 'conic-gradient(currentColor 25%, transparent 25%)',
      });
    });

    it('renders ring with conic-gradient background', () => {
      render(<CProgress variant="ring" value={75} data-testid="ring-determinate" />);

      const circle = screen.getByTestId('ring-determinate-circle');

      expect(circle).toHaveStyle({
        background: 'conic-gradient(currentColor 75%, transparent 75%)',
      });
    });
  });

  describe('indeterminate state', () => {
    it('renders bar indeterminate without aria-valuenow and with animation class', () => {
      render(<CProgress variant="bar" indeterminate data-testid="bar-indeterminate" />);

      const progress = screen.getByTestId('bar-indeterminate');
      const fill = screen.getByTestId('bar-indeterminate-fill');

      expect(progress).toHaveClass('cm-cprogress--indeterminate');
      expect(progress).not.toHaveAttribute('aria-valuenow');
      expect(fill.style.width).toBe('');
    });

    it('renders circle indeterminate without aria-valuenow', () => {
      render(<CProgress variant="circle" indeterminate data-testid="circle-indeterminate" />);

      const progress = screen.getByTestId('circle-indeterminate');

      expect(progress).toHaveClass('cm-cprogress--indeterminate');
      expect(progress).not.toHaveAttribute('aria-valuenow');
    });

    it('renders ring indeterminate without aria-valuenow', () => {
      render(<CProgress variant="ring" indeterminate data-testid="ring-indeterminate" />);

      const progress = screen.getByTestId('ring-indeterminate');

      expect(progress).toHaveClass('cm-cprogress--indeterminate');
      expect(progress).not.toHaveAttribute('aria-valuenow');
    });
  });

  describe('value clamping', () => {
    it('treats undefined value as indeterminate and omits aria-valuenow', () => {
      render(<CProgress variant="bar" value={undefined} data-testid="bar-undefined" />);

      const progress = screen.getByTestId('bar-undefined');
      const fill = screen.getByTestId('bar-undefined-fill');

      expect(progress).toHaveClass('cm-cprogress--indeterminate');
      expect(progress).not.toHaveAttribute('aria-valuenow');
      expect(fill.style.width).toBe('');
    });

    it('treats non-finite value as 0', () => {
      render(<CProgress variant="bar" value={NaN} data-testid="bar-nan" />);

      expect(screen.getByTestId('bar-nan')).toHaveAttribute('aria-valuenow', '0');
      expect(screen.getByTestId('bar-nan-fill')).toHaveStyle({ width: '0%' });
    });

    it('clamps percent above max to 100', () => {
      render(<CProgress variant="bar" value={200} data-testid="bar-over" />);

      const progress = screen.getByTestId('bar-over');

      expect(progress).toHaveAttribute('aria-valuenow', '200');
      expect(screen.getByTestId('bar-over-fill')).toHaveStyle({ width: '100%' });
    });

    it('clamps negative value to 0 percent', () => {
      render(<CProgress variant="bar" value={-10} data-testid="bar-neg" />);

      const progress = screen.getByTestId('bar-neg');

      expect(progress).toHaveAttribute('aria-valuenow', '-10');
      expect(screen.getByTestId('bar-neg-fill')).toHaveStyle({ width: '0%' });
    });
  });

  describe('max prop', () => {
    it('defaults max to 100', () => {
      render(<CProgress variant="bar" value={50} data-testid="max-default" />);

      expect(screen.getByTestId('max-default')).toHaveAttribute('aria-valuemax', '100');
    });

    it('uses custom max to calculate percent', () => {
      render(<CProgress variant="bar" value={10} max={20} data-testid="max-custom" />);

      const progress = screen.getByTestId('max-custom');

      expect(progress).toHaveAttribute('aria-valuemax', '20');
      expect(progress).toHaveAttribute('aria-valuenow', '10');
      expect(screen.getByTestId('max-custom-fill')).toHaveStyle({ width: '50%' });
    });

    it('falls back max to 100 when non-positive', () => {
      render(<CProgress variant="bar" value={50} max={0} data-testid="max-zero" />);

      expect(screen.getByTestId('max-zero')).toHaveAttribute('aria-valuemax', '100');
    });

    it('falls back max to 100 when non-finite', () => {
      render(<CProgress variant="bar" value={50} max={Infinity} data-testid="max-inf" />);

      expect(screen.getByTestId('max-inf')).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('label and value display', () => {
    it('renders label when provided', () => {
      render(<CProgress label="Uploading" data-testid="labelled" />);

      expect(screen.getByText('Uploading')).toBeInTheDocument();
      expect(screen.getByTestId('labelled-label')).toBeInTheDocument();
    });

    it('renders default value text when showValue is true', () => {
      render(<CProgress variant="bar" value={25} showValue data-testid="show-value" />);

      expect(screen.getByText('25%')).toBeInTheDocument();
      expect(screen.getByTestId('show-value-label')).toBeInTheDocument();
    });

    it('renders custom format output', () => {
      render(
        <CProgress
          variant="bar"
          value={1}
          max={4}
          showValue
          format={(percent, currentValue, currentMax) =>
            `${currentValue}/${currentMax} (${percent.toFixed(1)}%)`
          }
          data-testid="formatted"
        />,
      );

      expect(screen.getByText('1/4 (25.0%)')).toBeInTheDocument();
    });

    it('does not render label wrapper when neither label nor showValue is provided', () => {
      render(<CProgress data-testid="no-label" />);

      expect(
        screen.getByTestId('no-label').querySelector('.cm-cprogress__label'),
      ).not.toBeInTheDocument();
    });
  });

  describe('size prop', () => {
    it('defaults to medium', () => {
      render(<CProgress data-testid="default-size" />);

      expect(screen.getByTestId('default-size')).toHaveClass('cm-cprogress--size-medium');
    });

    it('applies named size classes', () => {
      const { rerender } = render(<CProgress size="small" data-testid="sized" />);

      expect(screen.getByTestId('sized')).toHaveClass('cm-cprogress--size-small');

      rerender(<CProgress size="large" data-testid="sized" />);
      expect(screen.getByTestId('sized')).toHaveClass('cm-cprogress--size-large');
    });

    it('sets --cm-cprogress-size for numeric size', () => {
      render(<CProgress variant="circle" size={64} data-testid="numeric-size" />);

      expect(screen.getByTestId('numeric-size')).toHaveStyle({ '--cm-cprogress-size': '64px' });
      expect(screen.getByTestId('numeric-size')).not.toHaveClass('cm-cprogress--size-small');
    });

    it('sets --cm-cprogress-size for string size', () => {
      render(<CProgress variant="circle" size="4rem" data-testid="string-size" />);

      expect(screen.getByTestId('string-size')).toHaveStyle({ '--cm-cprogress-size': '4rem' });
    });
  });

  describe('status prop', () => {
    it('defaults to default', () => {
      render(<CProgress data-testid="default-status" />);

      expect(screen.getByTestId('default-status')).toHaveClass('cm-cprogress--status-default');
    });

    it('applies status classes', () => {
      const { rerender } = render(<CProgress status="active" data-testid="statused" />);

      expect(screen.getByTestId('statused')).toHaveClass('cm-cprogress--status-active');

      rerender(<CProgress status="success" data-testid="statused" />);
      expect(screen.getByTestId('statused')).toHaveClass('cm-cprogress--status-success');

      rerender(<CProgress status="exception" data-testid="statused" />);
      expect(screen.getByTestId('statused')).toHaveClass('cm-cprogress--status-exception');
    });
  });

  describe('classNames overrides', () => {
    it('merges custom classNames for track and fill', () => {
      render(
        <CProgress
          variant="bar"
          value={50}
          classNames={{ track: 'custom-track', fill: 'custom-fill' }}
          data-testid="classnames-bar"
        />,
      );

      expect(screen.getByTestId('classnames-bar-track')).toHaveClass('custom-track');
      expect(screen.getByTestId('classnames-bar-fill')).toHaveClass('custom-fill');
    });

    it('merges custom classNames for circle', () => {
      render(
        <CProgress
          variant="circle"
          value={50}
          classNames={{ circle: 'custom-circle' }}
          data-testid="classnames-circle"
        />,
      );

      expect(screen.getByTestId('classnames-circle-circle')).toHaveClass('custom-circle');
    });

    it('merges root className with base classes', () => {
      render(<CProgress className="custom-root" data-testid="root-classname" />);

      expect(screen.getByTestId('root-classname')).toHaveClass('cm-cprogress', 'custom-root');
    });
  });

  describe('theme prop', () => {
    it('applies theme class from explicit theme prop', () => {
      render(<CProgress theme="cm-theme--win98" data-testid="themed-progress" />);

      const progress = screen.getByTestId('themed-progress');

      expect(progress).toHaveClass('cm-cprogress');
      expect(progress).toHaveClass('cm-theme--win98');
    });

    it('applies theme class from Theme provider when no explicit prop', () => {
      render(
        <Theme name="win98">
          <CProgress data-testid="provider-themed" />
        </Theme>,
      );

      expect(screen.getByTestId('provider-themed')).toHaveClass('cm-theme--win98');
    });

    it('explicit theme prop overrides Theme provider', () => {
      render(
        <Theme name="win98">
          <CProgress theme="cm-theme--winxp" data-testid="override-themed" />
        </Theme>,
      );

      const progress = screen.getByTestId('override-themed');

      expect(progress).toHaveClass('cm-theme--winxp');
      expect(progress).not.toHaveClass('cm-theme--win98');
    });
  });
});
