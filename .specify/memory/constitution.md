<!--
Sync Impact Report
Version change: template -> 1.0.0
Modified principles: [PRINCIPLE_1_NAME]/[PRINCIPLE_2_NAME]/[PRINCIPLE_3_NAME]/[PRINCIPLE_4_NAME]/[PRINCIPLE_5_NAME] -> 代码质量门禁/测试标准/用户体验一致性/性能要求/可维护性与清晰性
Added sections: 性能标准, 开发流程与质量门禁
Removed sections: None
Templates requiring updates:
- ✅ `.specify/templates/plan-template.md`
- ✅ `.specify/templates/spec-template.md`
- ✅ `.specify/templates/tasks-template.md`
Follow-up TODOs: None
-->
# @sysui/chameleon Constitution

## Core Principles

### 代码质量门禁
代码必须满足 TypeScript 严格模式、ESLint 与 Prettier 规则，不允许
`any`、类型错误抑制（`@ts-ignore`/`@ts-expect-error`）或未使用变量。
所有变更必须通过 lint、format 与 build 质量门禁。

### 测试标准
所有影响行为或公共 API 的变更必须有测试覆盖（单测或集成测）。
测试需先失败后实现，通过后方可合入；禁止删除或跳过现有测试来“通过”。
仅文档或纯样式改动可在规格中明确豁免测试，并给出理由。

### 用户体验一致性
组件外观与交互必须遵循主题 tokens 与现有组件模式，避免临时样式或
不一致的交互反馈。公共 API 与默认行为应保持一致性，必要时提供向后
兼容的迁移路径。

### 性能要求
新增或修改不得引入明显的运行时开销、重渲染或包体积回退。涉及性能
敏感路径的变更必须在规格中定义可度量指标并验证（如渲染时延、
包体积变化或交互流畅度）。

### 可维护性与清晰性
代码以可读性和可维护性优先，保持模块边界清晰、职责单一，避免重复
实现与过度抽象。复杂逻辑必须有清晰注释或文档支持其必要性。

## 性能标准

- 对外发布的组件包必须保持良好的 tree-shaking 与按需引入能力。
- 新依赖必须评估包体积与运行时成本，优先选择轻量方案。
- 规格文档必须标注性能敏感点与验证方法（如基准、对比或快照）。

## 开发流程与质量门禁

- 所有提交必须通过 `yarn lint`、`yarn test`、`yarn build`。
- 任何违反宪章的变更必须在计划文档的 Constitution Check 中记录原因。
- 变更必须更新相关规范与模板，确保治理规则持续一致。

## Governance

- 宪章优先级最高，任何流程或规范不得与本宪章冲突。
- 修订必须记录在宪章中，包含版本号、日期与修改摘要。
- 版本遵循语义化：新增原则或重大扩展为 MINOR，原则移除或重定义为
  MAJOR，措辞澄清为 PATCH。
- 所有 PR/评审必须检查宪章符合性，并在必要时要求规格或任务清单调整。

**Version**: 1.0.0 | **Ratified**: 2026-01-19 | **Last Amended**: 2026-01-19
