import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CWindow } from '@/components/Window/Window';
import {
  CWindowTitle,
  type WindowTitleActionButtonPosition,
} from '@/components/Window/WindowTitle';
import { WidgetInteractionBehavior } from '@/components/Widget/Widget';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from '../themeSwitcher';
import '../styles/catalog.scss';

type HarnessRoute = {
  theme: DevThemeId;
  fixture: string;
};

const DEFAULT_FIXTURE = 'default';
const DEV_THEME_IDS = Object.values(DEV_THEME);

const isDevThemeId = (value: string | null): value is DevThemeId => {
  return value !== null && DEV_THEME_IDS.includes(value as DevThemeId);
};

const handleWindowActionClick = (): void => {};

const renderWindowActionButtons = (): ReactNode => {
  return (
    <div className="cm-catalog__window-actions">
      <button
        type="button"
        className="cm-catalog__window-action"
        data-testid="window-demo-minimize"
        aria-label="Minimize window"
        onClick={handleWindowActionClick}
      >
        —
      </button>
      <button
        type="button"
        className="cm-catalog__window-action"
        data-testid="window-demo-maximize"
        aria-label="Maximize window"
        onClick={handleWindowActionClick}
      >
        □
      </button>
      <button
        type="button"
        className="cm-catalog__window-action cm-catalog__window-action--close"
        data-testid="window-demo-close"
        aria-label="Close window"
        onClick={handleWindowActionClick}
      >
        ×
      </button>
    </div>
  );
};

const renderActionButtonFixture = (
  title: string,
  actionButtonPosition?: WindowTitleActionButtonPosition,
): ReactNode => {
  return (
    <CWindow x={10} y={20} width={240} height={160}>
      <CWindowTitle
        actionButton={renderWindowActionButtons()}
        actionButtonPosition={actionButtonPosition}
      >
        {title}
      </CWindowTitle>
      <div>Window action controls</div>
    </CWindow>
  );
};

const readHarnessRoute = (): HarnessRoute => {
  try {
    const url = new URL(window.location.href);
    const fixture = url.searchParams.get('fixture');
    const theme = url.searchParams.get('theme');

    return {
      theme: isDevThemeId(theme) ? theme : DEV_THEME.default,
      fixture: fixture ?? DEFAULT_FIXTURE,
    };
  } catch {
    return {
      theme: DEV_THEME.default,
      fixture: DEFAULT_FIXTURE,
    };
  }
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'default':
      return (
        <CWindow x={10} y={20} width={240} height={160}>
          <CWindowTitle>Default Window</CWindowTitle>
          <div>Default content</div>
        </CWindow>
      );
    case 'drag-only':
      return (
        <CWindow
          x={12}
          y={24}
          width={200}
          height={120}
          resizable={false}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Drag only</CWindowTitle>
        </CWindow>
      );
    case 'min-clamp':
      return (
        <CWindow
          x={30}
          y={30}
          width={40}
          height={30}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Clamp min</CWindowTitle>
        </CWindow>
      );
    case 'max-clamp':
      return (
        <CWindow
          x={50}
          y={60}
          width={120}
          height={100}
          resizeOptions={{
            minContentWidth: 20,
            minContentHeight: 30,
            maxContentWidth: 150,
            maxContentHeight: 110,
          }}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Clamp max</CWindowTitle>
        </CWindow>
      );
    case 'outline-move':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          moveBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Move</CWindowTitle>
          <div>Outline move content</div>
        </CWindow>
      );
    case 'outline-resize':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Resize</CWindowTitle>
          <div>Outline resize content</div>
        </CWindow>
      );
    case 'outline-both':
      return (
        <CWindow
          x={10}
          y={20}
          width={240}
          height={160}
          moveBehavior={WidgetInteractionBehavior.Outline}
          resizeBehavior={WidgetInteractionBehavior.Outline}
        >
          <CWindowTitle>Outline Both</CWindowTitle>
          <div>Outline move + resize content</div>
        </CWindow>
      );
    case 'action-buttons-right':
      return renderActionButtonFixture('Action buttons right');
    case 'action-buttons-left':
      return renderActionButtonFixture('Action buttons left', 'left');
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

const App = () => {
  const route = readHarnessRoute();

  return <DevThemeRoot theme={route.theme}>{renderFixture(route.fixture)}</DevThemeRoot>;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
