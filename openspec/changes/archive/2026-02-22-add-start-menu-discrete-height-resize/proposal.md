## Why

当前 Win98/WinXP 风格开始菜单缺少高度调整能力，无法覆盖「紧凑 / 扩展」两种常见展示密度。为保持复古交互一致性并控制实现复杂度，需要新增“拖动切换 1x/2x 高度”的离散能力，而非自由缩放。

## What Changes

- 为 Win98 与 WinXP 开始菜单新增底边拖动调整高度的交互。
- 高度调整采用离散档位，仅支持 `1x` 与 `2x` 两档，不支持任意像素自由尺寸。
- 在拖动过程中与结束时，统一应用档位吸附与边界约束，确保最终高度稳定在允许档位。
- 补充主题与组件行为约束，使两个主题在能力一致的前提下保留各自视觉表现。

## Capabilities

### New Capabilities
- `start-menu-discrete-height`: 定义开始菜单高度拖动与离散档位（1x/2x）规则，包括允许方向、吸附时机、最终高度约束与主题一致性要求。

### Modified Capabilities
- （无）

## Impact

- Affected code:
  - `src/components/StartButton.tsx`
  - `src/components/Taskbar.tsx`
  - `src/components/Window.tsx`（若复用窗口调整能力）
  - `src/components/Taskbar.scss`
  - `src/theme/win98/index.ts`
  - `src/theme/winxp/index.ts`
- Affected tests:
  - `tests/Window.test.tsx`（若复用窗口调整行为）
  - 新增开始菜单高度档位与拖动行为测试
- APIs/Contracts:
  - 开始菜单高度状态与交互契约新增离散档位语义（1x/2x）
- Dependencies:
  - 无新增外部依赖，优先复用现有交互与主题系统
