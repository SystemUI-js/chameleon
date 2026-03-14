# Component Pattern Learnings

## Canonical Pattern for Adding New Component (based on exploration)

### 1. Folder Structure
- Create folder under `src/components/{ComponentName}/`
- Main component file: `{ComponentName}.tsx` (e.g., `src/components/Widget/Widget.tsx`)
- Optional styles: `index.scss` in the component folder
- Tests are placed at `tests/{ComponentName}.test.tsx` (root level, NOT inside component folder)

### 2. Component Naming
- Class components use `C` prefix: `CWindow`, `CScreen`, `CGrid`
- File naming matches class name without prefix: `Window.tsx` contains `CWindow`

### 3. Props & State Typing
- Props interface named `Props`
- State interface named `State`
- Example:
  ```ts
  interface Props {
    children?: React.ReactNode;
    className?: string;
  }
  
  interface State {
    isOpen: boolean;
  }
  
  export class CWidget extends React.Component<Props, State> { ... }
  ```

### 4. Export Pattern
- Named exports directly from component files
- No barrel export (index.ts) in component folder
- Components exported from `src/index.ts` (currently empty)

### 5. ClassName Conventions
- Base class: `cm-{component}` (e.g., `cm-window`, `cm-btn`)
- Variant class: `cm-{component}--{variant}` (e.g., `cm-btn--secondary`)
- BEM-style with double underscore for sub-elements: `cm-window__title-bar`

### 6. Styles
- Use plain SCSS (not CSS modules)
- Import in component: `import './index.scss';`
- SCSS files co-located in component folder

### 7. Test Pattern
- Location: `tests/{ComponentName}.test.tsx`
- Import from `../src`
- Use `@testing-library/react` with `@testing-library/jest-dom`
- Example test structure:
  ```ts
  import { render } from '@testing-library/react'
  import { screen, fireEvent } from '@testing-library/dom'
  import { Widget } from '../src'
  import '@testing-library/jest-dom'
  
  describe('Widget', () => {
    it('renders', () => { ... })
  })
  ```

### 8. Path Aliases
- `@/*` maps to `./src/*`
- Jest moduleNameMapper: `'^@/(.*)$': '<rootDir>/src/$1'`

## Verified Files/Patterns

| Pattern | Source Files |
|---------|--------------|
| Class component structure | `src/components/Window/Window.tsx`, `src/components/Screen/Screen.tsx`, `src/components/Screen/Grid.tsx` |
| Props interface | Same as above |
| State interface | `src/components/Screen/Grid.tsx` |
| Export pattern | All component files use named exports |
| Test structure | `tests/Button.test.tsx`, `tests/Window.test.tsx` |
| SCSS import | `src/components/Screen/Grid.tsx` imports `./index.scss` |
| ClassName conventions | Test expects `cm-btn`, `cm-btn--secondary` (from AGENTS.md + Button.test.tsx) |

## Gap Found
- Button component test exists at `tests/Button.test.tsx` but no implementation in `src/components/`
- `src/index.ts` is empty - no exports currently defined
- `src/components/index.ts` exists but just exports `export const A = 1;`

---

## External References: Base Widget Classes & Constructor Checks

### 1. Radix UI Primitives
**URL**: https://www.radix-ui.com/primitives
**Pattern**: Composition over inheritance
**Relevance**: LOW - Radix uses "Slot" pattern and `asChild` prop for composition. No base widget class. Not applicable to this repo's inheritance model.

### 2. Material UI Component Structure
**URL**: https://mui.com/material-ui/guides/composition/
**Pattern**: `muiName` static property (string-based tagging)
**Evidence**:
```typescript
// Material UI uses static muiName for component identification
const WrappedIcon = (props) => <Icon {...props}/>;
WrappedIcon.muiName = Icon.muiName;
```
**Relevance**: MEDIUM - Material UI avoids instanceof entirely. Uses string-based tagging instead. This is an alternative to constructor checks.

### 3. PrimeFaces BaseWidget
**URL**: https://github.com/primefaces/primefaces (search: `core.widget.ts`)
**Pattern**: Class inheritance with `BaseWidget` as base class
**Evidence**:
```typescript
// PrimeFaces has BaseWidget, DeferredWidget, DynamicOverlayWidget hierarchy
import type { BaseWidget, DeferredWidget, DynamicOverlayWidget } from './core.widget.js';
```
**Relevance**: HIGH - Direct example of BaseWidget class in a UI component library. TypeScript-based, uses class inheritance.

### 4. Appsmith Widget System
**URL**: https://github.com/appsmithorg/appsmith
**Pattern**: `BaseWidget` class with widget loader registry
**Evidence**:
```typescript
// From appsmith: widgets/index.ts
import type BaseWidget from "./BaseWidget";
const WidgetLoaders = new Map<string, () => Promise<typeof BaseWidget>>([...]);
const loadedWidgets = new Map<string, typeof BaseWidget>();
export const loadWidget = async (type: string): Promise<typeof BaseWidget> => { ... };
```
**Relevance**: HIGH - Modern React widget system with BaseWidget, registry pattern, and dynamic widget loading.

### 5. Mailspring ComponentRegistry
**URL**: https://github.com/Foundry376/Mailspring/blob/master/app/src/registries/component-registry.ts
**Pattern**: Class-based registry with role/location metadata
**Evidence**:
```typescript
class ComponentRegistry extends MailspringStore {
  register(component: React.ComponentType<any>, descriptor: ComponentRegistryDescriptor): void
  // Usage:
  ComponentRegistry.register(ThreadList, {
    role: 'ThreadList',
    modes: ['split', 'list'],
  });
}
```
**Relevance**: MEDIUM - Registry pattern, but doesn't use instanceof for type checking.

### 6. Grafana Registry Pattern
**URL**: https://github.com/grafana/grafana (search: ExposedComponentsRegistry)
**Pattern**: Generic-based Registry with type-safe registration
**Evidence**:
```typescript
export class ExposedComponentsRegistry extends Registry<
  ExposedComponentRegistryItem,
  PluginExtensionExposedComponentConfig
> { ... }
```
**Relevance**: MEDIUM - Type-safe registry with generics. No instanceof checks.

### 7. TypeScript instanceof Behavior
**URL**: https://www.tektutorialshub.com/typescript/typescript-instanceof-type-guard/
**Pattern**: Prototype chain checking
**Evidence**:
- `instanceof` checks prototype chain, works with class inheritance
- Returns true if object inherits from class's prototype
- Can be used as type guard in conditional blocks
- Does NOT work with TypeScript types (only classes)
```typescript
class Animal {}
class Dog extends Animal {}
const dog = new Dog();
console.log(dog instanceof Dog);   // true
console.log(dog instanceof Animal); // true - inheritance works!
```
**Relevance**: HIGH - Confirms instanceof works with inheritance chain, which is key for base class checking.

### 8. component-registry npm package
**URL**: https://www.npmjs.com/package/component-registry
**Pattern**: Adapter/Interface pattern (inspired by Zope Toolkit)
**Evidence**:
- Uses TypeScript for type checking (no runtime type checking)
- Removed multiple inheritance in v3
- Uses Adapter pattern for component extension
**Relevance**: LOW - More complex pattern, may be overkill for this repo's scope.

---

## Pattern Applicability Summary

| Pattern | Safe to Use? | Notes |
|---------|-------------|-------|
| instanceof BaseWidget | YES | Works with inheritance chain. Key: BaseWidget must be actual class, not interface. |
| muiName-style string tag | OPTION | Alternative to instanceof. Requires manual maintenance of string values. |
| Registry with generics | YES | Type-safe, no instanceof needed if using string keys. |
| Adapter pattern | NO | Overkill for this scope. |
| Composition (Radix) | N/A | Different paradigm than inheritance. |

---

## Local Constraints Consideration

Given repo constraints (strict TS, no `any`, minimal scope):

1. **BaseWidget must be a class** - Cannot use `instanceof` with interfaces/types
2. **Use abstract class** - Consider `abstract class CWidget` to prevent direct instantiation
3. **Registry key: string type** - Avoids instanceof entirely if using string-based component IDs
4. **Type guard pattern** - If instanceof needed, create custom type guard:
```typescript
function isCWidget(obj: unknown): obj is CWidget {
  return obj instanceof CWidget;
}
```
