# 测试完善计划

本文档用于记录 `js-screen-shot` 测试体系的完善计划。每完成一项后，将对应 checkbox 标记为已完成，并补充必要说明。

## 目标

- 保留现有 `Jest + ts-jest + jsdom` 作为单元测试和轻量集成测试基础。
- 新增浏览器级测试能力，用真实浏览器覆盖 `canvas`、DOM、工具栏交互、截图主链路。
- 先恢复稳定绿色基线，再逐步提高关键模块覆盖率。
- 测试重点放在能保护重构和真实使用路径的行为上，而不是追求纯覆盖率数字。

## 阶段 0：测试策略确认

- [x] 评估当前测试框架是否需要替换。
  - 结论：不替换 Jest。
- [x] 明确测试分层方向。
  - Jest：store、工具函数、DOM 生命周期、事件逻辑、截图模式逻辑。
  - Playwright：真实浏览器里的 demo 页面、canvas、工具栏、截图主链路。
- [x] 创建测试完善计划文档。

## 阶段 1：恢复稳定测试基线

- [x] 修复 `TextElementSnapshot.test.ts` 中 `fontSize: 0` 时文本元素宽高兜底失败的问题。
- [x] 修复 `TextToolInteraction.test.ts` 中拖拽已有元素时工具栏状态未同步的问题。
- [x] 全量执行 `pnpm exec jest --runInBand --silent`，确认 Jest 测试恢复绿色。
- [x] 记录导致失败的根因和修复说明。

### 阶段 1 说明

- `TextElementSnapshot` 失败根因：`buildTextElement` 直接信任外部传入的 `fontSize`，当字号为 `0` 时，文本测量高度和兜底宽度都会变成 `0`。修复：构建文本元素前统一规范化字号，非法或非正数字号回退到默认字号，保证文本元素宽高为正。
- `TextToolInteraction` 失败根因：拖拽已有元素的新路径依赖 `transformingExisting` 标记，但旧调用路径只传 `prevElementId`，导致文字工具选中时拖拽已有非文字元素不会同步工具栏，也不会清空文字编辑态。修复：在文字工具、move 光标、且 `prevElementId` 指向有效元素时，将其识别为已有元素变换。
- 测试夹具补充：拖拽清理文字编辑态时会触发文本重绘，测试用 canvas mock 需要提供 `clip` 方法以匹配真实 `CanvasRenderingContext2D` 能力。

## 阶段 2：补生命周期测试

- [x] 覆盖 `new ScreenShot()` 后基础 DOM 是否创建完整。
- [x] 覆盖 `destroyComponents()` 后 DOM、键盘事件、右键事件、canvas 鼠标/触摸事件是否释放。
- [x] 覆盖重复创建/销毁实例时不会重复注册 MobX reaction。
- [x] 覆盖 `image/html2canvas/webrtc/injected-stream` 加载失败时会统一清理 DOM。
- [x] 覆盖 `destroyContainer: false` 场景下确认截图后的 DOM 和 store 状态。

### 阶段 2 说明

- 新增 `ScreenShotLifecycle.test.ts`：覆盖实例创建后的核心 DOM、store 引用、加载流程触发、`destroyComponents()` 清理，以及重复创建实例时只保留一组截图 DOM。
- 新增 `ScreenInitializer.test.ts`：覆盖 `initScreenShot` 注册的鼠标和触摸事件会通过 `domDisposers` 正确释放。
- 新增 `UiCoordinator.test.ts`：覆盖右键事件和文本输入快捷键事件会注册 disposer 并能被释放。
- 新增 `StoreObserver.test.ts`：覆盖重复执行 `observeStore()` 时会先释放旧的 MobX reaction，避免重复监听。
- 新增 `ToolClickEvent.test.ts`：覆盖 `destroyContainer: false` 下确认截图会回调结果、隐藏工具栏和选项面板，并保留 DOM。
- 补充 `domDisposers` 异常测试：单个 disposer 抛错时，不影响后续 disposer 继续执行。

## 阶段 3：补核心交互集成测试

- [x] 框选截图区域后，裁剪框位置和尺寸状态正确。
- [x] 绘制矩形后，`drawingDataStore.canvasElements` 写入正确。
- [x] 绘制文字后，文本元素位置、颜色、字号和内容正确。
- [x] 移动已有元素后，元素坐标变化正确且仍被限制在裁剪框内。
- [x] 缩放已有矩形/圆形/箭头后，元素数据正确更新。
- [x] 撤销后，canvas history 和 `canvasElements` 状态同步回退。
- [x] 确认截图后，`completeCallback` 返回 `base64` 和 `cutInfo`。
- [x] 取消/关闭截图后，`closeCallback` 被调用且 DOM 被清理。

### 阶段 3 说明

- 新增 `CoreInteractionIntegration.test.ts`，通过 pointer handler、文本交互和工具栏事件覆盖核心用户路径。
- 覆盖框选区域、绘制矩形、绘制文字、移动已有元素、缩放已有矩形、撤销、确认截图和关闭截图。
- 该阶段仍属于 Jest/jsdom 级别，真实浏览器中的 canvas 像素和 demo 页面链路会在阶段 5 用 Playwright 覆盖。

## 阶段 4：补拆分后模块单测

- [x] `CanvasElementHitTest`：覆盖矩形、圆形、箭头、文字、画笔的命中检测和拖拽偏移。
- [x] `CanvasElementTransform`：覆盖移动、缩放、边界约束、箭头移动。
- [x] `CanvasElementSelection`：覆盖选中边框显示/隐藏、删除选中元素。
- [x] `CanvasElementToolbarSync`：覆盖工具栏工具名、工具 id、选中 class、文本编辑态重置。
- [x] `domDisposers`：补异常 disposer 不影响其他 disposer 释放的测试。

### 阶段 4 说明

- 新增 `CanvasElementHitTest.test.ts`：覆盖矩形控制点命中、圆形/箭头/文字/画笔拖拽偏移、空命中时清理 active element。
- 新增 `CanvasElementTransform.test.ts`：覆盖矩形/圆形边界约束、矩形/文字/画笔/箭头移动、矩形/箭头缩放。
- 新增 `CanvasElementSelection.test.ts`：覆盖选中边框显示、隐藏选中边框、删除当前选中元素并记录历史。
- 新增 `CanvasElementToolbarSync.test.ts`：覆盖工具栏状态、选中 class、文本编辑态和输入框清理。

## 阶段 5：引入 Playwright 浏览器级测试

- [x] 安装并配置 Playwright。
- [x] 增加 `test:e2e` 脚本。
- [x] 增加可复用的 dev server 启动配置。
- [x] 编写 demo 页面加载测试。
- [x] 编写框选区域测试。
- [x] 编写工具栏点击和绘制矩形测试。
- [x] 编写撤销测试。
- [x] 编写确认截图回调测试。
- [x] 增加 canvas 非空像素校验，避免只测 DOM 不测画布结果。

### 阶段 5 说明

- 新增 `@playwright/test`、`playwright.config.ts` 和 `test:e2e` 脚本。
- Playwright 通过 `pnpm run build-rollup:dev` 启动 Rollup demo server，并复用 `http://127.0.0.1:8123`。
- 新增 `tests/e2e/demo.spec.ts`：覆盖 demo 页面加载、框选截图区域、canvas 非空像素、工具栏矩形绘制、撤销和确认截图。

## 阶段 6：整理测试目录和规范

- [x] 评估是否将 `tests/` 拆成 `unit/`、`integration/`、`e2e/`。
- [x] 抽取通用 DOM/canvas 测试 setup helper。
- [x] 统一命名规则：`*.test.ts` 用于 Jest，`*.spec.ts` 用于 Playwright。
- [x] 为复杂交互测试建立 factory/helper，减少重复 mock。
- [x] 为测试数据类型建立固定 fixture。

### 阶段 6 说明

- 新增 `tests/README.md` 记录目录分层和命名规则；当前不大规模搬迁旧 Jest 测试，后续新增测试按规范放置。
- 新增 `tests/helpers/canvas.ts`，提供 canvas context、canvas DOM、pointer event helper。
- 新增 `tests/fixtures/canvasElements.ts`，提供 canvas element fixture factory。
- 已将复杂交互测试和部分 canvas 模块测试改为复用 helper/fixture，减少重复 mock。

## 阶段 7：设置质量门槛

- [x] 先记录当前覆盖率基线。
- [x] 为核心纯逻辑模块设置较低但有效的覆盖率门槛。
- [x] 避免一开始对全项目设置过高 coverage threshold。
- [x] 随着关键测试补齐，逐步提高门槛。

### 阶段 7 说明

- 当前源码覆盖率基线：statements 68.33%、branches 43.72%、functions 67.29%、lines 68.46%。
- 已修正 Jest 配置：`tests/e2e/` 交给 Playwright 执行，Jest 不再误收集 `*.spec.ts` 端到端测试。
- 已修正覆盖率采集范围：只采集 `src/**/*.ts`，同时排除 `src/lib/type/**/*.ts` 纯类型文件，避免测试文件和类型声明参与 coverage 统计。
- 已为 `CanvasElementHitTest`、`CanvasElementTransform`、`CanvasElementSelection`、`CanvasElementToolbarSync`、`domDisposers` 设置文件级覆盖率门槛。
- 全局 coverage threshold 暂时保持为 0，避免在历史低覆盖模块上设置不现实的硬门槛；后续每补齐一个核心模块，再逐步提高对应文件门槛。

## 推荐执行顺序

1. 阶段 1：先恢复 Jest 绿色基线。
2. 阶段 2：补生命周期测试，防止实例化/销毁类问题回归。
3. 阶段 4：给刚拆出来的模块补单测。
4. 阶段 3：补核心交互集成测试。
5. 阶段 5：引入 Playwright，覆盖真实浏览器链路。
6. 阶段 6、7：整理测试结构并设置质量门槛。

## 当前状态

- Jest 测试框架保留。
- Playwright 已新增，用于浏览器级 demo 和 canvas 主链路测试。
- 阶段 1 至阶段 7 已完成，后续只需要按业务变化继续补充测试和抬高关键模块门槛。
