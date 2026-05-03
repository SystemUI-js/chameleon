import React from 'react';
import {
  CButton,
  CButtonGroup,
  CButtonSeparator,
  CCheckbox,
  CSlider,
  CDock,
  CGrid,
  CGridItem,
  CIconContainer,
  CMenu,
  CRadio,
  CRadioGroup,
  CScrollArea,
  CScrollBar,
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
import { Text, View, Pressable } from 'react-native';

const SIZE_OPTIONS: readonly CSelectOption[] = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
];

const GRID_COLUMNS = ['1fr', '1fr', '1fr'];
const WINDOW_ACTION_BUTTON_POSITIONS = ['left', 'right'] as const;

const DEV_THEME_OPTIONS: readonly CSelectOption[] = Object.values(DEV_THEME).map((themeId) => ({
  label: themeId,
  value: themeId,
}));

const isWindowTitleActionButtonPosition = (
  value: string,
): value is WindowTitleActionButtonPosition => {
  return WINDOW_ACTION_BUTTON_POSITIONS.includes(value as WindowTitleActionButtonPosition);
};

const isDevThemeId = (value: string): value is DevThemeId => {
  return Object.values(DEV_THEME).includes(value as DevThemeId);
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
    <View data-testid={testId} className="cm-catalog__section">
      <Text className="cm-catalog__section-title">{title}</Text>
      <View className="cm-catalog__section-content">{children}</View>
      {code !== undefined && <ShowcaseCodeDisclosure sectionId={testId} code={code} />}
    </View>
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
    <View data-testid="catalog-theme-switch" className="cm-catalog__theme-switcher">
      <View className="cm-catalog__theme-label">
        <Text>Theme</Text>
        <CSelect
          aria-label="Theme"
          className="cm-catalog__theme-select"
          value={theme}
          options={DEV_THEME_OPTIONS}
          onChange={(nextTheme) => {
            if (isDevThemeId(nextTheme)) {
              onThemeChange(nextTheme);
            }
          }}
        />
      </View>
    </View>
  );
}

const BUTTON_SNIPPET = `
const [buttonClicks, setButtonClicks] = useState(0);

return (
  <>
    <CButton variant="primary" onClick={() => setButtonClicks((c) => c + 1)}>Primary action</CButton>
    <CButton>Default action</CButton>
    <CButton variant="ghost">Ghost action</CButton>

    <Text>Primary button clicks: {buttonClicks}</Text>
  </>
);
`.trim();

function ButtonShowcase(): React.ReactElement {
  const [buttonClicks, setButtonClicks] = React.useState(0);

  return (
    <ShowcaseSection title="Button" testId="catalog-section-button" code={BUTTON_SNIPPET}>
      <View className="cm-catalog__stack">
        <View className="cm-catalog__row">
          <CButton
            data-testid="button-demo-primary"
            variant="primary"
            onClick={() => setButtonClicks((c) => c + 1)}
          >
            Primary action
          </CButton>
          <CButton>Default action</CButton>
          <CButton variant="ghost">Ghost action</CButton>
        </View>
        <View className="cm-catalog__row">
          <CButton disabled>Disabled default</CButton>
          <CButton variant="primary" disabled>
            Disabled primary
          </CButton>
        </View>
        <Text className="cm-catalog__value">Primary button clicks: {buttonClicks}</Text>
      </View>
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
      <Text>Explorer</Text>
      <CSplitArea direction="vertical" separatorMovable>
        <Text>Editor</Text>
        <CSplitArea direction="horizontal" separatorMovable>
          <Text>Preview</Text>
          <Text>Console</Text>
        </CSplitArea>
      </CSplitArea>
      {showInspector ? <Text>Inspector</Text> : null}
    </CSplitArea>
  </>
);
`.trim();

function ThemeShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Theme" testId="catalog-section-theme" code={THEME_SNIPPET}>
      <View>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>Theme wrapper:</Text>
          <Text> Wrap any subtree with </Text>
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            &lt;Theme&gt;
          </Text>
          <Text> and set the </Text>
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            name
          </Text>
          <Text> prop to a theme class like </Text>
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            cm-theme--win98
          </Text>
          <Text>.</Text>
        </Text>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>Nested Theme:</Text> Nesting{' '}
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            &lt;Theme&gt;
          </Text>
          <Text> inside another </Text>
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            &lt;Theme&gt;
          </Text>
          <Text> is not supported. Use a component&apos;s </Text>
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            theme
          </Text>
          <Text> prop to override the provider theme for that specific component.</Text>
        </Text>
        <Text>
          <Text style={{ fontWeight: 'bold' }}>Explicit prop:</Text> A component&apos;s own{' '}
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            theme
          </Text>
          <Text> prop takes precedence over any Theme provider in its ancestor chain.</Text>
        </Text>
        <View>
          <Theme name="cm-theme--win98">
            <CButton>Wrapper applies theme</CButton>
          </Theme>
          <Theme name="cm-theme--win98">
            <CButton theme="cm-theme--default">Prop overrides</CButton>
          </Theme>
        </View>
      </View>
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
      <View className="cm-catalog__stack">
        <View className="cm-catalog__row">
          <CButtonGroup data-testid="button-group-demo-horizontal" variant="primary">
            <CButton>Back</CButton>
            <CButton>Next</CButton>
            <CButtonSeparator />
            <CButton variant="ghost">Cancel</CButton>
          </CButtonGroup>
        </View>
        <View className="cm-catalog__row">
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
        </View>
      </View>
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

    <Text>Selected fruit: {selectedFruit}</Text>
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

    <Text>Notifications enabled: {notificationsEnabled ? 'Yes' : 'No'}</Text>
  </>
);
`.trim();

function RadioGroupShowcase(): React.ReactElement {
  const [selectedFruit, setSelectedFruit] = React.useState('apple');

  return (
    <ShowcaseSection title="RadioGroup" testId="catalog-section-radio" code={RADIOGROUP_SNIPPET}>
      <View className="cm-catalog__stack">
        <CRadioGroup
          aria-label="Favorite fruit"
          data-testid="radio-demo-fruit"
          name="fruit"
          value={selectedFruit}
          onChange={setSelectedFruit}
        >
          <View className="cm-catalog__choice-row">
            <CRadio value="apple">Apple</CRadio>
            <CRadio value="orange">Orange</CRadio>
          </View>
        </CRadioGroup>
        <CRadioGroup name="fruit-disabled" defaultValue="apple" disabled>
          <View className="cm-catalog__choice-row">
            <CRadio value="apple">Apple disabled</CRadio>
            <CRadio value="orange">Orange disabled</CRadio>
          </View>
        </CRadioGroup>
        <Text className="cm-catalog__value">Selected fruit: {selectedFruit}</Text>
      </View>
    </ShowcaseSection>
  );
}

function CheckboxShowcase(): React.ReactElement {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ShowcaseSection title="Checkbox" testId="catalog-section-checkbox" code={CHECKBOX_SNIPPET}>
      <View className="cm-catalog__stack">
        <CCheckbox
          checked={notificationsEnabled}
          data-testid="checkbox-demo-notifications"
          onChange={setNotificationsEnabled}
        >
          Enable notifications
        </CCheckbox>
        <CCheckbox defaultChecked>Auto-save drafts</CCheckbox>
        <CCheckbox disabled>Disabled setting</CCheckbox>
        <Text className="cm-catalog__value">
          Notifications enabled: {notificationsEnabled ? 'Yes' : 'No'}
        </Text>
      </View>
    </ShowcaseSection>
  );
}

const SELECT_SNIPPET = `
const [selectedSize, setSelectedSize] = useState('medium');

return (
  <>
    <CSelect name="size" value={selectedSize} options={sizeOptions} onChange={setSelectedSize} />

    <Text>Selected size: {selectedSize}</Text>
  </>
);
`.trim();

const CSLIDER_SNIPPET = `
const [volume, setVolume] = useState(40);

return (
  <>
    <CSlider min={0} max={100} step={5} value={volume} onChange={setVolume} />

    <Text>Volume: {volume}</Text>
  </>
);
`.trim();

const SCROLL_AREA_SNIPPET = `
const [useDomScrollBar, setUseDomScrollBar] = React.useState(false);

<CCheckbox
  checked={useDomScrollBar}
  onChange={setUseDomScrollBar}
  data-testid="scroll-area-demo-dom-scrollbar-toggle"
>
  使用自定义 DOM 滚动条
</CCheckbox>

<CScrollArea
  aria-label="Activity feed"
  scrollBarComponent={useDomScrollBar ? CScrollBar : undefined}
  style={{ height: 180 }}
>
  {activityItems.map((item) => (
    <View key={item.title}>
      <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
      <Text>{item.detail}</Text>
    </View>
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

    <Text>Root opens on click, nested parents default to hover, and explicit item.trigger=&quot;click&quot; still overrides.</Text>
    <Text>Selected: {selectedItem?.title ?? 'none'}</Text>
  </>
);
`.trim();

const TAB_SNIPPET = `
<CTab>
  <CTabItem key="overview" title="Overview">
    <Text>Use arrow keys, Home, and End to move between tabs.</Text>
    <Text>Panels preserve semantic tab roles and active state automatically.</Text>
  </CTabItem>
  <CTabItem key="details" title="Details">
    <Text>Each tab panel can render any React content.</Text>
  </CTabItem>
  <CTabItem key="notes" title="Notes">
    <Text>CTab manages focus and selection internally.</Text>
  </CTabItem>
</CTab>
`.trim();

function SelectShowcase(): React.ReactElement {
  const [selectedSize, setSelectedSize] = React.useState('medium');

  return (
    <ShowcaseSection title="Select" testId="catalog-section-select" code={SELECT_SNIPPET}>
      <View className="cm-catalog__stack">
        <CSelect
          data-testid="select-demo-size"
          name="size"
          value={selectedSize}
          options={SIZE_OPTIONS}
          onChange={setSelectedSize}
        />
        <CSelect name="size-disabled" value="large" options={SIZE_OPTIONS} disabled />
        <Text className="cm-catalog__value">Selected size: {selectedSize}</Text>
      </View>
    </ShowcaseSection>
  );
}

function SliderShowcase(): React.ReactElement {
  const [volume, setVolume] = React.useState(40);

  return (
    <ShowcaseSection title="Slider" testId="catalog-section-slider" code={CSLIDER_SNIPPET}>
      <View className="cm-catalog__stack">
        <View className="cm-catalog__slider-shell">
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
        </View>
        <Text className="cm-catalog__value" data-testid="slider-demo-value">
          Volume: {volume}
        </Text>
        <View className="cm-catalog__slider-presets">
          <CButton data-testid="slider-demo-min" compact onClick={() => setVolume(0)}>
            Min
          </CButton>
          <CButton data-testid="slider-demo-mid" compact onClick={() => setVolume(50)}>
            Mid
          </CButton>
          <CButton data-testid="slider-demo-max" compact onClick={() => setVolume(100)}>
            Max
          </CButton>
        </View>
      </View>
    </ShowcaseSection>
  );
}

function ScrollAreaShowcase(): React.ReactElement {
  const [useDomScrollBar, setUseDomScrollBar] = React.useState(false);

  return (
    <ShowcaseSection
      title="ScrollArea"
      testId="catalog-section-scroll-area"
      code={SCROLL_AREA_SNIPPET}
    >
      <View className="cm-catalog__stack">
        <CCheckbox
          checked={useDomScrollBar}
          onChange={setUseDomScrollBar}
          data-testid="scroll-area-demo-dom-scrollbar-toggle"
        >
          使用自定义 DOM 滚动条
        </CCheckbox>
        <CScrollArea
          aria-label="Activity feed"
          data-testid="scroll-area-demo"
          className="cm-catalog__scroll-area"
          contentClassName="cm-catalog__scroll-area-content"
          scrollBarComponent={useDomScrollBar ? CScrollBar : undefined}
        >
          {SCROLL_AREA_ACTIVITY_ITEMS.map((item) => (
            <View key={item.title} className="cm-catalog__scroll-entry">
              <Text className="cm-catalog__scroll-entry-title">{item.title}</Text>
              <Text className="cm-catalog__scroll-entry-detail">{item.detail}</Text>
            </View>
          ))}
        </CScrollArea>
        <Text className="cm-catalog__value">
          Focus the area and use wheel, trackpad, or keyboard to scroll.
        </Text>
      </View>
    </ShowcaseSection>
  );
}

function TabShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Tab" testId="catalog-section-tab" code={TAB_SNIPPET}>
      <CTab data-testid="tab-demo">
        <CTabItem key="overview" title="Overview">
          <View className="cm-catalog__stack">
            <Text>Use arrow keys, Home, and End to move between tabs.</Text>
            <Text>Panels preserve semantic tab roles and active state automatically.</Text>
          </View>
        </CTabItem>
        <CTabItem key="details" title="Details">
          <View className="cm-catalog__stack">
            <Text>Each tab panel can render any React content.</Text>
            <Text>Try switching tabs with mouse or keyboard.</Text>
          </View>
        </CTabItem>
        <CTabItem key="notes" title="Notes">
          <View className="cm-catalog__stack">
            <Text>CTab manages focus and selection internally.</Text>
            <Text>Use keyed items for stable tab and panel identifiers.</Text>
          </View>
        </CTabItem>
      </CTab>
    </ShowcaseSection>
  );
}

function MenuShowcase(): React.ReactElement {
  const [selectedItem, setSelectedItem] = React.useState<MenuListItem | null>(null);

  return (
    <ShowcaseSection title="Menu" testId="catalog-section-menu" code={MENU_SNIPPET}>
      <View className="cm-catalog__stack">
        <CMenu
          data-testid="menu-demo-mixed"
          trigger="click"
          menuList={MIXED_MENU_LIST}
          onSelect={setSelectedItem}
        >
          <CButton data-testid="menu-demo-trigger-mixed">Mixed Menu</CButton>
        </CMenu>
        <Text className="cm-catalog__value">
          Mixed mode: root opens on click, <Text style={{ fontWeight: 'bold' }}>File</Text> opens on
          hover, and <Text style={{ fontWeight: 'bold' }}>View</Text> keeps click via{' '}
          <Text
            style={{
              fontFamily: 'monospace', // 等宽字体
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              fontSize: 14,
            }}
          >
            item.trigger=&quot;click&quot;
          </Text>
          .
        </Text>
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
        <Text className="cm-catalog__value">Selected: {selectedItem?.title ?? 'none'}</Text>
      </View>
    </ShowcaseSection>
  );
}

const WINDOW_SNIPPET =
  `const [actionButtonPosition, setActionButtonPosition] = useState<'left' | 'right'>('right');

const actionButtons = (
  <View className="cm-catalog__window-actions">
    <CButton>—</CButton>
    <CButton>□</CButton>
    <CButton>×</CButton>
  </View>
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
        <Text>Window content goes here.</Text>
        <Text>Try dragging the title bar.</Text>
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
      <View className="cm-catalog__window-actions">
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
      </View>
    ),
    [handleWindowActionClick],
  );

  return (
    <ShowcaseSection title="Window" testId="catalog-section-window" code={WINDOW_SNIPPET}>
      <View className="cm-catalog__stack">
        <CRadioGroup
          aria-label="Window action button position"
          data-testid="window-demo-position"
          name="window-action-button-position"
          value={actionButtonPosition}
          onChange={handleActionButtonPositionChange}
        >
          <View className="cm-catalog__choice-row cm-catalog__window-position-choice-row">
            <CRadio value="left">Left</CRadio>
            <CRadio value="right">Right</CRadio>
          </View>
        </CRadioGroup>
        <View className="cm-catalog__stage cm-catalog__stage--relative">
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
              <Text>Window content goes here.</Text>
              <Text>Try dragging the title bar.</Text>
            </CWindowBody>
            <CStatusBar>
              <CStatusBarItem>Ready</CStatusBarItem>
              <CStatusBarItem>Line 12, Column 4</CStatusBarItem>
            </CStatusBar>
          </CWindow>
        </View>
      </View>
    </ShowcaseSection>
  );
}

const DOCK_SNIPPET = `<CDock position="top" height={48} className="cm-catalog__dock">
  <View className="cm-catalog__dock-content">Dock content area</View>
</CDock>`.trim();

function DockShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="Dock" testId="catalog-section-dock" code={DOCK_SNIPPET}>
      <View className="cm-catalog__stage cm-catalog__stage--relative">
        <CDock position="top" height={48} className="cm-catalog__dock">
          <Text className="cm-catalog__dock-content">Dock content area</Text>
        </CDock>
        <View className="cm-catalog__dock-spacer" />
      </View>
    </ShowcaseSection>
  );
}

const STARTBAR_SNIPPET =
  `<CStartBar data-testid="catalog-start-bar" height={32} className="cm-catalog__start-bar">
  <Text>Application shortcuts</Text>
</CStartBar>`.trim();

function StartBarShowcase(): React.ReactElement {
  return (
    <ShowcaseSection title="StartBar" testId="catalog-section-start-bar" code={STARTBAR_SNIPPET}>
      <View className="cm-catalog__stage cm-catalog__stage--relative">
        <View className="cm-catalog__start-bar-spacer" />
        <CStartBar data-testid="catalog-start-bar" height={32} className="cm-catalog__start-bar">
          <Text>Application shortcuts</Text>
        </CStartBar>
      </View>
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
        icon: <Text>★</Text>,
        title: 'Star',
        position: { x: 10, y: 10 },
        activeTrigger: 'click',
        openTrigger: 'click',
        onActive: (active) => { setActiveInfo(active ? 'Star clicked' : null); readIconPositions(); },
        onOpen: () => setOpenInfo('Star opened'),
        onContextMenu: () => setContextInfo('Heart context'),
      },
      {
        icon: <Text>♥</Text>,
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
    if (typeof document === 'undefined') return;
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
      <View className="cm-catalog__stack">
        <View
          className="cm-catalog__stage cm-catalog__stage--relative"
          style={{ minHeight: '80px' }}
        >
          <CIconContainer
            data-testid="icon-container"
            iconList={[
              {
                icon: <Text>★</Text>,
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
                icon: <Text>♥</Text>,
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
        </View>
        <View className="cm-catalog__row">
          <Text className="cm-catalog__label">Active:</Text>
          <Text className="cm-catalog__value">{activeInfo ?? '—'}</Text>
        </View>
        <View className="cm-catalog__row">
          <Text className="cm-catalog__label">Open:</Text>
          <Text className="cm-catalog__value">{openInfo ?? '—'}</Text>
        </View>
        <View className="cm-catalog__row">
          <Text className="cm-catalog__label">Context:</Text>
          <Text className="cm-catalog__value">{contextInfo ?? '—'}</Text>
        </View>
        <View className="cm-catalog__row">
          <Text className="cm-catalog__label">Coords:</Text>
          <Text className="cm-catalog__value" data-testid="icon-coords-display">
            {Object.keys(coords).length > 0
              ? Object.entries(coords)
                  .map(([k, v]) => `${k}:${v}`)
                  .join(' | ')
              : '—'}
          </Text>
          <Pressable type="button" data-testid="icon-coords-refresh" onClick={readIconPositions}>
            <Text>Refresh</Text>
          </Pressable>
        </View>
      </View>
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
      <View className="cm-catalog__stack">
        <View className="cm-catalog__row">
          <CButton
            data-testid="split-area-demo-toggle"
            onClick={() => setShowInspector((visible) => !visible)}
          >
            {showInspector ? '隐藏右侧区域' : '恢复右侧区域'}
          </CButton>
          <Text className="cm-catalog__value" data-testid="split-area-demo-status">
            {showInspector ? '当前为三栏布局' : '当前为双栏布局'}
          </Text>
        </View>

        <View className="cm-split-area-demo-shell">
          <CSplitArea
            data-testid="split-area-demo-root"
            direction="horizontal"
            separatorMovable
            className="cm-split-area-demo"
          >
            <View className="cm-split-area-demo__panel cm-split-area-demo__panel--sidebar">
              <Text className="cm-split-area-demo__title">Explorer</Text>
              <Text className="cm-split-area-demo__text">导航区保持横向分割中的左侧面板。</Text>
            </View>

            <CSplitArea
              direction="vertical"
              separatorMovable
              className="cm-split-area-demo__nested"
            >
              <View className="cm-split-area-demo__panel cm-split-area-demo__panel--editor">
                <Text className="cm-split-area-demo__title">Editor</Text>
                <Text className="cm-split-area-demo__text">
                  中间区域再按纵向拆分，模拟编辑器与输出区。
                </Text>
              </View>

              <CSplitArea
                direction="horizontal"
                separatorMovable
                className="cm-split-area-demo__nested"
              >
                <View className="cm-split-area-demo__panel cm-split-area-demo__panel--preview">
                  <Text className="cm-split-area-demo__title">Preview</Text>
                  <Text className="cm-split-area-demo__text">横向嵌套区域可继续拖动调整。</Text>
                </View>
                <View className="cm-split-area-demo__panel cm-split-area-demo__panel--console">
                  <Text className="cm-split-area-demo__title">Console</Text>
                  <Text className="cm-split-area-demo__text">
                    分割线支持拖动，方便观察比例变化。
                  </Text>
                </View>
              </CSplitArea>
            </CSplitArea>

            {showInspector ? (
              <View className="cm-split-area-demo__panel cm-split-area-demo__panel--inspector">
                <Text className="cm-split-area-demo__title">Inspector</Text>
                <Text className="cm-split-area-demo__text">
                  点击按钮后该区域会被移除，并触发布局重算。
                </Text>
              </View>
            ) : null}
          </CSplitArea>
        </View>
      </View>
    </ShowcaseSection>
  );
}

export function ComponentCatalog({
  theme,
  onThemeChange,
}: ComponentCatalogProps): React.ReactElement {
  return (
    <View data-testid="component-catalog" className="cm-catalog">
      <DevThemeRoot theme={theme} testId={null}>
        <View className="cm-catalog__header">
          <Text className="cm-catalog__title">Component Catalog</Text>
          <ThemeSwitcher theme={theme} onThemeChange={onThemeChange} />
        </View>
      </DevThemeRoot>

      <View className="cm-catalog__main">
        <ThemeShowcase />
        <DevThemeRoot theme={theme}>
          <View className="cm-catalog__showcase-list">
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
            <GridShowcase />
          </View>
        </DevThemeRoot>
      </View>
    </View>
  );
}
