# Playwright 配置决策记录

## 1. Chromium-Only 项目配置

**来源**: [Playwright 官方文档 - Test Configuration](https://playwright.dev/docs/test-configuration)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**关键点**:
- 使用 `projects` 数组定义单个 Chromium 项目
- `devices['Desktop Chrome']` 提供标准 Chrome 桌面配置
- 不需要 Firefox/WebKit 项目，符合成本和稳定性目标

---

## 2. webServer 配置

**来源**: [Playwright 官方文档 - Web Server](https://playwright.dev/docs/test-webserver)

```typescript
export default defineConfig({
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5673',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
```

**关键点**:
- `command`: 启动开发服务器的 shell 命令
- `url`: Playwright 等待服务器就绪的健康检查 URL
- `reuseExistingServer`: 本地开发时复用已有服务器，CI 环境下重新启动
- `stdout/stderr`: 控制服务器输出日志行为

**CI 注意事项**:
- `reuseExistingServer: !process.env.CI` 确保 CI 环境每次都启动新服务器
- 需确保 `yarn dev` 绑定的端口与 `url` 一致

---

## 3. Artifact 保留配置 (Trace/Screenshot/Video)

**来源**: [Playwright 官方文档 - Trace Viewer](https://playwright.dev/docs/trace-viewer), [Videos](https://playwright.dev/docs/videos)

```typescript
export default defineConfig({
  use: {
    // Trace: 首次重试时保留，适合 CI
    trace: 'on-first-retry',
    // Video: 失败时保留
    video: 'retain-on-failure',
    // Screenshot: 仅失败时截图
    screenshot: 'only-on-failure',
  },
});
```

**模式选项**:

| 选项 | Trace | Video | Screenshot |
|------|-------|-------|------------|
| `'on'` | 每次都记录 | 每次都录制 | 每次都截图 |
| `'on-first-retry'` | 首次重试时记录 | 首次重试时录制 | - |
| `'retain-on-failure'` | 失败时保留 | 失败时保留 | - |
| `'only-on-failure'` | - | - | 仅失败时截图 |
| `'off'` | 关闭 | 关闭 | 关闭 |

**推荐策略 (CI)**:
- `trace: 'on-first-retry'` - 首次失败时自动记录 trace，便于调试
- `video: 'retain-on-failure'` - 失败测试保留视频
- `screenshot: 'only-on-failure'` - 失败时截图

---

## 4. Reporter 配置

**来源**: [Playwright 官方文档 - Reporters](https://playwright.dev/docs/test-reporters)

```typescript
export default defineConfig({
  reporter: process.env.CI ? 'dot' : 'list',
});
```

**内置 Reporter**:
- `'list'`: 本地开发，每行显示测试详情
- `'dot'`: CI 环境，圆点表示结果（简洁）
- `'html'`: 生成交互式 HTML 报告

**CI + HTML 报告上传**:
```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [['html', { outputFolder: 'playwright-report' }]],
});
```

```yaml
# .github/workflows/ci-pr.yml
- uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 30
```

---

## 5. GitHub Actions CI 安装 Playwright 浏览器

**来源**: [Playwright 官方文档 - CI](https://playwright.dev/docs/ci), [Steve Fenton Blog](https://stevefenton.co.uk/blog/2025/09/playwright-insteall-github-actions/)

### 完整安装 (所有浏览器)
```bash
npx playwright install --with-deps
```

### Chromium Only (推荐)
```bash
npx playwright install chromium --with-deps
```

**关键优化**:
- 使用 `chromium` 参数仅安装 Chromium 浏览器
- 显著减少安装时间和 CI 超时风险
- 避免安装不需要的 Firefox/WebKit

**完整 CI 步骤**:
```yaml
- name: Install dependencies
  run: npm ci  # 或 yarn

- name: Install Playwright Browsers
  run: npx playwright install chromium --with-deps

- name: Run Playwright tests
  run: npx playwright test
```

---

## 6. CI Artifact 上传 (失败时)

**来源**: [Playwright 官方文档 - CI Intro](https://playwright.dev/docs/ci-intro)

```yaml
- name: Upload Playwright Artifacts
  if: ${{ failure() }}
  uses: actions/upload-artifact@v4
  with:
    name: playwright-failure-artifacts
    path: |
      playwright-report/
      test-results/
    retention-days: 7
```

**上传内容**:
- `playwright-report/`: HTML 报告
- `test-results/`: 包含 trace.zip, video.webm, screenshot.png

---

## 7. 完整配置示例

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'dot' : 'list',

  use: {
    baseURL: 'http://localhost:5673',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:5673',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
```

---

## 8. CI 工作流集成点

根据 plan 要求: `lint → test → build → npm pack`

UI 自动化测试应插入在 unit tests 之后、build 之前:

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: yarn install
      - run: yarn lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: yarn install
      - run: yarn test

  ui-test:  # <-- 新增 Playwright UI 测试
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: yarn install
      - run: npx playwright install chromium --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: ${{ failure() }}
        with:
          name: playwright-artifacts
          path: |
            playwright-report/
            test-results/
          retention-days: 7

  build:
    runs-on: ubuntu-latest
    needs: [lint, test, ui-test]  # <-- 依赖 UI 测试
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: yarn install
      - run: yarn build

  pack:
    runs-on: ubuntu-latest
    needs: build
    # ... npm pack 步骤
```

---

## 参考资料

1. [Playwright Test Configuration](https://playwright.dev/docs/test-configuration)
2. [Playwright Web Server](https://playwright.dev/docs/test-webserver)
3. [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
4. [Playwright Videos](https://playwright.dev/docs/videos)
5. [Playwright Reporters](https://playwright.dev/docs/test-reporters)
6. [Playwright CI](https://playwright.dev/docs/ci)
7. [Playwright CI Intro](https://playwright.dev/docs/ci-intro)
8. [Steve Fenton: Installing Playwright in GitHub Actions](https://stevefenton.co.uk/blog/2025/09/playwright-insteall-github-actions/)
