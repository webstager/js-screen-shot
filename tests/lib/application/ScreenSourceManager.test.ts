import { loadImageSource, h2cScreenShot } from "@/lib/application/core/ScreenSourceManager";
import screenDomStore from "@/store/dom/ScreenDomStore";
const userParamStore = require("@/store/UserParamStore").default;
const drawingDataStore = require("@/store/DrawingDataStore").default;

jest.mock("@/lib/features/canvas/drawing/DrawImgToCanvas", () => ({
  drawImgToCanvas: jest.fn(() => Promise.resolve(document.createElement("canvas")))
}));

jest.mock("@/lib/application/core/ScreenInitializer", () => ({
  initScreenShot: jest.fn(),
  setScreenShotContainerSize: jest.fn()
}));

jest.mock("html2canvas", () => jest.fn(() => Promise.resolve(document.createElement("canvas"))));

jest.mock("@/lib/features/canvas/drawing/drawCrossImg", () => ({
  drawCrossImg: jest.fn()
}));

import { drawImgToCanvas } from "@/lib/features/canvas/drawing/DrawImgToCanvas";
import { initScreenShot } from "@/lib/application/core/ScreenInitializer";
import html2canvas from "html2canvas";
import { drawCrossImg } from "@/lib/features/canvas/drawing/drawCrossImg";

const mouseEvents = {
  mouseDownEvent: jest.fn(),
  mouseMoveEvent: jest.fn(),
  mouseUpEvent: jest.fn()
};

describe("ScreenSourceManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userParamStore.renderOptions = { x: 10, y: 20 };
    userParamStore.loadCrossImg = false;
    userParamStore.screenShotDom = null;
    drawingDataStore.dpr = 1;
    screenDomStore.screenShotController = document.createElement("canvas");
  });

  test("loadImageSource 会绘制图像并调用 initScreenShot", async () => {
    const imageController = document.createElement("canvas");
    imageController.width = 300;
    imageController.height = 150;
    const context = imageController.getContext("2d") as CanvasRenderingContext2D;

    await loadImageSource(
      jest.fn(),
      context,
      imageController,
      "data:image/png;base64,xxx",
      mouseEvents
    );

    expect(drawImgToCanvas).toHaveBeenCalledWith(
      "data:image/png;base64,xxx",
      300,
      150,
      drawingDataStore.dpr
    );
    expect(initScreenShot).toHaveBeenCalled();
  });

  test("h2cScreenShot 使用自定义 DOM 与 onclone", async () => {
    const customDom = document.createElement("div");
    userParamStore.screenShotDom = customDom;
    userParamStore.loadCrossImg = true;

    await h2cScreenShot(jest.fn(), {} as CanvasRenderingContext2D, mouseEvents);

    expect(html2canvas).toHaveBeenCalledWith(customDom, expect.objectContaining({
      x: 10,
      y: 20,
      onclone: drawCrossImg
    }));
    expect(initScreenShot).toHaveBeenCalled();
  });
});
