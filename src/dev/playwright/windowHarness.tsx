import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CWindow } from '@/components/Window/Window';
import { CWindowTitle } from '@/components/Window/WindowTitle';

const getFixtureName = (): string => {
  try {
    const url = new URL(window.location.href);
    const f = url.searchParams.get('fixture');
    return f ?? 'default';
  } catch {
    return 'default';
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
        <CWindow x={12} y={24} width={200} height={120} resizable={false}>
          <CWindowTitle>Drag only</CWindowTitle>
        </CWindow>
      );
    case 'min-clamp':
      return (
        <CWindow x={30} y={30} width={40} height={30}>
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
        >
          <CWindowTitle>Clamp max</CWindowTitle>
        </CWindow>
      );
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

const App = () => {
  const fixture = getFixtureName();
  return <>{renderFixture(fixture)}</>;
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
