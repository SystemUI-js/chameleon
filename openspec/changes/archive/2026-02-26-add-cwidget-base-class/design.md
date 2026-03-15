## Context

当前窗口体系中，`CWindow` 直接继承 `React.Component`，而 `CWindowManager` 使用 `CWindow` 作为 `windowCtor` 的类型与运行时判定基准。该做法能满足当前功能，但把“可注册窗口”的抽象锁定在具体实现类，导致后续若出现更多窗口形态时，管理器边界会持续耦合到 `CWindow`。本次变更希望引入一个更稳定的抽象层 `CWidget`，承载基础外框与位置/尺寸 Props，并将构造器识别迁移到基类层。

约束条件：
- 保持现有 `CWindowManager` 行为语义不回退（子类可注册、非法类拒绝、去重有效）。
- 不引入新的第三方依赖。
- 变更聚焦 `Widget/Window/WindowManager` 与对应测试，不扩散到无关模块。

## Goals / Non-Goals

**Goals:**
- 引入 `CWidget` 基类，统一窗口体系的基础组件外框与尺寸/位置 Props 抽象。
- 将 `CWindow` 继承关系调整为 `CWindow extends CWidget`，保留现有窗口语义能力。
- 将 `CWindowManager` 的 `windowCtor` 类型守卫与运行时原型链判定从 `CWindow` 迁移到 `CWidget`。
- 通过测试验证迁移后行为一致：合法子类可注册、非法组件被拒绝、重复注册不重复渲染。

**Non-Goals:**
- 不在本次变更中重构 `CWindow` 的业务交互（拖拽、主题、菜单等）。
- 不改动 `CWindowManager` 的外部调用模式（如 API 名称）之外的接口设计。
- 不处理与 `CWidget` 无关的导出体系或历史遗留问题。

## Decisions

1. 采用继承抽象（`CWidget`）而非在管理器中添加额外标记字段。
   - 选择原因：`CWindowManager` 已采用构造器与原型链判断，迁移到基类能保持机制一致，同时降低对具体窗口实现类的耦合。
   - 备选方案：使用静态标识字段（例如 `isWidget = true`）进行判定。
   - 未采用原因：标识字段更易被误用或遗漏，且不如继承关系直观。

2. `CWidget` 只承载基础外框与位置/尺寸 Props，不提前承载窗口行为。
   - 选择原因：满足当前需求且保持最小可用抽象，避免把窗口语义错误下沉到基类。
   - 备选方案：在 `CWidget` 中提前加入更多窗口行为（激活、层级、交互状态）。
   - 未采用原因：超出当前目标，增加未来拆分成本。

3. `CWindowManager` 继续使用“函数 + prototype 对象”运行时守卫模式。
   - 选择原因：现有实现已经验证可用，迁移只需替换判定基准为 `CWidget`，风险最小。
   - 备选方案：改为 `instanceof` 实例级判断。
   - 未采用原因：管理器当前管理的是构造器类型而非实例，`instanceof` 不适配该入口。

## Risks / Trade-offs

- [风险] 基类迁移后类型别名与守卫可能不一致（编译通过但语义偏差）
  → Mitigation: 同步调整 `WindowConstructor` 类型与 `isWindowConstructor` 判定基准，并补充/更新对应测试断言。

- [风险] `CWidget` Props 设计过宽，后续造成不必要的 API 负担
  → Mitigation: 仅保留位置与尺寸必需字段；其他能力保持在 `CWindow` 层。

- [风险] 现有测试里存在 `InvalidWindow as unknown as typeof CWindow` 这类断言绕过
  → Mitigation: 同步迁移为 `typeof CWidget` 基准，并保留“运行时拒绝无效构造器”的行为测试。

- [权衡] 通过继承增强可扩展性，但会引入一层抽象并增加理解成本
  → Mitigation: 保持 `CWidget` 职责单一，文档与测试中明确边界。
