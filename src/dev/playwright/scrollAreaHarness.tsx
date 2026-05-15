import { Component, useState } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { CScrollArea } from '@/components/ScrollArea/ScrollArea';
import { DevThemeRoot, type DevThemeId } from '../themeSwitcher';
import { readHarnessRoute } from './harnessRoute';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<{ readonly children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { readonly children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ScrollAreaHarness] React render error:', error.message, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <div data-testid="fixture-error">Render Error: {this.state.errorMessage}</div>;
    }
    return this.props.children;
  }
}

const createLongContent = (): ReactNode[] => {
  const items: ReactNode[] = [];
  for (let idx = 0; idx < 20; idx++) {
    items.push(
      <p key={`line-${idx}`} style={{ margin: '0 0 8px 0' }}>
        Line {idx + 1}: Scrollable content to force overflow on the scrolling axis.
      </p>,
    );
  }
  return items;
};

const createTallContent = (): ReactNode[] => {
  const items: ReactNode[] = [];
  for (let idx = 0; idx < 20; idx++) {
    items.push(
      <p key={`vert-${idx}`} style={{ margin: '0 0 8px 0' }}>
        Vertical content {idx + 1}
      </p>,
    );
  }
  return items;
};

const createWideContent = (): ReactNode[] => {
  const items: ReactNode[] = [];
  for (let idx = 0; idx < 20; idx++) {
    items.push(
      <span key={`col-${idx}`} style={{ display: 'inline-block', marginRight: '24px' }}>
        Column {idx + 1}
      </span>,
    );
  }
  return items;
};

const SHRINKING_CONTENT_NUMBER_OF_ITEMS = 5;

const ShrinkingContentItem = ({
  index,
  onRemove,
}: {
  index: number;
  onRemove: (index: number) => void;
}): ReactNode => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid #ccc',
      }}
    >
      <span>Item {index + 1}</span>
      <button type="button" data-testid={`shrink-remove-${index}`} onClick={() => onRemove(index)}>
        Remove
      </button>
    </div>
  );
};

interface HarnessLayoutProps {
  readonly children: ReactNode;
}

const HarnessLayout = ({ children }: HarnessLayoutProps): ReactNode => {
  return (
    <main
      style={{
        display: 'grid',
        gap: '16px',
        padding: '24px',
        alignContent: 'start',
      }}
    >
      {children}
    </main>
  );
};

const VerticalOverflowFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CScrollArea
        data-testid="scroll-area-host"
        style={{ height: '200px', width: '300px' }}
        overflowX="hidden"
        overflowY="auto"
      >
        <div>{createTallContent()}</div>
      </CScrollArea>
      <p>Vertical overflow only (200px height container, 20 paragraphs)</p>
    </HarnessLayout>
  );
};

const HorizontalOverflowFixture = (): ReactNode => {
  return (
    <HarnessLayout>
      <CScrollArea
        data-testid="scroll-area-host"
        style={{ height: '200px', width: '300px' }}
        overflowX="auto"
        overflowY="hidden"
      >
        <div style={{ display: 'flex', flexDirection: 'row', width: '800px' }}>
          {createWideContent()}
        </div>
      </CScrollArea>
      <p>Horizontal overflow only (300px width container, 20 spans at 800px total)</p>
    </HarnessLayout>
  );
};

const BothAxesOverflowFixture = (): ReactNode => {
  const contentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '800px',
  };

  return (
    <HarnessLayout>
      <CScrollArea
        data-testid="scroll-area-host"
        style={{ height: '200px', width: '300px' }}
        overflowX="auto"
        overflowY="auto"
      >
        <div style={contentStyle}>{createLongContent()}</div>
      </CScrollArea>
      <p>Both axes overflow (200x300 container, 800px content)</p>
    </HarnessLayout>
  );
};

const ShrinkingContentFixture = (): ReactNode => {
  const [items, setItems] = useState<readonly number[]>(
    Array.from({ length: SHRINKING_CONTENT_NUMBER_OF_ITEMS }, (_, i) => i),
  );

  const handleRemove = (index: number): void => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <HarnessLayout>
      <CScrollArea
        data-testid="scroll-area-host"
        style={{ height: '200px', width: '300px' }}
        overflowX="hidden"
        overflowY="auto"
      >
        <div>
          {items.map((itemValue) => (
            <ShrinkingContentItem
              key={`item-${itemValue}`}
              index={itemValue}
              onRemove={handleRemove}
            />
          ))}
        </div>
      </CScrollArea>
      <p>Shrinking content regression (remove items to shrink content height)</p>
    </HarnessLayout>
  );
};

const renderFixture = (fixture: string): ReactNode => {
  switch (fixture) {
    case 'vertical':
      return <VerticalOverflowFixture />;
    case 'horizontal':
      return <HorizontalOverflowFixture />;
    case 'both':
      return <BothAxesOverflowFixture />;
    case 'shrink':
      return <ShrinkingContentFixture />;
    default:
      return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
  }
};

interface ThemedFixtureContainerProps {
  readonly theme: DevThemeId;
  readonly fixture: string;
}

const ThemedFixtureContainer = ({ theme, fixture }: ThemedFixtureContainerProps): ReactNode => {
  return (
    <DevThemeRoot theme={theme}>
      <div style={{ padding: '24px' }}>{renderFixture(fixture)}</div>
    </DevThemeRoot>
  );
};

const App = (): ReactNode => {
  const route = readHarnessRoute();

  return (
    <ErrorBoundary>
      <ThemedFixtureContainer theme={route.theme} fixture={route.fixture} />
    </ErrorBoundary>
  );
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
