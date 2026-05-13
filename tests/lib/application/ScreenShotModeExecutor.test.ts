import { executeLoadMode } from "@/lib/application/core/ScreenShotModeExecutor";
import type { ScreenShotMode } from "@/lib/application/core/ScreenShotModeResolver";

jest.mock("@/lib/application/core/ScreenSourceManager", () => ({
  loadImageSource: jest.fn(() => Promise.resolve(document.createElement("canvas"))),
  h2cScreenShot: jest.fn(() => Promise.resolve(document.createElement("canvas"))),
  executeCaptureSource: jest.fn(() => Promise.resolve(null))
}));

jest.mock("@/store/dom/domCleanup", () => ({
  destroyScreenShotDom: jest.fn()
}));

import {
  loadImageSource,
  h2cScreenShot,
  executeCaptureSource
} from "@/lib/application/core/ScreenSourceManager";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";

const userParamStore = require("@/store/UserParamStore").default;

const mouseEvents = {
  mouseDownEvent: jest.fn(),
  mouseMoveEvent: jest.fn(),
  mouseUpEvent: jest.fn()
};

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d") as CanvasRenderingContext2D;

describe("ScreenShotModeExecutor", () => {
  const triggerCallback = jest.fn();
  const cancelCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    triggerCallback.mockClear();
    cancelCallback.mockClear();
    userParamStore.imgSrc = "data:image/png;base64,xxx";
    userParamStore.screenFlow = { mock: true } as any;
    userParamStore.wrcWindowMode = false;
  });

  const runMode = (mode: ScreenShotMode) =>
    executeLoadMode(
      mode,
      mouseEvents,
      context,
      triggerCallback,
      cancelCallback,
      () => canvas,
      () => {}
    );

  test("image 模式会调用 loadImageSource 并忽略其他策略", async () => {
    await runMode("image");
    expect(loadImageSource).toHaveBeenCalledTimes(1);
    expect(h2cScreenShot).not.toHaveBeenCalled();
    expect(executeCaptureSource).not.toHaveBeenCalled();
  });

  test("html2canvas 模式调用 h2cScreenShot", async () => {
    await runMode("html2canvas");
    expect(h2cScreenShot).toHaveBeenCalledTimes(1);
  });

  test("injected-stream 模式会转成统一 capture source plan", async () => {
    await runMode("injected-stream");
    expect(executeCaptureSource).toHaveBeenCalledWith(
      {
        captureSource: "injected-media-stream",
        renderStrategy: "browser-frame"
      },
      cancelCallback,
      triggerCallback,
      canvas,
      mouseEvents
    );
  });

  test("webrtc 模式会转成统一 capture source plan", async () => {
    userParamStore.wrcWindowMode = true;

    await runMode("webrtc");
    expect(executeCaptureSource).toHaveBeenCalledWith(
      {
        captureSource: "browser-display-media",
        renderStrategy: "window-frame"
      },
      cancelCallback,
      triggerCallback,
      canvas,
      mouseEvents
    );
  });

  test("加载失败时触发取消回调并清理截图 DOM", async () => {
    const error = new Error("load failed");
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (loadImageSource as jest.Mock).mockReturnValueOnce(Promise.reject(error));

    runMode("image");
    await Promise.resolve();
    await Promise.resolve();

    try {
      expect(cancelCallback).toHaveBeenCalledWith(error);
      expect(destroyScreenShotDom).toHaveBeenCalledTimes(1);
    } finally {
      errorSpy.mockRestore();
    }
  });
});
