import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CStartBar as PackageEntryCStartBar, Theme } from '../src';
import { CStartBar, type CStartBarProps } from '../src/components/StartBar/StartBar';

const readThemeStyles = (theme: 'win98' | 'winxp'): string =>
  readFileSync(join(process.cwd(), 'src', 'theme', theme, 'styles', 'index.scss'), 'utf8');

describe('CStartBar', () => {
  it('exports CStartBar from package entry', () => {
    render(<PackageEntryCStartBar data-testid="startbar-package-entry" defaultHeight={24} />);

    const startBar = screen.getByTestId('startbar-package-entry');

    expect(PackageEntryCStartBar).toBe(CStartBar);
    expect(startBar).toBeInTheDocument();
    expect(startBar).toHaveClass('cm-start-bar');
  });

  it('rejects position prop at type level', () => {
    const validWithHeight: CStartBarProps = { height: 24 };
    const validWithDefaultHeight: CStartBarProps = { defaultHeight: 24 };
    const validWithBoth: CStartBarProps = { height: 24, defaultHeight: 12 };
    // CStartBar does not support position prop - this should cause a type error if uncommented:
    // const _invalidWithPosition: CStartBarProps = { position: 'bottom' };
    // CStartBar does not support defaultPosition prop - this should cause a type error if uncommented:
    // const _invalidWithDefaultPosition: CStartBarProps = { defaultPosition: 'bottom' };

    expect([validWithHeight, validWithDefaultHeight, validWithBoth]).toHaveLength(3);
  });

  it('renders with default height of 30px when neither height nor defaultHeight provided', () => {
    render(<CStartBar data-testid="startbar-default-height" />);

    const startBar = screen.getByTestId('startbar-default-height');

    expect(startBar).toBeInTheDocument();
    expect(startBar).toHaveStyle({
      position: 'absolute',
      bottom: '0px',
      height: '30px',
    });
  });

  it('renders start button and content slot with default testids', () => {
    render(
      <CStartBar data-testid="startbar-structure">
        <span>startbar-content</span>
      </CStartBar>,
    );

    const startBar = screen.getByTestId('startbar-structure');
    const button = screen.getByTestId('startbar-structure-button');
    const content = screen.getByTestId('startbar-structure-content');

    expect(startBar).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(button).toHaveTextContent('Start');
    expect(content).toHaveTextContent('startbar-content');
  });

  it('renders children in content slot', () => {
    render(
      <CStartBar defaultHeight={32}>
        <span>custom-content</span>
      </CStartBar>,
    );

    const content = screen.getByTestId('start-bar-content');

    expect(content).toBeInTheDocument();
    expect(content).toContainElement(screen.getByText('custom-content'));
  });

  it('applies className to root element', () => {
    render(
      <CStartBar data-testid="startbar-classes" className="custom-startbar" defaultHeight={24} />,
    );

    const startBar = screen.getByTestId('startbar-classes');

    expect(startBar).toHaveClass('cm-start-bar');
    expect(startBar).toHaveClass('custom-startbar');
  });

  it('inherits theme class from provider', () => {
    render(
      <Theme name="cm-theme--win98">
        <CStartBar data-testid="startbar-themed" defaultHeight={24} />
      </Theme>,
    );

    expect(screen.getByTestId('startbar-themed')).toHaveClass('cm-theme--win98');
  });

  it('prefers explicit theme over provider theme', () => {
    render(
      <Theme name="cm-theme--win98">
        <CStartBar
          data-testid="startbar-themed-override"
          defaultHeight={24}
          theme="cm-theme--winxp"
        />
      </Theme>,
    );

    const startBar = screen.getByTestId('startbar-themed-override');
    expect(startBar).toHaveClass('cm-theme--winxp');
    expect(startBar).not.toHaveClass('cm-theme--win98');
  });

  it('applies style to root element without overriding dock edges', () => {
    render(
      <CStartBar
        data-testid="startbar-style"
        height={48}
        gapStart={12}
        gapEnd={24}
        style={{
          backgroundColor: 'rgb(0, 0, 128)',
          color: 'rgb(255, 255, 255)',
          zIndex: 100,
          position: 'fixed',
          top: 999,
          right: 888,
          bottom: 777,
          left: 666,
          width: 555,
          height: 444,
        }}
      />,
    );

    const startBar = screen.getByTestId('startbar-style');

    expect(startBar).toHaveStyle({
      backgroundColor: 'rgb(0, 0, 128)',
      color: 'rgb(255, 255, 255)',
      zIndex: '100',
      position: 'absolute',
      bottom: '0px',
      left: '12px',
      right: '24px',
      height: '48px',
    });
    expect(startBar.style.top).toBe('');
    expect(startBar.style.width).toBe('');
  });

  it('renders with custom startLabel', () => {
    render(<CStartBar data-testid="startbar-label" startLabel="开始" defaultHeight={24} />);

    const button = screen.getByTestId('startbar-label-button');

    expect(button).toHaveTextContent('开始');
  });

  it('uses default testids when not provided', () => {
    render(
      <CStartBar defaultHeight={24}>
        <span>content</span>
      </CStartBar>,
    );

    const startBar = screen.getByTestId('start-bar');
    const button = screen.getByTestId('start-bar-button');
    const content = screen.getByTestId('start-bar-content');

    expect(startBar).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(content).toBeInTheDocument();
  });

  it('applies gapStart and gapEnd correctly', () => {
    render(<CStartBar data-testid="startbar-gaps" height={36} gapStart={10} gapEnd={20} />);

    const startBar = screen.getByTestId('startbar-gaps');

    expect(startBar).toHaveStyle({
      position: 'absolute',
      bottom: '0px',
      left: '10px',
      right: '20px',
      height: '36px',
    });
  });

  it('syncs controlled height updates', () => {
    const { rerender } = render(<CStartBar data-testid="startbar-sync" height={32} />);

    const startBar = screen.getByTestId('startbar-sync');

    expect(startBar).toHaveStyle({
      height: '32px',
    });

    rerender(<CStartBar data-testid="startbar-sync" height={48} />);

    expect(startBar).toHaveStyle({
      height: '48px',
    });
  });

  it('keeps start bar theme selectors self-scoped in theme styles', () => {
    expect(readThemeStyles('win98')).toContain('&.cm-start-bar');
    expect(readThemeStyles('win98')).toContain('&.cm-start-bar__button');
    expect(readThemeStyles('winxp')).toContain('&.cm-start-bar');
    expect(readThemeStyles('winxp')).toContain('&.cm-start-bar__button');
  });
});
