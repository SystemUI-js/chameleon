## Why

当前 CMenu 的触发模式主要按整棵菜单统一继承，导致根菜单使用 click 打开时，二级子菜单也默认需要 click 才能展开。这与常见桌面菜单的交互预期不一致，用户希望保留根菜单 click 打开的能力，同时让进入菜单后的二级子菜单默认通过 hover 更高效地展开。

## What Changes

- 调整 CMenu 的触发配置语义，使根菜单与嵌套子菜单可以采用不同的默认触发方式。
- 保持根菜单默认通过 click 打开总菜单。
- 在根菜单使用 click 打开时，让内部二级子菜单默认通过 hover 展开。
- 明确子菜单项的显式触发配置仍可覆盖默认行为，避免破坏已有可定制能力。
- 为混合触发模式补充组件测试与开发示例，覆盖 click 打开根菜单、hover 展开子菜单等关键场景。

## Capabilities

### New Capabilities
- `cmenu-mixed-trigger-modes`: 定义 CMenu 根菜单与嵌套子菜单的默认触发行为及覆盖规则，支持 click 打开总菜单、hover 展开子菜单的混合交互。

### Modified Capabilities
- 无

## Impact

- 影响组件行为与公开配置语义：`src/components/Menu/Menu.tsx`
- 影响组件交互验证：`tests/Menu.test.tsx`
- 可能需要同步更新开发演示或调试夹具：`src/dev/playwright/menuHarness.tsx`、`src/dev/ComponentCatalog.tsx`
- 不涉及新增外部依赖或后端系统变更
