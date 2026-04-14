## Why

当前组件库已有按钮、单选框、选择器等基础表单与交互组件，但缺少复选框能力。补齐 `CCheckbox` 能让使用方以统一主题、类名和导出方式构建多选或布尔开关场景，避免在业务侧重复实现样式与可访问性语义。

## What Changes

- 新增 `CCheckbox` 复选框组件，支持标签内容、禁用态、受控/非受控选中态以及原生复选框交互语义。
- 为复选框提供稳定的 `cm-checkbox` 系列类名，并接入现有主题 className 合并机制。
- 通过组件入口与库公共入口导出 `CCheckbox` 及其 props 类型，确保消费者可直接从包入口使用。
- 增加对应测试覆盖基础渲染、状态变更、禁用态、类名与公共导出行为。

## Capabilities

### New Capabilities
- `ccheckbox-component`: 定义 `CCheckbox` 的复选框组件能力，包括受控/非受控选中行为、禁用态、标签渲染、基础可访问性语义、稳定类名与公共入口导出。

### Modified Capabilities

## Impact

- 影响 `src/components/` 下的组件源码、样式与组件聚合导出。
- 影响 `src/index.ts` 公共库入口导出。
- 影响 `tests/` 中的组件测试覆盖。
- 不引入新的运行时依赖，不包含破坏性变更。
