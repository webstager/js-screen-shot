import {
  loadImageSource,
  h2cScreenShot,
  resolveSnapDomRenderer,
  snapdomScreenShot
} from "@/lib/application/core/ScreenSourceManager";
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
    userParamStore.snapdom = null;
    userParamStore.snapdomOptions = {};
    delete (window as unknown as { snapdom?: unknown }).snapdom;
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

  test("snapdomScreenShot 使用传入的 SnapDOM 渲染器", async () => {
    const customDom = document.createElement("div");
    const renderedCanvas = document.createElement("canvas");
    const snapdom = {
      toCanvas: jest.fn(() => Promise.resolve(renderedCanvas))
    };
    userParamStore.screenShotDom = customDom;
    userParamStore.snapdom = snapdom;
    userParamStore.snapdomOptions = { scale: 2 };

    const result = await snapdomScreenShot(
      jest.fn(),
      {} as CanvasRenderingContext2D,
      mouseEvents
    );

    expect(result).toBe(renderedCanvas);
    expect(snapdom.toCanvas).toHaveBeenCalledWith(customDom, { scale: 2 });
    expect(initScreenShot).toHaveBeenCalledWith(
      expect.any(Function),
      {},
      renderedCanvas,
      mouseEvents
    );
  });

  test("未引入 SnapDOM 时会抛出明确错误", () => {
    expect(() => resolveSnapDomRenderer()).toThrow(
      'capture.source 为 "snapdom" 时，需要先引入 SnapDOM'
    );
  });
});
