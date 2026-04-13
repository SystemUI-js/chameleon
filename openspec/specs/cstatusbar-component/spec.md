## Purpose

定义 `CStatusBar` 与 `CStatusBarItem` 的独立状态栏能力，包括横向容器布局、可独立复用的状态单元、基础样式扩展钩子、与 `CWindow` 的组合关系以及公共入口导出要求。

## Requirements

### Requirement: `CStatusBar` 提供独立的状态栏容器

组件库 SHALL 提供 `CStatusBar` 公开组件。`CStatusBar` MUST 能在没有 `CWindow` 或其他专用父组件的前提下独立渲染，并且 SHALL 默认按水平方向排列其直接渲染出的内容，以承载连续的状态信息单元。

#### Scenario: 独立渲染横向状态栏

- **WHEN** 使用方单独渲染一个包含多个可见子内容的 `CStatusBar`
- **THEN** 组件 MUST 渲染为一个可见状态栏容器，并按声明顺序横向排列这些子内容

### Requirement: `CStatusBarItem` 提供可复用的状态单元承载能力

组件库 SHALL 提供 `CStatusBarItem` 公开组件，用于包裹单个状态栏单元内容。`CStatusBarItem` MUST 保持其子内容可见，并且 SHALL 既可以作为 `CStatusBar` 的子项使用，也可以在其他布局上下文中独立使用，而不依赖专用上下文或注册步骤。

#### Scenario: 在 `CStatusBar` 中渲染状态单元

- **WHEN** 使用方在 `CStatusBar` 内声明一个或多个 `CStatusBarItem`
- **THEN** 每个 `CStatusBarItem` MUST 作为独立状态单元渲染，并显示各自承载的子内容

#### Scenario: 在非状态栏上下文中独立使用状态单元

- **WHEN** 使用方在普通容器中直接渲染 `CStatusBarItem`
- **THEN** 组件 MUST 正常渲染其子内容，且不要求存在 `CStatusBar` 父级

### Requirement: 状态栏组件支持基础样式扩展钩子

`CStatusBar` 与 `CStatusBarItem` SHALL 保留组件库提供的基础样式标识，并且 MUST 接受并合并使用方传入的 `className`，使消费者可以在不覆盖组件核心结构的前提下扩展状态栏与状态单元的展示样式。

#### Scenario: 使用方传入自定义类名

- **WHEN** 使用方为 `CStatusBar` 或 `CStatusBarItem` 传入自定义 `className`
- **THEN** 渲染结果 MUST 同时保留组件库基础样式标识与使用方自定义类名

### Requirement: 状态栏与窗口组件通过组合方式协作

组件库 MUST 保持 `CWindow` 不内建状态栏专用插槽或预置状态栏结构。使用方 SHALL 能通过普通子节点组合的方式，将 `CStatusBar` 放入 `CWindow` 内部的任意合适位置，并获得与声明顺序一致的渲染结果。

#### Scenario: 窗口默认不带状态栏

- **WHEN** 使用方渲染一个未显式包含 `CStatusBar` 子节点的 `CWindow`
- **THEN** `CWindow` MUST 不额外渲染任何预置状态栏结构

#### Scenario: 在窗口中组合状态栏

- **WHEN** 使用方将 `CStatusBar` 作为 `CWindow` 内部声明的一部分进行渲染
- **THEN** 状态栏 MUST 按其声明位置渲染，且不要求使用额外的 `statusBar` 属性或专用 API

### Requirement: 状态栏组件可从公共入口导入

组件库 SHALL 通过公共导出入口暴露 `CStatusBar` 与 `CStatusBarItem`，使消费者可以直接从包入口导入并使用这些组件，而无需依赖内部文件路径。

#### Scenario: 消费者从包入口导入状态栏组件

- **WHEN** 消费者从组件库公共入口导入 `CStatusBar` 与 `CStatusBarItem`
- **THEN** 导入 MUST 成功，且这两个组件可用于构建状态栏界面
