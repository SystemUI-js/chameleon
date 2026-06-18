## Purpose

定义 `CLoading` 组件在开发预览中的演示要求，确保开发者能够直观验证不同主题与状态下的加载效果。

## Requirements

### Requirement: 开发预览提供 `CLoading` 组件展示页面

开发预览 SHALL 提供一个展示 `CLoading` 组件的示例页面。该页面 MUST 包含至少一个可直接查看的 `CLoading` 实例，使开发者能够确认组件渲染正常。

#### Scenario: 预览中查看 `CLoading` 基本展示

- **WHEN** 开发者打开 `CLoading` 的开发预览示例
- **THEN** 页面 MUST 展示至少一个正在加载状态的 `CLoading` 组件

### Requirement: 开发预览展示不同主题下的 `CLoading` 效果

开发预览 SHALL 在同一页面中展示 `CLoading` 在不同主题（default、win98、winxp）下的视觉效果，使开发者能够对比验证主题化后的加载样式。

#### Scenario: 预览中切换主题查看加载效果

- **WHEN** 开发者在 `CLoading` 示例页面中查看不同主题区域
- **THEN** 每个主题区域 MUST 展示应用了对应主题的 `CLoading` 组件，且视觉样式 MUST 与主题一致

### Requirement: 开发预览展示不同尺寸与状态的 `CLoading`

开发预览 SHALL 展示 `CLoading` 在不同尺寸配置或状态（如局部加载、全屏加载、带文字/不带文字）下的表现，使开发者能够验证组件在各种使用场景中的可用性。

#### Scenario: 预览中查看局部与全屏加载

- **WHEN** 开发者在 `CLoading` 示例页面中查看不同状态区域
- **THEN** 页面 MUST 同时展示局部加载与全屏加载的示例，且各示例 MUST 正常渲染

