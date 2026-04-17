## Context

当前组件库的包入口同时承担了两类职责：一类是组件与主题定义导出，另一类是 `src/system/` 下 legacy system shell 与注册表兼容层导出。`src/system/registry.ts` 负责维护 `SYSTEM_TYPE`、`THEME`、默认映射、system-theme 合法矩阵以及 `resolveThemeDefinition` 等解析逻辑；`SystemHost`、`DefaultSystem`、`WindowsSystem` 则继续把主题与“系统壳层”绑定在一起。

这套 system layer 与“纯组件库”的定位不一致，也让包入口暴露了额外的运行时、类型与测试负担。此次变更的目标是在不改变现有纯主题定义内容的前提下，移除 system layer 相关公开 API，并将主题定义导出改为直接来自 `src/theme/*`，不再经过 registry 计算链路。

## Goals / Non-Goals

**Goals:**
- 移除 `src/system/` 相关 runtime、类型、常量与解析函数的公开导出。
- 将包入口中的主题定义导出直接接到 `src/theme/default`、`src/theme/win98`、`src/theme/winxp`。
- 删除或改写依赖 legacy system layer 的测试，保留组件库与纯主题定义的公共契约验证。
- 让仓库内部不再依赖 system registry 才能完成主题导出与基础预览。

**Non-Goals:**
- 不重构现有主题 definition 的对象结构、token 命名或样式实现。
- 不调整组件本身的行为、样式类名约定或窗口组件功能。
- 不提供兼容旧 API 的 runtime shim、弃用警告层或临时代理实现。
- 不在本次变更中新增新的主题或新的系统壳层抽象。

## Decisions

### 1. 包入口只保留组件库与纯主题定义导出

`src/index.ts` 将停止 re-export `src/system/registry`、`src/system/SystemHost` 及其关联类型；`defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition` 改为直接导出对应 `src/theme/*` 中的主题定义，而不是调用 `resolveThemeDefinition(...)` 间接生成。

这样做可以把包入口重新收敛为“组件 + 主题”的最小公开面，并消除 theme definition 对 system registry 的反向依赖。

**备选方案：**保留旧导出但内部改为空实现或 warning 包装。  
**不采用原因：**这会继续暴露已不符合定位的 API，增加维护与测试成本，也会弱化 breaking change 的边界。

### 2. 彻底删除 `src/system/**`，而不是改为内部私有实现

当包入口与测试不再依赖 system layer 后，直接删除 `src/system/**` 比“改成内部私有模块”更合适。system shell、注册表、默认系统切换 UI、system-theme 矩阵本身就是此次要移除的能力，继续保留会留下死代码、误导后续开发，并可能被内部新代码再次依赖。

**备选方案：**保留 `src/system/**` 仅供 dev 或内部预览使用。  
**不采用原因：**这会持续保留 theme 与 system 的耦合链路，使后续删除成本更高，也不利于从架构上明确“组件库不再提供系统壳层”。

### 3. dev / 测试场景改为直接消费纯主题定义

dev 预览与测试若仍需要切换主题，应直接使用 `src/theme/*` 导出的纯主题定义与 `Theme` 组件，而不是通过 `SYSTEM_TYPE`、`THEME`、`DEFAULT_THEME_BY_SYSTEM` 或 `resolveThemeDefinition` 间接完成。

这保证仓库内部与对外契约保持一致：主题能力来自 theme 模块本身，而不是来自额外的 registry 解释层。

**备选方案：**在 dev/test 中保留 registry，仅对外移除导出。  
**不采用原因：**内部继续依赖 registry 会掩盖真实迁移成本，且容易造成后续又把 registry 暴露回 public API。

### 4. 测试从“legacy export 快照”转向“当前公开契约”验证

`tests/LegacyPublicExports.test.tsx` 这类专门锁定 `SystemHost`、`SYSTEM_TYPE`、`THEME`、`DEFAULT_SYSTEM_TYPE`、`resolveThemeDefinition` 的测试应删除；`tests/ThemeExports.test.ts`、`tests/PublicThemeMatrix.test.tsx` 这类主题导出测试需要改写为验证新的直接导出契约，而不是验证 registry 解析链路。

这样可以避免测试继续为已废弃能力背书，并把测试重心放回组件库仍承诺支持的 API。

**备选方案：**保留旧测试并新增一层兼容断言。  
**不采用原因：**与本次 breaking change 目标冲突，也会让测试语义混乱。

## Risks / Trade-offs

- **[Risk]** 下游消费者仍在导入 `SystemHost` 或 registry 常量，升级后会直接编译失败。  
  **Mitigation：**在 CHANGELOG / 发布说明中明确列出移除项与迁移方向，强调改用组件级 API 与纯主题定义。

- **[Risk]** 主题定义改为直连 `src/theme/*` 后，若当前 resolved theme 与纯主题 definition 结构存在细微差异，可能引入行为回归。  
  **Mitigation：**更新主题导出测试，锁定导出的对象结构与关键字段，确保入口导出与 theme 模块保持一致。

- **[Risk]** 删除 `src/system/**` 后仍可能残留内部引用，导致 TypeScript、Jest 或构建失败。  
  **Mitigation：**在删除前完成全局搜索与入口/测试改线；删除后执行 lint、test、build 作为兜底验证。

- **[Trade-off]** 直接移除旧 API 会让升级更陡峭，但能更快结束历史兼容负担。  
  **Mitigation：**接受本次变更为明确的 breaking change，不引入过渡层，换取更清晰的长期边界。

## Migration Plan

1. 调整 `src/index.ts`，停止导出所有 `src/system/*` 符号，并将主题定义改为直接导出 `src/theme/*` 中的 canonical definitions。
2. 搜索并替换仓库内对 `src/system/registry`、`SystemHost` 及相关类型/常量的直接依赖，优先处理 dev 入口与测试文件。
3. 删除 `src/system/**` 实现与不再需要的类型声明。
4. 删除 legacy public exports 测试，并把主题相关测试改写为覆盖新的公共契约。
5. 运行 `yarn lint`、`yarn test`、`yarn build`，确认没有残留引用与行为回归。
6. 以 breaking change 形式发布，并在 `[UnReleased]` 中记录迁移说明。

**Rollback：**若发布前或集成验证中发现关键消费者受阻，可基于当前变更前的提交恢复 `src/index.ts` 的旧导出与 `src/system/**` 文件，再重新评估是否需要分阶段迁移。

## Open Questions

- `pureDefaultThemeDefinition`、`pureWin98ThemeDefinition`、`pureWinXpThemeDefinition` 这类别名是否仍需保留；还是统一只保留 `defaultThemeDefinition`、`win98ThemeDefinition`、`winXpThemeDefinition` 作为 canonical 导出？
- 是否存在仓库外文档、示例或脚手架代码仍在展示 `SystemHost` / system registry 用法，需要在实现阶段同步更新？
