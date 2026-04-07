## Context

`CMenu` 当前在根节点 `.cm-menu` 内固定渲染一层 `.cm-menu__trigger` 包裹节点，再将 click / hover 触发逻辑与 ARIA 属性通过 `React.cloneElement` 注入到传入的 `children`。这意味着根触发器的交互语义实际上已经绑定在 `children` 本身上，但 DOM 结构仍额外增加了一层中间节点。

当前实现带来两个约束：

- 使用方无法让自身传入的元素直接成为 `.cm-menu` 的一级子节点，影响依赖精简 DOM 层级的布局或选择器。
- `.cm-menu__trigger` 形成了额外的 DOM 契约，外部样式、自动化测试或 DOM 遍历逻辑可能依赖这层包装。

本次变更需要在不改变 `CMenu` props、根触发模式和无障碍语义的前提下，移除该中间 wrapper，并保持根菜单弹层定位、点击外部关闭、hover 打开/关闭等行为稳定。

## Goals / Non-Goals

**Goals:**

- 让 `children` 直接作为 `.cm-menu` 的子节点承载根触发行为与 ARIA 语义。
- 保持根级 `click` / `hover` 打开逻辑、外部点击关闭逻辑和子菜单分支状态管理不变。
- 保持弹层仍以 `.cm-menu` 作为定位上下文，避免影响根菜单与子菜单 popup 定位。
- 明确记录 DOM 契约变更，便于后续测试与文档同步更新。

**Non-Goals:**

- 不重构子菜单结构或 `renderItems` 的分支展开机制。
- 不新增触发器类型、键盘导航能力或新的公开 props。
- 不兼容保留 `.cm-menu__trigger` 相关样式钩子。

## Decisions

### 1. 直接渲染克隆后的 trigger 元素，不再包裹 `.cm-menu__trigger`

根节点返回结构改为 `.cm-menu > {triggerElement} + popup`，由 `triggerElement` 直接成为 `.cm-menu` 的子节点。已有的 `React.cloneElement` 注入逻辑保留，继续负责：

- `onClick`
- `onPointerEnter`
- `aria-haspopup`
- `aria-expanded`
- `aria-controls`

这样可以最小化行为改动，把本次修改限定为 DOM 结构收敛，而不是重新设计触发机制。

**为什么不是保留 wrapper 并新增开关？**

保留可配置 wrapper 会让组件同时维护两套 DOM 契约，测试和样式矩阵更复杂；而 proposal 已明确目标是移除中间节点，因此直接收敛到单一结构更清晰。

### 2. 保留 `.cm-menu` 作为唯一根容器与定位/命中检测边界

`rootRef`、`onPointerLeave` 和 document `mousedown` 的关闭逻辑继续绑定在 `.cm-menu` 根节点上，不迁移到触发元素。这样可以保证：

- 弹层绝对定位仍相对 `.cm-menu` 生效；
- “点击外部关闭” 仍以整个 menu 根容器为边界；
- hover 模式下，指针离开根容器时仍可统一关闭菜单。

这避免了因为不同 `children` 标签类型或布局样式差异，导致关闭边界判断不一致。

### 3. 删除 `.cm-menu__trigger` 样式定义，并把触发元素布局责任交回给使用方

`index.scss` 中 `.cm-menu__trigger` 仅承担 `display: inline-block`。移除 wrapper 后，不再由组件强行包一层内联块元素。`.cm-menu` 仍保留 `display: inline-block; position: relative;`，确保组件整体布局与 popup 定位稳定。

这意味着传入的 `children` 元素将按其自身语义和样式参与布局；若使用方此前依赖 wrapper 提供的内联块行为，需要自行在触发元素上声明对应样式。

**为什么不是用 `display: contents` 保留 class？**

`display: contents` 会继续保留一个不稳定的 DOM 钩子，而且在可访问性、事件命中和跨浏览器行为上存在额外风险，不适合作为组件库的过渡方案。

### 4. 通过测试更新显式锁定新的 DOM 契约与现有交互行为

测试需要覆盖两类结果：

- 根触发器不再被 `.cm-menu__trigger` 包裹；
- click / hover 打开、ARIA 注入、外部点击关闭等既有能力仍然可用。

这样可以防止未来在重构时重新引入隐式 wrapper，或因结构变化破坏触发交互。

## Risks / Trade-offs

- **[Risk] 外部依赖 `.cm-menu__trigger` 的样式或测试失效** → 在 proposal / changelog 中明确 BREAKING CHANGE，并同步更新内部示例与测试选择器。
- **[Risk] 某些触发元素失去 wrapper 提供的 `inline-block` 布局效果** → 保持 `.cm-menu` 根节点为 `inline-block`，并在文档中说明触发元素样式由使用方自行控制。
- **[Risk] DOM 结构变化影响 hover 模式边界判断** → 保留 `rootRef` 与 `onPointerLeave` 在 `.cm-menu` 根节点，通过回归测试覆盖 hover 打开与离开关闭。

## Migration Plan

1. 修改 `Menu.tsx`，移除 `.cm-menu__trigger` wrapper，仅直接渲染 `triggerElement`。
2. 删除 `index.scss` 中 `.cm-menu__trigger` 样式，并确认 popup 定位仍依赖 `.cm-menu`。
3. 更新测试与开发示例，改为断言新的 DOM 结构。
4. 在 `[UnReleased]` CHANGELOG 中标注 BREAKING CHANGE，提醒使用方迁移 `.cm-menu__trigger` 相关依赖。
5. 如出现兼容性问题，可通过恢复 wrapper 的单点实现回滚，但这会撤销本次 DOM 契约变更。

## Open Questions

- 暂无阻塞性开放问题；实现阶段只需确认现有测试中是否存在对 `.cm-menu__trigger` 的硬编码断言，并一并迁移。
