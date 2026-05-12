import {
  calculateElementDragOffset,
  handleMouseMoveOnElement
} from "@/lib/shared/canvas/CanvasElementHitTest";
import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import userParamStore from "@/store/UserParamStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("CanvasElementHitTest", () => {
  beforeEach(() => {
    resetAllStores();
    cropBoxStore.updateDrawGraphPosition(0, 0, 200, 200);
  });

  afterEach(() => {
    resetAllStores();
  });

  test("矩形控制点命中时更新操作点和 cursor", () => {
    drawingDataStore.addElement({
      id: "square",
      type: "square",
      element: {
        id: "square",
        x: 10,
        y: 20,
        width: 40,
        height: 30,
        color: "#000",
        borderWidth: 2
      }
    });
    drawingDataStore.updateActiveElementId("square");

    handleMouseMoveOnElement("square", 10, 20, 4);

    expect(drawingDataStore.rectOperateIndex).not.toBeNull();
    expect(screenDomStore.mousePointer).not.toBe("default");
  });

  test("圆形、箭头、文字和画笔元素命中时能计算拖拽偏移", () => {
    drawingDataStore.addElement({
      id: "round",
      type: "round",
      element: {
        id: "round",
        x: 20,
        y: 30,
        width: 50,
        height: 40,
        color: "#111",
        borderWidth: 2
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
        width: 60,
        height: 0,
        startX: 10,
        startY: 10,
        endX: 70,
        endY: 10,
        x2: 70,
        y2: 10,
        theta: 30,
        slashLength: 10,
        color: "#222",
        borderWidth: 2
      }
    });
    drawingDataStore.addElement({
      id: "text",
      type: "text",
      element: {
        id: "text",
        x: 80,
        y: 40,
        width: 30,
        height: 18,
        color: "#333",
        fontSize: 14,
        text: "hello",
        borderWidth: 1
      }
    });
    drawingDataStore.addElement({
      id: "brush",
      type: "brush",
      element: {
        id: "brush",
        x: 100,
        y: 80,
        width: 20,
        height: 10,
        size: 4,
        color: "#444",
        points: [
          { x: 100, y: 80 },
          { x: 120, y: 90 }
        ]
      }
    });

    expect(calculateElementDragOffset(45, 50, "round")).toEqual({
      x: 25,
      y: 20
    });
    expect(calculateElementDragOffset(40, 10, "arrow")).toEqual({
      x: 30,
      y: 0
    });
    expect(calculateElementDragOffset(90, 50, "text")).toEqual({
      x: 10,
      y: 10
    });
    expect(calculateElementDragOffset(110, 85, "brush")).toEqual({
      x: 10,
      y: 5
    });
  });

  test("自定义元素可以通过 adapter 命中并计算拖拽偏移", () => {
    userParamStore.setCustomElementAdapters([
      {
        toolId: 101,
        draw: jest.fn(),
        hitTest: (_element, point) => point.x === 60 && point.y === 70
      }
    ]);
    drawingDataStore.addElement({
      id: "custom",
      type: "custom",
      element: {
        id: "custom",
        customType: "custom",
        x: 40,
        y: 45,
        width: 30,
        height: 20,
        toolId: 101,
        toolName: "badge"
      }
    });

    handleMouseMoveOnElement("custom", 60, 70, 4);

    expect(drawingDataStore.activeElementId).toBe("custom");
    expect(screenDomStore.mousePointer).toBe("move");
    expect(calculateElementDragOffset(60, 70, "custom")).toEqual({
      x: 20,
      y: 25
    });
  });

  test("未命中元素时清空 active element 和操作点", () => {
    drawingDataStore.updateActiveElementId("square");
    drawingDataStore.updateRectOperateIndex(1);

    handleMouseMoveOnElement(null, 300, 300, 4);

    expect(drawingDataStore.activeElementId).toBeNull();
    expect(drawingDataStore.rectOperateIndex).toBeNull();
    expect(screenDomStore.mousePointer).toBe("default");
  });
});
