import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DEV_THEME } from '../src/dev/themeSwitcher';
import { SystemHost, type SystemHostProps } from '../src/system/SystemHost';

type ThemeShellCase = {
  name: string;
  titleText: string;
  bodyText: string;
  selection: SystemHostProps;
};

type WindowSeamSignature = {
  frameTag: string;
  frameClassName: string;
  frameParentTag: string | null;
  contentTag: string;
  contentClassName: string;
  contentParentTestId: string | null;
  titleTag: string;
  titleParentTestId: string | null;
  titleIsFirstChildOfContent: boolean;
  titleHasBaseClass: boolean;
};

const SYSTEM_SHELL_CASES: ThemeShellCase[] = [
  {
    name: 'default/default',
    titleText: 'Default Window',
    bodyText: 'Default content',
    selection: { systemType: 'default', theme: 'default' },
  },
  {
    name: 'windows/win98',
    titleText: 'Windows Window',
    bodyText: 'Windows content',
    selection: { systemType: 'windows', theme: 'win98' },
  },
  {
    name: 'windows/winxp',
    titleText: 'Windows Window',
    bodyText: 'Windows content',
    selection: { systemType: 'windows', theme: 'winxp' },
  },
];

type HistoricalDevThemeId = (typeof DEV_THEME)[keyof typeof DEV_THEME];

const HistoricalDefaultThemeRoot = () => <SystemHost systemType="default" theme="default" />;

const HistoricalWin98ThemeRoot = () => <SystemHost systemType="windows" theme="win98" />;

const HistoricalWinXpThemeRoot = () => <SystemHost systemType="windows" theme="winxp" />;

function HistoricalDevThemeRoot({ activeTheme }: { activeTheme: HistoricalDevThemeId }) {
  switch (activeTheme) {
    case DEV_THEME.default:
      return <HistoricalDefaultThemeRoot />;
    case DEV_THEME.win98:
      return <HistoricalWin98ThemeRoot />;
    case DEV_THEME.winxp:
      return <HistoricalWinXpThemeRoot />;
    default: {
      const unsupportedTheme: never = activeTheme;
      throw new Error(`Unsupported historical theme root: ${unsupportedTheme}`);
    }
  }
}

function expectSharedShellComposition(
  titleText: string,
  bodyText: string,
  container: HTMLElement,
): void {
  const screenRoot = screen.getByTestId('screen-root');
  const screenGrid = container.querySelector(
    '[data-testid="screen-root"] > .c-grid',
  ) as HTMLElement | null;
  const frame = screen.getByTestId('window-frame');
  const content = screen.getByTestId('window-content');
  const title = screen.getByTestId('window-title');

  expect(screenRoot).toBe(container.firstElementChild);
  expect(screenRoot.childElementCount).toBe(1);
  expect(screenGrid).toBe(screenRoot.firstElementChild);
  expect(screenGrid).toHaveClass('c-grid');
  expect(frame.parentElement?.parentElement).toBe(screenGrid);
  expect(frame.parentElement?.tagName).toBe('DIV');
  expect(frame).toContainElement(content);
  expect(content).toContainElement(title);
  expect(content.firstElementChild).toBe(title);
  expect(title).toHaveTextContent(titleText);
  expect(content).toHaveTextContent(bodyText);
}

function collectWindowSeamSignature(): WindowSeamSignature {
  const frame = screen.getByTestId('window-frame');
  const content = screen.getByTestId('window-content');
  const title = screen.getByTestId('window-title');

  return {
    frameTag: frame.tagName,
    frameClassName: frame.className,
    frameParentTag: frame.parentElement?.tagName ?? null,
    contentTag: content.tagName,
    contentClassName: content.className,
    contentParentTestId: content.parentElement?.getAttribute('data-testid') ?? null,
    titleTag: title.tagName,
    titleParentTestId: title.parentElement?.getAttribute('data-testid') ?? null,
    titleIsFirstChildOfContent: content.firstElementChild === title,
    titleHasBaseClass: title.classList.contains('cm-window__title-bar'),
  };
}

describe('system shell characterization', () => {
  it('dev root swaps full theme components', () => {
    const { rerender } = render(<HistoricalDevThemeRoot activeTheme={DEV_THEME.default} />);

    const defaultScreenRoot = screen.getByTestId('screen-root');
    const defaultFrame = screen.getByTestId('window-frame');
    const defaultContent = screen.getByTestId('window-content');

    expect(screen.getByTestId('window-title')).toHaveTextContent('Default Window');
    expect(defaultContent).toHaveTextContent('Default content');

    rerender(<HistoricalDevThemeRoot activeTheme={DEV_THEME.win98} />);

    const win98ScreenRoot = screen.getByTestId('screen-root');
    const win98Frame = screen.getByTestId('window-frame');
    const win98Content = screen.getByTestId('window-content');

    expect(screen.getByTestId('window-title')).toHaveTextContent('Windows Window');
    expect(win98Content).toHaveTextContent('Windows content');
    expect(defaultScreenRoot).not.toBeInTheDocument();
    expect(win98ScreenRoot).not.toBe(defaultScreenRoot);
    expect(win98Frame).not.toBe(defaultFrame);
    expect(win98Content).not.toBe(defaultContent);

    rerender(<HistoricalDevThemeRoot activeTheme={DEV_THEME.winxp} />);

    const winXpScreenRoot = screen.getByTestId('screen-root');
    const winXpFrame = screen.getByTestId('window-frame');
    const winXpContent = screen.getByTestId('window-content');

    expect(screen.getByTestId('window-title')).toHaveTextContent('Windows Window');
    expect(winXpContent).toHaveTextContent('Windows content');
    expect(win98ScreenRoot).not.toBeInTheDocument();
    expect(winXpScreenRoot).toHaveAttribute('data-theme', DEV_THEME.winxp);
    expect(winXpScreenRoot).not.toBe(win98ScreenRoot);
    expect(winXpFrame).not.toBe(win98Frame);
    expect(winXpContent).not.toBe(win98Content);
  });

  it.each(SYSTEM_SHELL_CASES)(
    '%s renders CScreen -> CWindowManager -> CWindow composition',
    ({ titleText, bodyText, selection }) => {
      const { container } = render(
        <SystemHost systemType={selection.systemType} theme={selection.theme} />,
      );

      expectSharedShellComposition(titleText, bodyText, container);
    },
  );

  it('win98 and winxp share the window seam', () => {
    const win98Render = render(<SystemHost systemType="windows" theme="win98" />);
    const win98Seam = collectWindowSeamSignature();

    win98Render.unmount();

    render(<SystemHost systemType="windows" theme="winxp" />);
    const winxpSeam = collectWindowSeamSignature();

    expect(win98Seam).toEqual(winxpSeam);
  });
});
