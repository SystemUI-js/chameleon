import React from 'react';
import {
  CButton,
  CRadio,
  CRadioGroup,
  CSelect,
  CWindow,
  CWindowTitle,
  CWindowBody,
  Theme,
  CDock,
  CStartBar,
  CGrid,
  CGridItem,
  type CSelectOption,
  type WindowTitleActionButtonPosition,
  WidgetInteractionBehavior,
} from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from './themeSwitcher';
import { ShowcaseCodeDisclosure } from './ShowcaseCodeDisclosure';
import './styles/catalog.scss';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const GRID_COLUMNS = ['1fr', '1fr', '1fr'];
const WINDOW_ACTION_BUTTON_POSITIONS = ['left', 'right'] as const;

const isWindowTitleActionButtonPosition = (
  value: string,
): value is WindowTitleActionButtonPosition => {
  return WINDOW_ACTION_BUTTON_POSITIONS.includes(value as WindowTitleActionButtonPosition);
};

interface ComponentCatalogProps {
  readonly theme: DevThemeId;
  readonly onThemeChange: (theme: DevThemeId) => void;
}

interface ShowcaseSectionProps {
  readonly title: string;
  readonly testId: string;
  readonly children: React.ReactNode;
  readonly code?: string;
}

function ShowcaseSection({
  title,
  testId,
  children,
  code,
}: ShowcaseSectionProps): React.ReactElement {
  return (
    <section data-testid={testId} className="cm-catalog__section">
      <h2 className="cm-catalog__section-title">{title}</h2>
      <div className="cm-catalog__section-content">{children}</div>
      {code !== undefined && <ShowcaseCodeDisclosure sectionId={testId} code={code} />}
    </section>
  );
}

function ThemeSwitcher({
  theme,
  onThemeChange,
}: {
  theme: DevThemeId;
  onThemeChange: (theme: DevThemeId) => void;
}): React.ReactElement {
  return (
    <div data-testid="catalog-theme-switch" className="cm-catalog__theme-switcher">
      <label className="cm-catalog__theme-label">
        Theme
        <select
          value={theme}
          onChange={(event) => onThemeChange(event.target.value as DevThemeId)}
          className="cm-catalog__theme-select"
        >
          {Object.values(DEV_THEME).map((themeId) => (
            <option key={themeId} value={themeId}>
              {themeId}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

const BUTTON_SNIPPET = `
const [buttonClicks, setButtonClicks] = useState(0);

return (
  <>
    <CButton variant="primary" onClick={() => setButtonClicks((c) => c + 1)}>Primary action</CButton>
    <CButton>Default action</CButton>
    <CButton variant="ghost">Ghost action</CButton>

    <p>Primary button clicks: {buttonClicks}</p>
  </>
);
`.trim();

function ButtonShowcase(): React.ReactElement {
  const [buttonClicks, setButtonClicks] = React.useState(0);

  return (
    <ShowcaseSection title="Button" testId="catalog-section-button" code={BUTTON_SNIPPET}>
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CButton
            data-testid="button-demo-primary"
            variant="primary"
            onClick={() => setButtonClicks((c) => c + 1)}
          >
            Primary action
          </CButton>
          <CButton>Default action</CButton>
          <CButton variant="ghost">Ghost action</CButton>
        </div>
        <div className="cm-catalog__row">
          <CButton disabled>Disabled default</CButton>
          <CButton variant="primary" disabled>
            Disabled primary
          </CButton>
        </div>
        <p className="cm-catalog__value">Primary button clicks: {buttonClicks}</p>
      </div>
    </ShowcaseSection>
  );
}

const THEME_SNIPPET = `
// Theme wrapper applies theme to entire subtree
<Theme name="cm-theme--win98">
  <CButton>Themed button</CButton>
</Theme>

// Explicit theme prop overrides Theme provider
<Theme name="cm-theme--win98">
  <CButton theme="cm-theme--default">Explicit prop overrides</CButton>
</Theme>
`.trim();

function ThemeShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Theme" testId="catalog-section-theme" code={THEME_SNIPPET}>
      <div>
        <p>
          <strong>Theme wrapper:</strong> Wrap any subtree with <code>&lt;Theme&gt;</code> and set
          the <code>name</code> prop to a theme class like <code>cm-theme--win98</code>.
        </p>
        <p>
          <strong>Nested Theme:</strong> Nesting <code>&lt;Theme&gt;</code> inside another{' '}
          <code>&lt;Theme&gt;</code> is not supported. Use a component&apos;s <code>theme</code>{' '}
          prop to override the provider theme for that specific component.
        </p>
        <p>
          <strong>Explicit prop:</strong> A component&apos;s own <code>theme</code> prop takes
          precedence over any Theme provider in its ancestor chain.
        </p>
        <div aria-hidden="true">
          <Theme name="cm-theme--win98">
            <CButton>Wrapper applies theme</CButton>
          </Theme>
          <Theme name="cm-theme--win98">
            <CButton theme="cm-theme--default">Prop overrides</CButton>
          </Theme>
        </div>
      </div>
    </ShowcaseSection>
  );
}

const RADIOGROUP_SNIPPET = `
const [selectedFruit, setSelectedFruit] = useState('apple');

return (
  <>
    <CRadioGroup aria-label="Favorite fruit" name="fruit" value={selectedFruit} onChange={setSelectedFruit}>
      <CRadio value="apple">Apple</CRadio>
      <CRadio value="orange">Orange</CRadio>
    </CRadioGroup>

    <p>Selected fruit: {selectedFruit}</p>
  </>
);
`.trim();

function RadioGroupShowcase(): React.ReactElement {
  const [selectedFruit, setSelectedFruit] = React.useState('apple');

  return (
    <ShowcaseSection title="RadioGroup" testId="catalog-section-radio" code={RADIOGROUP_SNIPPET}>
      <div className="cm-catalog__stack">
        <CRadioGroup
          aria-label="Favorite fruit"
          data-testid="radio-demo-fruit"
          name="fruit"
          value={selectedFruit}
          onChange={setSelectedFruit}
        >
          <div className="cm-catalog__choice-row">
            <CRadio value="apple">Apple</CRadio>
            <CRadio value="orange">Orange</CRadio>
          </div>
        </CRadioGroup>
        <CRadioGroup name="fruit-disabled" defaultValue="apple" disabled>
          <div className="cm-catalog__choice-row">
            <CRadio value="apple">Apple disabled</CRadio>
            <CRadio value="orange">Orange disabled</CRadio>
          </div>
        </CRadioGroup>
        <p className="cm-catalog__value">Selected fruit: {selectedFruit}</p>
      </div>
    </ShowcaseSection>
  );
}

const SELECT_SNIPPET = `
const [selectedSize, setSelectedSize] = useState('medium');

return (
  <>
    <CSelect name="size" value={selectedSize} options={sizeOptions} onChange={setSelectedSize} />

    <p>Selected size: {selectedSize}</p>
  </>
);
`.trim();

function SelectShowcase(): React.ReactElement {
  const [selectedSize, setSelectedSize] = React.useState('medium');

  return (
    <ShowcaseSection title="Select" testId="catalog-section-select" code={SELECT_SNIPPET}>
      <div className="cm-catalog__stack">
        <CSelect
          data-testid="select-demo-size"
          name="size"
          value={selectedSize}
          options={SIZE_OPTIONS}
          onChange={setSelectedSize}
        />
        <CSelect name="size-disabled" value="large" options={SIZE_OPTIONS} disabled />
        <p className="cm-catalog__value">Selected size: {selectedSize}</p>
      </div>
    </ShowcaseSection>
  );
}

const WINDOW_SNIPPET =
  `const [actionButtonPosition, setActionButtonPosition] = useState<'left' | 'right'>('right');

const actionButtons = (
  <div className="cm-catalog__window-actions">
    <button type="button">—</button>
    <button type="button">□</button>
    <button type="button">×</button>
  </div>
);

return (
  <>
    <CRadioGroup
      aria-label="Window action button position"
      name="window-action-button-position"
      value={actionButtonPosition}
      onChange={setActionButtonPosition}
    >
      <CRadio value="left">Left</CRadio>
      <CRadio value="right">Right</CRadio>
    </CRadioGroup>

    <CWindow x={24} y={24} width={300} height={140} resizeBehavior={WidgetInteractionBehavior.Outline}>
      <CWindowTitle actionButton={actionButtons} actionButtonPosition={actionButtonPosition}>
        Sample Window
      </CWindowTitle>
      <CWindowBody>
        <p>Window content goes here.</p>
        <p>Try dragging the title bar.</p>
      </CWindowBody>
    </CWindow>
  </>
);`.trim();

function WindowShowcase(): React.ReactElement {
  const [actionButtonPosition, setActionButtonPosition] =
    React.useState<WindowTitleActionButtonPosition>('right');

  const handleActionButtonPositionChange = React.useCallback((nextValue: string) => {
    if (isWindowTitleActionButtonPosition(nextValue)) {
      setActionButtonPosition(nextValue);
    }
  }, []);

  const handleWindowActionClick = React.useCallback((): void => {}, []);

  const actionButtons = React.useMemo(
    () => (
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
    ),
    [handleWindowActionClick],
  );

  return (
    <ShowcaseSection title="Window" testId="catalog-section-window" code={WINDOW_SNIPPET}>
      <div className="cm-catalog__stack">
        <CRadioGroup
          aria-label="Window action button position"
          data-testid="window-demo-position"
          name="window-action-button-position"
          value={actionButtonPosition}
          onChange={handleActionButtonPositionChange}
        >
          <div className="cm-catalog__choice-row cm-catalog__window-position-choice-row">
            <CRadio value="left">Left</CRadio>
            <CRadio value="right">Right</CRadio>
          </div>
        </CRadioGroup>
        <div className="cm-catalog__stage cm-catalog__stage--relative">
          <CWindow
            x={24}
            y={24}
            width={300}
            height={140}
            resizeBehavior={WidgetInteractionBehavior.Outline}
          >
            <CWindowTitle actionButton={actionButtons} actionButtonPosition={actionButtonPosition}>
              Sample Window
            </CWindowTitle>
            <CWindowBody>
              <p>Window content goes here.</p>
              <p>Try dragging the title bar.</p>
            </CWindowBody>
          </CWindow>
        </div>
      </div>
    </ShowcaseSection>
  );
}

const DOCK_SNIPPET = `<CDock position="top" height={48} className="cm-catalog__dock">
  <div className="cm-catalog__dock-content">Dock content area</div>
</CDock>`.trim();

function DockShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Dock" testId="catalog-section-dock" code={DOCK_SNIPPET}>
      <div className="cm-catalog__stage cm-catalog__stage--relative">
        <CDock position="top" height={48} className="cm-catalog__dock">
          <div className="cm-catalog__dock-content">Dock content area</div>
        </CDock>
        <div className="cm-catalog__dock-spacer" />
      </div>
    </ShowcaseSection>
  );
}

const STARTBAR_SNIPPET =
  `<CStartBar data-testid="catalog-start-bar" height={32} className="cm-catalog__start-bar">
  <span>Application shortcuts</span>
</CStartBar>`.trim();

function StartBarShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="StartBar" testId="catalog-section-start-bar" code={STARTBAR_SNIPPET}>
      <div className="cm-catalog__stage cm-catalog__stage--relative">
        <div className="cm-catalog__start-bar-spacer" />
        <CStartBar data-testid="catalog-start-bar" height={32} className="cm-catalog__start-bar">
          <span>Application shortcuts</span>
        </CStartBar>
      </div>
    </ShowcaseSection>
  );
}

const GRID_SNIPPET = `<CGrid
  className="cm-catalog__grid"
  grid={GRID}
  initGridSize={{ rows: ['1fr', '1fr', '1fr'], columns: GRID_COLUMNS }}
>
  <CGridItem parentGrid={GRID} grid={[1, 2, 1, 2]} className="cm-catalog__grid-item">
    Item 1
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[1, 2, 2, 3]} className="cm-catalog__grid-item">
    Item 2
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[1, 2, 3, 4]} className="cm-catalog__grid-item">
    Item 3
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[2, 3, 1, 2]} className="cm-catalog__grid-item">
    Item 4
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[2, 3, 2, 4]} className="cm-catalog__grid-item">
    Item 5
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[3, 4, 1, 4]} className="cm-catalog__grid-item">
    Item 6
  </CGridItem>
</CGrid>`.trim();

function GridShowcase(): React.ReactElement {
  const GRID: [number, number] = [3, 3];

  return (
    <ShowcaseSection title="Grid" testId="catalog-section-grid" code={GRID_SNIPPET}>
      <CGrid
        className="cm-catalog__grid"
        grid={GRID}
        initGridSize={{ rows: ['1fr', '1fr', '1fr'], columns: GRID_COLUMNS }}
      >
        <CGridItem parentGrid={GRID} grid={[1, 2, 1, 2]} className="cm-catalog__grid-item">
          Item 1
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[1, 2, 2, 3]} className="cm-catalog__grid-item">
          Item 2
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[1, 2, 3, 4]} className="cm-catalog__grid-item">
          Item 3
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[2, 3, 1, 2]} className="cm-catalog__grid-item">
          Item 4
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[2, 3, 2, 4]} className="cm-catalog__grid-item">
          Item 5
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[3, 4, 1, 4]} className="cm-catalog__grid-item">
          Item 6
        </CGridItem>
      </CGrid>
    </ShowcaseSection>
  );
}

export function ComponentCatalog({
  theme,
  onThemeChange,
}: ComponentCatalogProps): React.ReactElement {
  return (
    <div data-testid="component-catalog" className="cm-catalog">
      <DevThemeRoot theme={theme} testId={null}>
        <header className="cm-catalog__header">
          <h1 className="cm-catalog__title">Component Catalog</h1>
          <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
        </header>
      </DevThemeRoot>

      <main className="cm-catalog__main">
        <ThemeShowcase />
        <DevThemeRoot theme={theme}>
          <div className="cm-catalog__showcase-list">
            <ButtonShowcase />
            <RadioGroupShowcase />
            <SelectShowcase />
            <WindowShowcase />
            <DockShowcase />
            <StartBarShowcase />
            <GridShowcase />
          </div>
        </DevThemeRoot>
      </main>
    </div>
  );
}
