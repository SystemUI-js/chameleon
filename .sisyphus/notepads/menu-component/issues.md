# Issues

## 2026-04-04 Task 5

- 无阻塞问题。回归阶段仅发现 `tests/Menu.test.tsx` 的父级菜单项查询名与实际可访问名（含 caret）不一致，已改为稳定 `data-testid` 查询并通过全量验证。
