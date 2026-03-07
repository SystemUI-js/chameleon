## Context

当前 `CWindowManager` 仅透传渲染 `props.children`，没有窗口注册能力，也没有可控的内部渲染源。`CWindow` 目前是 class 组件，占位实现具备可继承特性，因此适合通过“基类+子类识别”来建立统一注册机制。

约束条件：
- 保持现有 class 组件架构，不引入新依赖。
- 在 TypeScript 严格模式下实现，避免 `any`。
- 兼容两种输入来源：`props.children` 中可识别的窗口，以及运行时通过 `addWindow` 注入的窗口。

相关方：
- 主题组合层（例如 `win98`）需要继续通过 `<CWindowManager>{children}</CWindowManager>` 使用。
- 后续窗口能力（层级、布局、生命周期）需要基于注册机制继续扩展。

## Goals / Non-Goals

**Goals:**
- 为 `CWindowManager` 建立私有注册表（建议命名：`registeredWindowConstructors`），统一存储被允许渲染的窗口类。
- 支持识别并注册 `children` 中的 `CWindow`/`CWindow` 子类。
- 新增 `addWindow` API，用于运行时注册窗口类。
- `render` 阶段从注册表生成并渲染窗口实例，形成可预测的渲染结果。

**Non-Goals:**
- 不在本次变更中重做窗口拖拽、缩放、Dock、z-index 等完整窗口系统。
- 不引入全局状态管理或跨屏分发机制。
- 不改变现有主题结构与公开包发布流程。

## Decisions

### 决策 1：注册对象为“窗口构造器（class）”，而非已实例化对象
- 方案 A（采纳）：注册 `typeof CWindow`（包含子类构造器），`render` 时再实例化为 React 元素。
- 方案 B（备选）：注册 `CWindow` 实例。
- 取舍理由：
  - A 更契合 React 渲染模型（元素在 render 阶段构建），更容易保证幂等。
  - A 避免在生命周期外保留 React 组件实例，降低状态漂移风险。
  - B 容易与 React 内部实例管理冲突，不利于后续扩展。

### 决策 2：子类识别使用“构造器原型链判断”
- 方案 A（采纳）：对候选构造器使用 `candidate === CWindow || CWindow.prototype.isPrototypeOf(candidate.prototype)`。
- 方案 B（备选）：通过名字或静态字段标识。
- 取舍理由：
  - A 对继承关系语义准确，避免字符串约定脆弱性。
  - B 容易被重命名、压缩或人为遗漏破坏。

### 决策 3：children 解析采用 `React.Children.forEach + React.isValidElement`
- 方案 A（采纳）：沿用仓库已有 children 处理风格，统一遍历与类型守卫。
- 方案 B（备选）：`React.Children.toArray` + `filter/map`。
- 取舍理由：
  - A 与当前代码风格一致，语义直观，易于插入注册副作用控制。
  - B 可读性也可接受，但与现有模式不完全一致。

### 决策 4：去重策略按构造器引用去重
- 方案 A（采纳）：注册表使用 `Set<typeof CWindow>` 或数组+引用判重，避免重复注册同一类。
- 方案 B（备选）：按类名去重。
- 取舍理由：
  - A 不受类名变化影响，运行时更稳定。
  - B 在压缩、重命名或同名类场景下有冲突风险。

### 决策 5：`addWindow` 接口只接受已验证类型
- 方案 A（采纳）：`addWindow(windowCtor: typeof CWindow): void` 并在内部再做防御性校验。
- 方案 B（备选）：接受 `unknown` 后内部宽松转换。
- 取舍理由：
  - A 提前把错误暴露在调用侧，类型系统可直接约束。
  - B 虽灵活，但会弱化静态安全与可维护性。

## Risks / Trade-offs

- [Risk] 注册表与 `children` 的重复来源可能导致重复渲染  
  → Mitigation：使用构造器引用去重，并在渲染前构造唯一列表。

- [Risk] 在 `render` 中做注册副作用可能触发不可预期行为  
  → Mitigation：把 children 扫描注册放在受控流程（如生命周期或纯函数提取）并保证幂等。

- [Risk] 子类判断在非 class 组件输入下可能抛错  
  → Mitigation：先做函数/原型存在性检查，再执行原型链判断。

- [Risk] 仅基于 class 注册，短期不覆盖 function component window 形态  
  → Mitigation：在文档明确本次能力边界，后续通过扩展注册协议支持更多类型。

## Migration Plan

1. 在 `CWindowManager` 中引入私有注册表字段与类型别名。
2. 实现 `addWindow`，包含防御性校验与去重逻辑。
3. 增加 children 扫描逻辑：识别 `CWindow`/子类并写入注册表。
4. 调整 `render`：由注册表生成元素并输出。
5. 补充/更新测试：覆盖子类识别、`addWindow` 注册、去重、渲染结果。
6. 如有回归，回滚到仅透传 children 的实现，并保留类型与测试改动以便二次迭代。

## Open Questions

- `render` 是否需要“注册表渲染 + 原始 children 渲染”并存，还是完全以注册表为准？
- `addWindow` 是否需要返回卸载句柄（例如 remove 函数）以支持动态移除？
- 对于同一窗口类的多实例诉求，是否需要引入实例化参数或工厂协议？
