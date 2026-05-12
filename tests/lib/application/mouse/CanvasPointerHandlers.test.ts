import { handleCanvasPointerDown } from "@/lib/application/CanvasPointerHandlers";
import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { SquareElement } from "@/lib/type/editor/canvasElements";
import * as CanvasElementEditUtils from "@/lib/shared/canvas/CanvasElementEditUtils";

jest.mock("nanoid", () => ({ nanoid: () => "mock-id" }));

describe("CanvasPointerHandlers - drag offsets", () => {
  beforeEach(() => {
    drawingDataStore.reset();
    cropBoxStore.reset();
    toolBarStore.reset();
    screenDomStore.reset();
    screenShotCanvasStore.reset();
    userParamStore.reset();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("preserves cursor offset when dragging non-text elements with text tool active", () => {
    const calculateOffsetSpy = jest
      .spyOn(CanvasElementEditUtils, "calculateElementDragOffset")
      .mockReturnValue({ x: 10, y: 15 });
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    document.body.appendChild(canvas);
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    screenDomStore.screenShotController = canvas as HTMLCanvasElement;
    screenShotCanvasStore.updateScreenShotCanvas(context);
    cropBoxStore.setCutOutBoxPosition(0, 0, 300, 300);
    drawingDataStore.updateTempGraphPosition(0, 0, 300, 300);

    const elementId = "square";
    drawingDataStore.addElement({
      id: elementId,
      type: "square",
      element: {
        id: elementId,
        x: 50,
        y: 40,
        width: 40,
        height: 30,
        color: "#000",
        borderWidth: 2
      } as SquareElement
    });
    drawingDataStore.updateActiveElementId(elementId);
    expect(drawingDataStore.activeElementId).toBe(elementId);

    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("text");
    toolBarStore.setSelectedColor("#000");
    screenDomStore.setCursorStyle("move");
    cropBoxStore.setDragging(true);

    const mouseDown = new MouseEvent("mousedown", { button: 0 });
    Object.defineProperty(mouseDown, "offsetX", { value: 60 });
    Object.defineProperty(mouseDown, "offsetY", { value: 42 });
    handleCanvasPointerDown(mouseDown);
    expect(drawingDataStore.activeElementId).toBe(elementId);

    expect(calculateOffsetSpy).toHaveBeenCalledWith(60, 42, elementId);
  });
});
