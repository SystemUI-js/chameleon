# Feature Specification: Window 交互与菜单优化

**Feature Branch**: `004-window-behavior`
**Created**: 2026-01-23
**Status**: Draft
**Input**: User description: "使用编号 004。
1. Window 的激活操作改为点击 Window 任意位置都可以让它 Active
2. 移动 Window 的时候不应该使用 cursor move，应该还是 cursor default
3. 在 Resize 的时候应该保持 光标和 hover 在边框时一致，而不是使用 move 这个光标
 4. 在 Win98 主题的 Window 移动，保持原有的 mode，在移动时显示预览的虚线框，就和真正的 Window 98 一样
 5. 优化主题逻辑，应该是这样：主题的样式切换，借助向主题组件的内部组件注入主题名来实现样式切换，样式文件还是放在原来的地方，这样才能在类似 cm-popover 这种在 body 下的组件方便使用样式
6. 增加 右键菜单能力，给 Window 的标题栏使用（只是说用来展示功能，实际上这是一个通用能力，而不是专门给 Window 标题栏使用的），菜单中先放一个关闭的菜单项，右键菜单继承自 DropMenu
7. Menu 功能中，如果打开了 多级子菜单，点击 Menu 以外的地方，应该收起所有 Menu 而不是收起最后一级子菜单"

## Clarifications

### Session 2026-01-23

- Q: 窗口激活边界定义 → A: 整个窗口可见区域（包括标题栏和内容区域）
- Q: 多级菜单嵌套深度限制 → A: 无限制，根据实际 UI 显示需求自适应
- Q: 主题切换的交互模式 → A: 立即更新所有已打开的组件（包括浮层）
- Q: 右键菜单在非激活窗口的优先级 → A: 右键菜单优先打开，不激活窗口
- Q: 窗口数量与性能约束 → A: 无具体限制，由运行环境决定

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 窗口激活与移动/缩放体验一致 (Priority: P1)

作为使用窗口组件的用户，我希望点击窗口任意位置（包括标题栏和内容区域）即可激活窗口，并且在移动与缩放时光标反馈与边框悬停一致，从而获得直观一致的交互体验。

**Why this priority**: 窗口激活与拖拽是最基础的交互，影响所有用户的第一感受。

**Independent Test**: 仅实现该故事即可通过点击、拖拽、缩放验证核心交互是否一致。

**Acceptance Scenarios**:

1. **Given** 窗口处于未激活状态，**When** 用户点击窗口任意可见区域（包括标题栏和内容区域），**Then** 窗口变为激活状态并更新为激活样式。
2. **Given** 用户拖动窗口进行移动，**When** 鼠标在拖动过程中持续移动，**Then** 光标保持为默认光标而非移动光标。
3. **Given** 用户在边框悬停进行缩放，**When** 进入缩放状态，**Then** 光标样式与悬停在对应边框时一致。
4. **Given** 当前主题为 Win98，**When** 用户拖动窗口进行移动，**Then** 保持原有移动模式且移动过程中显示虚线预览框。

---

### User Story 2 - 主题切换在浮层中一致生效 (Priority: P2)

作为使用主题系统的用户，我希望主题切换时所有组件（包括浮层/挂载到页面外层的组件）都能正确呈现对应主题样式，从而避免样式错乱。

**Why this priority**: 主题一致性直接影响整体观感，且浮层组件是常见场景。

**Independent Test**: 仅实现该故事即可通过切换主题并检查浮层组件外观一致性来验证。

**Acceptance Scenarios**:

1. **Given** 用户切换主题，**When** 打开浮层类组件，**Then** 浮层组件使用与当前主题一致的样式。
2. **Given** 页面中存在多个组件层级，**When** 主题切换，**Then** 所有相关组件样式同步更新且无混用旧主题。

---

### User Story 3 - 右键菜单能力与多级菜单收起行为 (Priority: P3)

作为需要扩展交互的用户，我希望提供通用的右键菜单能力（示例应用于窗口标题栏），并且多级菜单在点击外部时全部收起，从而避免菜单残留。

**Why this priority**: 右键菜单是通用能力示例展示，多级菜单收起行为能显著提升易用性与一致性。

**Independent Test**: 仅实现该故事即可通过右键触发菜单与外部点击关闭验证交互完整性。

**Acceptance Scenarios**:

1. **Given** 用户在窗口标题栏右键，**When** 触发右键菜单，**Then** 菜单展示且包含“关闭”项。
2. **Given** 多级菜单已展开，**When** 用户点击菜单以外区域，**Then** 所有层级菜单全部收起。

---

### Edge Cases

- 在窗口未激活时右键标题栏，菜单仍可打开且不影响激活逻辑。
- 快速连续拖动/缩放切换时，光标状态保持一致不闪烁。
- 多级菜单处于展开状态时切换主题，菜单外观更新且关闭行为不受影响。
- 多级菜单嵌套深度无限制，但建议 UI 样式约束以避免显示问题。
- 窗口数量无硬性限制，性能由运行环境（用户硬件、浏览器）决定。

## Requirements *(mandatory)*

### Quality Gates *(mandatory)*

- **QG-001**: Changes MUST pass lint/format/build in CI.
- **QG-002**: Behavior or public API changes MUST include tests.
- **QG-003**: UX MUST follow theme tokens and existing interaction patterns.
- **QG-004**: Performance-sensitive changes MUST define measurable targets.

### Functional Requirements

- **FR-001**: 系统 MUST 支持点击窗口任意可见区域即可激活窗口。
- **FR-002**: 系统 MUST 在窗口移动过程中保持默认光标表现。
- **FR-003**: 系统 MUST 在窗口缩放过程中保持与边框悬停一致的光标反馈。
- **FR-004**: 系统 MUST 在 Win98 主题下移动窗口时显示虚线预览框并保持原有移动模式。
- **FR-005**: 系统 MUST 确保主题切换后所有组件（含浮层类组件）样式一致更新。
- **FR-006**: 系统 MUST 提供通用右键菜单能力，可用于窗口标题栏等场景。
- **FR-007**: 右键菜单 MUST 至少包含“关闭”菜单项作为示例。
- **FR-008**: 多级菜单展开时点击菜单以外区域 MUST 关闭所有菜单层级。

### Assumptions

- 以上行为适用于所有主题，除非主题明确覆盖其交互表现。
- “点击菜单以外区域”指菜单与其子菜单可视区域之外的任意页面区域。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在可用性测试中，≥95% 的用户可在 10 秒内完成窗口激活与移动的基本操作。
- **SC-002**: 缩放与移动过程中光标一致性缺陷为 0（基于回归用例与人工验证）。
- **SC-003**: 主题切换后，浮层组件样式一致性问题在回归测试中为 0。
- **SC-004**: 多级菜单外部点击关闭成功率达到 100%（基于自动化或人工测试用例）。
