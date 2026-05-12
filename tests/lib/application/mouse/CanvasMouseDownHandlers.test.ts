jest.mock("@/lib/features/canvas/drawing/DrawCutOutBox", () => ({
  drawCutOutBox: jest.fn(() => ({
    startX: 0,
    startY: 0,
    width: 315,
    height: 235
  }))
}));

import { captureFullScreenSelection } from "@/lib/application/mouse/CanvasMouseDownHandlers";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import drawingDataStore from "@/store/DrawingDataStore";
import { resetAllStores } from "@/store/utils/resetRegistry";
import { createMockCanvasContext } from "../../../helpers/canvas";

describe("CanvasMouseDownHandlers", () => {
  beforeEach(() => {
    resetAllStores();
    jest.clearAllMocks();
  });

  afterEach(() => {
    resetAllStores();
  });

  test("单击截全屏在样式尺寸为空时使用可视尺寸绘制裁剪框", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    Object.defineProperty(canvas, "clientWidth", { value: 320 });
    Object.defineProperty(canvas, "clientHeight", { value: 240 });
    const imageCanvas = document.createElement("canvas");
    const context = createMockCanvasContext();

    screenDomStore.screenShotController = canvas;
    screenShotCanvasStore.updateScreenShotCanvas(context);

    captureFullScreenSelection(imageCanvas);

    expect(drawCutOutBox).toHaveBeenCalledWith(
      0,
      0,
      315,
      235,
      screenShotCanvasStore.screenShotCanvas,
      10,
      canvas,
      imageCanvas
    );
    expect(drawingDataStore.tempGraphPosition).toEqual({
      startX: 0,
      startY: 0,
      width: 315,
      height: 235
    });
  });
});
