# SystemType + Theme Refactor - Research Findings

## External Authority: React Official Documentation

### Keyed Remount Boundaries
**Source**: [React Dev - Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state)

**Core Pattern**:
- React preserves component state as long as the same component renders at the same position in the UI tree
- Changing the component's `key` prop forces React to treat it as a new instance, resetting ALL state
- Keys are not globally unique; they only specify position within the parent

**Implementation for SystemType Switch**:
```tsx
// SystemType switch uses key to force remount
<SystemHost key={systemType} systemType={systemType} theme={theme} />
```

**Key Quote**: "You can force a subtree to reset its state by giving it a different key."

### State Preservation Within Same Position
- Same component at same position preserves state across re-renders
- Different component types at same position resets state
- Props changes alone do NOT reset state if component type stays the same

**Implementation for Theme Switch**:
- Theme switch should NOT change component type or key
- Only change CSS class names on Screen wrapper
- Window instances (identified by `data-window-uuid`) remain stable

### State Lifting Above Remount Boundaries
**Source**: [React Dev - Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)

**Pattern**: Lift persistent state above the remount boundary
- Persistent data (file system, user data) stays in parent component
- Runtime state (open windows, z-order, focus) goes inside keyed subtree

```tsx
// Parent holds persistent state
function App() {
  const [persistentData, setPersistentData] = useState(...);
  
  return (
    // SystemType key forces remount on system change
    <SystemHost 
      key={systemType}
      systemType={systemType}
      theme={theme}
      persistentData={persistentData}
    />
  );
}
```

## CSS Scoping Patterns

### CSS Variables Theming (Current Repo Pattern)
**Source**: README.md - Theme tokens become CSS variables

**Pattern**:
- Theme defines tokens as plain objects
- Tokens are flattened to CSS variables with prefix `--cm-{category}-{token}`
- Components use CSS variables, not theme objects

**Implementation for Theme Class Scoping**:
```tsx
// Screen accepts className and renders scope wrapper
<Screen 
  className="cm-system--windows cm-theme--win98"
  data-system-type={systemType}
  data-theme={theme}
>
  <CGrid>{/* content */}</CGrid>
</Screen>
```

### CSS Selector Scope
**Pattern**: Theme CSS targets scoped selectors
```scss
// Theme styles target scoped selectors
.cm-system--windows.cm-theme--win98 {
  .cm-window__title-bar {
    background: #000080;
    color: #ffffff;
  }
}

.cm-system--windows.cm-theme--winxp {
  .cm-window__title-bar {
    background: #316AC5;
    color: #ffffff;
  }
}
```

## Repo-Local Precedent

### Window UUID Stability
**Source**: `src/components/Window/Window.tsx:437`

```tsx
data-window-uuid={this.uuid}
```

**Finding**: Window components already have stable UUID via `this.uuid`. This can be used to verify window instance preservation across theme switches.

### Screen Component Structure
**Source**: `src/components/Screen/Screen.tsx`

**Current**: Returns CGrid directly, no root wrapper
**Required**: Add root wrapper with scope hooks

### Theme Component Pattern (To Be Replaced)
**Source**: `src/theme/default/index.tsx:27`

Current pattern exports React.Component that mounts full shell:
```tsx
export class DefaultTheme extends React.Component {
  render() {
    return (
      <CScreen>
        <CWindowManager>
          <DefaultWindow>...</DefaultWindow>
        </CWindowManager>
      </CScreen>
    );
  }
}
```

**Required**: Convert to CSS-only theme definition:
```tsx
export const defaultTheme: ThemeDefinition = {
  id: 'default',
  label: 'Default',
  systemType: 'default',
  className: 'cm-theme--default'
};
```

## Concrete Recommendations for Implementation Agents

### Wave 1: Contract Definition

1. **SystemType/Theme Types** (`src/system/types.ts`):
   - Define `SystemTypeId = 'windows' | 'default'`
   - Define `ThemeId = 'win98' | 'winxp' | 'default'`
   - Theme carries only: `id`, `label`, `systemType`, `className`

2. **Registry** (`src/system/registry.ts`):
   - Legal pairs: `{ windows: ['win98', 'winxp'], default: ['default'] }`
   - Validation throws: `Invalid theme "{theme}" for system type "{systemType}"`

3. **Screen Scope** (`src/components/Screen/Screen.tsx`):
   - Add props: `className?`, `systemType?`, `theme?`
   - Render root wrapper with `data-testid="screen-root"`
   - Apply `data-system-type` and `data-theme` attributes

### Wave 2: System Host Implementation

1. **SystemHost** (`src/system/SystemHost.tsx`):
   - Validates pair via registry
   - Renders keyed subtree: `<WindowsSystem key={systemType} ... />`
   - Same systemType = same key = state preserved
   - Different systemType = different key = remount (reboot)

2. **Windows System Shell** (`src/system/windows/WindowsSystem.tsx`):
   - Extends CScreen, applies `cm-system--windows`
   - Hosts shared CWindowManager + CWindow composition
   - No theme-conditional behavior branches

3. **Theme Application**:
   - Theme class appended to Screen root
   - CSS selectors scope theme styles

### Wave 3: Migration

1. **Convert Themes**:
   - `src/theme/*/index.tsx` → export ThemeDefinition, not React.Component
   - Remove WindowTitle subclasses
   - Move styling to scoped CSS selectors

2. **Update Dev Switcher**:
   - Replace theme-to-root map with system/theme selection
   - Export DevSystemRoot component

## Verification Patterns

### Same-System Theme Switch (Preservation)
```tsx
// Test: Theme switch preserves window UUID
const { rerender } = render(
  <SystemHost systemType="windows" theme="win98" />
);
const uuidBefore = screen.getByTestId('window-content')
  .getAttribute('data-window-uuid');

rerender(<SystemHost systemType="windows" theme="winxp" />);
const uuidAfter = screen.getByTestId('window-content')
  .getAttribute('data-window-uuid');

expect(uuidBefore).toBe(uuidAfter);
```

### Cross-System Switch (Reboot)
```tsx
// Test: System switch remounts windows
const { rerender } = render(
  <SystemHost systemType="windows" theme="winxp" />
);
const uuidBefore = screen.getByTestId('window-content')
  .getAttribute('data-window-uuid');

rerender(<SystemHost systemType="default" theme="default" />);
const uuidAfter = screen.getByTestId('window-content')
  .getAttribute('data-window-uuid');

expect(uuidBefore).not.toBe(uuidAfter);
```

### Persistent State Above Boundary
```tsx
// Test: Persistent data survives system switch
const { rerender } = render(
  <SystemHost 
    systemType="windows" 
    theme="winxp"
    persistentData={{ note: 'persistent-note-123' }}
  />
);

rerender(
  <SystemHost 
    systemType="default" 
    theme="default"
    persistentData={{ note: 'persistent-note-123' }}
  />
);

// Persistent data still accessible (passed as prop, not internal state)
```

## Summary

| Concern | Pattern | Source |
|---------|---------|--------|
| Remount boundary | `key={systemType}` on SystemHost | React key docs |
| State preservation | Same component at same position | React state docs |
| CSS scoping | Theme class on Screen root | Current repo + CSS variables |
| Window identity | `data-window-uuid` attribute | Window.tsx:437 |
| Persistent data | Lift above keyed subtree | React state lifting |
| Theme-only styling | CSS selectors, no JSX in theme | Plan requirement |

---

*Research completed: 2026-03-23*

## 2026-03-23 Wave 1 implementation learnings

- `CScreen` 的 `screen-root` wrapper 可以安全包住 `CGrid`，前提是 `CGrid` 仍然是 wrapper 的唯一直接子节点，这样窗口布局和管理器层级不会被打散。

## 2026-03-23 F2 rerun learnings

- 复审通过的关键标志是：`WindowsSystem` 只把 `themeDefinition` 用于 screen scope metadata/class，而不再让 theme 参与 boot 标题、内容或坐标选择。
- 当 `src/theme/*` 只导出 plain `ThemeDefinition`，且 `src/system/registry.ts` 只依赖这些 plain object 时，旧 root-theme 模型才算真正退出活跃架构路径。
- `screenClassName` 传给 `CGrid` 时需要保留基础 `c-grid` class；仅覆盖 className 会让现有网格样式丢失。
- 现有窗口交互锚点仍然依赖 `window-frame`、`window-content`、`window-title` 和 `data-window-uuid`，新增 screen wrapper 后这些选择器可以保持不变。

## 2026-03-23 Wave 1 characterization test anchors

- `tests/SystemShellCharacterization.test.tsx` locks current `DevThemeRoot` behavior by rerendering from `default` → `win98` → `winxp` and proving the theme-specific body nodes disappear and reappear across the full root swap.
- Shared shell invariants are anchored on the existing DOM seam only: the rendered root remains `c-grid` from `CScreen`, `window-frame` still sits under the `CWindowManager` container, and both `Win98Theme` and `WinXpTheme` share the same `window-frame` / `window-content` / `window-title` structure.

## 2026-03-23 Wave 1 contract implementation learnings

- `src/system/registry.ts` 采用显式闭合集合常量 `SYSTEM_TYPE` / `THEME`，并将合法矩阵固定为 `{ windows: ['win98', 'winxp'], default: ['default'] }`，避免后续系统宿主层引入推断式回退。
- `resolveThemeDefinition()` 先经 `assertValidSystemThemeSelection()` 校验，再返回纯 metadata `ThemeDefinition`，这样后续主题切换既能复用同一校验口，也不会把 JSX 或组件引用带入注册表层。

## 2026-03-23 Task 5: Theme-to-CSS Migration Research

### Theme Files Identified

| Theme | File | Exports |
|-------|------|---------|
| Default | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/default/index.tsx` | DefaultTheme, DefaultWindow, DefaultWindowTitle |
| Win98 | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/win98/index.tsx` | Win98Theme, Win98WindowTitle |
| WinXP | `/Users/zhangxiao/frontend/SysUI/chameleon/src/theme/winxp/index.tsx` | WinXpTheme, WinXpWindowTitle |

### Theme-Specific Class Names (Current)

**Default Theme** (structural override via subclass):
- `cm-default-window-frame` - via `DefaultWindow.getWindowFrameClassName()`
- `cm-default-window` - via `DefaultWindow.getWindowContentClassName()`
- `cm-window__title-bar cm-window__title-bar--default cm-default-window-title` - via `DefaultWindowTitle.render()`

**Win98 Theme** (title bar only):
- `cm-window__title-bar cm-window__title-bar--win98` - via `Win98WindowTitle.render()`

**WinXP Theme** (title bar only):
- `cm-window__title-bar cm-window__title-bar--winxp` - via `WinXpWindowTitle.render()`

### Structural vs Pure Style Differences

**Structural Differences (require JSX changes):**
- Default theme: Has custom `DefaultWindow` subclass overriding `getWindowContentClassName()` and `getWindowFrameClassName()`
- Default theme: Has custom `DefaultWindowTitle` subclass
- Win98/WinXP: Use base `CWindow`, only custom `WindowTitle` subclasses

**Pure Style Differences (can collapse to CSS):**
- Win98 vs WinXP title bar: Only differ in modifier class (`--win98` vs `--winxp`)
- Both use same `CWindow` base with no customization

### Shared Renderer Analysis

**Can Win98 and WinXP share CWindowTitle?**
- YES. Both custom title classes only pass different className to `renderTitle()`:
  - Win98: `'cm-window__title-bar cm-window__title-bar--win98'`
  - WinXP: `'cm-window__title-bar cm-window__title-bar--winxp'`
- Difference is purely the modifier class. Can use base `CWindowTitle` with CSS scoping:
  ```scss
  .cm-system--windows.cm-theme--win98 .cm-window__title-bar { ... }
  .cm-system--windows.cm-theme--winxp .cm-window__title-bar { ... }
  ```

**Can Win98 and WinXP share CWindow?**
- YES. Both use base `CWindow` with no overrides. Window structure is identical.

### Exact Selectors to Retarget

| Current Selector | Target Scope | Notes |
|-----------------|--------------|-------|
| `.cm-window__title-bar--win98` | `.cm-system--windows.cm-theme--win98 .cm-window__title-bar` | Title bar bg/text |
| `.cm-window__title-bar--winxp` | `.cm-system--windows.cm-theme--winxp .cm-window__title-bar` | Title bar bg/text |
| `.cm-default-window-frame` | `.cm-system--default.cm-theme--default .cm-window-frame` | Frame gradient/border |
| `.cm-default-window` | `.cm-system--default.cm-theme--default .cm-window` | Content bg/border |
| `.cm-default-window-title` | `.cm-system--default.cm-theme--default .cm-window__title-bar` | Title bar styling |

### CSS Files to Create/Modify

1. **Create**: `src/theme/win98/styles/index.scss` - Win98 title bar styles (currently none)
2. **Create**: `src/theme/winxp/styles/index.scss` - WinXP title bar styles (currently none)
3. **Modify**: `src/theme/default/styles/index.scss` - Retarget to scoped selectors

### Migration Path Summary

1. Remove `Win98WindowTitle`, `WinXpWindowTitle` subclasses → use base `CWindowTitle`
2. Remove `DefaultWindow`, `DefaultWindowTitle` subclasses → use base `CWindow`, `CWindowTitle`
3. Convert theme exports from React.Component to ThemeDefinition (id, label, systemType, className)
4. Add scoped CSS selectors under `.cm-system--{system}.cm-theme--{theme}` wrapper
5. Screen root already has `data-system-type` and `data-theme` attributes (from Wave 1)

### Verification Anchors

- `window-frame` selector in `Window.tsx:436` - stable across themes
- `window-content` selector in `Window.tsx:435` - stable across themes  
- `window-title` selector in `WindowTitle.tsx:65` - stable across themes
- `data-window-uuid` in `Window.tsx:437` - window identity preserved

---

*Task 5 research completed: 2026-03-23*

## 2026-03-23 Task 4 SystemHost exploration findings

### Files identified for future insertion

**SystemHost (main entry)**:
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/system/SystemHost.tsx` — 尚未创建，将是唯一选择活跃系统 shell 的组件

**Windows system shell**:
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/system/windows/WindowsScreen.tsx` — 尚未创建，扩展 CScreen，应用 `cm-system--windows`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/system/windows/WindowsSystem.tsx` — 尚未创建，托管共享 Windows boot layout

**Default system shell**:
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/system/default/DefaultScreen.tsx` — 尚未创建，扩展 CScreen，应用 `cm-system--default`
- `/Users/zhangxiao/frontend/SysUI/chameleon/src/system/default/DefaultSystem.tsx` — 尚未创建，托管默认 boot layout

**Test file**:
- `/Users/zhangxiao/frontend/SysUI/chameleon/tests/SystemHost.test.tsx` — 尚未创建，验证同系统主题切换保持运行时窗口 UUID，跨系统切换重置

### Current boot window coordinates and content

| System/Theme | x | y | width | height | body test ID | title text |
|--------------|---|---|-------|--------|--------------|------------|
| default/default | 32 | 28 | 332 | 228 | `default-window-body` | "Default Window" |
| windows/win98 | 24 | 24 | 320 | 220 | `win98-window-body` | "Win98 Window" |
| windows/winxp | 40 | 32 | 340 | 236 | `winxp-window-body` | "WinXP Window" |

**Source evidence**:
- Default: `src/theme/default/index.tsx:32` — `<DefaultWindow x={32} y={28} width={332} height={228}>`
- Win98: `src/theme/win98/index.tsx:22` — `<CWindow x={24} y={24} width={320} height={220}>`
- WinXP: `src/theme/winxp/index.tsx:21` — `<CWindow x={40} y={32} width={340} height={236}>`

### Shared Windows-family structure (unifiable without theme-conditional behavior)

**DOM seam (proven identical in tests)**:
- `tests/SystemShellCharacterization.test.tsx:130-140` — "win98 and winxp share the window seam" 验证两者共享相同结构

**Shared anchors**:
- `src/components/Window/Window.tsx:437` — `data-window-uuid={this.uuid}` 提供稳定窗口标识
- `src/components/Window/Window.tsx:460` — `data-testid="window-frame"` 帧元素
- `src/components/Window/Window.tsx:435` — `data-testid="window-content"` 内容元素
- `src/components/Window/WindowTitle.tsx:65` — `data-testid="window-title"` 标题元素

**Composition pattern**:
- 所有主题根使用相同结构: `<CScreen><CWindowManager><CWindow>...</CWindow></CWindowManager></CScreen>`
- 现有 `CWindowTitle` 作为共享渲染器，无需主题特定子类（除非具体结构差异存活）

### Boundary: what stays above vs inside systemType-keyed remount

**Above (persistent, survives system switch)**:
- `src/system/types.ts` — 类型定义
- `src/system/registry.ts` — 注册表和校验逻辑
- `tests/helpers/systemSession.fixture.tsx` — `PersistentSystemStoreState` 定义
- 父组件传入的持久化数据 (file system, user data)

**Inside (runtime, resets on system switch)**:
- `src/system/SystemHost.tsx` (keyed by systemType) — 整个运行时子树
- 打开的窗口实例、z-order、焦点顺序
- 窗口几何坐标 (x, y, width, height)
- `data-window-uuid` 标识

**Remount mechanism**:
- `SystemHost` 使用 `key={systemType}` 强制 React 在系统切换时重新挂载
- 同系统主题切换不改变 key，保持相同组件位置，状态保留

### Test anchors for verification

**Existing tests to reference**:
- `tests/DefaultTheme.test.tsx:9` — 拖拽行为和 class 断言
- `tests/ScreenScope.test.tsx:101` — 窗口拖拽保持完整
- `tests/SystemShellCharacterization.test.tsx:95` — dev root 完整主题组件切换

**Required test patterns for SystemHost.test.tsx**:
- 同系统主题切换: `windows/win98` → `windows/winxp` 保持 `data-window-uuid` 不变
- 跨系统切换: `windows/win98` → `default/default` 改变 `data-window-uuid` 并加载目标系统 boot layout
- 持久化数据: 跨系统切换后持久化数据仍可访问

## 2026-03-23 Task 4 implementation learnings

- `SystemHost` 只用 `key={systemType}` 挂在具体系统壳组件上即可形成正确的重挂载边界；同系统换主题时 React 会保留同一 `WindowsSystem` 实例下的运行时窗口状态。
- 为了同时满足“首屏 boot 坐标准确”和“同系统换主题不重置几何”，`WindowsSystem` / `DefaultSystem` 需要把 boot layout 作为本地初始化状态锁定，而不是每次 render 都把 theme 对应坐标重新作为 `CWindow` props 下发。
- `screen-root` 上追加 system/theme class 与 `data-theme` 更新不会影响 `CWindow` 的 `data-window-uuid`；这让测试可以把样式域切换和运行时窗口身份拆开验证。

## 2026-03-23 Task 5 implementation learnings

- 主题样式迁移到 `.cm-system--{system}.cm-theme--{theme}` 作用域后，`CWindow` / `CWindowTitle` 无需保留任何 theme 分支，Windows 族可以稳定共用同一套渲染器。
- 为了让 scoped SCSS 在 `SystemHost` 路径下自动生效，`src/system/registry.ts` 应直接引用 `src/theme/*` 导出的 metadata 对象，让主题模块继续承担样式 side effect 的加载入口。
- `data-window-uuid` 加上 DOM 节点引用相等断言，可以同时证明“窗口实例未重挂载”和“只是 `screen-root` class 发生变化”。

## 2026-03-23 Task 5 registry projection learning

- 主题模块现在既是 renderable bridge 又带 metadata 属性，因此 `registry` 不能直接返回导入值本身；需要在注册表层投影出新的 plain object，才能同时保留 SCSS side effect 和满足纯数据契约。

## 2026-03-23 Task 6: Dev Switcher Migration Research

### Current Implementation Analysis

**File: `src/dev/themeSwitcher.tsx` (lines 1-37)**
```
Current exports:
- DEV_THEME: { default: 'default', win98: 'win98', winxp: 'winxp' }
- DevThemeId: union type of DEV_THEME values
- DEV_THEME_COMPONENTS: Record mapping theme IDs to React.ComponentType
- DEFAULT_DEV_THEME: DEV_THEME.default (line 20)
- ACTIVE_THEME: DEFAULT_DEV_THEME (line 22)
- resolveDevThemeComponent(themeId): returns component from map
- DevThemeRoot({ activeTheme }): renders resolved component
```

**File: `src/dev/main.tsx` (lines 1-9)**
```
- Imports DevThemeRoot from './themeSwitcher'
- Renders <DevThemeRoot /> with no props (uses default)
- Entry point loaded by index.html:10 → /src/dev/main.tsx
```

**File: `src/index.ts` (lines 1-4)**
```
Current exports:
- export * from './components'
- export * from './theme/default'  → exports DefaultTheme, DefaultWindow, DefaultWindowTitle
- export * from './theme/win98'    → exports Win98Theme, Win98WindowTitle
- export * from './theme/winxp'    → exports WinXpTheme, WinXpWindowTitle
```

### New Model (Already Implemented)

**File: `src/system/types.ts` (lines 1-21)**
```
- SystemTypeId: 'windows' | 'default'
- ThemeId: 'win98' | 'winxp' | 'default'
- ThemeDefinition: { id, label, systemType, className }
- SystemTypeDefinition: { id, label, className }
- SystemThemeSelection: { systemType, theme }
```

**File: `src/system/registry.ts` (lines 1-85)**
```
- SYSTEM_TYPE: { windows: 'windows', default: 'default' }
- THEME: { win98: 'win98', winxp: 'winxp', default: 'default' }
- SYSTEM_THEME_MATRIX: { windows: ['win98', 'winxp'], default: ['default'] }
- DEFAULT_SYSTEM_TYPE: 'default'
- DEFAULT_THEME_BY_SYSTEM: { windows: 'win98', default: 'default' }
- resolveSystemTypeDefinition(systemType): returns SystemTypeDefinition
- resolveThemeDefinition({ systemType, theme }): returns ThemeDefinition
- assertValidSystemThemeSelection({ systemType, theme }): throws if invalid
```

**File: `src/system/SystemHost.tsx` (lines 1-29)**
```
- Props: { systemType: SystemTypeId, theme: ThemeId }
- Validates pair via assertValidSystemThemeSelection
- Renders keyed system shell: <ActiveSystemShell key={systemType} ... />
- Key by systemType ensures remount on system switch
```

### Migration Mapping

| Current (to remove) | New (to add) | Notes |
|-------------------|--------------|-------|
| `DEV_THEME` | Keep `DEV_THEME` as is | Theme IDs unchanged |
| `DEFAULT_DEV_THEME` | `DEFAULT_DEV_SELECTION` | New type: `{ systemType, theme }` |
| `DEV_THEME_COMPONENTS` | (remove) | No longer maps to root components |
| `resolveDevThemeComponent()` | `resolveDevThemeDefinition()` | Returns metadata, not component |
| `DevThemeRoot` | `DevSystemRoot` | Accepts `{ systemType?, theme? }` |
| `DevThemeRootProps` | `DevSystemRootProps` | New prop shape |

### Default Selection Behavior

**Current** (src/dev/themeSwitcher.tsx:20-22):
```ts
export const DEFAULT_DEV_THEME: DevThemeId = DEV_THEME.default;
export const ACTIVE_THEME: DevThemeId = DEFAULT_DEV_THEME;
```

**New** (from registry.ts:28-33):
```ts
export const DEFAULT_SYSTEM_TYPE: SystemTypeId = SYSTEM_TYPE.default;
export const DEFAULT_THEME_BY_SYSTEM = {
  [SYSTEM_TYPE.windows]: THEME.win98,
  [SYSTEM_TYPE.default]: THEME.default,
};
// Default selection: { systemType: 'default', theme: 'default' }
```

### Concrete File:Line References

| Location | Symbol | Action |
|----------|--------|--------|
| src/dev/themeSwitcher.tsx:6-10 | `DEV_THEME` | Keep as-is |
| src/dev/themeSwitcher.tsx:14-18 | `DEV_THEME_COMPONENTS` | Remove |
| src/dev/themeSwitcher.tsx:20 | `DEFAULT_DEV_THEME` | Remove |
| src/dev/themeSwitcher.tsx:22 | `ACTIVE_THEME` | Remove |
| src/dev/themeSwitcher.tsx:24-26 | `resolveDevThemeComponent()` | Replace with resolver |
| src/dev/themeSwitcher.tsx:28-37 | `DevThemeRoot` | Replace with `DevSystemRoot` |
| src/dev/main.tsx:1 | `DevThemeRoot` import | Update to `DevSystemRoot` |
| src/dev/main.tsx:8 | `<DevThemeRoot />` | Update props |
| src/index.ts:2-4 | Theme exports | Remove, add system exports |
| tests/DevThemeSelection.test.tsx | Entire file | Rename to DevSystemSelection.test.tsx |

### Test File Migration

**Current**: `tests/DevThemeSelection.test.tsx`
- Tests: resolveDevThemeComponent mappings, DEFAULT_DEV_THEME, DevThemeRoot rendering

**Target**: `tests/DevSystemSelection.test.tsx`
- Tests: DEV_SYSTEM_TYPE, DEV_THEME, DEFAULT_DEV_SELECTION, resolveDevSystemDefinition, resolveDevThemeDefinition, DevSystemRoot rendering
- Invalid pair rejection: `Invalid theme "winxp" for system type "default"`

### Runtime Behavior Verification

**Default Selection**:
- Current: `<DevThemeRoot />` → renders DefaultTheme
- New: `<DevSystemRoot />` → renders SystemHost with { systemType: 'default', theme: 'default' }

**Theme Selection**:
- Current: `<DevThemeRoot activeTheme="win98" />` → renders Win98Theme
- New: `<DevSystemRoot systemType="windows" theme="win98" />` → renders SystemHost

**Invalid Pair**:
- New: `<DevSystemRoot systemType="default" theme="winxp" />` → throws `Invalid theme "winxp" for system type "default"`

---

*Task 6 research completed: 2026-03-23*

## 2026-03-23 Task 6: Public Export Surface & Test Migration Investigation

### Current Export Surface (`src/index.ts:1-4`)
```typescript
export * from './components';
export * from './theme/default';   // Exports DefaultTheme
export * from './theme/win98';     // Exports Win98Theme
export * from './theme/winxp';     // Exports WinXpTheme
```

### Symbols to Remove from Public API
| Symbol | Export Location | Type |
|--------|----------------|------|
| `DefaultTheme` | `src/theme/default/index.tsx:33` | Renderable bridge + metadata |
| `Win98Theme` | `src/theme/win98/index.tsx:28` | Renderable bridge + metadata |
| `WinXpTheme` | `src/theme/winxp/index.tsx:28` | Renderable bridge + metadata |

### Test Files Requiring Rename/Update
| File | Action Required |
|------|-----------------|
| `tests/DevThemeSelection.test.tsx` | Rename to `DevSystemSelection.test.tsx`, update to test systemType+theme |
| `tests/DefaultTheme.test.tsx` | May need to pivot to SystemHost or remove |
| `tests/Win98WindowTitle.test.tsx` | May need to pivot to SystemHost or remove |
| `tests/GlobalRenderer.test.tsx` | Remove theme imports, test composition only |
| `tests/SystemShellCharacterization.test.tsx` | Remove DevThemeRoot and theme imports |

### Internal Coupling Map
**themeSwitcher.tsx** (src/dev/themeSwitcher.tsx):
- Line 1-3: Imports DefaultTheme, Win98Theme, WinXpTheme
- Line 14-18: DEV_THEME_COMPONENTS maps theme IDs to components
- Line 32-36: DevThemeRoot resolves and renders theme component

**registry.ts** (src/system/registry.ts):
- Line 1-3: Imports themes for metadata projection (internal only)
- Line 60-64: THEME_DEFINITIONS uses projectThemeDefinition(theme)

### Highest-Risk Migration Seams (file:line)
1. `src/dev/themeSwitcher.tsx:32-36` — DevThemeRoot replacement
2. `src/dev/main.tsx:1,8` — DevThemeRoot usage
3. `tests/DevThemeSelection.test.tsx:3-11` — Import statements
4. `src/index.ts:2-4` — Theme re-exports to remove

### New Component Contract
- Name: `DevSystemSelection` (or `DevSystemRoot`)
- Props: `{ systemType?: SystemTypeId, theme?: ThemeId }`
- Renders: SystemHost with resolved systemType/theme
- Location: `src/dev/themeSwitcher.tsx` (replace DevThemeRoot)

### Verification Anchors
- Default branch test: `tests/DevThemeSelection.test.tsx:30-36`
- Theme swap test: `tests/SystemShellCharacterization.test.tsx:95-119`
- Registry resolution: `src/system/registry.ts:78-84`

---

*Task 6 investigation completed: 2026-03-23*

## 2026-03-23 Task 6 implementation learnings

- `src/dev/themeSwitcher.tsx` 可以直接把 `SYSTEM_TYPE` / `THEME` 作为 dev 常量源复用，再用本地 `DEFAULT_DEV_SELECTION` 包装默认值，这样 dev 入口和 registry 不会出现第二套矩阵规则。
- `DevSystemRoot` 先调用 `resolveDevSystemDefinition()` 与 `resolveDevThemeDefinition()`，再渲染 `SystemHost`，能把 dev 入口的默认化与合法性校验集中在 registry contract 上，而不是回到旧的 theme-to-component 映射。
- `src/index.ts` 不必重新公开旧主题桥组件；直接通过 `resolveThemeDefinition()` 导出 `defaultThemeDefinition` / `win98ThemeDefinition` / `winXpThemeDefinition` 即可暴露纯 metadata，同时保留主题模块的样式 side effect 链路。

## 2026-03-23 Task 6 regression follow-up learning

- `DevSystemRoot` 的表征测试不能再把 `windows/win98 -> windows/winxp` 当作整棵 root 替换；在 `SystemHost` 的 `key={systemType}` 边界下，这一步只会更新 `screen-root` 的 theme scope，而运行时 `window-frame` / `window-content` 节点应保持同一实例。

## 2026-03-23 Task 7: Legacy Jest Files Blast Radius Investigation

### Files Importing Root Themes (DefaultTheme/Win98Theme/WinXpTheme)

| File | Imports | Lines | Test Focus |
|------|---------|-------|------------|
| `tests/DefaultTheme.test.tsx` | DefaultTheme | 3, 7 | Drag behavior + class assertions |
| `tests/Win98WindowTitle.test.tsx` | Win98Theme | 4, 8 | Drag behavior + class assertions |
| `tests/GlobalRenderer.test.tsx` | DefaultTheme, WinXpTheme | 5-6, 10, 16 | Title text rendering |
| `tests/SystemShellCharacterization.test.tsx` | DefaultTheme, Win98Theme, WinXpTheme | 4-6, 33, 39, 45, 140, 145 | Shell composition + theme switching |

### Detailed Analysis by File

#### 1. `tests/DefaultTheme.test.tsx` (lines 1-46)

**What it tests:**
- Renders `<DefaultTheme />` root
- Asserts base classes: `cm-window-frame`, `cm-default-window-frame`
- Asserts content classes: `cm-window`, `cm-default-window`
- Asserts title classes: `cm-window__title-bar`, `cm-window__title-bar--default`, `cm-default-window-title`
- Tests dragging behavior: title bar drag updates frame position (32,28) → (56,51)

**What should become:**
- **Pivot to SystemHost**: Replace `<DefaultTheme />` with `<SystemHost systemType="default" theme="default" />`
- **Keep behavioral assertions**: Drag behavior is valuable - verify same coordinates (32,28) and drag delta
- **Adapt class assertions**: 
  - `cm-window-frame` → still valid (base class)
  - `cm-default-window-frame` → REMOVE (legacy class, replaced by CSS scoping)
  - `cm-window__title-bar--default` → REMOVE (legacy class)
  - `cm-default-window-title` → REMOVE (legacy class)
- **Risk level**: MEDIUM - behavioral test can stay, class assertions need removal

#### 2. `tests/Win98WindowTitle.test.tsx` (lines 1-40)

**What it tests:**
- Renders `<Win98Theme />` root
- Asserts title text: "Win98 Window"
- Asserts title class: `cm-window__title-bar--win98`
- Tests dragging behavior: (24,24) → (39,49)

**What should become:**
- **Pivot to SystemHost**: Replace `<Win98Theme />` with `<SystemHost systemType="windows" theme="win98" />`
- **Keep behavioral assertions**: Drag behavior - verify coordinates (24,24) and drag delta
- **Adapt class assertions**:
  - `cm-window__title-bar--win98` → REMOVE (legacy class, replaced by CSS scoping `.cm-system--windows.cm-theme--win98 .cm-window__title-bar`)
- **Risk level**: MEDIUM - behavioral test can stay, class assertion needs removal

#### 3. `tests/GlobalRenderer.test.tsx` (lines 1-31)

**What it tests:**
- Renders `<DefaultTheme />` and `<WinXpTheme />` roots
- Asserts title text: "Default Window", "WinXP Window"
- Tests explicit composition: `<CWindow><CWindowTitle>Custom Window</CWindowTitle>`

**What should become:**
- **Pivot to SystemHost**: Replace theme roots with SystemHost
- **Keep title text assertions**: "Default Window", "WinXP Window" still valid (boot layout content)
- **Keep explicit composition test**: Lines 21-30 test direct CWindow/CWindowTitle composition - this is valuable and doesn't depend on themes
- **Risk level**: LOW - title text assertions can stay, explicit composition test is already correct

#### 4. `tests/SystemShellCharacterization.test.tsx` (lines 1-150)

**What it tests:**
- Full shell composition: CScreen → CWindowManager → CWindow
- Theme-specific body test IDs: `default-window-body`, `win98-window-body`, `winxp-window-body`
- DevSystemRoot behavior: rerender default → win98 → winxp
- Window seam signature: frame tag, class, parent; content tag, class; title tag, parent
- Win98/WinXP share same seam structure

**What should become:**
- **Pivot to SystemHost**: Replace all theme roots with SystemHost
- **Keep shell composition test**: The structure CScreen → CWindowManager → CWindow is stable
- **Adapt body test IDs**: Still valid - SystemHost renders same boot windows
- **Rewrite theme switching test**: 
  - Current: Tests DevSystemRoot with theme-only switching
  - New: Test SystemHost with systemType+theme, verify:
    - Same system, diff theme: window UUID preserved
    - Diff system: window UUID reset
- **Keep seam signature test**: Win98/WinXP still share same structure under SystemHost
- **Risk level**: HIGH - needs significant rewrite for new lifecycle model

### Mapping: What Stays vs What Must Pivot

| Test Assertion | Current | New Model | Recommendation |
|---------------|---------|-----------|----------------|
| Window frame position (x,y) | DefaultTheme: 32,28 / Win98Theme: 24,24 | SystemHost with same params | KEEP - coordinates stable |
| Drag behavior | fireEvent pointer sequence | Same sequence | KEEP - behavior unchanged |
| Title text content | "Default Window", "Win98 Window" | Same boot layout | KEEP - content stable |
| Base class `cm-window-frame` | Present in all themes | Still rendered | KEEP - base class |
| Base class `cm-window` | Present in all themes | Still rendered | KEEP - base class |
| Base class `cm-window__title-bar` | Present in all themes | Still rendered | KEEP - base class |
| Legacy class `cm-default-window-frame` | DefaultTheme only | REMOVED | REMOVE - risky direct-theme test |
| Legacy class `cm-default-window` | DefaultTheme only | REMOVED | REMOVE - risky direct-theme test |
| Legacy class `cm-window__title-bar--default` | DefaultTheme only | REMOVED | REMOVE - risky direct-theme test |
| Legacy class `cm-default-window-title` | DefaultTheme only | REMOVED | REMOVE - risky direct-theme test |
| Legacy class `cm-window__title-bar--win98` | Win98Theme only | REMOVED | REMOVE - risky direct-theme test |
| Theme switching preserves window UUID | DevSystemRoot rerender | SystemHost rerender | REWRITE - new lifecycle |
| Shell composition structure | CScreen → CGrid → ... | Same structure | KEEP - stable contract |

### Narrowest Coherent Implementation Scope for Task 7

**Phase 1: Safe pivots (no behavioral change)**
1. `tests/GlobalRenderer.test.tsx` - Replace theme imports with SystemHost, keep title text + composition tests
2. `tests/DefaultTheme.test.tsx` - Replace with SystemHost, keep drag + position, remove legacy class assertions
3. `tests/Win98WindowTitle.test.tsx` - Replace with SystemHost, keep drag + position, remove legacy class assertions

**Phase 2: Complex rewrite**
4. `tests/SystemShellCharacterization.test.tsx` - Full rewrite for SystemHost + new lifecycle model

### Risky Direct-Theme Tests That Should NOT Survive Unchanged

1. **Any assertion on legacy class names** (lines in each test file):
   - `tests/DefaultTheme.test.tsx:14,16,18-19` - `cm-default-window-*` classes
   - `tests/Win98WindowTitle.test.tsx:14` - `cm-window__title-bar--win98`
   - `tests/SystemShellCharacterization.test.tsx` - implicitly tests legacy structure

2. **Theme-root direct rendering**:
   - All four files currently render theme roots directly
   - Must all pivot to SystemHost

3. **DevSystemRoot usage**:
   - `tests/SystemShellCharacterization.test.tsx:96-127` uses DevSystemRoot
   - Must replace with SystemHost for proper lifecycle testing

### File:Line References for Implementation

| File | Line | Current | Required Action |
|------|------|---------|-----------------|
| DefaultTheme.test.tsx | 3 | `import { DefaultTheme }` | → `import { SystemHost }` |
| DefaultTheme.test.tsx | 7 | `render(<DefaultTheme />)` | → `render(<SystemHost systemType="default" theme="default" />)` |
| DefaultTheme.test.tsx | 14,16,18-19 | Legacy class assertions | REMOVE |
| Win98WindowTitle.test.tsx | 4 | `import { Win98Theme }` | → `import { SystemHost }` |
| Win98WindowTitle.test.tsx | 8 | `render(<Win98Theme />)` | → `render(<SystemHost systemType="windows" theme="win98" />)` |
| Win98WindowTitle.test.tsx | 14 | Legacy class assertion | REMOVE |
| GlobalRenderer.test.tsx | 5-6 | Theme imports | → `import { SystemHost }` |
| GlobalRenderer.test.tsx | 10,16 | Theme root renders | → SystemHost renders |
| SystemShellCharacterization.test.tsx | 4-6 | Theme imports | → `import { SystemHost }` |
| SystemShellCharacterization.test.tsx | 33,39,45 | Theme roots in THEME_SHELL_CASES | → SystemHost with systemType/theme |
| SystemShellCharacterization.test.tsx | 96-127 | DevSystemRoot rerender test | REWRITE for SystemHost |
| SystemShellCharacterization.test.tsx | 140,145 | Direct theme renders | → SystemHost |

---

*Task 7 investigation completed: 2026-03-23*

## 2026-03-23 Task 7 implementation learnings

- `tests/SystemTypeSwitch.test.tsx` 用测试本地持久节点挂到 `window-content`，可以在不新增 `SystemHost` 生产 props 的前提下证明 `persistent-note-123` 跨系统切换仍能从 remount 边界上方重新注入。
- `tests/ThemeSwitchPreservation.test.tsx` 直接把可聚焦 `input` 挂到共享的 `window-content` DOM seam 上，能稳定证明同系统换主题时 `window-content` 节点未重建，因此拖拽坐标、`data-window-uuid`、输入值和焦点都保持不变。
- 遗留 Jest 文件迁移到 `SystemHost` / `DevSystemRoot` 路径后，仍可继续依赖 `screen-root`、`window-frame`、`window-title`、`window-content` 与标题/正文文本来覆盖可见行为，而不需要保留任何 `DefaultTheme`/`Win98Theme`/`WinXpTheme` root class 断言。
- `tests/SystemTypeSwitch.test.tsx` 的跨系统持久态证明不能靠 rerender 后手动搬运 DOM；更可靠的做法是在 `SystemHost` 之上放一个测试本地 React harness，用稳定 props/render 树持有 `persistent-note-123`，同时只把 reboot 断言留给 `SystemHost` 子树。

## 2026-03-23 Task 7: Lifecycle-Test Seams Investigation

### Persistent Payload Assertions (persistent-note-123)

**Pattern to implement**: Pass deterministic payload as prop to `SystemHost`, verify it survives across system switches.

**Current state**: No existing test for persistent payload - this is a NEW pattern to implement.

**Anchor locations**:
- `src/system/SystemHost.tsx:21-28` - SystemHost accepts props but doesn't currently accept persistent data
- The plan (task 7) specifies: "using a deterministic payload like `persistent-note-123`"

**Implementation approach**:
```tsx
// New test file: tests/SystemTypeSwitch.test.tsx
// Pass persistent data as prop to SystemHost
<SystemHost 
  systemType="windows" 
  theme="winxp"
  persistentData={{ note: 'persistent-note-123' }}
/>
// After system switch, verify persistentData is still accessible
```

### Runtime UUID Assertions

**Pattern**: `data-window-uuid` attribute on `window-content` element

**Source locations**:
- `src/components/Window/Window.tsx:439` - `data-window-uuid={this.uuid}`
- `src/components/Widget/Widget.tsx:22` - `public readonly uuid = generateUUID()`
- `src/utils/uuid.ts:17-38` - UUID generation using `crypto.randomUUID()`

**Existing test anchors**:
- `tests/SystemHost.test.tsx:41` - `const initialUuid = initialContent.getAttribute('data-window-uuid');`
- `tests/SystemHost.test.tsx:77` - `expect(updatedContent.getAttribute('data-window-uuid')).toBe(initialUuid);`
- `tests/SystemHost.test.tsx:92` - `const windowsUuid = windowsContent.getAttribute('data-window-uuid');`
- `tests/SystemHost.test.tsx:113` - `expect(defaultContent.getAttribute('data-window-uuid')).not.toBe(windowsUuid);`
- `tests/ScreenScope.test.tsx:143,161,173` - UUID preservation during drag/resize
- `tests/ThemeScopeClassNames.test.tsx:25,39` - UUID preservation across theme switches

**Finding**: UUID assertions are ALREADY WELL COVERED in existing tests. Task 7 should reference these patterns.

### Geometry/Focus Preservation Assertions

**Pattern**: Frame position assertions via `frame.style.left/top/width/height`

**Existing test anchors**:
- `tests/SystemHost.test.tsx:46-49` - Initial geometry: `expect(frame.style.left).toBe('24px')`, etc.
- `tests/SystemHost.test.tsx:63-66` - After drag: `expect(frame.style.left).toBe('48px')`, etc.
- `tests/SystemHost.test.tsx:78-81` - After theme switch: geometry preserved
- `tests/SystemHost.test.tsx:100-101` - After system switch: geometry resets to target defaults

**Drag helper** (already exists):
- `tests/SystemHost.test.tsx:5-31` - `dragPointer(target, { pointerId, start, end })` function
- `tests/ScreenScope.test.tsx:9-35` - Same drag helper pattern
- `tests/DefaultTheme.test.tsx:24-39` - Inline drag simulation

**Focus**: No existing focus tests found - may need to add if required by task 7

### Obsolete Root-Theme Tests to Repoint

**Files that need modification**:

| File | Current State | Action Required |
|------|--------------|-----------------|
| `tests/DefaultTheme.test.tsx:7` | Renders `<DefaultTheme />` | Pivot to `<SystemHost systemType="default" theme="default" />` |
| `tests/SystemShellCharacterization.test.tsx:3-6` | Imports `DefaultTheme`, `Win98Theme`, `WinXpTheme` | Remove or pivot to SystemHost |
| `tests/SystemShellCharacterization.test.tsx:28-46` | Defines `THEME_SHELL_CASES` with old root components | Remove or rewrite for SystemHost |
| `tests/SystemShellCharacterization.test.tsx:130-149` | Tests old root component structure | May need to remove or rewrite |

### Minimal File Set for Task 7

**New files to create**:
1. `tests/SystemTypeSwitch.test.tsx` - Persistent data preservation + system reboot
2. `tests/ThemeSwitchPreservation.test.tsx` - Same-system theme preservation

**Files to modify**:
1. `tests/DefaultTheme.test.tsx` - Pivot from DefaultTheme to SystemHost
2. `tests/SystemShellCharacterization.test.tsx` - Remove/repoint obsolete root-theme tests

**Reference files (do not modify)**:
- `tests/SystemHost.test.tsx` - Already has comprehensive UUID and geometry tests
- `tests/ThemeScopeClassNames.test.tsx` - Already covers theme scope class behavior
- `tests/ScreenScope.test.tsx` - Already covers screen wrapper behavior

### Hidden Gotchas

1. **Obsolete root-theme tests vs new SystemHost path**: 
   - `tests/SystemShellCharacterization.test.tsx` tests old `DevThemeRoot` behavior which no longer exists after task 6
   - This test file may need complete rewrite or removal, not just repointing

2. **DefaultTheme.test.tsx drag assertions**:
   - Current test at `tests/DefaultTheme.test.tsx:21-22` asserts `frame.style.left: 32px` and `frame.style.top: 28px`
   - These are DEFAULT system boot coordinates, not Windows system coordinates
   - After pivoting to SystemHost, these values should remain the same for `systemType="default"`/`theme="default"`

3. **UUID stability across theme switches**:
   - Already tested in `tests/SystemHost.test.tsx:34-84`
   - Already tested in `tests/ThemeScopeClassNames.test.tsx:18-42`
   - Task 7 should NOT duplicate these - should reference or extend

4. **persistent-note-123 pattern**:
   - The plan specifies this exact string for deterministic testing
   - Currently no implementation of persistent data prop on SystemHost
   - May need to add `persistentData` prop to SystemHost or verify it's passed through

---

*Task 7 investigation completed: 2026-03-23*

## 2026-03-23 Task 8: Playwright Harness Query-Param Investigation

### Current Architecture

**Entry Points:**
- `playwright-window.html` (root) → loads `src/dev/playwright/windowHarness.tsx`
- `index.html` (dev) → loads `src/dev/main.tsx`

**Current windowHarness.tsx (lines 1-68):**
- Parses `?fixture=` query param via `getFixtureName()` (lines 6-14)
- Renders hardcoded CWindow fixtures: `default`, `drag-only`, `min-clamp`, `max-clamp` (lines 16-57)
- Does NOT use DevSystemRoot or SystemHost

**Current DevSystemRoot (src/dev/themeSwitcher.tsx:58-66):**
- Already accepts `{ systemType?, theme? }` props
- Resolves definitions via registry
- Renders `<SystemHost systemType={systemType} theme={theme} />`

### Files to Modify for Task 8

| File | Lines | Action |
|------|-------|--------|
| `src/dev/playwright/windowHarness.tsx` | 1-68 | Replace fixture switch with DevSystemRoot + query param parsing |
| `tests/ui/window.helpers.ts` | 26-27 | Update `gotoWindowFixture()` to support new query params |

### Implementation Approach

**Option A: Extend fixture model (NOT recommended)**
- Add new fixture values like `system-windows-win98`
- Pro: Minimal code change
- Con: Defeats the purpose of systemType/theme separation

**Option B: Add dedicated system-theme mode (RECOMMENDED)**
- Add new query params: `systemType=windows&theme=win98`
- Keep backward compatibility with `?fixture=` for existing tests
- Render DevSystemRoot when systemType/theme present

**Implementation in windowHarness.tsx:**

```tsx
// Parse query params (NEW lines 6-20)
const getSystemThemeSelection = (): { systemType?: string; theme?: string } | null => {
  try {
    const url = new URL(window.location.href);
    const systemType = url.searchParams.get('systemType');
    const theme = url.searchParams.get('theme');
    if (systemType && theme) return { systemType, theme };
    return null;
  } catch {
    return null;
  }
};

// Keep existing fixture for backward compatibility
const getFixtureName = (): string => { ... };

// New render logic (lines 59-68)
const App = () => {
  const selection = getSystemThemeSelection();
  if (selection) {
    return <DevSystemRoot systemType={selection.systemType} theme={selection.theme} />;
  }
  const fixture = getFixtureName();
  return <>{renderFixture(fixture)}</>;
};
```

### Exact File:Line References

| Location | Current | Required Change |
|----------|---------|-----------------|
| `src/dev/playwright/windowHarness.tsx:1` | No imports from themeSwitcher | Add: `import { DevSystemRoot } from '../themeSwitcher';` |
| `src/dev/playwright/windowHarness.tsx:6-14` | `getFixtureName()` only | Add `getSystemThemeSelection()` before |
| `src/dev/playwright/windowHarness.tsx:59-62` | `App` renders fixture only | Add conditional: if selection → DevSystemRoot |
| `tests/ui/window.helpers.ts:26-27` | `gotoWindowFixture(page, fixture)` | Add `gotoSystemTheme(page, systemType, theme)` |

### QA Scenarios from Task 8

| Scenario | URL | Expected |
|----------|-----|----------|
| Load Windows/Win98 | `?systemType=windows&theme=win98` | Windows boot layout with Win98 title bar |
| Switch to Windows/WinXP | (after load) `?systemType=windows&theme=winxp` | Same window UUID, XP title bar |
| Switch to Default | `?systemType=default&theme=default` | New window UUID (reboot), Default layout |
| Legacy fixture | `?fixture=default` | Original CWindow fixture (backward compat) |

### Selector/Gotcha Analysis

**Same-system theme switch (windows/win98 → windows/winxp):**
- `window-frame` / `window-content` / `window-title` selectors still work
- `data-window-uuid` preserved (key unchanged)
- Screen scope class changes: `.cm-theme--win98` → `.cm-theme--winxp`

**Cross-system switch (windows/win98 → default/default):**
- `data-window-uuid` CHANGES (key={systemType} forces remount)
- Test must wait for new window to appear
- Use `waitForFunction` with UUID check

**Boot content verification:**
- Default system: "Default Window" title, coordinates (32,28)
- Windows/Win98: "Win98 Window" title, coordinates (24,24)
- Windows/WinXP: "WinXP Window" title, coordinates (40,32)

### Risks

1. **Vite serves playwright-window.html at root** - Ensure DevSystemRoot CSS imports work
2. **Theme CSS must be loaded** - Currently themes import SCSS side effects; verify this works in harness
3. **Playwright wait strategy** - Cross-system switch needs longer wait for remount

---

*Task 8 investigation completed: 2026-03-23*

## 2026-03-23 Final Wave F4 rerun learning

- F4 复核通过的关键标志是：`src/theme/*/index.tsx` 只剩纯 `ThemeDefinition` metadata，`src/system/registry.ts` 只依赖 metadata，且共享基础组件/系统壳里不再残留任何 legacy class 注入 props；这样才能证明兼容清理没有反向扩张成新的正式 API。

## 2026-03-23 Final Wave repair learnings

- `WindowsSystem` 的 boot layout 只要收敛为单一常量并锁在 system shell 内部，就能同时满足“同系统换 theme 不重置运行时窗口”和“theme 不拥有标题/正文/坐标”的最终边界。
- `src/theme/*/index.tsx` 仅导出 plain `ThemeDefinition` 仍然可以保留样式 side effect；让 `registry` 直接消费这些 metadata 就能彻底切断 renderable bridge 残留。
- 删除 `CWindow` 的 `windowContentClassName` / `windowFrameClassName` 公共扩展点后，测试应统一锚定 `screen-root`、`window-frame`、`window-title`、`window-content` 这些稳定 seam，而不是历史兼容 class。
- 计划证据如果依赖 `jest -t` 过滤串，最好让测试标题与计划命令保持一致；这样回填证据时可以直接复用计划里的命令而不需要二次解释。

## 2026-03-23 Task 8: Playwright Test Patterns Investigation

### Files Investigated

| File | Purpose | Key Patterns |
|------|---------|--------------|
| `tests/ui/window.helpers.ts` | Core helper functions | `gotoWindowFixture()`, `readFrameMetrics()`, `dragLocatorBy()` |
| `tests/ui/window.smoke.spec.ts` | Baseline fixture test | Uses `data-testid` selectors, metric assertions |
| `tests/ui/window.move.spec.ts` | Drag behavior test | Uses `dragLocatorBy()`, `readFrameMetrics()` |
| `tests/ui/window.resize.spec.ts` | Resize matrix test | Uses `data-testid="window-resize-{dir}"`, exact coordinate assertions |
| `tests/ui/window.resize-guards.spec.ts` | Resize constraints test | Uses same helpers, different fixtures |
| `playwright.config.ts` | Test configuration | Base URL: `http://127.0.0.1:5673`, chromium only |
| `src/dev/playwright/windowHarness.tsx` | Test fixture renderer | Reads `?fixture=` query param, renders CWindow |
| `playwright-window.html` | Test entry point | Loads `windowHarness.tsx` |

### Helper Functions to Reuse (file:line references)

**`tests/ui/window.helpers.ts`:**

1. **`gotoWindowFixture(page, fixture)`** (lines 26-48)
   - Navigates to `/playwright-window.html?fixture={fixture}`
   - Waits for window elements to be visible
   - Returns: `void`
   - **For Task 8**: Need to create similar function for systemType/theme loading

2. **`readFrameMetrics(page)`** (lines 50-68)
   - Reads inline styles from `window-frame` element
   - Returns: `{ x, y, width, height }`
   - **For Task 8**: CAN REUSE directly - works with any window frame

3. **`dragLocatorBy(locator, dx, dy)`** (lines 70-89)
   - Drags element by delta pixels
   - Uses mouse events with step interpolation
   - Returns: `void`
   - **For Task 8**: CAN REUSE directly - works with any draggable element

## 2026-03-23 Task 1 F1 repair learning

- 当最终架构已经改成 `DevSystemRoot` 后，补回 task-1 的历史 characterization 最稳妥的方式是在测试内重建 `HistoricalDevThemeRoot` 映射，用不同 theme-root 组件类型强制 `default -> win98 -> winxp` 每一步都整棵 subtree 重挂载，而不回滚任何生产导出。

### Selector Patterns to Reuse

| Selector | Source | Usage |
|----------|--------|-------|
| `window-frame` | `window.helpers.ts:10` | Frame element for metrics |
| `window-title` | `window.helpers.ts:11` | Title bar for drag |
| `window-content` | `window.helpers.ts:12` | Content area |
| `window-resize-{dir}` | `window.helpers.ts:13` | Resize handles (n/s/e/w/ne/nw/se/sw) |
| `fixture-error` | `window.helpers.ts:14` | Error display |

### Assertion Style to Mirror

**From `window.smoke.spec.ts:10-15`:**
```typescript
await expect(readFrameMetrics(page)).resolves.toEqual({
  x: 10,
  y: 20,
  width: 240,
  height: 160,
});
```

**From `window.move.spec.ts:12-17`:**
```typescript
await expect(readFrameMetrics(page)).resolves.toEqual({
  x: 30,
  y: 60,
  width: 240,
  height: 160,
});
```

### Gap Analysis: New Helper Needed for Query-Param Based Loading

**Current state**: `windowHarness.tsx` only reads `?fixture=` parameter
```typescript
// windowHarness.tsx:6-14
const getFixtureName = (): string => {
  try {
    const url = new URL(window.location.href);
    const f = url.searchParams.get('fixture');
    return f ?? 'default';
  } catch {
    return 'default';
  }
};
```

**Required for Task 8**: Need to add support for `?systemType=` and `?theme=` query parameters.

**Option 1**: Extend `windowHarness.tsx` to read both fixture and systemType/theme
- Add `getSystemType()` and `getTheme()` functions
- Pass to DevSystemRoot instead of just fixture

**Option 2**: Create new harness file (e.g., `systemThemeHarness.tsx`)
- Dedicated to systemType/theme testing
- Reads `?systemType=` and `?theme=` query params
- Renders DevSystemRoot with those params

### Recommended Spec Structure for `tests/ui/system-theme-switch.spec.ts`

```typescript
import { expect, test } from '@playwright/test';
import { dragLocatorBy, gotoWindowFixture, readFrameMetrics } from './window.helpers';

// Helper needed: gotoSystemThemeFixture(page, systemType, theme)

// Or extend gotoWindowFixture to accept optional systemType/theme params

test.describe('system-theme-switch', () => {
  test('same-system theme switch preserves window UUID', async ({ page }) => {
    // Navigate to windows/win98
    await gotoSystemThemeFixture(page, 'windows', 'win98');
    
    // Get initial UUID
    const initialUuid = await page.getByTestId('window-content')
      .getAttribute('data-window-uuid');
    
    // Switch to windows/winxp (same system, different theme)
    await gotoSystemThemeFixture(page, 'windows', 'winxp');
    
    // Verify UUID preserved
    const newUuid = await page.getByTestId('window-content')
      .getAttribute('data-window-uuid');
    expect(newUuid).toBe(initialUuid);
  });
  
  test('cross-system switch resets window UUID', async ({ page }) => {
    // Navigate to windows/win98
    await gotoSystemThemeFixture(page, 'windows', 'win98');
    
    // Get initial UUID
    const initialUuid = await page.getByTestId('window-content')
      .getAttribute('data-window-uuid');
    
    // Switch to default/default (different system)
    await gotoSystemThemeFixture(page, 'default', 'default');
    
    // Verify UUID reset
    const newUuid = await page.getByTestId('window-content')
      .getAttribute('data-window-uuid');
    expect(newUuid).not.toBe(initialUuid);
  });
  
  test('same-system theme switch preserves window geometry', async ({ page }) => {
    await gotoSystemThemeFixture(page, 'windows', 'win98');
    
    // Drag window
    const titleLocator = page.getByTestId('window-title');
    await dragLocatorBy(titleLocator, 20, 40);
    
    const beforeMetrics = await readFrameMetrics(page);
    
    // Switch theme
    await gotoSystemThemeFixture(page, 'windows', 'winxp');
    
    // Verify geometry preserved
    const afterMetrics = await readFrameMetrics(page);
    expect(afterMetrics).toEqual(beforeMetrics);
  });
});
```

### File:Line References Summary

| Location | Symbol | Notes |
|----------|--------|-------|
| `tests/ui/window.helpers.ts:26` | `gotoWindowFixture` | Base pattern for navigation |
| `tests/ui/window.helpers.ts:50` | `readFrameMetrics` | Reusable for Task 8 |
| `tests/ui/window.helpers.ts:70` | `dragLocatorBy` | Reusable for Task 8 |
| `tests/ui/window.helpers.ts:10-14` | Test ID constants | Stable selectors |
| `tests/ui/window.smoke.spec.ts:10-15` | Metric assertion style | Mirror this pattern |
| `src/dev/playwright/windowHarness.tsx:6-14` | Query param reading | Need to extend for systemType/theme |
| `playwright-window.html:10` | Entry point | May need new HTML or extend |

### Evidence Files to Capture

Per task 8 requirements, the spec should capture evidence for:
1. Same-system theme preservation (window UUID, geometry)
2. Cross-system reboot semantics (UUID reset)
3. Screen scope class updates (`data-system-type`, `data-theme` attributes)

---

*Task 8 investigation completed: 2026-03-23*

## 2026-03-23 Task 8 implementation learnings

- `src/dev/playwright/windowHarness.tsx` 采用“`fixture` 优先、否则解析 `systemType/theme`”的 route 分支，可以在不触碰旧 drag/resize spec URL 的前提下，为 `DevSystemRoot` 打开新的 Playwright 入口。
- 为了验证同页 system/theme 切换而不是整页重载，harness 需要监听 `popstate` 并在 helper 里通过 `history.replaceState(...); dispatchEvent(new PopStateEvent('popstate'))` 触发 rerender，这样同系统主题切换才能真实保留运行时窗口几何。
- `window-content` 这个稳定 seam 会包含标题栏文本，因此 Playwright 回归里验证 boot content 变化时应使用 `toContainText(...)`，而不是假设内容区只暴露 body 文本。

## 2026-03-23 Final Wave F4 rerun learning

- F4 复核通过的关键标志是：`src/theme/*/index.tsx` 只剩纯 `ThemeDefinition` metadata，`src/system/registry.ts` 只依赖 metadata，且共享基础组件/系统壳里不再残留任何 legacy class 注入 props；这样才能证明兼容清理没有反向扩张成新的正式 API。
