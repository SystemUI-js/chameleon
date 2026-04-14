import React from 'react';
import {
  CButton,
  CButtonGroup,
  CButtonSeparator,
  CCheckbox,
  CDock,
  CGrid,
  CGridItem,
  CIconContainer,
  CMenu,
  CRadio,
  CRadioGroup,
  CSelect,
  CStatusBar,
  CStatusBarItem,
  CStartBar,
  CSplitArea,
  CTab,
  CTabItem,
  CWindow,
  CWindowBody,
  CWindowTitle,
  Theme,
  type CSelectOption,
  type MenuListItem,
  type WindowTitleActionButtonPosition,
  WidgetInteractionBehavior,
} from '@/components';
import { ShowcaseCodeDisclosure } from './ShowcaseCodeDisclosure';
import './styles/catalog.scss';
import { DEV_THEME, DevThemeRoot, type DevThemeId } from './themeSwitcher';

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

const BUTTON_GROUP_SNIPPET = `
<CButtonGroup variant="primary">
  <CButton>Back</CButton>
  <CButton>Next</CButton>
  <CButtonSeparator />
  <CButton variant="ghost">Cancel</CButton>
</CButtonGroup>

<CButtonGroup orientation="vertical" disabled>
  <CButton>Up</CButton>
  <CButton>Down</CButton>
</CButtonGroup>
`.trim();

const SPLIT_AREA_SNIPPET = `
const [showInspector, setShowInspector] = useState(true);

return (
  <>
    <CButton onClick={() => setShowInspector((visible) => !visible)}>
      {showInspector ? 'Hide inspector' : 'Restore inspector'}
    </CButton>

    <CSplitArea direction="horizontal" separatorMovable className="workspace-layout">
      <section>Explorer</section>
      <CSplitArea direction="vertical" separatorMovable>
        <section>Editor</section>
        <CSplitArea direction="horizontal" separatorMovable>
          <section>Preview</section>
          <section>Console</section>
        </CSplitArea>
      </CSplitArea>
      {showInspector ? <section>Inspector</section> : null}
    </CSplitArea>
  </>
);
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

function ButtonGroupShowcase(): React.ReactElement {
  return (
    <ShowcaseSection
      title="ButtonGroup"
      testId="catalog-section-button-group"
      code={BUTTON_GROUP_SNIPPET}
    >
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CButtonGroup data-testid="button-group-demo-horizontal" variant="primary">
            <CButton>Back</CButton>
            <CButton>Next</CButton>
            <CButtonSeparator />
            <CButton variant="ghost">Cancel</CButton>
          </CButtonGroup>
        </div>
        <div className="cm-catalog__row">
          <CButtonGroup data-testid="button-group-demo-vertical" orientation="vertical">
            <CButton>Top</CButton>
            <CButton>Middle</CButton>
            <CButtonSeparator />
            <CButton>Bottom</CButton>
          </CButtonGroup>
          <CButtonGroup data-testid="button-group-demo-disabled" disabled variant="primary">
            <CButton>Save</CButton>
            <CButton>Apply</CButton>
            <CButtonSeparator />
            <CButton variant="ghost">Reset</CButton>
          </CButtonGroup>
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

const CHECKBOX_SNIPPET = `
const [notificationsEnabled, setNotificationsEnabled] = useState(true);

return (
  <>
    <CCheckbox checked={notificationsEnabled} onChange={setNotificationsEnabled}>
      Enable notifications
    </CCheckbox>
    <CCheckbox defaultChecked>Auto-save drafts</CCheckbox>
    <CCheckbox disabled>Disabled setting</CCheckbox>

    <p>Notifications enabled: {notificationsEnabled ? 'Yes' : 'No'}</p>
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

function CheckboxShowcase(): React.ReactElement {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ShowcaseSection title="Checkbox" testId="catalog-section-checkbox" code={CHECKBOX_SNIPPET}>
      <div className="cm-catalog__stack">
        <CCheckbox
          checked={notificationsEnabled}
          data-testid="checkbox-demo-notifications"
          onChange={setNotificationsEnabled}
        >
          Enable notifications
        </CCheckbox>
        <CCheckbox defaultChecked>Auto-save drafts</CCheckbox>
        <CCheckbox disabled>Disabled setting</CCheckbox>
        <p className="cm-catalog__value">
          Notifications enabled: {notificationsEnabled ? 'Yes' : 'No'}
        </p>
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

const SAMPLE_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'file',
    key: 'file',
    title: 'File',
    children: [
      { id: 'file-new', key: 'file-new', title: 'New' },
      { id: 'file-open', key: 'file-open', title: 'Open' },
    ],
  },
  {
    id: 'view',
    key: 'view',
    title: 'View',
    children: [{ id: 'view-zoom', key: 'view-zoom', title: 'Zoom' }],
  },
];

const MIXED_MENU_LIST: readonly MenuListItem[] = [
  {
    id: 'file',
    key: 'file',
    title: 'File (hover default)',
    children: [
      { id: 'file-new', key: 'file-new', title: 'New' },
      { id: 'file-open', key: 'file-open', title: 'Open' },
    ],
  },
  {
    id: 'view',
    key: 'view',
    title: 'View (click override)',
    trigger: 'click',
    children: [{ id: 'view-zoom', key: 'view-zoom', title: 'Zoom' }],
  },
];

const MENU_SNIPPET = `
const [selectedItem, setSelectedItem] = useState<MenuListItem | null>(null);

return (
  <>
    <CMenu data-testid="menu-demo-mixed" trigger="click" menuList={MIXED_MENU_LIST} onSelect={setSelectedItem}>
      <CButton data-testid="menu-demo-trigger-mixed">Mixed Menu</CButton>
    </CMenu>

    <p>Root opens on click, nested parents default to hover, and explicit item.trigger=&quot;click&quot; still overrides.</p>
    <p>Selected: {selectedItem?.title ?? 'none'}</p>
  </>
);
`.trim();

const TAB_SNIPPET = `
<CTab>
  <CTabItem key="overview" title="Overview">
    <p>Use arrow keys, Home, and End to move between tabs.</p>
    <p>Panels preserve semantic tab roles and active state automatically.</p>
  </CTabItem>
  <CTabItem key="details" title="Details">
    <p>Each tab panel can render any React content.</p>
  </CTabItem>
  <CTabItem key="notes" title="Notes">
    <p>CTab manages focus and selection internally.</p>
  </CTabItem>
</CTab>
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

function TabShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Tab" testId="catalog-section-tab" code={TAB_SNIPPET}>
      <CTab data-testid="tab-demo">
        <CTabItem key="overview" title="Overview">
          <div className="cm-catalog__stack">
            <p>Use arrow keys, Home, and End to move between tabs.</p>
            <p>Panels preserve semantic tab roles and active state automatically.</p>
          </div>
        </CTabItem>
        <CTabItem key="details" title="Details">
          <div className="cm-catalog__stack">
            <p>Each tab panel can render any React content.</p>
            <p>Try switching tabs with mouse or keyboard.</p>
          </div>
        </CTabItem>
        <CTabItem key="notes" title="Notes">
          <div className="cm-catalog__stack">
            <p>CTab manages focus and selection internally.</p>
            <p>Use keyed items for stable tab and panel identifiers.</p>
          </div>
        </CTabItem>
      </CTab>
    </ShowcaseSection>
  );
}

function MenuShowcase(): React.ReactElement {
  const [selectedItem, setSelectedItem] = React.useState<MenuListItem | null>(null);

  return (
    <ShowcaseSection title="Menu" testId="catalog-section-menu" code={MENU_SNIPPET}>
      <div className="cm-catalog__stack">
        <CMenu
          data-testid="menu-demo-mixed"
          trigger="click"
          menuList={MIXED_MENU_LIST}
          onSelect={setSelectedItem}
        >
          <CButton data-testid="menu-demo-trigger-mixed">Mixed Menu</CButton>
        </CMenu>
        <p className="cm-catalog__value">
          Mixed mode: root opens on click, <strong>File</strong> opens on hover, and{' '}
          <strong>View</strong> keeps click via <code>item.trigger=&quot;click&quot;</code>.
        </p>
        <CMenu
          data-testid="menu-demo"
          trigger="click"
          menuList={SAMPLE_MENU_LIST}
          onSelect={setSelectedItem}
        >
          <CButton data-testid="menu-demo-trigger">Click Menu</CButton>
        </CMenu>
        <CMenu
          data-testid="menu-demo-hover"
          trigger="hover"
          menuList={SAMPLE_MENU_LIST}
          onSelect={setSelectedItem}
        >
          <CButton data-testid="menu-demo-trigger-hover">Hover Menu</CButton>
        </CMenu>
        <p className="cm-catalog__value">Selected: {selectedItem?.title ?? 'none'}</p>
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
      <CStatusBar>
        <CStatusBarItem>Ready</CStatusBarItem>
        <CStatusBarItem>Line 12, Column 4</CStatusBarItem>
      </CStatusBar>
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
        <CButton
          className="cm-catalog__window-action"
          data-testid="window-demo-minimize"
          aria-label="Minimize window"
          compact
          onClick={handleWindowActionClick}
        >
          _
        </CButton>
        <CButton
          className="cm-catalog__window-action"
          data-testid="window-demo-maximize"
          aria-label="Maximize window"
          compact
          onClick={handleWindowActionClick}
        >
          □
        </CButton>
        <CButton
          className="cm-catalog__window-action cm-catalog__window-action--close"
          data-testid="window-demo-close"
          aria-label="Close window"
          compact
          onClick={handleWindowActionClick}
        >
          ×
        </CButton>
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
            <CStatusBar>
              <CStatusBarItem>Ready</CStatusBarItem>
              <CStatusBarItem>Line 12, Column 4</CStatusBarItem>
            </CStatusBar>
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
  className="cm-grid-demo-3x3"
  grid={GRID}
  initGridSize={{ rows: ['1fr', '1fr', '1fr'], columns: GRID_COLUMNS }}
>
  <CGridItem parentGrid={GRID} grid={[1, 2, 1, 2]} className="cm-grid-demo-3x3__item">
    Item 1
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[1, 2, 2, 3]} className="cm-grid-demo-3x3__item">
    Item 2
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[1, 2, 3, 4]} className="cm-grid-demo-3x3__item">
    Item 3
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[2, 3, 1, 2]} className="cm-grid-demo-3x3__item">
    Item 4
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[2, 3, 2, 4]} className="cm-grid-demo-3x3__item">
    Item 5
  </CGridItem>
  <CGridItem parentGrid={GRID} grid={[3, 4, 1, 4]} className="cm-grid-demo-3x3__item">
    Item 6
  </CGridItem>
</CGrid>`.trim();

const ICON_SNIPPET = `
const [activeInfo, setActiveInfo] = React.useState<string | null>(null);
const [openInfo, setOpenInfo] = React.useState<string | null>(null);
const [contextInfo, setContextInfo] = React.useState<string | null>(null);
const [coords, setCoords] = React.useState<Record<string, string>>({});

const readIconPositions = () => {
  const container = document.querySelector('[data-testid="icon-container"]');
  if (!container) return;
  const items = container.querySelectorAll('[data-testid^="icon-item-"]');
  const newCoords = {};
  items.forEach((item, i) => {
    const el = item;
    newCoords['item' + i] = (el.style.left || '0') + ',' + (el.style.top || '0');
  });
  setCoords(newCoords);
};

React.useEffect(() => { readIconPositions(); }, []);

return (
  <CIconContainer
    data-testid="icon-container"
    iconList={[
      {
        icon: <span>★</span>,
        title: 'Star',
        position: { x: 10, y: 10 },
        activeTrigger: 'click',
        openTrigger: 'click',
        onActive: (active) => { setActiveInfo(active ? 'Star clicked' : null); readIconPositions(); },
        onOpen: () => setOpenInfo('Star opened'),
        onContextMenu: () => setContextInfo('Heart context'),
      },
      {
        icon: <span>♥</span>,
        title: 'Heart',
        position: { x: 60, y: 10 },
        activeTrigger: 'hover',
        openTrigger: 'doubleClick',
        onActive: (active) => { setActiveInfo(active ? 'Heart hovered' : null); readIconPositions(); },
        onOpen: () => setOpenInfo('Heart double-clicked'),
        onContextMenu: () => setContextInfo('Heart context'),
      },
    ]}
  />
);
`.trim();

function IconShowcase(): React.ReactElement {
  const [activeInfo, setActiveInfo] = React.useState<string | null>(null);
  const [openInfo, setOpenInfo] = React.useState<string | null>(null);
  const [contextInfo, setContextInfo] = React.useState<string | null>(null);
  const [coords, setCoords] = React.useState<Record<string, string>>({});

  const readIconPositions = React.useCallback(() => {
    const container = document.querySelector('[data-testid="icon-container"]');
    if (!container) return;
    const items = container.querySelectorAll('[data-testid^="icon-item-"]');
    const newCoords: Record<string, string> = {};
    items.forEach((item, i) => {
      const el = item as HTMLElement;
      newCoords[`item${i}`] = `${el.style.left || '0'},${el.style.top || '0'}`;
    });
    setCoords(newCoords);
  }, []);

  React.useEffect(() => {
    readIconPositions();
  }, [readIconPositions]);

  return (
    <ShowcaseSection title="Icon" testId="catalog-section-icon" code={ICON_SNIPPET}>
      <div className="cm-catalog__stack">
        <div
          className="cm-catalog__stage cm-catalog__stage--relative"
          style={{ minHeight: '80px' }}
        >
          <CIconContainer
            data-testid="icon-container"
            iconList={[
              {
                icon: <span>★</span>,
                title: 'Star',
                position: { x: 10, y: 10 },
                activeTrigger: 'click',
                openTrigger: 'click',
                onActive: (active) => {
                  setActiveInfo(active ? 'Star clicked' : null);
                  readIconPositions();
                },
                onOpen: () => setOpenInfo('Star opened'),
                onContextMenu: () => setContextInfo('Star context'),
              },
              {
                icon: <span>♥</span>,
                title: 'Heart',
                position: { x: 60, y: 10 },
                activeTrigger: 'hover',
                openTrigger: 'doubleClick',
                onActive: (active) => {
                  setActiveInfo(active ? 'Heart hovered' : null);
                  readIconPositions();
                },
                onOpen: () => setOpenInfo('Heart double-clicked'),
                onContextMenu: () => setContextInfo('Heart context'),
              },
            ]}
          />
        </div>
        <div className="cm-catalog__row">
          <span className="cm-catalog__label">Active:</span>
          <span className="cm-catalog__value">{activeInfo ?? '—'}</span>
        </div>
        <div className="cm-catalog__row">
          <span className="cm-catalog__label">Open:</span>
          <span className="cm-catalog__value">{openInfo ?? '—'}</span>
        </div>
        <div className="cm-catalog__row">
          <span className="cm-catalog__label">Context:</span>
          <span className="cm-catalog__value">{contextInfo ?? '—'}</span>
        </div>
        <div className="cm-catalog__row">
          <span className="cm-catalog__label">Coords:</span>
          <span className="cm-catalog__value" data-testid="icon-coords-display">
            {Object.keys(coords).length > 0
              ? Object.entries(coords)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(' | ')
              : '—'}
          </span>
          <button type="button" data-testid="icon-coords-refresh" onClick={readIconPositions}>
            Refresh
          </button>
        </div>
      </div>
    </ShowcaseSection>
  );
}

function GridShowcase(): React.ReactElement {
  const GRID: [number, number] = [3, 3];

  return (
    <ShowcaseSection title="Grid" testId="catalog-section-grid" code={GRID_SNIPPET}>
      <CGrid
        className="cm-grid-demo-3x3"
        grid={GRID}
        initGridSize={{ rows: ['1fr', '1fr', '1fr'], columns: GRID_COLUMNS }}
      >
        <CGridItem parentGrid={GRID} grid={[1, 2, 1, 2]} className="cm-grid-demo-3x3__item">
          Item 1
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[1, 2, 2, 3]} className="cm-grid-demo-3x3__item">
          Item 2
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[1, 2, 3, 4]} className="cm-grid-demo-3x3__item">
          Item 3
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[2, 3, 1, 2]} className="cm-grid-demo-3x3__item">
          Item 4
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[2, 3, 2, 4]} className="cm-grid-demo-3x3__item">
          Item 5
        </CGridItem>
        <CGridItem parentGrid={GRID} grid={[3, 4, 1, 4]} className="cm-grid-demo-3x3__item">
          Item 6
        </CGridItem>
      </CGrid>
    </ShowcaseSection>
  );
}

function SplitAreaShowcase(): React.ReactElement {
  const [showInspector, setShowInspector] = React.useState(true);

  return (
    <ShowcaseSection
      title="SplitArea"
      testId="catalog-section-split-area"
      code={SPLIT_AREA_SNIPPET}
    >
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CButton
            data-testid="split-area-demo-toggle"
            onClick={() => setShowInspector((visible) => !visible)}
          >
            {showInspector ? '隐藏右侧区域' : '恢复右侧区域'}
          </CButton>
          <span className="cm-catalog__value" data-testid="split-area-demo-status">
            {showInspector ? '当前为三栏布局' : '当前为双栏布局'}
          </span>
        </div>

        <div className="cm-split-area-demo-shell">
          <CSplitArea
            data-testid="split-area-demo-root"
            direction="horizontal"
            separatorMovable
            className="cm-split-area-demo"
          >
            <section className="cm-split-area-demo__panel cm-split-area-demo__panel--sidebar">
              <h3 className="cm-split-area-demo__title">Explorer</h3>
              <p className="cm-split-area-demo__text">导航区保持横向分割中的左侧面板。</p>
            </section>

            <CSplitArea
              direction="vertical"
              separatorMovable
              className="cm-split-area-demo__nested"
            >
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--editor">
                <h3 className="cm-split-area-demo__title">Editor</h3>
                <p className="cm-split-area-demo__text">
                  中间区域再按纵向拆分，模拟编辑器与输出区。
                </p>
              </section>

              <CSplitArea
                direction="horizontal"
                separatorMovable
                className="cm-split-area-demo__nested"
              >
                <section className="cm-split-area-demo__panel cm-split-area-demo__panel--preview">
                  <h3 className="cm-split-area-demo__title">Preview</h3>
                  <p className="cm-split-area-demo__text">横向嵌套区域可继续拖动调整。</p>
                </section>
                <section className="cm-split-area-demo__panel cm-split-area-demo__panel--console">
                  <h3 className="cm-split-area-demo__title">Console</h3>
                  <p className="cm-split-area-demo__text">分割线支持拖动，方便观察比例变化。</p>
                </section>
              </CSplitArea>
            </CSplitArea>

            {showInspector ? (
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--inspector">
                <h3 className="cm-split-area-demo__title">Inspector</h3>
                <p className="cm-split-area-demo__text">
                  点击按钮后该区域会被移除，并触发布局重算。
                </p>
              </section>
            ) : null}
          </CSplitArea>
        </div>
      </div>
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
            <ButtonGroupShowcase />
            <RadioGroupShowcase />
            <CheckboxShowcase />
            <SelectShowcase />
            <TabShowcase />
            <IconShowcase />
            <MenuShowcase />
            <WindowShowcase />
            <DockShowcase />
            <StartBarShowcase />
            <SplitAreaShowcase />
            <GridShowcase />
          </div>
        </DevThemeRoot>
      </main>
    </div>
  );
}
