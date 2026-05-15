# Issues & Ambiguities

## Unresolved Questions

1. **Empty Button folder**: `src/components/Button/` folder exists but is empty. Is this intentional placeholder or legacy?

2. **Missing src/index.ts exports**: The main entry `src/index.ts` is empty (only contains `#KM|` marker). All components exist but are not exported. How should Widget be exported?

3. **No SCSS type declarations**: According to AGENTS.md, SCSS module types should be in `src/types/styles.d.ts` but this file doesn't exist. The types folder is empty.

4. **Button vs CButton naming**: The test imports `Button` (without C prefix) but existing components use `C` prefix (CWindow, CScreen, CGrid). Should new Widget use `CWidget` or just `Widget`?

5. **Barrel exports**: No component folder has an `index.ts` that re-exports. Is this the intended pattern, or should each component folder have one?

6. **Test location**: Tests are at root `tests/` folder, not co-located with components. Is this the canonical pattern or just current state?

# CWidget 引入潜在问题与风险

## 已识别风险

### 1. 类型兼容性风险

- **问题**: `WindowConstructor` 类型定义为 `typeof CWindow`
- **影响**: 引入 CWidget 后需要决定是否更新类型定义
- **选项**:
  - A) 保持 `typeof CWindow` - 最简单，可能够用
  - B) 改为 `typeof CWidget` - 更通用，但可能需要更多测试
- **状态**: 低风险，现有原型链检查逻辑保持不变

### 2. 测试覆盖边界

- **问题**: 测试文件只有 WindowManager.test.tsx
- **风险**: 没有针对 CWidget 的独立测试
- **建议**: 新增 `tests/Widget.test.tsx`

### 3. 组件导出缺失

- **问题**: `src/index.ts` 为空
- **风险**: CWidget 作为内部基类，不需要导出
- **确认**: CWidget 应为内部实现细节，不应导出

## 未确认事项

### 1. CWidget 具体功能边界

- 当前 CWindow 只有 `uuid` 和 `render()`
- 需要确认 CWidget 应该包含哪些通用功能:
  - uuid 生成?
  - 生命周期方法?
  - 状态管理?

### 2. Screen 组件是否也需要基类

- CScreen (Screen.tsx) 与 CWindow 模式类似
- 是否也需要继承 CWidget?
- 建议: 先仅处理 CWindow，后续根据需求扩展

## 依赖分析

无外部依赖，仅内部组件关系:

- React 18.2 (peer dependency)
- @testing-library/react (dev)

---

## External Pattern Risks & Caveats

### 1. React Component Instancing Complexity

**Risk**: React components are often function-based, not class-based
**Evidence**: Most modern React libraries (Radix, Headless UI) use functional components with hooks
**Mitigation**: Ensure CWidget extends `React.Component` if using class components. If using functional components, this pattern may not apply.

### 2. Minified Build Edge Case

**Risk**: `instanceof` can fail in bundled/minified code if class references differ
**Evidence**: When code is bundled, multiple copies of the same class can exist in different module contexts
**Mitigation**:

- Use string-based identification (like Material UI's `muiName`)
- Or ensure single instance of BaseWidget in bundle

### 3. Testing Complexity

**Risk**: instanceof checks are runtime behavior, harder to test in isolation
**Evidence**: Need actual component instances to test, cannot just test types
**Mitigation**: Add integration tests that verify widget type checking works correctly

### 4. Extensibility Trade-off

**Risk**: Inheritance (extends CWidget) is less flexible than composition
**Evidence**: Radix UI explicitly avoids inheritance in favor of composition
**Mitigation**:

- Document when to extend vs compose
- Consider providing both options if needed

### 5. TypeScript Strict Mode Compatibility

**Risk**: `abstract` classes may have edge cases with `typeof` operator
**Evidence**: `typeof AbstractClass` returns "function" not "abstract"
**Mitigation**: Use `instanceof` for runtime checks, `typeof` only for concrete classes

### 6. Registry Pattern Alternative

**Risk**: If using registry, need to maintain registry-component sync
**Evidence**: Appsmith uses separate widget loaders map that must match actual widgets
**Mitigation**:

- Consider auto-registration pattern
- Or generate registry from component files

---

## Verified Sources (URLs)

| Source                                                                       | Type          | Last Verified |
| ---------------------------------------------------------------------------- | ------------- | ------------- |
| https://www.radix-ui.com/primitives                                          | Official Docs | 2026-02-26    |
| https://mui.com/material-ui/guides/composition/                              | Official Docs | 2026-02-26    |
| https://github.com/primefaces/primefaces                                     | GitHub Repo   | 2026-02-26    |
| https://github.com/appsmithorg/appsmith                                      | GitHub Repo   | 2026-02-26    |
| https://github.com/Foundry376/Mailspring                                     | GitHub Repo   | 2026-02-26    |
| https://github.com/grafana/grafana                                           | GitHub Repo   | 2026-02-26    |
| https://www.npmjs.com/package/component-registry                             | npm Package   | 2026-02-26    |
| https://www.tektutorialshub.com/typescript/typescript-instanceof-type-guard/ | Tutorial      | 2026-02-26    |

---

## Recommendation Summary

**For this repo's narrow scope** (CWindow base class extraction):

- ✅ **Safe**: Use `instanceof CWidget` for runtime checks
- ✅ **Safe**: Make CWidget an abstract class
- ⚠️ **Caution**: Ensure CWindow actually extends CWidget (not just implements similar interface)
- ⚠️ **Alternative**: Consider string-tag pattern (like muiName) if instanceof proves problematic

**Not recommended for this repo**:

- Adapter pattern (component-registry npm) - too complex
- Multiple inheritance - not supported in TypeScript
- Functional component base - doesn't fit current class component architecture
