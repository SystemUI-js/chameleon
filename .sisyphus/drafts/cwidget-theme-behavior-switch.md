# Draft: CWidget Theme Behavior Switch

## Requirements (confirmed)
- 让 CWidget 的 Resize Behavior 和 Move Behavior 通过主题来切换。
- default 主题使用 `live`。
- win98 主题使用 `outline`。
- 需要使用通用化的方法解决，而不是只针对这两个 props。
- 未来可能还有别的 props 也需要按主题切换，因此要考虑配置化等可扩展解法。

## Technical Decisions
- 待定：主题驱动行为的通用配置承载位置与解析流程。
- 待定：主题默认值与显式 props 的优先级规则。
- 待定：类型层如何表达“按主题分发的 prop 配置”。
- 候选：在 `src/components/Theme/Theme.tsx` 关联的主题定义层增加通用 prop-defaults/overrides 配置，再由组件侧统一解析。
- 候选：优先级采用 `显式 props > 主题配置 > 组件内默认值`，保持现有可覆盖能力。

## Research Findings
- `src/components/Widget/Widget.tsx` 定义了 `CWidgetProps.moveBehavior` / `resizeBehavior`、`WidgetInteractionBehavior` 枚举，以及 `getMoveBehavior()` / `getResizeBehavior()` 两个核心解析点。
- `src/components/Window/Window.tsx` 只是将 `moveBehavior` / `resizeBehavior` 透传给 `CWidget`；`src/components/Window/WindowTitle.tsx` 会消费 move behavior 决定 live / outline 拖动模式。
- `src/components/Theme/Theme.tsx` 当前 Theme Context 只承载 `theme` className 与 provider 状态，没有主题级 prop 配置能力；主题 className 合并由 `src/components/Theme/mergeClasses.ts` 负责。
- 主题定义位于 `src/theme/`，当前公开的是 `default / win98 / winXp` 的 `className` 型定义，尚未发现现成的“按主题切换行为 prop”配置模式。
- 测试基础设施已具备：Jest + React Testing Library + Playwright；`tests/CWindowTitleComposition.test.tsx` 已覆盖 `live/outline` 行为差异，`tests/PublicThemeMatrix.test.tsx` / `tests/Theme.test.tsx` 已覆盖 Theme Provider 与显式 theme 用法。

## Open Questions
- 显式传入 Resize/Move Behavior 时，是否应覆盖主题默认值？
- 这种主题驱动配置是否仅用于行为类 props，还是应设计成适用于任意主题相关 props？
- 是否需要同步暴露公共 API 供其他组件复用相同机制？
- 测试策略采用 TDD、测试后补，还是仅保留最小必要回归？

## Scope Boundaries
- INCLUDE: CWidget 主题驱动行为切换方案、通用配置机制、相关测试与文档影响评估。
- EXCLUDE: 未被此次机制触达的其他组件重构（除非通用方案必须抽取公共层）。
