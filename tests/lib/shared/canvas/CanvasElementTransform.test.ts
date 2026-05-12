jest.mock("@/lib/shared/canvas/CanvasSurface", () => ({
  clearCanvasSurface: jest.fn()
}));

import {
  calculateNewEllipsePosition,
  calculateNewRectanglePosition,
  moveCanvasElementOnCanvas,
  resizeCanvasElementOnCanvas
} from "@/lib/shared/canvas/CanvasElementTransform";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { resetAllStores } from "@/store/utils/resetRegistry";
import { createMockCanvasContext } from "../../../helpers/canvas";

describe("CanvasElementTransform", () => {
  beforeEach(() => {
    resetAllStores();
    drawingDataStore.updateTempGraphPosition(0, 0, 100, 100);
    screenShotCanvasStore.screenShotCanvas = createMockCanvasContext({
      canvas: { width: 120, height: 120 } as HTMLCanvasElement
    });
  });

  afterEach(() => {
    resetAllStores();
  });

  test("calculateNewRectanglePosition 会把移动限制在裁剪区域内", () => {
    expect(
      calculateNewRectanglePosition(
        { x: 10, y: 10, width: 30, height: 20 },
        { x: 120, y: -10 },
        { startX: 0, startY: 0, width: 100, height: 100 },
        { x: 0, y: 0 }
      )
    ).toMatchObject({
      mouseX: 70,
      mouseY: 0
    });
  });

  test("calculateNewEllipsePosition 返回受限位置和新的中心点", () => {
    expect(
      calculateNewEllipsePosition(
        { id: "round", x: 10, y: 10, width: 40, height: 20, color: "#000", borderWidth: 2 },
        { x: -10, y: 95 },
        { startX: 0, startY: 0, width: 100, height: 100 },
        { x: 0, y: 0 }
      )
    ).toMatchObject({
      mouseX: 0,
      mouseY: 80,
      centerX: 20,
      centerY: 90
    });
  });

  test("moveCanvasElementOnCanvas 可以移动矩形、文字、画笔和箭头并保持边界约束", () => {
    toolBarStore.setSelectedColor("#ff0000");
    toolBarStore.setPenSize(6);
    drawingDataStore.addElement({
      id: "square",
      type: "square",
      element: { id: "square", x: 10, y: 10, width: 20, height: 20, color: "#000", borderWidth: 2 }
    });
    drawingDataStore.addElement({
      id: "text",
      type: "text",
      element: {
        id: "text",
        x: 15,
        y: 15,
        width: 20,
        height: 10,
        color: "#111",
        fontSize: 14,
        text: "A",
        borderWidth: 1
      }
    });
    drawingDataStore.addElement({
      id: "brush",
      type: "brush",
      element: {
        id: "brush",
        x: 10,
        y: 10,
        width: 20,
        height: 10,
        size: 4,
        color: "#222",
        points: [
          { x: 10, y: 10 },
          { x: 30, y: 20 }
        ]
      }
    });
    drawingDataStore.addElement({
      id: "arrow",
      type: "right-top",
      element: {
        id: "arrow",
        arrowType: "line",
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        startX: 10,
        startY: 10,
        endX: 30,
        endY: 30,
        x2: 30,
        y2: 30,
        theta: 30,
        slashLength: 10,
        color: "#333",
        borderWidth: 2
      }
    });

    moveCanvasElementOnCanvas(95, 95, { x: 0, y: 0 }, "square");
    moveCanvasElementOnCanvas(50, 45, { x: 5, y: 5 }, "text");
    moveCanvasElementOnCanvas(40, 40, { x: 10, y: 10 }, "brush");
    moveCanvasElementOnCanvas(80, 80, { x: 0, y: 0 }, "arrow");

    expect(drawingDataStore.getCanvasElement("square")?.element).toMatchObject({
      x: 80,
      y: 80,
      color: "#ff0000",
      borderWidth: 6
    });
    expect(drawingDataStore.getCanvasElement("text")?.element).toMatchObject({
      x: 45,
      y: 40,
      color: "#ff0000"
    });
    expect(drawingDataStore.getCanvasElement("brush")?.element).toMatchObject({
      x: 30,
      y: 30,
      points: [
        { x: 30, y: 30 },
        { x: 50, y: 40 }
      ]
    });
    expect(drawingDataStore.getCanvasElement("arrow")?.element).toMatchObject({
      startX: 80,
      startY: 80,
      endX: 100,
      endY: 100
    });
    expect(screenDomStore.mousePointer).toBe("move");
  });

  test("moveCanvasElementOnCanvas 可以移动自定义元素并保持边界约束", () => {
    drawingDataStore.addElement({
      id: "custom",
      type: "custom",
      element: {
        id: "custom",
        customType: "custom",
        x: 10,
        y: 12,
        width: 25,
        height: 20,
        toolId: 101,
        toolName: "badge"
      }
    });

    moveCanvasElementOnCanvas(120, 120, { x: 5, y: 6 }, "custom");

    expect(drawingDataStore.getCanvasElement("custom")?.element).toMatchObject({
      x: 75,
      y: 80,
      toolId: 101,
      toolName: "badge"
    });
    expect(screenDomStore.mousePointer).toBe("move");
  });

  test("resizeCanvasElementOnCanvas 可以缩放矩形和箭头", () => {
    toolBarStore.setSelectedColor("#00ff00");
    toolBarStore.setPenSize(5);
    drawingDataStore.addElement({
      id: "square",
      type: "square",
      element: { id: "square", x: 10, y: 10, width: 20, height: 20, color: "#000", borderWidth: 2 }
    });
    drawingDataStore.addElement({
      id: "arrow",
      type: "right-top",
      element: {
        id: "arrow",
        arrowType: "line",
        x: 20,
        y: 20,
        width: 20,
        height: 20,
        startX: 20,
        startY: 20,
        endX: 40,
        endY: 40,
        x2: 40,
        y2: 40,
        theta: 30,
        slashLength: 10,
        color: "#333",
        borderWidth: 2
      }
    });

    drawingDataStore.updateRectOperateIndex(2);
    resizeCanvasElementOnCanvas(45, 45, "square");
    drawingDataStore.updateRectOperateIndex(1);
    resizeCanvasElementOnCanvas(70, 80, "arrow");

    expect(drawingDataStore.getCanvasElement("square")?.element).toMatchObject({
      width: 35,
      height: 35,
      color: "#00ff00",
      borderWidth: 5
    });
    expect(drawingDataStore.getCanvasElement("arrow")?.element).toMatchObject({
      endX: 70,
      endY: 80,
      x2: 70,
      y2: 80
    });
  });

  test("resizeCanvasElementOnCanvas 支持自定义元素 adapter", () => {
    userParamStore.setCustomElementAdapters([
      {
        toolId: 101,
        draw: jest.fn(),
        resize: (element, _handleIndex, point) => ({
          ...element,
          width: point.x - element.x,
          height: point.y - element.y
        })
      }
    ]);
    drawingDataStore.addElement({
      id: "custom",
      type: "custom",
      element: {
        id: "custom",
        customType: "custom",
        x: 10,
        y: 12,
        width: 25,
        height: 20,
        toolId: 101,
        toolName: "badge"
      }
    });
    drawingDataStore.updateRectOperateIndex(2);

    resizeCanvasElementOnCanvas(55, 62, "custom");

    expect(drawingDataStore.getCanvasElement("custom")?.element).toMatchObject({
      width: 45,
      height: 50
    });
  });
});
