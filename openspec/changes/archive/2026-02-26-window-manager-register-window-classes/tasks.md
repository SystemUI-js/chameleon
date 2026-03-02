## 1. Types and Registry Foundation

- [x] 1.1 在 `src/components/Window/WindowManager.tsx` 定义窗口构造器类型（`typeof CWindow`）与注册表字段（`registeredWindowConstructors`）
- [x] 1.2 为注册表实现基于构造器引用的去重能力（使用 `Set` 或等价判重逻辑）

## 2. Registration API and Validation

- [x] 2.1 实现 `addWindow(windowCtor: typeof CWindow): void` 接口并接入注册表
- [x] 2.2 在 `addWindow` 中实现防御性类型校验，确保仅 `CWindow`/子类可注册
- [x] 2.3 对无效构造器输入实现“拒绝注册”行为并保持状态不变

## 3. Children Discovery and Integration

- [x] 3.1 在 `CWindowManager` 中实现 `props.children` 扫描逻辑（`React.Children.forEach` + `React.isValidElement`）
- [x] 3.2 实现 `CWindow` 子类识别（`candidate === CWindow` 或基于原型链判断）
- [x] 3.3 将 children 发现的窗口构造器并入注册表，并与 `addWindow` 共享去重语义

## 4. Render Path Update

- [x] 4.1 调整 `render`，从内部注册表生成并渲染每个唯一窗口类的输出
- [x] 4.2 确保非 `CWindow` 类型不会进入 manager-owned 渲染输出

## 5. Tests for Spec Scenarios

- [x] 5.1 新增/更新测试：children 直接 `CWindow` 可被注册
- [x] 5.2 新增/更新测试：children 中 `CWindow` 子类可被注册
- [x] 5.3 新增/更新测试：`addWindow` 对合法构造器注册成功
- [x] 5.4 新增/更新测试：`addWindow` 对非法构造器拒绝注册
- [x] 5.5 新增/更新测试：children + `addWindow` 重复来源仅保留单一注册项
- [x] 5.6 新增/更新测试：render 仅包含注册表中的有效窗口类输出

## 6. Quality Verification

- [x] 6.1 对变更文件执行类型与静态检查（含 LSP diagnostics、lint）
- [x] 6.2 运行相关测试并确认通过（覆盖注册、去重、渲染行为）
- [x] 6.3 执行构建验证，确保组件库构建成功
