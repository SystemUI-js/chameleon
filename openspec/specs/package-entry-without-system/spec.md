## Purpose

定义组件库包入口在移除 legacy system layer 后的公开契约，确保使用方继续通过包入口消费组件与纯主题定义，同时不再依赖任何 system shell 或 registry 公开能力。

## Requirements

### Requirement: 包入口 SHALL 收敛为组件库与纯主题定义公开面

在移除 legacy system layer 后，组件库公共入口 MUST 继续提供既有组件级 API 与纯主题定义导出，使使用方能够仅通过包入口消费组件和主题，而不再依赖任何 system shell 或 registry 公开能力。

#### Scenario: 使用方可继续从包入口导入组件与主题定义

- **WHEN** 使用方从组件库公共入口导入既有公开组件、`Theme` 能力以及 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition`
- **THEN** 这些组件与纯主题定义 MUST 继续作为受支持的公共契约可用，且不要求同时导入任何 legacy system 符号

### Requirement: legacy system 公开 API MUST 从包入口移除

组件库公共入口 MUST NOT 再暴露 `SystemHost`、`SYSTEM_TYPE`、`THEME`、`DEFAULT_SYSTEM_TYPE`、`DEFAULT_THEME_BY_SYSTEM`、`SYSTEM_THEME_MATRIX`、`resolveSystemTypeDefinition`、`assertValidSystemThemeSelection`、`resolveThemeDefinition` 及其关联类型，因为这些能力已不再属于“纯组件库”公开表面。

#### Scenario: 包入口不再包含 legacy system 导出

- **WHEN** 使用方检查组件库公共入口的公开导出集合
- **THEN** 公开契约中 MUST NOT 包含任何 legacy system shell、registry 常量、解析函数或其关联类型导出

#### Scenario: 使用方迁移时只能依赖组件级 API 与纯主题定义

- **WHEN** 使用方升级到包含本次 breaking change 的版本并查看公共入口可用能力
- **THEN** 迁移路径 MUST 明确落在组件级 API 与纯主题定义导出上，而不是继续依赖已移除的 system layer 公开能力

### Requirement: 主题定义导出 MUST 直接对应 canonical theme modules

组件库公共入口导出的 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition` MUST 直接对应各自 theme 模块中的 canonical theme definition，不得要求通过 system registry、system-theme matrix 或解析函数间接获得这些公开主题定义。

#### Scenario: 默认主题定义直接来自 default theme 模块

- **WHEN** 使用方从公共入口获取 `defaultThemeDefinition`
- **THEN** 该导出 MUST 与 default theme 模块中定义的 canonical theme definition 保持一致，而不是依赖 `resolveThemeDefinition` 一类 registry 解析链路生成

#### Scenario: Win98 与 WinXP 主题定义直接来自各自 theme 模块

- **WHEN** 使用方从公共入口获取 `win98ThemeDefinition` 与 `winXpThemeDefinition`
- **THEN** 这两个导出 MUST 分别与对应 theme 模块中的 canonical theme definition 保持一致，且不依赖默认 system/theme 映射矩阵参与计算
