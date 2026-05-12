import drawingDataStore from "@/store/DrawingDataStore";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import { SquareElement, TextElement } from "@/lib/type/editor/canvasElements";

const createSquareSnapshot = (
  id: string,
  width: number,
  height: number,
  overrides: Partial<SquareElement> = {}
): CanvasElementSnapshot => ({
  id,
  type: "square",
  element: {
    id,
    x: overrides.x ?? 0,
    y: overrides.y ?? 0,
    width,
    height,
    borderWidth: overrides.borderWidth ?? 0,
    color: overrides.color ?? "#000",
    drawNode: overrides.drawNode,
    dotRadius: overrides.dotRadius
  }
});

const createTextSnapshot = (
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  overrides: Partial<TextElement> = {}
): CanvasElementSnapshot => ({
  id,
  type: "text",
  element: {
    id,
    x,
    y,
    width,
    height,
    color: overrides.color ?? "#000",
    fontSize: overrides.fontSize ?? 16,
    text: overrides.text ?? "text",
    borderWidth: overrides.borderWidth ?? 1,
    drawNode: overrides.drawNode
  }
});

describe("DrawingDataStore", () => {
  afterEach(() => {
    drawingDataStore.reset();
  });

  test("clearEmptyCanvasElements 仅保留有尺寸的元素", () => {
    const valid = createSquareSnapshot("valid", 12, 10);
    const zeroSize = createSquareSnapshot("zero", 0, 0);
    const nullElement = {
      id: "null",
      type: "square" as const,
      element: null as unknown as SquareElement
    };

    drawingDataStore.canvasElements = [valid, zeroSize, nullElement];
    const callback = jest.fn();

    drawingDataStore.clearEmptyCanvasElements(callback);

    expect(callback).toHaveBeenCalledWith(1);
    expect(drawingDataStore.canvasElements).toHaveLength(1);
    expect(drawingDataStore.canvasElements[0].id).toBe("valid");
  });

  test("updateRectOperateIndex 支持重置为 null", () => {
    drawingDataStore.updateRectOperateIndex(3);
    expect(drawingDataStore.rectOperateIndex).toBe(3);

    drawingDataStore.updateRectOperateIndex(null);
    expect(drawingDataStore.rectOperateIndex).toBeNull();
  });

  test("checkMouseInElement 根据命中状态回调元素 id 或 null", () => {
    const square = createSquareSnapshot("hit-square", 20, 20);
    drawingDataStore.canvasElements = [square];

    const hitCallback = jest.fn();
    drawingDataStore.checkMouseInElement(0, 0, hitCallback);
    expect(hitCallback).toHaveBeenCalledWith("hit-square");

    const missCallback = jest.fn();
    drawingDataStore.checkMouseInElement(50, 50, missCallback);
    expect(missCallback).toHaveBeenCalledWith(null);
    expect(drawingDataStore.activeElementId).toBeNull();
  });

  test("checkMouseInElement 可以识别文本元素", () => {
    const textElement = createTextSnapshot("text", 10, 10, 40, 20);
    drawingDataStore.canvasElements = [textElement];

    const hitCallback = jest.fn();
    drawingDataStore.checkMouseInElement(20, 15, hitCallback);
    expect(hitCallback).toHaveBeenCalledWith("text");

    const missCallback = jest.fn();
    drawingDataStore.checkMouseInElement(2, 2, missCallback);
    expect(missCallback).toHaveBeenCalledWith(null);
  });

  test("clearEmptyCanvasElements 不移除有效的文本元素", () => {
    const textElement = createTextSnapshot("text", 0, 0, 0, 0, {
      text: "hi"
    });
    drawingDataStore.canvasElements = [textElement];
    const callback = jest.fn();

    drawingDataStore.clearEmptyCanvasElements(callback);

    expect(callback).toHaveBeenCalledWith(1);
    expect(drawingDataStore.canvasElements).toHaveLength(1);
    expect(drawingDataStore.canvasElements[0].id).toBe("text");
  });

  test("updateCanvasElement 文本元素宽高为 0 时保留旧值", () => {
    const textElement = createTextSnapshot("text", 0, 0, 20, 10, {
      text: "hi"
    });
    drawingDataStore.canvasElements = [textElement];

    drawingDataStore.updateCanvasElement({
      id: "text",
      x: 5,
      y: 5,
      width: 0,
      height: 0,
      color: "#f00",
      fontSize: 16,
      text: "hi",
      borderWidth: 1
    } as unknown as TextElement);

    const updated = drawingDataStore.canvasElements[0].element as TextElement;
    expect(updated.width).toBe(20);
    expect(updated.height).toBe(10);
    expect(updated.x).toBe(5);
    expect(updated.y).toBe(5);
  });
});
