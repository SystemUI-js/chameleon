## 1. Theme Switch Entrypoint

- [x] 1.1 更新 `src/dev/main.tsx`，移除对 `Win98Theme` 的直接固定挂载，改为主题切换组件挂载入口
- [x] 1.2 定义代码层面的主题常量（至少 `win98`、`winxp`）并实现常量驱动的主题分支渲染
- [x] 1.3 验证主题切换入口不改变 `CScreen` 在 theme 内声明的约束

## 2. WinXp Theme Capability

- [x] 2.1 新增 `WinXpTheme` 组件并保持与现有主题切换机制一致的挂载契约
- [x] 2.2 在主题导出入口中补充 `WinXpTheme` 对外导出（如 `src/index.ts` 与相关聚合导出）
- [x] 2.3 为 `WinXpTheme` 增加最小可验证测试（可被常量切换入口命中）

## 3. Screen Manager Registration Behavior

- [x] 3.1 在 `src/components/Screen/ScreenManager.tsx` 引入屏幕构造器注册表（构造器集合 + 元素映射）
- [x] 3.2 实现 `props.children` 扫描与 `CScreen`/子类识别，注册合法屏幕构造器
- [x] 3.3 实现 `addScreen` 运行时注册 API，并对非法构造器执行拒绝注册
- [x] 3.4 实现重复构造器去重与基于注册表的渲染输出语义

## 4. Shared Abstraction Evaluation

- [x] 4.1 对比 `CWindowManager` 与 `CScreenManager` 的共享逻辑，形成“可抽象/不抽象”的代码级判断
- [x] 4.2 若共享边界清晰，则提取轻量复用层（基类或私有通用函数）并保持现有 API 语义不变
- [x] 4.3 若不满足抽象门槛，则保留具体实现并在代码中保留清晰的决策说明（注释或变更文档）（N/A，本次已满足 4.2）

## 5. Residual Test Cleanup and Coverage

- [x] 5.1 移除与当前实现不一致、且依赖不存在 `ThemeProvider`/`useTheme` 的残留测试
- [x] 5.2 新增/更新 `CScreenManager` 场景测试：children 注册、addScreen 注册、非法拒绝、重复去重、渲染过滤
- [x] 5.3 新增/更新主题切换测试：`win98` 与 `winxp` 常量选择路径可验证

## 6. Verification

- [x] 6.1 运行变更相关测试并修复失败
- [x] 6.2 运行 `yarn lint`、`yarn test`、`yarn build`，确认无新增问题
- [x] 6.3 复核改动范围与 spec/design 一致，确保未引入额外范围外变更
