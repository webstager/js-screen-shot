# 测试目录说明

当前测试暂不做大规模搬迁，避免为了目录形态产生无意义改动。后续新增测试按以下规则放置：

- `tests/e2e/**/*.spec.ts`：Playwright 浏览器级测试。
- `tests/lib/**/*.test.ts`：库内部模块的 Jest 单元测试和轻量集成测试。
- `tests/store/**/*.test.ts`：store 行为测试。
- `tests/helpers/`：Jest 和 Playwright 都可复用的测试 helper。
- `tests/fixtures/`：稳定测试数据 factory。

命名规则：

- Jest 使用 `*.test.ts`。
- Playwright 使用 `*.spec.ts`。
- 复杂交互测试优先复用 `tests/helpers/canvas.ts` 中的 canvas 和 pointer helper。
- canvas 元素数据优先通过 `tests/fixtures/canvasElements.ts` 创建，减少测试间重复和字段遗漏。
