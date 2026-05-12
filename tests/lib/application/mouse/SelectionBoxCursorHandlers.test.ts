jest.mock("@/lib/shared/dom/UpdateContainerMouseStyle", () => ({
  updateContainerMouseStyle: jest.fn()
}));

jest.mock("@/lib/features/canvas/drawing/DrawCutOutBox", () => ({
  drawCutOutBox: jest.fn()
}));

import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolBarStore from "@/store/ToolBarStore";
import cropBoxStore from "@/store/CropBoxStore";
import {
  updateCursorOnSelectionBorder,
  renderTempSelectionBounds
} from "@/lib/application/mouse/SelectionBoxCursorHandlers";
import {
  CropBoxBorderOption,
  CropBoxBorderStyleIndex
} from "@/lib/constants/cropBoxOptions";
import { drawCutOutBox } from "@/lib/features/canvas/drawing/DrawCutOutBox";
import { updateContainerMouseStyle } from "@/lib/shared/dom/UpdateContainerMouseStyle";

const createMockContext = (hit: boolean): CanvasRenderingContext2D =>
  ({
    beginPath: jest.fn(),
    rect: jest.fn(),
    closePath: jest.fn(),
    isPointInPath: jest.fn().mockReturnValue(hit)
  } as unknown as CanvasRenderingContext2D);

describe("SelectionBoxCursorHandlers", () => {
  beforeEach(() => {
    drawingDataStore.reset();
    screenDomStore.reset();
    toolBarStore.reset();
    cropBoxStore.reset();
    jest.clearAllMocks();
  });

  test("updateCursorOnSelectionBorder 命中节点时更新 cursor 与 borderOption", () => {
    const canvas = document.createElement("canvas");
    const ctx = createMockContext(true);

    screenDomStore.screenShotController = canvas;
    drawingDataStore.updateSelectionBorderNodes([
      {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        index: CropBoxBorderStyleIndex.Move,
        option: CropBoxBorderOption.Move
      }
    ]);

    updateCursorOnSelectionBorder(10, 10, ctx);

    expect(screenDomStore.mousePointer).toBe("move");
    expect(drawingDataStore.borderOption).toBe(CropBoxBorderOption.Move);
  });

  test("updateCursorOnSelectionBorder 在工具栏正在操作时触发容器样式更新", () => {
    const canvas = document.createElement("canvas");
    const ctx = createMockContext(true);

    screenDomStore.screenShotController = canvas;
    toolBarStore.toolClickStatus = true;
    toolBarStore.activeTool = "brush";
    drawingDataStore.updateSelectionBorderNodes([
      {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        index: CropBoxBorderStyleIndex.Move,
        option: CropBoxBorderOption.Move
      }
    ]);

    updateCursorOnSelectionBorder(5, 5, ctx);
    expect(updateContainerMouseStyle).toHaveBeenCalledWith(canvas, "brush");
  });

  test("renderTempSelectionBounds 会调用 drawCutOutBox 并写回 store", () => {
    (drawCutOutBox as jest.Mock).mockReturnValue({
      startX: 15,
      startY: 25,
      width: 80,
      height: 60
    });

    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d")!;

    renderTempSelectionBounds(
      {
        startX: 10,
        startY: 20,
        width: 70,
        height: 50
      },
      ctx,
      canvas,
      canvas
    );

    expect(drawCutOutBox).toHaveBeenCalledWith(
      10,
      20,
      70,
      50,
      ctx,
      cropBoxStore.borderSize,
      canvas,
      canvas
    );
    expect(drawingDataStore.tempGraphPosition).toEqual({
      startX: 15,
      startY: 25,
      width: 80,
      height: 60
    });
  });
});
