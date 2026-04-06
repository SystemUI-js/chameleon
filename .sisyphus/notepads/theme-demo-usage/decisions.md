## 2026-04-02T08:23:24.885639Z Task: session-start
- Plan selected: `theme-demo-usage`.
- Theme section will be treated as a standalone dev-catalog showcase, not a public API or playground change.

---

## 2026-04-02T09:15:00Z Theme Semantics Analysis

### Verified Semantic Rules (backed by tests + implementation)

#### 1. Theme Wrapper: Context Provider + DOM Wrapper
**Evidence:** `src/components/Theme/Theme.tsx` lines 19–35
- `Theme` renders BOTH a `ThemeContext.Provider` (for descendants) AND a `<div className={finalTheme}>` wrapper element
- The wrapper div is NOT conditional — it always renders alongside the provider
- Dev note: This means `Theme` occupies real DOM space, not a transparent wrapper

#### 2. Nested Provider: Unsupported
**Evidence:** `tests/Theme.test.tsx` (the `nested Theme rejection` cases), `src/components/Theme/Theme.tsx` (`throw new Error('Nested Theme is not supported')`), and `src/components/Theme/useTheme.ts` (explicit theme still resolves before `context.theme`)
- `<Theme name="win98"><Theme name="winxp"><ThemeProbe /></Theme></Theme>` now throws `Nested Theme is not supported`
- Nested `Theme` providers are disallowed regardless of theme name or nesting depth
- Local overrides should use an explicit component `theme` prop instead of an inner `Theme` provider

#### 3. Explicit `theme` Prop: Wins Over Provider
**Evidence:** `tests/Theme.test.tsx` lines 43–51 (test name: "uses explicit theme prop before provider theme") and `src/components/Theme/useTheme.ts`
- `<Theme name="win98"><ThemeProbe theme="default" /></Theme>` → probe sees `default`
- Implementation: `useTheme.ts` checks `explicitTheme` BEFORE context lookup
- Priority order: explicit prop > provider theme (nested providers are not allowed)

#### 4. Empty/Whitespace Theme: Treated as No Theme
**Evidence:**
- `tests/Theme.test.tsx` lines 59–67: `name="   "` → probe has NO `data-theme` attribute
- `src/components/Theme/normalizeThemeClassName.ts` and `src/components/Theme/useTheme.ts`: empty/whitespace-only strings normalize to `undefined`

#### 5. No Provider: Undefined
**Evidence:** `tests/Theme.test.tsx` lines 69–73
- `<ThemeProbe />` with no provider → `data-theme` attribute absent

---

### Recommended Stable Wording / Snippet Ingredients for Showcase

**Rule 1 — Wrapper usage:**
```tsx
<Theme name="cm-theme--win98">
  <CButton>Themed Button</CButton>
</Theme>
```
Describe: "Theme wraps children with a context provider AND a DOM wrapper bearing the theme className."

**Rule 2 — Nested providers are disallowed:**
```tsx
<Theme name="cm-theme--win98">
  <Theme name="cm-theme--winxp">
    <CButton>This throws</CButton>
  </Theme>
</Theme>
```
Describe: "When Theme components are nested, rendering throws `Nested Theme is not supported`."

**Rule 3 — Explicit prop overrides provider:**
```tsx
<Theme name="cm-theme--win98">
  <CButton theme="cm-theme--default">I win</CButton>
</Theme>
```
Describe: "A component's own `theme` prop always takes precedence over any Theme provider in scope."

**Rule 4 — Empty/whitespace is ignored:**
```tsx
<Theme name="   ">
  <CButton>No theme applied</CButton>
</Theme>
```
Describe: "Empty or whitespace-only theme names are treated as 'no theme' — descendants see no theme."

---

### API Surface (no changes — documented for completeness)
- Exported from `@/components/Theme/Theme.tsx`: `Theme`, `ThemeContext`, `ThemeProps`, `ThemeContextValue`
- Exported from `@/components/Theme/useTheme.ts`: `useTheme`
- Theme definitions: `defaultThemeDefinition`, `win98ThemeDefinition`, `winXpThemeDefinition` (from `@/theme/*`)
- `mergeClasses` utility (from `src/index.ts`) — merges class arrays and deduplicates
