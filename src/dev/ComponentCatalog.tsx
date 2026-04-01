import React from 'react';
import {
  CButton,
  CRadio,
  CRadioGroup,
  CSelect,
  CWindow,
  CWindowTitle,
  CWindowBody,
  CDock,
  CStartBar,
  CGrid,
  CGridItem,
  type CSelectOption,
} from '@/components';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from './themeSwitcher';
import './styles/catalog.scss';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const GRID_COLUMNS = ['1fr', '1fr', '1fr'];

interface ComponentCatalogProps {
  readonly theme: DevThemeId;
  readonly onThemeChange: (theme: DevThemeId) => void;
}

interface ShowcaseSectionProps {
  readonly title: string;
  readonly testId: string;
  readonly children: React.ReactNode;
}

function ShowcaseSection({ title, testId, children }: ShowcaseSectionProps): React.ReactElement {
  return (
    <section data-testid={testId} className="cm-catalog__section">
      <h2 className="cm-catalog__section-title">{title}</h2>
      <div className="cm-catalog__section-content">{children}</div>
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

function ButtonShowcase(): React.ReactElement {
  const [buttonClicks, setButtonClicks] = React.useState(0);

  return (
    <ShowcaseSection title="Button" testId="catalog-section-button">
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

function RadioGroupShowcase(): React.ReactElement {
  const [selectedFruit, setSelectedFruit] = React.useState('apple');

  return (
    <ShowcaseSection title="RadioGroup" testId="catalog-section-radio">
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

function SelectShowcase(): React.ReactElement {
  const [selectedSize, setSelectedSize] = React.useState('medium');

  return (
    <ShowcaseSection title="Select" testId="catalog-section-select">
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

function WindowShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Window" testId="catalog-section-window">
      <div className="cm-catalog__stage cm-catalog__stage--relative">
        <CWindow x={24} y={24} width={320} height={200}>
          <CWindowTitle>Sample Window</CWindowTitle>
          <CWindowBody>
            <p>Window content goes here.</p>
            <p>Try dragging the title bar.</p>
          </CWindowBody>
        </CWindow>
      </div>
    </ShowcaseSection>
  );
}

function DockShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Dock" testId="catalog-section-dock">
      <div className="cm-catalog__stage cm-catalog__stage--relative">
        <CDock position="top" height={48} className="cm-catalog__dock">
          <div className="cm-catalog__dock-content">Dock content area</div>
        </CDock>
        <div className="cm-catalog__dock-spacer" />
      </div>
    </ShowcaseSection>
  );
}

function StartBarShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="StartBar" testId="catalog-section-start-bar">
      <div className="cm-catalog__stage cm-catalog__stage--relative">
        <div className="cm-catalog__start-bar-spacer" />
        <CStartBar data-testid="catalog-start-bar" height={32} className="cm-catalog__start-bar">
          <span>Application shortcuts</span>
        </CStartBar>
      </div>
    </ShowcaseSection>
  );
}

function GridShowcase(): React.ReactElement {
  const GRID: [number, number] = [3, 3];

  return (
    <ShowcaseSection title="Grid" testId="catalog-section-grid">
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
    <DevThemeRoot theme={theme}>
      <div data-testid="component-catalog" className="cm-catalog">
        <header className="cm-catalog__header">
          <h1 className="cm-catalog__title">Component Catalog</h1>
          <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
        </header>

        <main className="cm-catalog__main">
          <div className="cm-catalog__grid">
            <div className="cm-catalog__column">
              <ButtonShowcase />
              <RadioGroupShowcase />
              <SelectShowcase />
            </div>
            <div className="cm-catalog__column">
              <WindowShowcase />
              <DockShowcase />
              <StartBarShowcase />
              <GridShowcase />
            </div>
          </div>
        </main>
      </div>
    </DevThemeRoot>
  );
}
