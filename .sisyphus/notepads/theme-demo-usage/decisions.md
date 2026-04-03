## 2026-04-02T08:23:24.885639Z Task: session-start
- Plan selected: `theme-demo-usage`.
- Theme section will be treated as a standalone dev-catalog showcase, not a public API or playground change.

---

## 2026-04-02T09:15:00Z Theme Semantics Analysis

### Verified Semantic Rules (backed by tests + implementation)

#### 1. Theme Wrapper: Context Provider + DOM Wrapper
**Evidence:** `src/components/Theme/Theme.tsx` lines 24–35
- `Theme` renders BOTH a `ThemeContext.Provider` (for descendants) AND a `<div className={name}>` wrapper element
- The wrapper div is NOT conditional — it always renders alongside the provider
- Dev note: This means `Theme` occupies real DOM space, not a transparent wrapper

#### 2. Nested Provider: Nearest/Innermost Wins
**Evidence:** `tests/Theme.test.tsx` lines 47–57 (test name: "uses the nearest nested provider theme")
- `<Theme name="win98"><Theme name="winxp"><ThemeProbe /></Theme></Theme>` → probe sees `winxp`
- Implementation: `src/components/Theme/useTheme.ts` lines 14–22 — explicit theme check first, then falls back to `context.theme`
- Since `useTheme()` always checks explicit first, the "nearest provider" behavior only matters when NO explicit prop is passed

#### 3. Explicit `theme` Prop: Wins Over Provider
**Evidence:** `tests/Theme.test.tsx` lines 37–45 (test name: "uses explicit theme prop before provider theme")
- `<Theme name="win98"><ThemeProbe theme="default" /></Theme>` → probe sees `default`
- Implementation: `useTheme.ts` lines 14–22 — `explicitTheme` is checked BEFORE context lookup
- Priority order: explicit prop > nearest provider > outer providers

#### 4. Empty/Whitespace Theme: Treated as No Theme
**Evidence:**
- `tests/Theme.test.tsx` lines 59–67: `name="   "` → probe has NO `data-theme` attribute
- `Theme.tsx` lines 14–22 and `useTheme.ts` lines 4–12: `normalizeTheme()` returns `undefined` for empty/whitespace-only strings

#### 5. No Provider: Undefined
**Evidence:** `tests/Theme.test.tsx` lines 69–73
- `<ThemeProbe />` with no provider → `data-theme` attribute absent

---

### Recommended Stable Wording / Snippet Ingredients for Showcase

**Rule 1 — Wrapper usage:**
```
<Theme name="cm-theme--win98">
  <CButton>Themed Button</CButton>
</Theme>
```
Describe: "Theme wraps children with a context provider AND a DOM wrapper bearing the theme className."

**Rule 2 — Nested provider precedence:**
```
<Theme name="cm-theme--win98">
  <CButton>Outer</CButton>
  <Theme name="cm-theme--winxp">
    <CButton>Inner wins</CButton>
  </Theme>
</Theme>
```
Describe: "When Theme components are nested, the innermost (nearest) provider wins for its descendants."

**Rule 3 — Explicit prop overrides provider:**
```
<Theme name="cm-theme--win98">
  <CButton theme="cm-theme--default">I win</CButton>
</Theme>
```
Describe: "A component's own `theme` prop always takes precedence over any Theme provider in scope."

**Rule 4 — Empty/whitespace is ignored:**
```
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
