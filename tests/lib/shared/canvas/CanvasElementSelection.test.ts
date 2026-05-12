jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

jest.mock("@/lib/shared/canvas/CanvasSurface", () => ({
  clearCanvasSurface: jest.fn()
}));

jest.mock("@/lib/features/canvas/state/AddHistoryData", () => ({
  addHistory: jest.fn()
}));

jest.mock("@/lib/shared/canvas/CanvasElementToolbarSync", () => ({
  syncToolbarWithElement: jest.fn()
}));

import {
  deleteActiveCanvasElement,
  hideCanvasActiveElementBorder,
  showCanvasActiveElementBorder
} from "@/lib/shared/canvas/CanvasElementSelection";
import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { resetAllStores } from "@/store/utils/resetRegistry";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { createMockCanvasContext } from "../../../helpers/canvas";

describe("CanvasElementSelection", () => {
  beforeEach(() => {
    resetAllStores();
    cropBoxStore.updateDrawGraphPosition(10, 10, 100, 100);
    screenShotCanvasStore.screenShotCanvas = createMockCanvasContext({
      canvas: { width: 120, height: 120 } as HTMLCanvasElement
    });
  });

  afterEach(() => {
    resetAllStores();
  });

  test("showCanvasActiveElementBorder 会显示矩形选中边框并设置 cursor", () => {
    drawingDataStore.addElement({
      id: "square",
      type: "square",
      element: {
        id: "square",
        x: 10,
        y: 10,
        width: 40,
        height: 30,
        color: "#000",
        borderWidth: 2
      }
    });
    drawingDataStore.updateActiveElementId("square");

    showCanvasActiveElementBorder(4);

    expect(drawingDataStore.getCanvasElement("square")?.element).toMatchObject({
      drawNode: true,
      dotRadius: 4
    });
    expect(screenDomStore.mousePointer).toBe("move");
  });

  test("showCanvasActiveElementBorder 会显示自定义元素选中边框", () => {
    drawingDataStore.addElement({
      id: "custom",
      type: "custom",
      element: {
        id: "custom",
        customType: "custom",
        x: 5,
        y: 5,
        width: 30,
        height: 20,
        toolId: 101,
        toolName: "badge"
      }
    });
    drawingDataStore.updateActiveElementId("custom");

    showCanvasActiveElementBorder(4);

    expect(drawingDataStore.getCanvasElement("custom")?.element).toMatchObject({
      drawNode: true,
      dotRadius: 4
    });
    expect(screenDomStore.mousePointer).toBe("move");
  });

  test("hideCanvasActiveElementBorder 会隐藏已有选中边框", () => {
    drawingDataStore.addElement({
      id: "text",
      type: "text",
      element: {
        id: "text",
        x: 10,
        y: 10,
        width: 40,
        height: 20,
        color: "#111",
        fontSize: 14,
        text: "hello",
        borderWidth: 1,
        drawNode: true
      }
    });
    drawingDataStore.updateActiveElementId("text");

    expect(hideCanvasActiveElementBorder()).toBe(true);

    expect(drawingDataStore.activeElementId).toBeNull();
    expect(drawingDataStore.getCanvasElement("text")?.element?.drawNode).toBe(false);
  });

  test("deleteActiveCanvasElement 会删除当前元素并记录历史", () => {
    drawingDataStore.addElement({
      id: "square",
      type: "square",
      element: {
        id: "square",
        x: 10,
        y: 10,
        width: 40,
        height: 30,
        color: "#000",
        borderWidth: 2
      }
    });
    drawingDataStore.updateActiveElementId("square");
    drawingDataStore.updateRectOperateIndex(2);

    expect(deleteActiveCanvasElement()).toBe(true);

    expect(drawingDataStore.getCanvasElement("square")).toBeUndefined();
    expect(drawingDataStore.activeElementId).toBeNull();
    expect(drawingDataStore.rectOperateIndex).toBeNull();
    expect(addHistory).toHaveBeenCalledTimes(1);
  });
});
