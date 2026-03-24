# Native HTML Semantics for Button, Radio, Select

## Sources Identified

| Element | MDN Documentation URL |
|---------|----------------------|
| `<button>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button |
| `<input type="radio">` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio |
| `<select>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select |

---

## 1. Button Default Type (Task 1)

**Constraint**: CButton must default to `type="button"`

**MDN Quote**:
> "The default behavior of the button. Possible values are:
> - `submit`: The button submits the form data to the server. This is the **default** if the attribute is not specified for buttons associated with a `<form>`"

**MDN Note**:
> "If your buttons are not for submitting form data to the server, be sure to set their `type` attribute to `button`. Otherwise, they will try to submit form data and to load the (nonexistent) response, potentially destroying the current state of the document."

**Implication**: CButton MUST explicitly set `type="button"` to prevent accidental form submission.

---

## 2. Radio Name Exclusivity (Task 2)

**Constraint**: CRadioGroup must support controlled and uncontrolled flows with native radio grouping

**MDN Quote**:
> "A radio group is defined by giving each of radio buttons in the group the **same `name` attribute**."

> "Once a radio group is established, selecting any radio button in that group automatically **deselects any currently-selected radio button in the same group**."

> "Only **one radio button** in a given group can be selected at the same time."

**Implication**: 
- Native radio grouping is purely by `name` attribute
- CRadioGroup must expose a `name` prop that gets passed to all child `<input type="radio">` elements
- Only one selection per group is enforced by the browser, not the component

---

## 3. Disabled Behavior (Tasks 1-3)

**MDN Quotes**:

**Button**:
> "This Boolean attribute prevents the user from interacting with the button: it **cannot be pressed or focused**."

**Select**:
> "This Boolean attribute indicates that the user **cannot interact with the control**."

**Radio**:
> Supports the `disabled` attribute (common to all `<input>` elements)

**Implication**: 
- `disabled` prop must be passed through to native elements
- Disabled elements cannot be focused (keyboard navigation must skip)
- Disabled elements do not respond to user interaction events

---

## 4. Select Empty Option / Required Behavior (Task 3)

**Constraint**: CSelect must support placeholder-like empty option behavior

**MDN Quote**:
> "A Boolean attribute indicating that **an option with a non-empty string value must be selected**."

**Common Pattern** (from MDN example):
```html
<select name="pets" id="pet-select">
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
  ...
</select>
```

**Implication**:
- Empty string `value=""` creates a placeholder-like option
- When `required` is set, form validation requires selection of a non-empty value
- The first `<option>` (including empty value) is selected by default if no `selected` attribute exists

---

## Summary for Plan Constraints

| Plan Task | Native Semantic Rule | Implementation Note |
|-----------|---------------------|---------------------|
| Task 1: CButton | Default type is `submit` when in form | MUST set `type="button"` explicitly |
| Task 2: CRadioGroup | Grouping by `name` attribute | Pass `name` to all child radios |
| Task 2: CRadioGroup | Only one selected per group | Browser enforces; component reflects |
| Task 1-3: All | `disabled` prevents focus/interaction | Pass through to native elements |
| Task 3: CSelect | Empty `value=""` is placeholder | First option selected by default |
| Task 3: CSelect | `required` needs non-empty selection | Form validation behavior |

---

## 5. Testing Guidance (RTL + Playwright)

### 5.1 React Testing Library (Jest) - Tasks 1-3

**Official Docs**:
- Query API: https://testing-library.com/docs/queries/byrole
- User Interaction: https://testing-library.com/docs/user-event/intro
- jest-dom matchers: https://github.com/testing-library/jest-dom

#### Disabled Button Click Behavior (Task 1)

**Best Practice**: Use `getByRole` with `{ disabled: true }` filter + verify click doesn't fire handler.

```typescript
// ❌ AVOID: Testing that click "does nothing" is flaky
const button = screen.getByRole('button', { name: 'Submit' })
await userEvent.click(button)
// Hard to verify "nothing happened"

/// ✅ RECOMMENDED: Test that disabled button is not interactive
const disabledButton = screen.getByRole('button', { name: 'Submit', disabled: true })
expect(disabledButton).toBeDisabled()

// Or verify handler is NOT called using jest.fn()
const handleClick = jest.fn()
render(<CButton disabled onClick={handleClick}>Submit</CButton>)
await userEvent.click(screen.getByRole('button'))
expect(handleClick).not.toHaveBeenCalled()
```

**Source**: Testing Library ByRole docs show `getByRole` supports `{ disabled: true/false }` filter option.

#### Radio Checked State (Task 2)

**Best Practice**: Use `getByRole` with `{ checked: true }` filter.

```typescript
// ✅ RECOMMENDED: Query by role with checked state
const checkedRadio = screen.getByRole('radio', { checked: true })
expect(checkedRadio).toBeChecked()

// For specific value
const optionA = screen.getByRole('radio', { name: 'Option A' })
await userEvent.click(optionA)
expect(optionA).toBeChecked()

// Verify other is NOT checked
const optionB = screen.getByRole('radio', { name: 'Option B' })
expect(optionB).not.toBeChecked()
```

**Source**: Testing Library ByRole docs - `checked` option filters by `aria-checked` attribute.

#### Controlled Rerender Expectations (Tasks 1-3)

**Best Practice**: Use `waitFor` or `findBy*` for async state changes.

```typescript
// ✅ RECOMMENDED: Wait for state update
const button = screen.getByRole('button', { name: 'Toggle' })
await userEvent.click(button)

// Use findBy for auto-waiting
const newButton = await screen.findByRole('button', { name: 'Updated' })
expect(newButton).toBeInTheDocument()

// Or use waitFor for explicit waiting
await waitFor(() => {
  expect(screen.getByRole('button')).toHaveTextContent('Updated')
})
```

**Source**: Testing Library async methods - https://testing-library.com/docs/dom-testing-library/api-async

#### Select Value Assertions (Task 3)

**Best Practice**: Use `getByRole` for select and verify selected option.

```typescript
// ✅ RECOMMENDED: Query select by role, verify selected option
const select = screen.getByRole('combobox', { name: 'Choose pet' })
expect(select).toHaveValue('dog')

// For <select> element specifically
const selectElement = screen.getByRole('listbox', { name: 'Country' })
expect(selectElement).toHaveValue('us')

// Verify selected option text
const selectedOption = screen.getByRole('option', { selected: true })
expect(selectedOption).toHaveTextContent('United States')
```

**Source**: Testing Library ByRole docs - `combobox` is the implicit role for `<select>` elements.

---

### 5.2 Playwright - Task 5 & F3 (Smoke Tests)

**Official Docs**:
- Assertions: https://playwright.dev/docs/test-assertions
- Locators: https://playwright.dev/docs/locators

#### Visible Test IDs (Task 5)

**Best Practice**: Use `getByTestId` with auto-retrying assertions.

```typescript
// ✅ RECOMMENDED: Stable test id selector
await expect(page.getByTestId('submit-button')).toBeVisible()

// With custom test id attribute (if configured)
await expect(page.getByTestId('directions')).toBeVisible()
```

**Source**: Playwright Locators docs - "getByTestId() will locate elements based on their data-testid attribute"

#### Button Disabled State (Task 5)

**Best Practice**: Use auto-retrying `toBeDisabled()` assertion.

```typescript
// ✅ RECOMMENDED: Auto-retrying disabled check
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()

// Or check enabled state
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
```

**Source**: Playwright Assertions docs - `toBeDisabled()` and `toBeEnabled()` are auto-retrying.

#### Radio Checked State (Task 5)

**Best Practice**: Use `toBeChecked()` assertion.

```typescript
// ✅ RECOMMENDED: Auto-retrying checked assertion
await expect(page.getByRole('radio', { name: 'Option A' })).toBeChecked()

// Verify NOT checked
await expect(page.getByRole('radio', { name: 'Option B' })).not.toBeChecked()
```

**Source**: Playwright Assertions docs - `toBeChecked()` waits until the checkbox is checked.

#### Select Value (Task 5)

**Best Practice**: Use `toHaveValue()` for select elements.

```typescript
// ✅ RECOMMENDED: Assert select value
await expect(page.getByRole('combobox', { name: 'Country' })).toHaveValue('us')

// For multiple select
await expect(page.getByRole('listbox', { name: 'Colors' })).toHaveValues(['red', 'blue'])
```

**Source**: Playwright Assertions docs - `toHaveValue()` asserts input has a value.

---

### 5.3 Summary: Recommended Assertions

| Test Case | RTL (Jest) | Playwright |
|-----------|------------|------------|
| Button visible | `expect(button).toBeVisible()` | `await expect(locator).toBeVisible()` |
| Button disabled | `expect(button).toBeDisabled()` | `await expect(locator).toBeDisabled()` |
| Button enabled | `expect(button).toBeEnabled()` | `await expect(locator).toBeEnabled()` |
| Radio checked | `expect(radio).toBeChecked()` | `await expect(locator).toBeChecked()` |
| Select value | `expect(select).toHaveValue('x')` | `await expect(locator).toHaveValue('x')` |
| Test ID visible | `expect(screen.getByTestId('x')).toBeVisible()` | `await expect(page.getByTestId('x')).toBeVisible()` |
| Click handler NOT called | `expect(handler).not.toHaveBeenCalled()` | N/A (smoke test) |

---

### 5.4 Key Principles

1. **Prefer role-based queries**: `getByRole('button', { name: 'Submit' })` over `getByTestId`
2. **Use auto-retrying assertions**: Both RTL and Playwright support auto-retry for async state
3. **Stable selectors**: `data-testid` is most stable but least user-facing; balance with role queries
4. **Test behavior, not implementation**: Verify user-visible outcomes, not internal state
5. **Disabled elements**: Verify both presence of `disabled` attribute AND non-interactive behavior

**Source URLs**:
- RTL: https://testing-library.com/docs/queries/byrole
- RTL User Event: https://testing-library.com/docs/user-event/intro
- Playwright Assertions: https://playwright.dev/docs/test-assertions
- Playwright Locators: https://playwright.dev/docs/locators


---

## 5. Theme Integration Patterns (Task 4)

### Theme Entry Points

| File | Purpose |
|------|---------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/default/index.tsx` | Theme definition export |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/default/styles/index.scss` | Theme CSS styles |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/winxp/index.tsx` | WinXP theme variant |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/index.tsx` | Win98 theme variant |

### Theme Definition Structure (Line refs: registry.ts:48-64)

```typescript
// ThemeDefinition interface (types.ts:5-10)
interface ThemeDefinition {
  id: ThemeId;        // 'win98' | 'winxp' | 'default'
  label: string;      // Display name
  systemType: SystemTypeId;  // 'windows' | 'default'
  className: string;  // CSS class prefix: 'cm-theme--default'
}
```

### Theme Registry Pattern (registry.ts:17-21, 60-64)

```typescript
export const THEME = {
  win98: 'win98',
  winxp: 'winxp',
  default: 'default',
} as const satisfies Record<string, ThemeId>;

const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  [THEME.win98]: projectThemeDefinition(win98ThemeDefinition),
  [THEME.winxp]: projectThemeDefinition(winXpThemeDefinition),
  [THEME.default]: projectThemeDefinition(defaultThemeDefinition),
};
```

### CSS Class Naming Convention

- System class: `.cm-system--{systemType}` (e.g., `.cm-system--windows`)
- Theme class: `.cm-theme--{themeId}` (e.g., `.cm-theme--win98`)
- Combined: `.cm-system--windows.cm-theme--win98` (see default/styles/index.scss:1)

---

## 6. Dev Preview Patterns (Task 4)

### Dev Entry Points

| File | Purpose |
|------|---------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/index.html` (line 10) | Dev server entry: loads `src/dev/main.tsx` |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/main.tsx` (line 8) | Renders `<DevSystemRoot {...DEFAULT_DEV_SELECTION} />` |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/themeSwitcher.tsx` (line 58-66) | DevSystemRoot component |

### DevSystemRoot Component (themeSwitcher.tsx:58-66)

```typescript
export function DevSystemRoot({
  systemType = DEFAULT_DEV_SELECTION.systemType,
  theme = DEFAULT_DEV_SELECTION.theme,
}: DevSystemRootProps): ReactElement {
  resolveDevSystemDefinition(systemType);
  resolveDevThemeDefinition({ systemType, theme });
  return <SystemHost systemType={systemType} theme={theme} />;
}
```

### SystemHost Integration (SystemHost.tsx:21-28)

```typescript
export const SystemHost = ({ systemType, theme }: SystemHostProps): ReactElement => {
  assertValidSystemThemeSelection({ systemType, theme });
  const systemDefinition = resolveSystemTypeDefinition(systemType);
  const themeDefinition = resolveThemeDefinition({ systemType, theme });
  const ActiveSystemShell = SYSTEM_SHELL_BY_TYPE[systemDefinition.id];
  return <ActiveSystemShell key={systemType} themeDefinition={themeDefinition} />;
};
```

---

## 7. Harness Page Patterns (Task 5)

### Harness HTML Files

| File | Purpose |
|------|---------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/playwright-window.html` | Playwright harness entry |
| `/Users/zhangxiao/frontend/SysUI/chameleon/index.html` | Dev server entry |

### Harness Route Parsing (windowHarness.tsx:36-69)

Two routing modes:
1. **Fixture mode**: `?fixture={name}` - renders predefined fixture components
2. **System-theme mode**: `?systemType={type}&theme={theme}` - renders full DevSystemRoot

```typescript
const readHarnessRoute = (): HarnessRoute => {
  const fixture = url.searchParams.get('fixture');
  if (fixture !== null) {
    return { kind: 'fixture', fixture };
  }
  const systemType = url.searchParams.get('systemType');
  const theme = url.searchParams.get('theme');
  if (isDevSystemTypeId(systemType) && isDevThemeId(theme)) {
    return { kind: 'system-theme', systemType, theme };
  }
  return { kind: 'fixture', fixture: DEFAULT_FIXTURE };
};
```

### Unknown Fixture Error Rendering (windowHarness.tsx:127-129)

```typescript
default:
  return <div data-testid="fixture-error">Unknown fixture: {fixture}</div>;
```

**Key Pattern**: Unknown fixtures render explicit error with `data-testid="fixture-error"` instead of silently failing.

---

## 8. Playwright Smoke Test Patterns (Task 5)

### Test Files

| File | Purpose |
|------|---------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/window.smoke.spec.ts` | Smoke tests |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/window.helpers.ts` | Test helpers |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/window.move.spec.ts` | Move behavior tests |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/window.resize.spec.ts` | Resize behavior tests |

### Stable data-testid Values (window.helpers.ts:16-21)

```typescript
const SCREEN_ROOT_TEST_ID = 'screen-root';
const WINDOW_FRAME_TEST_ID = 'window-frame';
const WINDOW_TITLE_TEST_ID = 'window-title';
const WINDOW_CONTENT_TEST_ID = 'window-content';
const WINDOW_RESIZE_TEST_ID_PREFIX = 'window-resize-';
const FIXTURE_ERROR_TEST_ID = 'fixture-error';
```

### Component data-testid Usage

| Component | testid Value | Location |
|-----------|--------------|----------|
| CScreen | `screen-root` | Screen.tsx:21 |
| CWindow frame | `window-frame` | Window.tsx:460 |
| CWindow content | `window-content` | Window.tsx:435 |
| CWindow resize handles | `window-resize-{direction}` | Window.tsx:396 |
| CWindowTitle | `window-title` | WindowTitle.tsx:65 |

### Screen Root Data Attributes (Screen.tsx:21-24)

```typescript
<div
  data-testid="screen-root"
  data-system-type={systemType}
  data-theme={theme}
>
```

**Key Pattern**: Screen root exposes `data-system-type` and `data-theme` for test verification.

### Test Helper Functions (window.helpers.ts)

| Function | Purpose |
|----------|---------|
| `gotoWindowFixture(page, fixture)` | Navigate to fixture URL and wait |
| `gotoWindowSelection(page, selection)` | Navigate to system+theme selection |
| `switchWindowSelection(page, selection)` | Switch theme via URL without reload |
| `readFrameMetrics(page)` | Read window position/size from inline styles |
| `dragLocatorBy(locator, dx, dy)` | Simulate mouse drag |

### Smoke Test Pattern (window.smoke.spec.ts:18-24)

```typescript
test('unknown fixture shows explicit error', async ({ page }) => {
  await gotoWindowFixture(page, 'unknown-mode');
  const error = page.getByTestId('fixture-error');
  await expect(error).toBeVisible();
  await expect(error).toHaveText('Unknown fixture: unknown-mode');
});
```

---

## 9. Test Fixture Pattern (for reference)

### Fixture Factory (tests/helpers/systemSession.fixture.tsx)

```typescript
export interface CreateSystemSessionFixtureOptions {
  readonly persistentStoreState?: Partial<PersistentSystemStoreState>;
  readonly runtimeWindowSessionState?: Partial<...>;
}

export const createSystemSessionFixture = (
  overrides?: CreateSystemSessionFixtureOptions,
): SystemSessionFixture => { ... }
```

---

## Summary for Task 4-5 Implementation

| Aspect | Pattern | Key Files |
|--------|---------|-----------|
| Theme entry | ThemeDefinition with id, label, systemType, className | `src/theme/*/index.tsx` |
| Theme styles | SCSS with `.cm-system--{type}.cm-theme--{id}` selector | `src/theme/*/styles/index.scss` |
| Dev preview | DevSystemRoot → SystemHost → ActiveSystemShell | `src/dev/themeSwitcher.tsx`, `SystemHost.tsx` |
| Harness routing | URL params: `?fixture=X` or `?systemType=X&theme=Y` | `windowHarness.tsx:36-69` |
| Unknown fixture | Render `<div data-testid="fixture-error">` | `windowHarness.tsx:127-129` |
| Stable testids | Constants in helpers, used in components | `window.helpers.ts:16-21` |
| Screen metadata | `data-system-type`, `data-theme` on root | `Screen.tsx:21-24` |
| Smoke test | Use helpers + expect(page.getByTestId(...)) | `window.smoke.spec.ts` |

---

## 6. Local Codebase Patterns (Chameleon Component Library)

### 6.1 Component Structure Patterns

#### File Organization
```
src/components/
├── Button/           # New component folder (per plan task 1)
│   ├── Button.tsx    # Component implementation
│   └── index.scss    # Component-local styles
├── Radio/            # New component folder (per plan task 2)
│   ├── Radio.tsx
│   ├── RadioGroup.tsx
│   └── index.scss
├── Select/           # New component folder (per plan task 3)
│   ├── Select.tsx
│   └── index.scss
├── Dock/             # Existing reference
│   ├── Dock.tsx
│   └── index.scss
└── index.ts          # Central export file
```

#### Export Pattern
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/index.ts`
```typescript
export * from './Widget/Widget';
export * from './Window/Window';
export * from './Window/WindowTitle';
export * from './Window/WindowManager';
export * from './Screen/Screen';
export * from './Screen/ScreenManager';
export * from './Screen/Grid';
export * from './Dock/Dock';
// Add new exports:
export * from './Button/Button';
export * from './Radio/Radio';
export * from './Radio/RadioGroup';
export * from './Select/Select';
```

**Package entry**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/index.ts`
```typescript
export * from './components';  // Re-exports all component exports
```

---

### 6.2 Component Implementation Patterns

#### Class Component Pattern (CDock reference)
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx`

Key patterns:
- Extends `CWidget` for layout components (NOT needed for form controls per plan)
- Props interface includes `'data-testid'?: string`
- Uses `cm-*` class prefix
- Controlled/uncontrolled pattern with `value`/`defaultValue` or `position`/`defaultPosition`

```typescript
interface CDockBaseProps extends CWidgetProps {
  children?: React.ReactNode;
  position?: DockPosition;        // Controlled
  defaultPosition?: DockPosition; // Uncontrolled
  onPositionChange?: (position: DockPosition) => void;
  // ...
  'data-testid'?: string;
}

type CDockHeightProps =
  | { height: number; defaultHeight?: number; }
  | { height?: number; defaultHeight: number; };

export type CDockProps = CDockBaseProps & CDockHeightProps;

export class CDock extends CWidget {
  declare public props: CDockProps;
  public state: DockState;

  public constructor(props: CDockProps) {
    super(props);
    this.state = {
      resolvedPosition: props.position ?? props.defaultPosition ?? 'top',
      resolvedHeight: props.height ?? props.defaultHeight,
    };
  }

  public componentDidUpdate(prevProps: CDockProps): void {
    if (prevProps.position !== this.props.position || prevProps.height !== this.props.height) {
      this.setState({
        resolvedPosition: this.props.position ?? this.state.resolvedPosition,
        resolvedHeight: this.props.height ?? this.state.resolvedHeight,
      });
    }
  }

  public render() {
    return this.renderFrame(
      this.props.children,
      {},
      {
        className: this.getDockFrameClassName(resolvedPosition),
        style: this.getDockFrameStyle(dockEdgeStyle),
        testId: this.props['data-testid'] ?? 'dock-frame',  // Fallback testId
      },
    );
  }
}
```

#### Simple Component Pattern (CWindowTitle reference)
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Window/WindowTitle.tsx`

For simpler form controls, use functional component pattern:
```typescript
export interface CWindowTitleProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onWindowMove?: (position: WindowPosition) => void;
  getWindowPose?: () => Pose;
}

export class CWindowTitle extends React.Component<CWindowTitleProps> {
  protected readonly titleRef = React.createRef<HTMLDivElement>();

  protected renderTitle(content: React.ReactNode, className?: string): React.ReactElement {
    return (
      <div
        ref={this.titleRef}
        data-testid="window-title"
        className={className ?? 'cm-window__title-bar'}
        style={this.props.style}
      >
        {content}
      </div>
    );
  }

  public render(): React.ReactElement {
    return this.renderTitle(this.props.children, this.props.className);
  }
}
```

---

### 6.3 SCSS Naming Conventions

#### Component-local SCSS
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/index.scss`

```scss
.cm-dock {
}

.cm-dock--top {
}

.cm-dock--right {
}

.cm-dock--bottom {
}

.cm-dock--left {
}
```

**Pattern**: 
- Base class: `cm-{component-name}`
- Modifier class: `cm-{component-name}--{variant}`
- Element class: `cm-{component-name}__{element}`

#### Theme SCSS (for visual styling)
**Location**: `src/theme/{themeId}/styles/index.scss`

Per plan task 4, visual styles should be in theme files, not component-local SCSS.

---

### 6.4 data-testid Patterns

#### Component Implementation
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx:17,136`

```typescript
interface CDockBaseProps extends CWidgetProps {
  // ...
  'data-testid'?: string;  // Line 17
}

// Usage in render:
testId: this.props['data-testid'] ?? 'dock-frame',  // Line 136
```

#### CWidget Base Class
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Widget/Widget.tsx:41`

```typescript
protected renderFrame(
  content: React.ReactNode,
  layout?: WidgetLayoutProps,
  options?: WidgetFrameOptions,
): React.ReactElement {
  return (
    <div
      data-testid={options?.testId ?? 'widget-frame'}  // Default fallback
      className={options?.className}
      style={frameStyle}
    >
      {content}
    </div>
  );
}
```

#### Test Usage
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx`

```typescript
// Custom testid passed by user
render(<CDock data-testid="dock-under-test" ... />);
const dock = screen.getByTestId('dock-under-test');

// Default fallback testid
render(<CDock defaultHeight={32} />);
const dock = screen.getByTestId('dock-frame');
```

---

### 6.5 Controlled/Uncontrolled Pattern

#### State Initialization
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx:41-47`

```typescript
public constructor(props: CDockProps) {
  super(props);
  this.state = {
    resolvedPosition: props.position ?? props.defaultPosition ?? 'top',
    resolvedHeight: props.height ?? props.defaultHeight,
  };
}
```

#### Update Synchronization
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx:49-56`

```typescript
public componentDidUpdate(prevProps: CDockProps): void {
  if (prevProps.position !== this.props.position || prevProps.height !== this.props.height) {
    this.setState({
      resolvedPosition: this.props.position ?? this.state.resolvedPosition,
      resolvedHeight: this.props.height ?? this.state.resolvedHeight,
    });
  }
}
```

**Key Pattern**:
- Controlled prop (`position`) takes precedence over internal state
- Default prop (`defaultPosition`) only used for initial state
- Changes to default props after mount are ignored (tested in Dock.test.tsx:223-266)

---

### 6.6 Test Patterns

#### Test File Structure
**File**: `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CDock as PackageEntryCDock } from '../src';
import { CDock, type CDockProps } from '../src/components/Dock/Dock';

describe('CDock', () => {
  // Export verification
  it('exports CDock from package entry', () => {
    render(<PackageEntryCDock data-testid="dock-package-entry" defaultHeight={24} />);
    const dock = screen.getByTestId('dock-package-entry');
    expect(PackageEntryCDock).toBe(CDock);
    expect(dock).toBeInTheDocument();
  });

  // Type checking
  it('requires height or defaultHeight in props typing', () => {
    const validWithHeight: CDockProps = { height: 24 };
    // @ts-expect-error CDock requires height or defaultHeight
    const invalidWithoutThickness: CDockProps = {};
  });

  // Happy path
  it('renders with supported dock props', () => {
    const props: CDockProps = {
      position: 'bottom',
      defaultPosition: 'left',
      height: 48,
      // ... more props
    };
    render(<CDock {...props} />);
    const dock = screen.getByTestId('dock-under-test');
    expect(dock).toBeInTheDocument();
    expect(dock).toHaveClass('cm-dock');
    expect(dock).toHaveClass('cm-dock--bottom');
  });

  // Controlled update
  it('syncs controlled position and height updates', async () => {
    const { rerender } = render(
      <CDock data-testid="dock-sync" position="top" height={32} ... />
    );
    // ... verify initial state
    
    rerender(<CDock data-testid="dock-sync" position="left" height={48} ... />);
    
    await waitFor(() => {
      expect(dock).toHaveClass('cm-dock--left');
    });
  });

  // Default prop ignored after mount
  it('ignores default prop changes after mount', () => {
    const { rerender } = render(
      <CDock data-testid="dock-default-sync" defaultPosition="bottom" defaultHeight={28} ... />
    );
    // ... verify initial state
    
    rerender(<CDock data-testid="dock-default-sync" defaultPosition="right" defaultHeight={52} ... />);
    
    // Should still be bottom, not right
    expect(dock).toHaveClass('cm-dock--bottom');
    expect(dock).not.toHaveClass('cm-dock--right');
  });
});
```

---

### 6.7 Reference File Summary

| Purpose | File Path | Key Lines |
|---------|-----------|-----------|
| Component export pattern | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/index.ts` | 1-8 |
| Package entry re-export | `/Users/zhangxiao/frontend/SysUI/chameleon/src/index.ts` | 3 |
| Class component pattern | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx` | 37-140 |
| Props interface with testid | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx` | 7-30 |
| Controlled/uncontrolled init | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx` | 41-47 |
| Controlled update sync | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/Dock.tsx` | 49-56 |
| SCSS naming | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Dock/index.scss` | 1-14 |
| Test structure | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx` | 1-370 |
| Export verification test | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx` | 7-15 |
| Type checking test | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx` | 17-26 |
| Controlled rerender test | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx` | 188-221 |
| Default prop ignored test | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Dock.test.tsx` | 223-266 |
| CWidget base class | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Widget/Widget.tsx` | 21-53 |
| Simple component pattern | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Window/WindowTitle.tsx` | 17-77 |

---

### 6.8 Key Conventions for Tasks 1-3

1. **DO NOT extend CWidget** - Form controls use native HTML elements directly, not layout frame
2. **Use `cm-*` class prefix** - All component classes start with `cm-`
3. **Support `data-testid` prop** - Allow custom testid with sensible fallback
4. **Implement controlled/uncontrolled** - Use `value`/`defaultValue` pattern
5. **Export from components/index.ts** - Add `export * from './Button/Button'` etc.
6. **Test both modes** - Cover controlled rerender and defaultValue ignored after mount
7. **Use native HTML elements** - `<button>`, `<input type="radio">`, `<select>` per plan constraints
8. **Default type="button"** - For CButton, explicitly set to avoid form submission

---

## 10. Radio Task Implementation Notes (2026-03-24)

- `CRadioGroup` 用 `value ?? internalState` 解析当前选中项；`defaultValue` 只进入首次 `useState` 初始化，后续 prop 变化不会回写 UI。
- 为了支持从非受控切到受控，组组件在 `value` 存在时会同步内部状态；这样移除受控值时，最后一次受控选择仍可作为回退状态。
- `CRadio` 保持纯原生语义：外层使用可点击 `<label>`，内层使用 `<input type="radio">`，浏览器互斥完全依赖共享 `name`。
- 组级 `disabled` / `required` 通过 context 下发到每个 radio，单项 `disabled` 与组级禁用取并集。
- 在 Jest + jsdom 里，禁用 radio 的交互断言使用原生 `.click()` 比 `fireEvent.click()` 更贴近真实浏览器的“禁用不可选中”行为。

---

## 10. Task 1 Implementation Notes

- `CButton` uses a native `<button>` and stays independent from `CWidget`.
- Structural Button SCSS stays minimal: `.cm-button` base plus `.cm-button--primary` and `.cm-button--ghost` modifiers only.
- Entry tests for Button should stay focused on native render, explicit `type="button"`, variant classes, and disabled click suppression with `jest.fn()`.

## 11. Task 3 Implementation Notes

- `CSelect` keeps to a native `<select>` with plain `<option>` children and a single `cm-select` structural class.
- Controlled precedence is `value` over `defaultValue`; in uncontrolled mode `defaultValue` only seeds the initial DOM state.
- When `placeholder` exists, the first option uses `value=""` and is marked `disabled`, so it can display initially without acting as a reusable business value.
- For uncontrolled placeholder flows, falling back `defaultValue` to `""` ensures the placeholder shows before the user picks a real option.
- Controlled tests can rely on native React semantics: firing `change` calls `onChange(nextValue)`, but the rendered value stays old until parent rerender.

---

## 12. Task 4 Integration Notes

- 集中导出继续沿用 `export * from` 模式，包入口测试可像 `tests/Dock.test.tsx` 一样同时断言“包入口符号 === 直接入口符号”与基础渲染成功。
- dev 预览无需改 `src/dev/themeSwitcher.tsx`：先渲染 `DevSystemRoot`，再把预览组件挂到现有 `default-window-body` / `windows-window-body` 占位节点即可复用主题切换链路。
- Button / Radio / Select 的可见外观应放在 `.cm-system--{systemType}.cm-theme--{themeId}` 作用域里；组件局部 `index.scss` 继续只保留结构类名即可。

---

## 13. Task 5 Playwright Harness Notes

- 新增独立 harness 页面时，直接复用 `windowHarness.tsx` 的 `new URL(window.location.href)` + `searchParams.get('fixture')` + `popstate` 监听模式，默认回退到 `default` fixture。
- common controls smoke helper 继续包一层 `page.goto()` + `page.waitForFunction()`，但等待条件改成按钮 / radio group / select 或 `fixture-error` 出现，避免复用 window 专属选择器。
- `radio-demo-fruit` 自身是 group 容器，若要断言“当前值”，适合在 helper 里读取容器内 `input[type="radio"]:checked` 的 `value`，同时保留 `getByRole('radio', { name: 'Orange' })` 做禁用态断言。

---

## 14. Task 6 README and Validation Notes

- README 公共安装名必须使用 `@system-ui-js/chameleon`，不能写成旧的 `@sysui/chameleon`。
- Button 最小示例可直接展示 `<CButton>Default</CButton>` 与 `<CButton variant="primary">Primary</CButton>`。
- Radio 最小示例要写成带非空 `name` 的 `CRadioGroup`，演示值固定为 `apple` / `orange`。
- Select 最小示例要通过 `options` 传入 `small` / `medium` / `large`，并显式展示 `placeholder` 用法。
- 本地 CI 对齐顺序实测可用：`yarn lint`，3 个聚焦 Jest 命令，聚焦 Playwright smoke，`yarn build`，`npm pack --dry-run`。
- 这轮 `yarn lint` 还会检查 `src/dev/playwright/commonControlsHarness.tsx`，即使主任务只改 README，也可能需要补最小相关修复。
- `yarn build` 仍会输出 Sass legacy JS API deprecation warning，但当前不阻塞构建结果。

---

## 15. Final Wave F2 Radio Accessibility Fix Notes

- `CRadioGroup` 的最小可访问修复可以只落在 group wrapper：为容器增加 `role="radiogroup"`，并显式支持 `aria-label` / `aria-labelledby` 命名，不需要改动原生 radio 本体。
- 保持原生 `<input type="radio">` 的 checked、键盘和互斥行为不变，比引入自定义 roving tabindex 或 ARIA radio 状态管理更符合当前任务边界。
- 对 group wrapper 同步暴露 `aria-required` / `aria-disabled`，可以让辅助技术更完整地感知组级状态，同时继续由各个原生 input 承担真实交互约束。
- 预览页里直接给交互示例传入具体 `aria-label`（如 `Favorite fruit`）即可满足命名要求，不必额外引入新的视觉文案或主题样式。

---

## 16. Verification Reference Memo (Authoritative Sources)

### Official Documentation URLs (Verified 2026-03-24)

| Topic | URL | Status |
|-------|-----|--------|
| MDN Button | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | ✅ Valid |
| MDN Radio Input | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio | ✅ Valid |
| MDN Select | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select | ✅ Valid |
| Playwright Assertions | https://playwright.dev/docs/test-assertions | ✅ Valid |
| Testing Library Queries | https://testing-library.com/docs/queries/byrole | ✅ Valid |

---

### Verification-Relevant Behavioral Constraints

#### 1. Button Default Type (Task 1 Acceptance Criteria)

**Constraint**: `CButton` must default to `type="button"` to prevent accidental form submission.

**MDN Source** (button#type):
> "submit": The button submits the form data to the server. This is the **default** if the attribute is not specified for buttons associated with a `<form>`.

**MDN Note**:
> "If your buttons are not for submitting form data to the server, be sure to set their `type` attribute to `button`."

**Verification**:
- Jest: `expect(screen.getByRole('button')).toHaveAttribute('type', 'button')`
- Playwright: `await expect(page.getByRole('button')).toHaveAttribute('type', 'button')`

---

#### 2. Radio Name Grouping (Task 2 Acceptance Criteria)

**Constraint**: All radios in a group must share the same `name` attribute for browser-enforced mutual exclusion.

**MDN Source** (input/radio):
> "A radio group is defined by giving each of radio buttons in the group the **same `name` attribute**."
> "Only **one radio button** in a given group can be selected at the same time."

**Verification**:
- Jest: Query all radios with same name, verify only one has `checked` attribute
- Playwright: `await expect(page.getByRole('radio', { name: 'Apple' })).toBeChecked()`

---

#### 3. Disabled Behavior (Tasks 1-3)

**Constraint**: Disabled elements cannot be focused or respond to user interaction.

**MDN Source** (button#disabled):
> "This Boolean attribute prevents the user from interacting with the button: it **cannot be pressed or focused**."

**Verification**:
- Jest: `expect(button).toBeDisabled()` (from jest-dom)
- Playwright: `await expect(locator).toBeDisabled()` (auto-retrying)

---

#### 4. Select Placeholder + Required (Task 3 Acceptance Criteria)

**Constraint**: Empty `value=""` option acts as placeholder; `required` forces non-empty selection.

**MDN Source** (select#required):
> "A Boolean attribute indicating that **an option with a non-empty string value must be selected**."

**Common Pattern**:
```html
<select required>
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
</select>
```

**Verification**:
- Jest: `expect(select).toHaveValue('')`
- Playwright: `await expect(page.getByRole('combobox')).toHaveValue('medium')`

---

### Playwright Assertion Quick Reference

| Assertion | Usage | Auto-Retry |
|-----------|-------|------------|
| `toBeDisabled()` | Verify button/radio/select is disabled | ✅ Yes |
| `toBeEnabled()` | Verify element is enabled | ✅ Yes |
| `toBeChecked()` | Verify radio/checkbox is checked | ✅ Yes |
| `toBeVisible()` | Verify element is visible | ✅ Yes |
| `toHaveValue('x')` | Verify input/select value equals 'x' | ✅ Yes |
| `toHaveText('x')` | Verify element text content | ✅ Yes |
| `getByTestId('x')` | Locate element by data-testid | N/A |

**Source**: https://playwright.dev/docs/test-assertions (Auto-retrying assertions table)

---

### Smoke Test Assertions (Task 5)

Per plan acceptance criteria:
- Default fixture: button visible, radio value = `apple`, select value = `medium`
- Disabled fixture: button disabled, radio disabled, select disabled
- Unknown fixture: `data-testid="fixture-error"` visible with "Unknown fixture:" text

**Playwright Code**:
```typescript
// Default fixture
await expect(page.getByTestId('button-demo-primary')).toBeVisible()
await expect(page.getByRole('radio', { name: 'Apple' })).toBeChecked()
await expect(page.getByRole('combobox')).toHaveValue('medium')

// Disabled fixture
await expect(page.getByRole('button')).toBeDisabled()
await expect(page.getByRole('radio', { name: 'Orange' })).toBeDisabled()
await expect(page.getByRole('combobox')).toBeDisabled()

// Unknown fixture
await expect(page.getByTestId('fixture-error')).toBeVisible()
await expect(page.getByTestId('fixture-error')).toContainText('Unknown fixture:')
```

---

### Summary: What to Verify

| Plan Task | Key Verification Point | Source |
|-----------|----------------------|--------|
| Task 1 | Button default `type="button"` | MDN button#type |
| Task 1 | Disabled button not clickable | MDN button#disabled |
| Task 2 | Radio group shares `name` | MDN input/radio |
| Task 2 | Only one radio checked per group | MDN input/radio |
| Task 3 | Select renders options | MDN select |
| Task 3 | Placeholder with `value=""` | MDN select#required |
| Task 5 | Smoke test assertions | Playwright docs |

---

## 18. Final F4 Scope Audit Notes (2026-03-24)

- 复核范围覆盖计划文件、`src/components/Button/Button.tsx`、`src/components/Radio/Radio.tsx`、`src/components/Radio/RadioGroup.tsx`、`src/components/Select/Select.tsx`、`src/components/index.ts`、`src/index.ts`、`src/dev/commonControlsPreview.tsx`、`src/dev/main.tsx`、`src/dev/playwright/commonControlsHarness.tsx`、`playwright-common-controls.html`、`README.md`、`tests/Button.test.tsx`、`tests/Radio.test.tsx`、`tests/Select.test.tsx`、`tests/ui/common-controls.helpers.ts`、`tests/ui/common-controls.smoke.spec.ts`，以及 `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`。
- 实际导出面仍限定在计划内的原生包装组件：`CButton`、`CRadio`、`CRadioGroup`、`CSelect`，没有新增 button group、form abstraction、radio options renderer 或额外 demo/public API。
- `CButton` 仅支持 `default | primary | ghost`、原生 `button/submit/reset`、`disabled`、`onClick`、`className`、`data-testid`；未发现 loading、icon-only matrix、link-button 等越界功能。
- `CRadio` / `CRadioGroup` 维持原生 radio 语义；额外的 `role="radiogroup"`、`aria-label`、`aria-labelledby` 属于已接受的最小可访问性收紧，不计为 scope creep。
- `CSelect` 仍是原生单选 `<select>` 包装；未发现 searchable、clearable、multiselect、custom popup/listbox、portal、async loading、grouped options 或 option template 扩展。
- 组件局部 SCSS 仅保留结构类，视觉样式位于三个主题入口；预览接入保留在现有 `DevSystemRoot` 流程内，没有新增 docs site 或新的 dev app route。
- README、preview、Playwright harness 与 smoke spec 中的固定值保持与计划一致：radio 为 `apple/orange`，select 为 `small/medium/large`，默认 smoke 状态为 radio=`apple`、select=`medium`。
- 可用验证证据来自现有记录：notepad 已记录 targeted Jest、Playwright smoke、`yarn lint`、`yarn build`、`npm pack --dry-run` 均已通过；本轮 F4 只做只读 scope 复审，不重新修改实现。


---

## 17. Current Implementation Status Mapping (Tasks 1-4)

**Date**: 2026-03-24
**Purpose**: Verify actual codebase state against plan tasks 1-4

### Task 1: CButton Native Wrapper

| Acceptance Criteria | Status | Evidence |
|---------------------|--------|----------|
| Component file exists | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Button/Button.tsx` |
| SCSS file exists | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Button/index.scss` |
| Test file exists | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Button.test.tsx` |
| Supports children, variant, type, disabled, onClick, className, data-testid | ✅ COMPLETE | Button.tsx lines 7-15 (props interface) |
| Default type="button" | ✅ COMPLETE | Button.tsx line 20: `type = 'button'` |
| Variant class applied | ✅ COMPLETE | Button.tsx lines 28-30: `cm-button--${variant}` |
| Disabled click blocking | ✅ COMPLETE | Button.tsx line 39: `disabled` passed to native button |

**Plan Quote** (Task 1 Acceptance):
> "tests/Button.test.tsx 断言未传 type 时 DOM button.type === 'button'"
> "tests/Button.test.tsx 断言 disabled 时点击不触发 jest.fn()"
> "tests/Button.test.tsx 断言 variant="primary" 时具备 cm-button--primary"

**Verification**: Button.test.tsx line 30-34 verifies default type="button", lines 50-66 verify disabled blocks click, lines 36-48 verify variant class.

---

### Task 2: CRadio and CRadioGroup

| Acceptance Criteria | Status | Evidence |
|---------------------|--------|----------|
| Component files exist | ✅ COMPLETE | Radio.tsx, RadioGroup.tsx, index.scss in `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/` |
| Test file exists | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Radio.test.tsx` |
| CRadio uses native `<input type="radio">` + label | ✅ COMPLETE | Radio.tsx lines 43-53: native input inside label |
| CRadioGroup provides shared name | ✅ COMPLETE | RadioGroup.tsx lines 67-76: context provides name |
| Supports controlled/uncontrolled | ✅ COMPLETE | RadioGroup.tsx lines 41-65: value vs uncontrolledValue |
| Name sharing verified | ✅ COMPLETE | Radio.test.tsx lines 26-49 |
| Disabled state handled | ✅ COMPLETE | Radio.tsx lines 26, 47: isDisabled propagation |

**Plan Quote** (Task 2 Acceptance):
> "tests/Radio.test.tsx 断言 group 下所有 radio 共享相同 name"
> "tests/Radio.test.tsx 断言非受控模式点击后选中值更新，受控模式点击后若不 rerender 则界面不改变"
> "tests/Radio.test.tsx 断言禁用 radio 点击后仍保持未选中"

**Verification**: Radio.test.tsx line 47-48 verifies name sharing, lines 76-94 verify uncontrolled click, lines 96-128 verify controlled mode, lines 130-171 verify disabled behavior.

---

### Task 3: CSelect Native Single-Select Wrapper

| Acceptance Criteria | Status | Evidence |
|---------------------|--------|----------|
| Component file exists | ✅ COMPLETE | Select.tsx, index.scss in `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Select/` |
| Test file exists | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Select.test.tsx` |
| Uses native `<select>` | ✅ COMPLETE | Select.tsx lines 52-76: native select element |
| Supports options, value, defaultValue, onChange, name, disabled, required, placeholder | ✅ COMPLETE | Select.tsx lines 10-21 (props interface) |
| Controlled/uncontrolled mode | ✅ COMPLETE | Select.tsx lines 36-41: isControlled logic |
| placeholder + required behavior | ✅ COMPLETE | Select.tsx lines 62-66: placeholder option with value="" and disabled |

**Plan Quote** (Task 3 Acceptance):
> "tests/Select.test.tsx 断言 options 正确渲染为原生 option 列表"
> "tests/Select.test.tsx 断言非受控模式用户选择后值更新，受控模式若不 rerender 则值不变"
> "tests/Select.test.tsx 断言 placeholder + required 时初始值为空且需显式选择真实 option"

**Verification**: Select.test.tsx lines 25-52 verify options rendering, lines 54-67 verify uncontrolled mode, lines 69-82 verify controlled mode, lines 90-104 verify placeholder+required.

---

### Task 4: Integration (Exports, Theme, Dev Preview)

| Acceptance Criteria | Status | Evidence |
|---------------------|--------|----------|
| Exports in src/components/index.ts | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/index.ts` lines 9-12 |
| Exports in src/index.ts | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/index.ts` line 4 |
| Theme default styles | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/default/styles/index.scss` lines 128-274 |
| Theme win98 styles | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/styles/index.scss` lines 65-183 |
| Theme winxp styles | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/winxp/styles/index.scss` lines 90-222 |
| Dev preview component | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/commonControlsPreview.tsx` |
| Dev preview wired in main.tsx | ✅ COMPLETE | `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/main.tsx` lines 2, 9-23 |
| Test ID: button-demo-primary | ✅ COMPLETE | commonControlsPreview.tsx line 31 |
| Test ID: radio-demo-fruit | ✅ COMPLETE | commonControlsPreview.tsx line 59 |
| Test ID: select-demo-size | ✅ COMPLETE | commonControlsPreview.tsx line 83 |
| Radio demo values: apple/orange | ✅ COMPLETE | commonControlsPreview.tsx lines 65-66 |
| Select demo values: small/medium/large | ✅ COMPLETE | commonControlsPreview.tsx lines 4-8 |

**Plan Quote** (Task 4 Acceptance):
> "Dev preview root renders button-demo-primary、radio-demo-fruit、select-demo-size 三个稳定节点"
> "Radio demo 固定值为 apple / orange，Select demo 固定值为 small / medium / large"

**Verification**: commonControlsPreview.tsx line 31 has `data-testid="button-demo-primary"`, line 59 has `data-testid="radio-demo-fruit"`, line 83 has `data-testid="select-demo-size"`. Radio values are apple/orange (lines 65-66), Select options are small/medium/large (lines 4-8).

---

## Gap Report Summary

| Task | Status | Missing Items |
|------|--------|---------------|
| Task 1: CButton | ✅ COMPLETE | None |
| Task 2: CRadio/CRadioGroup | ✅ COMPLETE | None |
| Task 3: CSelect | ✅ COMPLETE | None |
| Task 4: Integration | ✅ COMPLETE | None |

**Conclusion**: All plan tasks 1-4 are FULLY IMPLEMENTED in the current codebase. No gaps identified.

---

## Additional Artifacts Verified (Not in Tasks 1-4 Scope)

| Artifact | Status | Evidence |
|----------|--------|----------|
| Playwright harness | ✅ EXISTS | `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/playwright/commonControlsHarness.tsx` |
| Playwright HTML | ✅ EXISTS | `/Users/zhangxiao/frontend/SysUI/chameleon/playwright-common-controls.html` |
| Smoke test spec | ✅ EXISTS | `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/common-controls.smoke.spec.ts` |

Note: These are Task 5 artifacts, verified for completeness but not required for Tasks 1-4 gap analysis.

---

## 18. Final Wave F2 Independent Code Review (2026-03-24)

- Verdict: `APPROVE`
- Reviewed files: `src/components/Button/Button.tsx`, `src/components/Radio/Radio.tsx`, `src/components/Radio/RadioGroup.tsx`, `src/components/Select/Select.tsx`, local SCSS stubs, `src/dev/commonControlsPreview.tsx`, `src/dev/playwright/commonControlsHarness.tsx`, `tests/Button.test.tsx`, `tests/Radio.test.tsx`, `tests/Select.test.tsx`, `tests/ui/common-controls.helpers.ts`, `tests/ui/common-controls.smoke.spec.ts`, theme style entries, and `README.md` usage surface.
- Typing review: no `any` found in reviewed TS/TSX files; props stay narrow and aligned with current native-wrapper scope.
- Semantics review: `CButton` keeps native `<button>` behavior with explicit default `type="button"`; `CRadio`/`CRadioGroup` preserve native radio mutual exclusion via shared `name`; `CSelect` remains a native single-select with native option semantics.
- Accessibility review: `CRadioGroup` adds the intended minimal wrapper surface (`role="radiogroup"`, `aria-label`, `aria-labelledby`, `aria-required`, `aria-disabled`) without replacing native radio interaction, which is adequate for the scoped change.
- Styling review: component-local SCSS remains intentionally light while visual rules live in theme files, matching project direction and avoiding duplicated styling logic.
- Test review: Jest covers controlled/uncontrolled precedence plus disabled paths for radio and select; button disabled click suppression is covered; Playwright smoke checks visible default state, disabled fixture state, and unknown-fixture failure path. Existing passing lint/test/build/pack evidence is consistent with the inspected code.
- Blocking issues: none identified. Minor omissions like unnamed harness radiogroup usage are not blocking because the component accessibility surface itself is present and the harness is a test-only validation page.

---

## 18. Final Wave F3 Manual QA Verdict (2026-03-24)

- Reviewed `src/dev/commonControlsPreview.tsx`, `src/dev/playwright/commonControlsHarness.tsx`, `tests/ui/common-controls.helpers.ts`, `tests/ui/common-controls.smoke.spec.ts`, and the `README.md` usage section for `CButton`, `CRadioGroup`, and `CSelect`.
- `commonControlsPreview` matches the plan's demo intent: one stable interactive example plus disabled examples for the same control family.
- Harness `default` fixture encodes the expected smoke baseline: visible primary button, radio value `apple`, and select value `medium`.
- Harness `disabled` fixture encodes the expected disabled state: disabled primary button, disabled `Orange` radio, disabled select, with `Apple` preserved as the checked default.
- Harness unknown fixture path renders `data-testid="fixture-error"` with `Unknown fixture: {fixture}`, matching the required failure mode.
- Local browser evidence confirmed the visible UI matched those encoded states for `default`, `disabled`, and `unknown-mode`.
- Re-ran `npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts --reporter=list` during QA review: 3/3 tests passed.
- Only console noise noted in local QA was a missing `favicon.ico` 404 on the harness page; this is non-blocking and does not affect the control fixtures.
- Final F3 verdict: `APPROVE`.

---

## 18. Final Wave F1 Plan Compliance Audit (2026-03-24T12:02:26Z)

- Verdict: `APPROVE`.
- 计划中的 1-6 号交付物均已落地：原生 `CButton` / `CRadio` / `CRadioGroup` / `CSelect`、统一导出、三套主题样式、dev preview、Playwright harness、smoke spec、README 示例全部存在并与计划 API 对齐。
- 守护边界保持成立：未发现 `any`、`CWidget` 继承、自定义 listbox / popup、searchable / clearable / multi-select、loading button、表单抽象层或 Storybook。
- 组件局部 SCSS 维持结构占位，主要视觉样式位于 `src/theme/default/styles/index.scss`、`src/theme/win98/styles/index.scss`、`src/theme/winxp/styles/index.scss`，符合任务 4 的样式分层要求。
- 预览与 harness 的稳定节点符合计划：`button-demo-primary`、`radio-demo-fruit`、`select-demo-size`，unknown fixture 也保留了 `fixture-error` 明确报错出口。
- README 中新增的最小示例与最终实现一致：`CButton` 展示 default/primary，`CRadioGroup` 演示 `apple`/`orange`，`CSelect` 演示 `small`/`medium`/`large` 与 `placeholder`。
- 审计直接采用了用户提供的本地 QA 证据：3 个聚焦 Jest、全量 Jest、Playwright smoke、`yarn lint`、`yarn build`、`npm pack --dry-run` 均已通过。

---

## 19. Reference Pack for Atlas Verification (Authoritative Sources)

### Official Documentation URLs

| Topic | URL | Purpose |
|-------|-----|---------|
| MDN `<button>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button | Default type behavior, disabled semantics |
| MDN `<input type="radio">` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio | Name grouping, mutual exclusion, checked state |
| MDN `<select>` | https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select | Placeholder, required, value behavior |
| Playwright Locators | https://playwright.dev/docs/locators | getByRole, getByTestId, getByLabel |
| Playwright Assertions | https://playwright.dev/docs/test-assertions | toBeDisabled, toBeChecked, toHaveValue |

---

### Key Behavioral Rules for Atlas to Verify

#### 1. Button Default Type
**Rule**: `<button>` defaults to `type="submit"` when inside a form; must explicitly set `type="button"` to prevent accidental form submission.

**MDN Quote**:
> "If your buttons are not for submitting form data to the server, be sure to set their `type` attribute to `button`. Otherwise, they will try to submit form data and to load the (nonexistent) response, potentially destroying the current state of the document."

**Verification**:
```typescript
// Jest
expect(screen.getByRole('button')).toHaveAttribute('type', 'button')

// Playwright
await expect(page.getByRole('button')).toHaveAttribute('type', 'button')
```

---

#### 2. Radio Name Grouping
**Rule**: Radios share the same `name` attribute form a group; only one can be checked at a time.

**MDN Quote**:
> "A radio group is defined by giving each of radio buttons in the group the same `name` attribute."
> "Once a radio group is established, selecting any radio button in that group automatically deselects any currently-selected radio button in the same group."

**Verification**:
```typescript
// Verify all radios in group share same name
const radios = screen.getAllByRole('radio')
radios.forEach(radio => expect(radio).toHaveAttribute('name', 'expected-name'))

// Verify only one checked
const checked = screen.getByRole('radio', { checked: true })
expect(checked).toBeChecked()
```

---

#### 3. Radio Disabled Behavior
**Rule**: Disabled radio cannot be checked; clicking does not change checked state.

**MDN**: The `disabled` attribute is common to all `<input>` elements.

**Verification**:
```typescript
// Jest - disabled radio stays unchecked after click
const disabledRadio = screen.getByRole('radio', { name: 'Orange', disabled: true })
await userEvent.click(disabledRadio)
expect(disabledRadio).not.toBeChecked()

// Playwright
await expect(page.getByRole('radio', { name: 'Orange' })).toBeDisabled()
```

---

#### 4. Select Placeholder + Required
**Rule**: Empty `value=""` option acts as placeholder; `required` forces selection of non-empty value.

**MDN Quote**:
> "A Boolean attribute indicating that an option with a non-empty string value must be selected."

**Common Pattern**:
```html
<select required>
  <option value="">--Please choose an option--</option>
  <option value="dog">Dog</option>
</select>
```

**Verification**:
```typescript
// Jest - placeholder shows empty value initially
const select = screen.getByRole('combobox')
expect(select).toHaveValue('')

// Playwright - verify selected value
await expect(page.getByRole('combobox')).toHaveValue('medium')
```

---

#### 5. Disabled Elements Cannot Be Focused
**Rule**: Disabled elements cannot receive focus and do not respond to user interaction.

**MDN Quote** (button):
> "This Boolean attribute prevents the user from interacting with the button: it cannot be pressed or focused."

**Verification**:
```typescript
// Jest
expect(screen.getByRole('button', { disabled: true })).toBeDisabled()

// Playwright - auto-retrying
await expect(page.getByRole('button')).toBeDisabled()
```

---

### Playwright Locator Patterns for Smoke Tests

| Scenario | Locator | Assertion |
|----------|---------|-----------|
| Button visible | `page.getByRole('button', { name: 'Submit' })` | `.toBeVisible()` |
| Button disabled | `page.getByRole('button', { name: 'Submit' })` | `.toBeDisabled()` |
| Radio checked | `page.getByRole('radio', { name: 'Apple' })` | `.toBeChecked()` |
| Radio disabled | `page.getByRole('radio', { name: 'Orange' })` | `.toBeDisabled()` |
| Select value | `page.getByRole('combobox')` | `.toHaveValue('medium')` |
| Select disabled | `page.getByRole('combobox')` | `.toBeDisabled()` |
| Test ID | `page.getByTestId('button-demo-primary')` | `.toBeVisible()` |
| Error state | `page.getByTestId('fixture-error')` | `.toContainText('Unknown fixture:')` |

---

### Summary: What Atlas Should Verify

| Component | Native Semantic | Verification Command |
|-----------|-----------------|---------------------|
| CButton | Default `type="button"` | `expect(button).toHaveAttribute('type', 'button')` |
| CButton | Disabled not focusable | `expect(button).toBeDisabled()` |
| CRadio | Grouped by `name` | All radios share same `name` attr |
| CRadio | Only one checked | `expect(radio).toBeChecked()` |
| CRadio | Disabled not selectable | Click disabled radio → still unchecked |
| CSelect | Renders native `<option>` | DOM contains `<option>` elements |
| CSelect | Placeholder with `value=""` | Initial value is empty string |
| CSelect | Required forces selection | Form validation requires non-empty |

---

**Reference Pack Generated**: 2026-03-24
**Purpose**: Atlas code review and scope compliance verification

---

## 19. File-to-Task Matrix for Atlas QA (2026-03-24)

### Overview
This section provides a comprehensive mapping of all files involved in the `common-components-button-radio-select` change, organized by planned task number (1-6) and final verification wave (F1-F4).

### Commit Reference
- **Commit**: `394f1c1` - `feat(components): add common controls (button, radio, select)`
- **Date**: 2026-03-24

---

### Task 1: Add `CButton` Native Wrapper

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Button/Button.tsx` | Component implementation | Supports children, variant, type, disabled, onClick, className, data-testid |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Button/index.scss` | Component-local SCSS (structural) | Minimal structure classes only |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Button.test.tsx` | Jest unit tests | Default type="button", disabled click blocking, variant class |

**Key Implementation Details**:
- Line 20: `type = 'button'` (explicit default)
- Lines 28-30: `cm-button--${variant}` modifier class
- Line 39: `disabled` passed to native button

---

### Task 2: Add `CRadio` and `CRadioGroup`

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/Radio.tsx` | Individual radio component | Native `<input type="radio">` + label |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/RadioGroup.tsx` | Radio group container | Shared name, controlled/uncontrolled |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Radio/index.scss` | Component-local SCSS | Minimal structure classes |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Radio.test.tsx` | Jest unit tests | Name sharing, controlled/uncontrolled, disabled |

**Key Implementation Details**:
- Radio.tsx lines 43-53: native input inside label
- RadioGroup.tsx lines 67-76: context provides name
- RadioGroup.tsx lines 41-65: value vs uncontrolledValue pattern

---

### Task 3: Add `CSelect` Native Single-Select Wrapper

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Select/Select.tsx` | Component implementation | Native `<select>`, options, controlled/uncontrolled |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/Select/index.scss` | Component-local SCSS | Minimal structure classes |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/Select.test.tsx` | Jest unit tests | Options rendering, controlled/uncontrolled, placeholder+required |

**Key Implementation Details**:
- Select.tsx lines 52-76: native select element
- Select.tsx lines 36-41: isControlled logic
- Select.tsx lines 62-66: placeholder option with value="" and disabled

---

### Task 4: Integrate Exports, Theme-Layer Visuals, and Dev Preview

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/components/index.ts` | Central component exports | Lines 9-12: Button, Radio, RadioGroup, Select |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/index.ts` | Package entry re-export | Line 4: exports CButton, CRadio, CRadioGroup, CSelect |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/default/styles/index.scss` | Default theme visuals | Lines 128-274: button, radio, select styles |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/styles/index.scss` | Win98 theme visuals | Lines 65-183: button, radio, select styles |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/winxp/styles/index.scss` | WinXP theme visuals | Lines 90-222: button, radio, select styles |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/commonControlsPreview.tsx` | Dev preview component | Stable test IDs: button-demo-primary, radio-demo-fruit, select-demo-size |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/main.tsx` | Dev entry wiring | Lines 2, 9-23: imports and renders CommonControlsPreview |

**Stable Test IDs**:
- `button-demo-primary` (line 31 in commonControlsPreview.tsx)
- `radio-demo-fruit` (line 59 in commonControlsPreview.tsx) - values: apple/orange
- `select-demo-size` (line 83 in commonControlsPreview.tsx) - values: small/medium/large

---

### Task 5: Add Playwright Harness and Smoke Spec

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/playwright-common-controls.html` | Harness HTML entry | Mounts commonControlsHarness.tsx |
| `/Users/zhangxiao/frontend/SysUI/chameleon/src/dev/playwright/commonControlsHarness.tsx` | Harness component | Supports default/disabled/unknown fixtures |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/common-controls.smoke.spec.ts` | Smoke test spec | Verifies button, radio, select states |
| `/Users/zhangxiao/frontend/SysUI/chameleon/tests/ui/common-controls.helpers.ts` | Test helpers | Constants for test IDs |

**Fixture Behavior**:
- `default`: button visible, radio=apple, select=medium
- `disabled`: button disabled, Orange radio disabled, select disabled
- `unknown`: renders `data-testid="fixture-error"` with "Unknown fixture: {name}"

---

### Task 6: Update README and CI Validation

| File Path | Purpose | Plan Acceptance Criteria |
|-----------|---------|-------------------------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/README.md` | Documentation | Lines 32-56: CButton, CRadioGroup, CSelect usage examples |

**README Examples**:
- CButton: default + primary variant
- CRadioGroup: name="fruit", values apple/orange
- CSelect: options small/medium/large with placeholder

---

### Final Verification Wave (F1-F4)

| File Path | Purpose |
|-----------|---------|
| `/Users/zhangxiao/frontend/SysUI/chameleon/.sisyphus/evidence/f1-plan-compliance.md` | F1: Plan compliance audit |
| `/Users/zhangxiao/frontend/SysUI/chameleon/.sisyphus/evidence/f2-code-quality.md` | F2: Code quality review |
| `/Users/zhangxiao/frontend/SysUI/chameleon/.sisyphus/evidence/f3-ui-qa.md` | F3: Manual QA |
| `/Users/zhangxiao/frontend/SysUI/chameleon/.sisyphus/evidence/f4-scope-fidelity.md` | F4: Scope fidelity check |

---

### Complete File List (22 files)

```
src/components/Button/Button.tsx                    [Task 1]
src/components/Button/index.scss                    [Task 1]
src/components/Radio/Radio.tsx                      [Task 2]
src/components/Radio/RadioGroup.tsx                 [Task 2]
src/components/Radio/index.scss                      [Task 2]
src/components/Select/Select.tsx                     [Task 3]
src/components/Select/index.scss                     [Task 3]
src/components/index.ts                              [Task 4]
src/index.ts                                         [Task 4]
src/theme/default/styles/index.scss                 [Task 4]
src/theme/win98/styles/index.scss                    [Task 4]
src/theme/winxp/styles/index.scss                    [Task 4]
src/dev/commonControlsPreview.tsx                   [Task 4]
src/dev/main.tsx                                     [Task 4]
playwright-common-controls.html                     [Task 5]
src/dev/playwright/commonControlsHarness.tsx        [Task 5]
tests/Button.test.tsx                               [Task 1]
tests/Radio.test.tsx                                [Task 2]
tests/Select.test.tsx                               [Task 3]
tests/ui/common-controls.smoke.spec.ts              [Task 5]
tests/ui/common-controls.helpers.ts                 [Task 5]
README.md                                           [Task 6]
```

---

### Verification Commands (for Atlas QA)

```bash
# Unit tests
yarn test --runInBand tests/Button.test.tsx
yarn test --runInBand tests/Radio.test.tsx
yarn test --runInBand tests/Select.test.tsx

# Playwright smoke
npx playwright test --config=playwright.config.ts tests/ui/common-controls.smoke.spec.ts

# Build and lint
yarn lint
yarn build
npm pack --dry-run
```

---

### Summary

All 22 files from commit `394f1c1` have been identified and mapped to their respective plan tasks (1-6) and final verification wave (F1-F4). The implementation follows the planned scope with:
- Native HTML semantics for Button, Radio, Select
- Controlled/uncontrolled pattern for RadioGroup and Select
- Theme-layer visual styling (default, win98, winxp)
- Stable test IDs for dev preview and Playwright
- README usage examples matching final API
