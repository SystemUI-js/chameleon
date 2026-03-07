## Why

当前 Default 主题下的 Window 视觉特征不够明确，用户不容易一眼识别“这是一个窗口容器”。需要在不增加复杂视觉负担的前提下，提供最小但可辨识的窗口样式。

## What Changes

- 为 Default 主题的 Window 补充基础外观样式（边框、标题栏与内容区层次）。
- 明确约束：不添加阴影效果，保持样式简洁。
- 保持现有 Window 交互行为与 API 不变，仅调整默认视觉表现。
- 补充/更新对应测试断言与文档示例，确保默认外观可验证。

## Capabilities

### New Capabilities
- `default-window-visual-style`: 定义 Default 主题下 Window 的最小可辨识视觉规范（无阴影、简洁、可区分窗口结构）。

### Modified Capabilities
- （无）

## Impact

- Affected code:
  - `src/components/Window.scss`
  - `src/components/Window.tsx`（如需补充语义 className）
  - `tests/Window.test.tsx`
- 影响范围：仅 Default 主题下 Window 的默认视觉样式，不涉及行为逻辑与公开 API。
- 依赖与构建链路无新增要求。
