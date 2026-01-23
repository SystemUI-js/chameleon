# Feature Specification: 主题与窗口交互完善

**Feature Branch**: `003-theme-window-behavior`  
**Created**: 2026-01-23  
**Status**: Draft  
**Input**: User description: "003 实现以下功能 ：
1. 默认主题改为 default，现在默认是 WinXP
2. 现在 demo 中窗口 Resize 没反应
3. 移动时 cursor 还是 default
4. 鼠标点击 标题栏 应该也可以激活窗口
5. 窗口组件增加 Props onActive，在窗口被激活时触发
 6. SubMenu 样式应该跟主题变动
 7. Modal 应该继承 Window 组件的样式
 8. 主题不光要有样式分别，也要有功能分别，这次做一个功能分别，Win98 的主题，拖动窗口，使用 mode 为 静止，winXP 主题拖动使用内容随鼠标移动的 mode。这个能力要求写在主题文件夹内，考虑把主题这个高阶组件变成基类，而真正的主题继承自这个组件，可以对子组件做一些定义，比如给某一个类的组件自动增加默认的 Props"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 使用默认主题并展示一致风格 (Priority: P1)

作为使用组件库的开发者，我希望默认主题为 default，并且主题相关组件样式能随主题变化，这样不用额外配置也能获得一致外观。

**Why this priority**: 默认主题与主题一致性直接影响所有使用者的首次体验。

**Independent Test**: 在未设置主题的情况下加载 demo，确认主题为 default 且 SubMenu、Modal、Window 风格一致。

**Acceptance Scenarios**:

1. **Given** 未设置主题的 demo，**When** 页面加载完成，**Then** 默认主题为 default 且不会显示 WinXP 默认主题。
2. **Given** 切换主题为 Win98 或 WinXP，**When** 打开 SubMenu 与 Modal，**Then** 其样式随主题切换并与 Window 一致。

---

### User Story 2 - 直观的窗口交互与激活反馈 (Priority: P1)

作为使用 demo 的用户，我希望窗口可以正常 resize 与拖动，并且在拖动或激活时有正确的光标与激活行为反馈。

**Why this priority**: 交互可用性与反馈是窗口组件的核心体验，缺失会导致功能不可用。

**Independent Test**: 在 demo 中对窗口进行 resize、拖动与点击标题栏激活，观察反馈。

**Acceptance Scenarios**:

1. **Given** 一个可交互的窗口，**When** 拖动窗口边缘，**Then** 窗口尺寸发生变化。
2. **Given** 窗口处于非激活状态，**When** 点击标题栏，**Then** 窗口被激活并触发激活回调。
3. **Given** 窗口可拖动，**When** 鼠标移动到拖动区域并拖拽，**Then** 光标显示为移动相关指示。

---

### User Story 3 - 主题差异化行为 (Priority: P2)

作为开发者，我希望不同主题不仅有样式差异，也有交互行为差异，以便模拟真实系统风格。

**Why this priority**: 主题差异化是本次功能的核心扩展，影响主题设计的可表达性。

**Independent Test**: 在 demo 中切换 Win98 与 WinXP 主题后拖动窗口，验证拖动模式差异。

**Acceptance Scenarios**:

1. **Given** 主题为 Win98，**When** 拖动窗口，**Then** 拖动模式为静止反馈（不随鼠标实时移动）。
2. **Given** 主题为 WinXP，**When** 拖动窗口，**Then** 窗口内容随鼠标实时移动。

---

### Edge Cases

- 当窗口已经是激活状态时再次点击标题栏，不应重复触发激活事件。
- 当窗口尺寸接近最小值时 resize 行为仍可完成且不会产生负尺寸。
- 在主题切换过程中打开的窗口，样式与交互应立即应用新主题行为。

## Requirements *(mandatory)*

### Quality Gates *(mandatory)*

- **QG-001**: Changes MUST pass lint/format/build in CI.
- **QG-002**: Behavior or public API changes MUST include tests.
- **QG-003**: UX MUST follow theme tokens and existing interaction patterns.
- **QG-004**: Performance-sensitive changes MUST define measurable targets.

### Functional Requirements

- **FR-001**: 系统 MUST 将默认主题设置为 default，并在未配置时使用该主题。
- **FR-002**: 系统 MUST 让 demo 中的窗口 resize 行为生效并可交互。
- **FR-003**: 系统 MUST 在窗口可拖动区域显示符合拖动行为的鼠标指示。
- **FR-004**: 系统 MUST 支持点击标题栏激活窗口并触发 onActive 回调。
- **FR-005**: 系统 MUST 在窗口首次被激活时触发 onActive，并避免重复触发。
- **FR-006**: 系统 MUST 让 SubMenu 样式随主题变化并与当前主题一致。
- **FR-007**: 系统 MUST 让 Modal 继承 Window 的主题样式与外观行为。
- **FR-008**: 系统 MUST 为主题提供交互行为差异化配置入口。
- **FR-009**: 系统 MUST 在 Win98 主题下使用静止拖动模式。
- **FR-010**: 系统 MUST 在 WinXP 主题下使用内容随鼠标实时移动的拖动模式。
- **FR-011**: 系统 MUST 支持主题为子组件设置默认 Props（例如 Window 相关组件）。

### Assumptions

- 默认主题 default 已存在或会新增为标准主题标识。
- demo 仅需覆盖主窗口交互与主题联动样式展示。

### Dependencies

- 主题系统支持扩展交互行为配置入口。
- Window 组件提供可复用样式给 Modal 继承。

## Success Criteria *(mandatory)*


### Measurable Outcomes

- **SC-001**: 新建 demo 页面在未配置主题的情况下 100% 使用 default 主题。
- **SC-002**: 在 demo 中 100% 的窗口可完成 resize 与拖动操作。
- **SC-003**: 窗口激活与 onActive 行为在回归测试中通过率达到 95% 以上。
- **SC-004**: 主题切换后 SubMenu 与 Modal 的样式更新在用户可感知范围内完成（不超过 1 秒）。
- **SC-005**: 主题切换前后拖动交互模式符合对应主题预期，用户测试通过率不低于 90%。
