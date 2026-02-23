## Why

缺少统一的挂载点机制，导致像开始菜单这类需要按主题变更位置的 UI 只能硬编码在布局里。引入可索引的挂载点与挂载组件，能让布局与组件解耦，满足多主题差异化布局。

## What Changes

- 新增 MountProvider 组件，初始化时注册到全局命名挂载点，销毁时注销，重复注册抛出异常。
- 新增 MountConsumer 高阶组件，将内容渲染到指定 MountProvider，支持排他（exclude）与优先级。
- 在 demo 的整体布局中提供上下左右中 5 个挂载点，并将开始菜单按主题挂载到顶部或底部。
- 主题行为扩展以支持开始菜单挂载位置（default 顶部、Win98/WinXP 底部）。

## Capabilities

### New Capabilities
- `mount-points`: 全局命名挂载点注册与挂载渲染机制（含排他与优先级）。

### Modified Capabilities
- （无）

## Impact

- 组件层：`src/components/` 新增 MountProvider/MountConsumer 相关实现与导出。
- 主题行为：`src/theme/types.ts` 与各主题配置可能增加开始菜单挂载位置配置。
- Demo：`src/dev/main.tsx` 布局改造以提供 5 个挂载点并示例挂载开始菜单。
- 可能新增样式或辅助类型以支持挂载点布局。
