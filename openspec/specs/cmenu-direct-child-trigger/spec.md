## Purpose

定义 `CMenu` 根触发器在移除中间 wrapper 后的 DOM 结构、触发语义与关闭边界要求，确保直接渲染的触发元素仍保持既有交互与无障碍能力。

## Requirements

### Requirement: 根触发器直接以传入 children 元素承载触发语义

`CMenu` SHALL 将传入的 `children` 元素直接渲染为 `.cm-menu` 根容器的子节点，并且 MUST NOT 额外插入 `.cm-menu__trigger` 包裹节点作为根触发器中间层。

#### Scenario: 根触发器不再生成中间 wrapper

- **WHEN** 使用方传入一个单一 React 元素作为 `CMenu` 的根触发器
- **THEN** 渲染结果中的该触发元素直接成为 `.cm-menu` 的子节点，且 DOM 中不存在 `.cm-menu__trigger` 包裹节点

#### Scenario: 弹层仍与直接触发器同属根容器

- **WHEN** 根菜单被渲染且当前存在 popup 内容
- **THEN** `.cm-menu` 根容器同时包含直接触发器元素与菜单弹层，且不通过额外触发器 wrapper 改变二者层级关系

### Requirement: 直接触发器必须保留现有触发交互与 ARIA 语义

在移除根触发器 wrapper 后，`CMenu` MUST 继续将根级触发交互与无障碍属性注入到传入的 `children` 元素上，包括 `click` / `hover` 打开逻辑，以及 `aria-haspopup`、`aria-expanded`、`aria-controls`。

#### Scenario: click 模式下直接触发器可打开菜单

- **WHEN** `CMenu` 配置为 `trigger: 'click'` 且用户点击作为直接根触发器的 `children` 元素
- **THEN** 根菜单按既有语义打开，并且被注入的触发元素暴露正确的展开态 ARIA 属性

#### Scenario: hover 模式下直接触发器可打开菜单

- **WHEN** `CMenu` 配置为 `trigger: 'hover'` 且用户将指针移入作为直接根触发器的 `children` 元素
- **THEN** 根菜单按既有 hover 语义打开，并且触发元素仍保留 `aria-haspopup` 与可关联弹层的 ARIA 标识

### Requirement: 移除 wrapper 后必须保持根容器的关闭与命中边界语义

即使根触发器改为直接子元素，`CMenu` MUST 继续以 `.cm-menu` 根容器作为弹层定位、外部点击关闭与 hover 离开关闭的边界，不得因为 DOM 结构收敛而改变关闭判定范围。

#### Scenario: 外部点击仍关闭直接触发器菜单

- **WHEN** 根菜单已经通过直接触发器打开，随后用户点击 `.cm-menu` 根容器外部区域
- **THEN** 系统关闭根菜单并清除当前展开状态

#### Scenario: hover 模式离开根容器后关闭菜单

- **WHEN** 根菜单通过直接触发器在 `hover` 模式下打开，且用户将指针移出 `.cm-menu` 根容器
- **THEN** 系统按照既有 hover 关闭语义关闭根菜单，而不是要求依赖已移除的 wrapper 节点
