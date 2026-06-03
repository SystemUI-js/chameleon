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
  CInput,
  CList,
  CMenu,
  CRadio,
  CRadioGroup,
  CScrollArea,
  CSelect,
  type CSelectOption,
  CSlider,
  CSplitArea,
  CStartBar,
  CStatusBar,
  CStatusBarItem,
  CTab,
  CTabItem,
  CTable,
  CTimePicker,
  CTooltip,
  CTransfer,
  type CTransferItem,
  CTree,
  type CTreeDataNode,
  CWindow,
  CWindowBody,
  CWindowTitle,
  type MenuListItem,
  Theme,
  WidgetInteractionBehavior,
  type WindowTitleActionButtonPosition,
} from '@/components';
import { ShowcaseCodeDisclosure } from './ShowcaseCodeDisclosure';
import './styles/catalog.scss';
import { DEV_THEME, type DevThemeId, DevThemeRoot } from './themeSwitcher';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const GRID_COLUMNS = ['1fr', '1fr', '1fr'];
const WINDOW_ACTION_BUTTON_POSITIONS = ['left', 'right'] as const;

interface CatalogListItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly actions?: readonly string[];
  readonly children?: readonly CatalogListItem[];
  readonly lazyMode?: 'success' | 'retry';
}

const LIST_ITEMS: readonly CatalogListItem[] = [
  {
    id: '1',
    name: 'Item 1',
    description: 'First list item',
    icon: '□',
    actions: ['Edit', 'Delete'],
  },
  {
    id: '2',
    name: 'Item 2',
    description: 'Second list item',
    icon: '◇',
    actions: ['Edit', 'Delete'],
  },
  {
    id: '3',
    name: 'Item 3',
    description: 'Third list item',
    icon: '○',
    actions: ['Edit', 'Delete'],
    children: [
      {
        id: '3-1',
        name: 'Nested note',
        description: 'Immediate child rendered from caller-owned data',
        icon: '↳',
      },
    ],
  },
] as const;

const LIST_GRID_ITEMS: readonly CatalogListItem[] = [
  {
    id: 'grid-1',
    name: 'Grid Alpha',
    description: 'Compact grid card',
    icon: '▣',
  },
  {
    id: 'grid-2',
    name: 'Grid Beta',
    description: 'Second grid card',
    icon: '▤',
  },
  {
    id: 'grid-3',
    name: 'Grid Gamma',
    description: 'Third grid card',
    icon: '▥',
  },
] as const;

const LIST_ICON_ITEMS: readonly CatalogListItem[] = [
  {
    id: 'icon-1',
    name: 'Desktop',
    description: 'Icon mode uses larger affordances',
    icon: '▦',
  },
  {
    id: 'icon-2',
    name: 'Archive',
    description: 'Double-click or hover to emit intent',
    icon: '▧',
  },
  {
    id: 'icon-3',
    name: 'Settings',
    description: 'Keyboard drag handle remains focusable',
    icon: '⚙',
  },
] as const;

const LIST_LAZY_ITEMS: readonly CatalogListItem[] = [
  {
    id: 'lazy-success',
    name: 'Lazy success branch',
    description: 'Expands into async children',
    icon: '▸',
    lazyMode: 'success',
  },
  {
    id: 'lazy-retry',
    name: 'Lazy retry branch',
    description: 'Fails once, then Retry loads children',
    icon: '!',
    lazyMode: 'retry',
  },
] as const;

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
    <div className="cm-catalog__row">
      <CButton variant="primary" onClick={() => setButtonClicks((c) => c + 1)}>Primary action</CButton>
      <CButton>Default action</CButton>
      <CButton variant="ghost">Ghost action</CButton>
    </div>

    <div className="cm-catalog__row">
      <CButton size="compact">Compact</CButton>
      <CButton size="small">Small</CButton>
      <CButton size="medium">Medium</CButton>
      <CButton size="large">Large</CButton>
    </div>

    <div className="cm-catalog__row">
      <CButton displayType="round" size="small" aria-label="Small icon">
        <span aria-hidden="true">+</span>
      </CButton>
      <CButton displayType="round" variant="primary" aria-label="Primary icon">
        <span aria-hidden="true">+</span>
      </CButton>
    </div>

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
        <div className="cm-catalog__row">
          <CButton size="compact">Compact</CButton>
          <CButton size="small">Small</CButton>
          <CButton size="medium">Medium</CButton>
          <CButton size="large">Large</CButton>
        </div>
        <div className="cm-catalog__row">
          <CButton displayType="round" size="small" aria-label="Small icon">
            <span aria-hidden="true">+</span>
          </CButton>
          <CButton displayType="round" size="medium" aria-label="Medium icon">
            <span aria-hidden="true">+</span>
          </CButton>
          <CButton displayType="round" size="large" aria-label="Large icon">
            <span aria-hidden="true">+</span>
          </CButton>
          <CButton displayType="round" variant="primary" aria-label="Primary icon">
            <span aria-hidden="true">+</span>
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

// 基础用法：嵌套分割区域
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

// Hover 模式: area — 鼠标悬停于区域时显示分割线（默认）
<CSplitArea separatorVisibleOnHover separatorHoverMode="area">
  <section>Left</section>
  <section>Right</section>
</CSplitArea>

// Hover 模式: separator — 仅鼠标悬停于分割线本身时才显示
<CSplitArea separatorVisibleOnHover separatorHoverMode="separator">
  <section>Left</section>
  <section>Right</section>
</CSplitArea>
`.trim();

const LIST_SNIPPET = `
const [selectedItem, setSelectedItem] = useState(null);
const [lastIntent, setLastIntent] = useState('none');

return (
  <>
    <CList
      type="list"
      draggable
      items={items}
      getItemKey={(item) => item.id}
      getItemChildren={(item) => item.children}
      renderItem={(item) => <ListLabel item={item} />}
      renderActions={(item) => item.actions?.map((action) => <CButton>{action}</CButton>)}
      onItemClick={(item) => setSelectedItem(item)}
      onItemHover={(payload) => setLastIntent('Hover ' + payload.item.name)}
      onItemDoubleClick={(payload) => setLastIntent('Open ' + payload.item.name)}
      onItemDrag={(payload) => setLastIntent(payload.source.key + ' ' + payload.position + ' ' + payload.target.key)}
      onItemDragInto={(payload) => setLastIntent(payload.source.key + ' inside ' + payload.target.key)}
    />

    <CList type="grid" iconSize={32} items={gridItems} renderItem={(item) => <ListLabel item={item} />} />
    <CList type="icon" iconSize={40} items={iconItems} renderItem={(item) => <ListLabel item={item} />} />

    <CList
      items={lazyItems}
      getItemKey={(item) => item.id}
      isItemExpandable={(item) => item.lazyMode !== undefined}
      onLoadChildren={loadChildren}
      renderItem={(item) => <ListLabel item={item} />}
    />

    <p>Selected: {selectedItem?.name ?? 'none'}</p>
    <p>Intent: {lastIntent}</p>
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

const CSLIDER_SNIPPET = `
const [volume, setVolume] = useState(40);

return (
  <>
    <CSlider min={0} max={100} step={5} value={volume} onChange={setVolume} />

    <p>Volume: {volume}</p>
  </>
);
`.trim();

const SCROLL_AREA_SNIPPET = `
<CScrollArea aria-label="Activity feed" style={{ height: 180 }}>
  {activityItems.map((item) => (
    <article key={item.title}>
      <strong>{item.title}</strong>
      <p>{item.detail}</p>
    </article>
  ))}
</CScrollArea>
`.trim();

const SCROLL_AREA_ACTIVITY_ITEMS = [
  {
    title: 'Build completed',
    detail: 'Library bundle emitted successfully and source maps were updated.',
  },
  {
    title: 'QA snapshot queued',
    detail: 'Visual regression capture is waiting for the Windows XP theme pass.',
  },
  {
    title: 'Theme audit note',
    detail: 'Win98 scrollbar contrast needs a quick check against disabled surfaces.',
  },
  {
    title: 'Docs sync',
    detail: 'Component catalog examples were refreshed for keyboard and screen reader hints.',
  },
  {
    title: 'Release reminder',
    detail: 'Add the component to the next changelog entry before pushing the release branch.',
  },
  {
    title: 'Follow-up task',
    detail: 'Consider adding optional scrollbar size tokens if more skins arrive later.',
  },
] as const;

const SCROLL_AREA_BOTH_AXIS_LINE_NUMBERS = Array.from(
  { length: 20 },
  (_, lineIndex) => lineIndex + 1,
);

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
          aria-label="Catalog size"
          data-testid="select-demo-size"
          name="size"
          value={selectedSize}
          options={SIZE_OPTIONS}
          onChange={setSelectedSize}
        />
        <CSelect
          aria-label="Disabled catalog size"
          name="size-disabled"
          value="large"
          options={SIZE_OPTIONS}
          disabled
        />
        <p className="cm-catalog__value">Selected size: {selectedSize}</p>
      </div>
    </ShowcaseSection>
  );
}

function SliderShowcase(): React.ReactElement {
  const [volume, setVolume] = React.useState(40);

  return (
    <ShowcaseSection title="Slider" testId="catalog-section-slider" code={CSLIDER_SNIPPET}>
      <div className="cm-catalog__stack">
        <div className="cm-catalog__slider-shell">
          <CSlider
            data-testid="slider-demo"
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={setVolume}
            classNames={{
              track: 'cm-catalog__slider-track',
              fill: 'cm-catalog__slider-fill',
              thumb: 'cm-catalog__slider-thumb',
            }}
          />
        </div>
        <p className="cm-catalog__value" data-testid="slider-demo-value">
          Volume: {volume}
        </p>
        <div className="cm-catalog__slider-presets">
          <CButton data-testid="slider-demo-min" size="compact" onClick={() => setVolume(0)}>
            Min
          </CButton>
          <CButton data-testid="slider-demo-mid" size="compact" onClick={() => setVolume(50)}>
            Mid
          </CButton>
          <CButton data-testid="slider-demo-max" size="compact" onClick={() => setVolume(100)}>
            Max
          </CButton>
        </div>
      </div>
    </ShowcaseSection>
  );
}

function ScrollAreaShowcase(): React.ReactElement {
  const bothAxisContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '800px',
  };

  const bothAxisItems = SCROLL_AREA_BOTH_AXIS_LINE_NUMBERS.map((lineNumber) => (
    <p key={`both-line-${lineNumber}`} style={{ margin: '0 0 8px 0', whiteSpace: 'nowrap' }}>
      Line {lineNumber}: Wide content — scroll horizontally and vertically.
    </p>
  ));

  return (
    <ShowcaseSection
      title="ScrollArea"
      testId="catalog-section-scroll-area"
      code={SCROLL_AREA_SNIPPET}
    >
      <div className="cm-catalog__stack">
        <CScrollArea
          aria-label="Activity feed"
          data-testid="scroll-area-demo"
          className="cm-catalog__scroll-area"
          contentClassName="cm-catalog__scroll-area-content"
        >
          {SCROLL_AREA_ACTIVITY_ITEMS.map((item) => (
            <article key={item.title} className="cm-catalog__scroll-entry">
              <h3 className="cm-catalog__scroll-entry-title">{item.title}</h3>
              <p className="cm-catalog__scroll-entry-detail">{item.detail}</p>
            </article>
          ))}
        </CScrollArea>
        <p className="cm-catalog__value">
          Focus the area and use wheel, trackpad, or keyboard to scroll.
        </p>
      </div>
      <div className="cm-catalog__stack" style={{ marginTop: '16px' }}>
        <CScrollArea
          aria-label="Wide and tall content"
          data-testid="scroll-area-demo-both"
          className="cm-catalog__scroll-area"
          style={{ height: '200px', width: '300px' }}
          overflowX="auto"
          overflowY="auto"
        >
          <div style={bothAxisContentStyle}>{bothAxisItems}</div>
        </CScrollArea>
        <p className="cm-catalog__value">
          Both axes overflow (300×200 container, 800px wide content, 20 rows).
        </p>
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
const [windowActive, setWindowActive] = useState(true);

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

    <CCheckbox checked={windowActive} onChange={setWindowActive}>
      Active
    </CCheckbox>

    <CWindow active={windowActive} x={24} y={24} width={300} height={140} resizeBehavior={WidgetInteractionBehavior.Outline}>
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
  const [windowActive, setWindowActive] = React.useState(true);

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
          size="compact"
          onClick={handleWindowActionClick}
        >
          _
        </CButton>
        <CButton
          className="cm-catalog__window-action"
          data-testid="window-demo-maximize"
          aria-label="Maximize window"
          size="compact"
          onClick={handleWindowActionClick}
        >
          □
        </CButton>
        <CButton
          className="cm-catalog__window-action cm-catalog__window-action--close"
          data-testid="window-demo-close"
          aria-label="Close window"
          size="compact"
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
        <div className="cm-catalog__row">
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
          <CCheckbox
            data-testid="window-demo-active"
            checked={windowActive}
            onChange={setWindowActive}
          >
            Active
          </CCheckbox>
        </div>
        <div className="cm-catalog__stage cm-catalog__stage--relative">
          <CWindow
            active={windowActive}
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
              <CScrollArea>
                <p>Window content goes here.</p>
                <p>Try dragging the title bar.</p>
              </CScrollArea>
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

function ListShowcase(): React.ReactElement {
  const lazyRetryAttemptsRef = React.useRef(0);
  const [selectedItem, setSelectedItem] = React.useState<CatalogListItem | null>(null);
  const [lastAction, setLastAction] = React.useState('none');
  const [lastIntent, setLastIntent] = React.useState('none');

  const renderCatalogListItem = React.useCallback((item: CatalogListItem): React.ReactNode => {
    return (
      <div>
        <strong>
          <span aria-hidden="true">{item.icon}</span> {item.name}
        </strong>
        <p>{item.description}</p>
      </div>
    );
  }, []);

  const handleLoadChildren = React.useCallback(
    async (item: CatalogListItem): Promise<readonly CatalogListItem[]> => {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 20);
      });

      if (item.lazyMode === 'retry' && lazyRetryAttemptsRef.current === 0) {
        lazyRetryAttemptsRef.current += 1;
        throw new Error('Preview load failed once; Retry will succeed.');
      }

      return [
        {
          id: `${item.id}-child`,
          name: `${item.name} child`,
          description: 'Loaded asynchronously by the catalog caller',
          icon: '↳',
        },
      ];
    },
    [],
  );

  return (
    <ShowcaseSection title="List" testId="catalog-section-list" code={LIST_SNIPPET}>
      <div className="cm-catalog__stack">
        <p className="cm-catalog__value">
          List mode: click selects, hover/double-click reports intent, drag handles emit movement
          payloads without mutating caller-owned items.
        </p>
        <div className="cm-catalog__row">
          <div className="cm-catalog__list-demo">
            <CList
              data-testid="list-demo-basic"
              type="list"
              draggable
              items={LIST_ITEMS}
              getItemKey={(item) => item.id}
              getItemChildren={(item) => item.children}
              renderItem={renderCatalogListItem}
              renderActions={(item) =>
                item.actions?.map((action) => (
                  <CButton
                    key={action}
                    data-testid={`list-demo-action-${item.id}-${action.toLowerCase()}`}
                    size="compact"
                    onClick={(event) => {
                      event.stopPropagation();
                      setLastAction(`${action} ${item.name}`);
                    }}
                  >
                    {action}
                  </CButton>
                ))
              }
              onItemClick={(item) => setSelectedItem(item)}
              onItemHover={(payload) => setLastIntent(`Hover ${payload.item.name}`)}
              onItemDoubleClick={(payload) => setLastIntent(`Open ${payload.item.name}`)}
              onItemDrag={(payload) =>
                setLastIntent(
                  `Move ${String(payload.source.key)} ${payload.position} ${String(
                    payload.target.key,
                  )} by ${payload.input}`,
                )
              }
              onItemDragInto={(payload) =>
                setLastIntent(
                  `Move ${String(payload.source.key)} inside ${String(payload.target.key)} by ${
                    payload.input
                  }`,
                )
              }
            />
          </div>
        </div>
        <p className="cm-catalog__value">Selected: {selectedItem?.name ?? 'none'}</p>
        <p className="cm-catalog__value" data-testid="list-demo-intent">
          Intent: {lastIntent}
        </p>
        <p className="cm-catalog__value">Action: {lastAction}</p>

        <p className="cm-catalog__value">
          Keyboard hint: focus a ↕ handle, press ArrowUp/ArrowDown to emit before/after, or
          Alt+ArrowRight to emit inside.
        </p>
        <div className="cm-catalog__row">
          <CList
            data-testid="list-demo-grid"
            type="grid"
            iconSize={32}
            items={LIST_GRID_ITEMS}
            getItemKey={(item) => item.id}
            renderItem={renderCatalogListItem}
            onItemHover={(payload) => setLastIntent(`Grid hover ${payload.item.name}`)}
            onItemDoubleClick={(payload) => setLastIntent(`Grid open ${payload.item.name}`)}
          />
          <CList
            data-testid="list-demo-icon"
            type="icon"
            iconSize="40px"
            draggable
            items={LIST_ICON_ITEMS}
            getItemKey={(item) => item.id}
            renderItem={renderCatalogListItem}
            onItemHover={(payload) => setLastIntent(`Icon hover ${payload.item.name}`)}
            onItemDoubleClick={(payload) => setLastIntent(`Icon open ${payload.item.name}`)}
            onItemDrag={(payload) =>
              setLastIntent(
                `Icon move ${String(payload.source.key)} ${payload.position} ${String(
                  payload.target.key,
                )}`,
              )
            }
            onItemDragInto={(payload) =>
              setLastIntent(
                `Icon move ${String(payload.source.key)} inside ${String(payload.target.key)}`,
              )
            }
          />
        </div>

        <p className="cm-catalog__value">
          Lazy loading: expand the success branch for children, expand the retry branch to see an
          error and use Retry.
        </p>
        <div className="cm-catalog__row">
          <CList
            data-testid="list-demo-lazy"
            items={LIST_LAZY_ITEMS}
            getItemKey={(item) => item.id}
            isItemExpandable={(item) => item.lazyMode !== undefined}
            onLoadChildren={handleLoadChildren}
            renderItem={renderCatalogListItem}
          />
        </div>

        <div className="cm-catalog__row">
          <CList
            data-testid="list-demo-empty"
            items={[]}
            renderItem={() => null}
            emptyState={<p>No items available</p>}
          />
        </div>
      </div>
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

        <div className="cm-catalog__stack">
          <p className="cm-catalog__value">Hover over the SplitArea below to reveal separators</p>
          <div className="cm-split-area-demo-shell">
            <CSplitArea
              data-testid="split-area-demo-hover"
              direction="horizontal"
              separatorMovable
              separatorVisibleOnHover
              className="cm-split-area-demo"
            >
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--sidebar">
                <h3 className="cm-split-area-demo__title">Left</h3>
                <p className="cm-split-area-demo__text">Hover to see separator</p>
              </section>
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--editor">
                <h3 className="cm-split-area-demo__title">Right</h3>
                <p className="cm-split-area-demo__text">Separator appears on hover</p>
              </section>
            </CSplitArea>
          </div>
        </div>

        <div className="cm-catalog__stack">
          <p className="cm-catalog__value">
            separatorHoverMode=&quot;separator&quot; — only the separator itself responds to hover
          </p>
          <div className="cm-split-area-demo-shell">
            <CSplitArea
              data-testid="split-area-demo-separator-hover"
              direction="horizontal"
              separatorMovable
              separatorVisibleOnHover
              separatorHoverMode="separator"
              className="cm-split-area-demo"
            >
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--sidebar">
                <h3 className="cm-split-area-demo__title">Left</h3>
                <p className="cm-split-area-demo__text">Hover the separator line to reveal it</p>
              </section>
              <section className="cm-split-area-demo__panel cm-split-area-demo__panel--editor">
                <h3 className="cm-split-area-demo__title">Right</h3>
                <p className="cm-split-area-demo__text">Only the separator responds to hover</p>
              </section>
            </CSplitArea>
          </div>
        </div>
      </div>
    </ShowcaseSection>
  );
}

const INPUT_SNIPPET = `
const [inputValue, setInputValue] = useState('');

return (
  <>
    <CInput
      placeholder="Type something…"
      value={inputValue}
      onChange={(nextValue) => setInputValue(nextValue)}
    />
    <CButton size="compact" onClick={() => setInputValue('')}>Clear</CButton>
    <CInput placeholder="Disabled input" disabled />
  </>
);
`.trim();

function InputShowcase(): React.ReactElement {
  const [inputValue, setInputValue] = React.useState('');

  return (
    <ShowcaseSection title="Input" testId="catalog-section-input" code={INPUT_SNIPPET}>
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CInput
            data-testid="input-demo"
            placeholder="Type something…"
            value={inputValue}
            onChange={(nextValue) => setInputValue(nextValue)}
          />
          <CButton data-testid="input-demo-clear" size="compact" onClick={() => setInputValue('')}>
            Clear
          </CButton>
        </div>
        <div className="cm-catalog__row">
          <CInput data-testid="input-demo-disabled" placeholder="Disabled input" disabled />
        </div>
        <p className="cm-catalog__value">Value: {inputValue || '(empty)'}</p>
      </div>
    </ShowcaseSection>
  );
}

const TOOLTIP_SNIPPET = `
<CTooltip title="Hover tooltip" placement="top">
  <CButton>Hover me</CButton>
</CTooltip>

<CTooltip title="Focus tooltip" placement="right">
  <CButton>Focus me</CButton>
</CTooltip>
`.trim();

function TooltipShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Tooltip" testId="catalog-section-tooltip" code={TOOLTIP_SNIPPET}>
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CTooltip data-testid="tooltip-demo-hover" title="Hover tooltip" placement="top">
            <CButton>Hover me</CButton>
          </CTooltip>
          <CTooltip data-testid="tooltip-demo-focus" title="Focus tooltip" placement="right">
            <CButton>Focus me</CButton>
          </CTooltip>
          <CTooltip data-testid="tooltip-demo-bottom" title="Bottom tooltip" placement="bottom">
            <span>Hover text</span>
          </CTooltip>
        </div>
      </div>
    </ShowcaseSection>
  );
}

const TIME_PICKER_SNIPPET = `
const [time, setTime] = useState('09:30');

return (
  <>
    <CTimePicker value={time} onChange={setTime} />
    <CTimePicker disabled />
    <p>Selected time: {time}</p>
  </>
);
`.trim();

function TimePickerShowcase(): React.ReactElement {
  const [time, setTime] = React.useState('09:30');

  return (
    <ShowcaseSection
      title="TimePicker"
      testId="catalog-section-time-picker"
      code={TIME_PICKER_SNIPPET}
    >
      <div className="cm-catalog__stack">
        <div className="cm-catalog__row">
          <CTimePicker data-testid="time-picker-demo" value={time} onChange={setTime} />
          <CTimePicker data-testid="time-picker-demo-disabled" disabled />
        </div>
        <p className="cm-catalog__value">Selected time: {time}</p>
      </div>
    </ShowcaseSection>
  );
}

const TREE_SAMPLE_DATA: readonly CTreeDataNode[] = [
  {
    key: 'root-1',
    title: 'Documents',
    children: [
      { key: 'doc-1', title: 'Report.pdf' },
      { key: 'doc-2', title: 'Notes.txt' },
    ],
  },
  {
    key: 'root-2',
    title: 'Pictures',
    children: [
      { key: 'pic-1', title: 'Vacation.jpg' },
      { key: 'pic-2', title: 'Portrait.png' },
    ],
  },
  { key: 'root-3', title: 'Settings' },
];

const TREE_SNIPPET = `
const treeData = [
  {
    key: 'root-1',
    title: 'Documents',
    children: [
      { key: 'doc-1', title: 'Report.pdf' },
      { key: 'doc-2', title: 'Notes.txt' },
    ],
  },
];

const [checkedKeys, setCheckedKeys] = useState<string[]>(['doc-1']);
const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

return (
  <>
    <CTree
      treeData={treeData}
      checkable
      checkedKeys={checkedKeys}
      onCheck={setCheckedKeys}
      onSelect={setSelectedKeys}
    />
    <p>Checked: {checkedKeys.join(', ')}</p>
    <p>Selected: {selectedKeys.join(', ')}</p>
  </>
);
`.trim();

function TreeShowcase(): React.ReactElement {
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>(['doc-1']);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);

  return (
    <ShowcaseSection title="Tree" testId="catalog-section-tree" code={TREE_SNIPPET}>
      <div className="cm-catalog__stack">
        <CTree
          data-testid="tree-demo"
          treeData={TREE_SAMPLE_DATA}
          checkable
          checkedKeys={checkedKeys}
          onCheck={(nextCheckedKeys) => setCheckedKeys(nextCheckedKeys)}
          onSelect={(nextSelectedKeys) => setSelectedKeys(nextSelectedKeys)}
        />
        <p className="cm-catalog__value">Checked: {checkedKeys.join(', ') || 'none'}</p>
        <p className="cm-catalog__value">Selected: {selectedKeys.join(', ') || 'none'}</p>
      </div>
    </ShowcaseSection>
  );
}

const TRANSFER_SAMPLE_DATA: readonly CTransferItem[] = [
  { key: 'a', title: 'Apple' },
  { key: 'b', title: 'Banana' },
  { key: 'c', title: 'Cherry' },
  { key: 'd', title: 'Date' },
  { key: 'e', title: 'Elderberry' },
];

const TRANSFER_SNIPPET = `
const data = [
  { key: 'a', title: 'Apple' },
  { key: 'b', title: 'Banana' },
  { key: 'c', title: 'Cherry' },
];

const [targetKeys, setTargetKeys] = useState<string[]>(['b']);

return (
  <CTransfer
    dataSource={data}
    targetKeys={targetKeys}
    titles={['Available', 'Chosen']}
    onChange={setTargetKeys}
  />
);
`.trim();

function TransferShowcase(): React.ReactElement {
  const [targetKeys, setTargetKeys] = React.useState<string[]>(['b']);

  return (
    <ShowcaseSection title="Transfer" testId="catalog-section-transfer" code={TRANSFER_SNIPPET}>
      <div className="cm-catalog__stack">
        <CTransfer
          data-testid="transfer-demo"
          dataSource={TRANSFER_SAMPLE_DATA}
          targetKeys={targetKeys}
          titles={['Available', 'Chosen']}
          onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys as string[])}
        />
        <p className="cm-catalog__value">Target keys: {targetKeys.join(', ') || 'none'}</p>
      </div>
    </ShowcaseSection>
  );
}

interface TableRecord {
  readonly id: number;
  readonly name: string;
  readonly role: string;
  readonly age: number;
}

const TABLE_SAMPLE_DATA: readonly TableRecord[] = [
  { id: 1, name: 'Alice', role: 'Developer', age: 28 },
  { id: 2, name: 'Bob', role: 'Designer', age: 32 },
  { id: 3, name: 'Carol', role: 'Manager', age: 45 },
  { id: 4, name: 'Dave', role: 'Developer', age: 24 },
  { id: 5, name: 'Eve', role: 'Tester', age: 29 },
  { id: 6, name: 'Frank', role: 'DevOps', age: 35 },
];

const TABLE_COLUMNS = [
  { title: 'Name', dataIndex: 'name' as const, sorter: true },
  { title: 'Role', dataIndex: 'role' as const },
  {
    title: 'Age',
    dataIndex: 'age' as const,
    sorter: (a: TableRecord, b: TableRecord) => a.age - b.age,
  },
];

const TABLE_SNIPPET = `
const columns = [
  { title: 'Name', dataIndex: 'name', sorter: true },
  { title: 'Role', dataIndex: 'role' },
  { title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
];

const data = [
  { id: 1, name: 'Alice', role: 'Developer', age: 28 },
  { id: 2, name: 'Bob', role: 'Designer', age: 32 },
];

return (
  <>
    <CTable columns={columns} dataSource={data} pagination={{ pageSize: 4 }} rowKey="id" />
  </>
);
`.trim();

function TableShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Table" testId="catalog-section-table" code={TABLE_SNIPPET}>
      <div className="cm-catalog__stack">
        <CTable<TableRecord>
          data-testid="table-demo"
          columns={TABLE_COLUMNS}
          dataSource={TABLE_SAMPLE_DATA}
          pagination={{ pageSize: 4 }}
          rowKey="id"
        />
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
            <SliderShowcase />
            <ScrollAreaShowcase />
            <TabShowcase />
            <IconShowcase />
            <MenuShowcase />
            <WindowShowcase />
            <DockShowcase />
            <StartBarShowcase />
            <SplitAreaShowcase />
            <ListShowcase />
            <GridShowcase />
            <InputShowcase />
            <TooltipShowcase />
            <TimePickerShowcase />
            <TreeShowcase />
            <TransferShowcase />
            <TableShowcase />
          </div>
        </DevThemeRoot>
      </main>
    </div>
  );
}
