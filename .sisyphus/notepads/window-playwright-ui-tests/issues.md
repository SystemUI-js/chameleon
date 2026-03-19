
## 2026-03-19 Task 1
- `npx playwright test --config=playwright.config.ts --list` still exits non-zero with `Error: No tests found` while `tests/ui` has no specs. The installed Playwright version supports `--pass-with-no-tests` as a CLI flag, but not as a `defineConfig()` property, so the exact bare command cannot pass until a later task adds at least one UI spec.
- Retry proof: local `npx playwright --version` reports `1.58.2`; `npx playwright test --config=playwright.config.ts --list` exits `1` with `Listing tests: Total: 0 tests in 0 files` plus `Error: No tests found`; `npx playwright test --config=playwright.config.ts --project=firefox --list` exits `1` with `Project(s) "firefox" not found. Available projects: "chromium"`.
