## 1. CWidget 基类引入

- [x] 1.1 新增 `src/components/Widget/Widget.tsx`，定义 `CWidget` 与位置/尺寸 Props（`x`、`y`、`width`、`height`）
- [x] 1.2 在 `CWidget` 中实现基础外框容器渲染，并确保派生类可复用

## 2. 继承链与管理器判定迁移

- [x] 2.1 修改 `src/components/Window/Window.tsx`，将 `CWindow` 从 `React.Component` 迁移为继承 `CWidget`
- [x] 2.2 修改 `src/components/Window/WindowManager.tsx`，将 `windowCtor` 类型基准从 `CWindow` 调整为 `CWidget`
- [x] 2.3 修改 `src/components/Window/WindowManager.tsx`，将 `isWindowConstructor` 原型链判定基准从 `CWindow.prototype` 调整为 `CWidget.prototype`

## 3. 测试与行为一致性验证

- [x] 3.1 更新 `tests/WindowManager.test.tsx`，将无效构造器断言基准迁移到 `typeof CWidget`
- [x] 3.2 保持并验证子类可注册、非法类拒绝、重复构造器去重三类行为断言

## 4. 质量校验与收尾

- [x] 4.1 运行与本变更相关测试并修复失败（至少覆盖 `WindowManager` 相关测试）
- [x] 4.2 运行项目基础校验（lint/typecheck/build）并确认无新增问题
- [x] 4.3 复核改动范围仅限 `Widget/Window/WindowManager` 及相关测试，确保不引入额外依赖
