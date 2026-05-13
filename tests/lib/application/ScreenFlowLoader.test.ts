import { loadScreenFlowData } from "@/lib/application/core/ScreenFlowLoader";
import screenDomStore from "@/store/dom/ScreenDomStore";
const userParamStore = require("@/store/UserParamStore").default;
const drawingDataStore = require("@/store/DrawingDataStore").default;

jest.mock("@/lib/application/core/ScreenFrameDrawer", () => {
  const draw = jest.fn(() => true);
  return {
    __esModule: true,
    getFrameDrawer: jest.fn(() => ({ draw })),
    __draw: draw
  };
});

jest.mock("@/lib/application/core/ScreenCapture", () => ({
  stopCapture: jest.fn()
}));

jest.mock("@/lib/application/core/ScreenInitializer", () => ({
  initScreenShot: jest.fn(),
  setScreenShotContainerSize: jest.fn()
}));

import { getFrameDrawer } from "@/lib/application/core/ScreenFrameDrawer";
import { stopCapture } from "@/lib/application/core/ScreenCapture";
import { initScreenShot } from "@/lib/application/core/ScreenInitializer";

const mockFrameDrawer = getFrameDrawer as jest.Mock;

describe("ScreenFlowLoader", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    userParamStore.setCanvasSize(200, 100);
    userParamStore.wrcWindowMode = false;
    userParamStore.wrcReplyTime = 0;
    drawingDataStore.captureStream = {
      getVideoTracks: () => [
        {
          label: "Display",
          getSettings: () => ({ displaySurface: "monitor" })
        }
      ]
    } as any;
    const screenCanvas = document.createElement("canvas");
    screenDomStore.screenShotController = screenCanvas;
    const video = document.createElement("video");
    screenDomStore.videoController = video;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("成功绘制后调用 initScreenShot 与回调", async () => {
    const triggerCallback = jest.fn();
    const mouseEvents = {
      mouseDownEvent: jest.fn(),
      mouseMoveEvent: jest.fn(),
      mouseUpEvent: jest.fn()
    };
    const imageController = document.createElement("canvas");
    imageController.width = 400;
    imageController.height = 300;
    const overlay = document.createElement("div");
    document.body.appendChild(overlay);

    loadScreenFlowData(
      triggerCallback,
      "browser-frame",
      imageController,
      mouseEvents,
      overlay
    );
    jest.runOnlyPendingTimers();

    await Promise.resolve();

    expect(document.body.contains(overlay)).toBe(false);
    expect(initScreenShot).toHaveBeenCalled();
    expect(triggerCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 0,
        displaySurface: "monitor",
        displayLabel: "Display"
      })
    );
    expect(stopCapture).toHaveBeenCalled();
    expect(mockFrameDrawer).toHaveBeenCalledWith("browser-frame");
    const drawerInstance = mockFrameDrawer.mock.results[0].value;
    expect(drawerInstance.draw).toHaveBeenCalled();
  });
});
