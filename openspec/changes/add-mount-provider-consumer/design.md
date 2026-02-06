## Context

当前组件库已有 Portal 类组件（Popover/Modal/ContextMenu）与 Map 注册表模式（WindowMenu），但没有统一的“挂载点”概念。开始菜单与主题布局需要解耦，因此引入命名挂载点与挂载消费者，并在 demo 中按主题改变挂载位置。

## Goals / Non-Goals

**Goals:**
- 提供 MountProvider 作为命名挂载点，支持全局注册/注销与唯一性校验。
- 提供 MountConsumer HOC，将内容渲染到命名挂载点，支持排他与优先级。
- demo 中创建上下左右中 5 个挂载点，开始菜单按主题挂载到顶部或底部。

**Non-Goals:**
- 不引入新的第三方依赖。
- 不实现跨文档/iframe 的挂载。
- 不处理 SSR 适配与服务端渲染输出。

## Decisions

- 使用模块级 Map 作为全局注册表：`Map<string, MountSlot>`，MountProvider 在 `useEffect` 中注册并在 cleanup 时注销。重复注册直接抛出异常，保证 name 唯一。
- MountProvider 暴露一个稳定的 DOM 容器作为挂载目标，MountConsumer 使用 `createPortal` 将内容渲染到该容器，遵循项目现有 portal 模式。
- MountConsumer 采用 HOC/组件包装形式，接收 `name`、`exclude`、`priority`，并在挂载点内进行排他决策：当存在 `exclude=true` 的消费者时，仅渲染优先级最高者；否则渲染全部。
- 主题行为新增“开始菜单挂载位置”配置，demo 根据 `theme.behavior` 选择将开始菜单挂载到 top/bottom。

## Risks / Trade-offs

- [全局注册表与 React 生命周期错配] → 在注册/注销时保证 cleanup 完整，避免重复渲染或泄漏。
- [排他逻辑复杂度] → 设计明确的优先级比较规则（数值越大优先）并保证稳定排序。
- [挂载点缺失] → 当未找到 name 对应挂载点时返回 null，并在开发模式下提示。
