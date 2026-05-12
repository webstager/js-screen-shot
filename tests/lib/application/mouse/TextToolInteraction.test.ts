jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

import { handleTextToolInteraction } from "@/lib/application/mouse/TextToolInteraction";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import textInputStore from "@/store/TextInputStore";
import toolBarStore from "@/store/ToolBarStore";
import { CANVAS_RESIZE_POINTERS } from "@/lib/constants/canvasTools";
import cropBoxStore from "@/store/CropBoxStore";
import { showCanvasActiveElementBorder } from "@/lib/shared/canvas/CanvasElementEditUtils";
import { TextElement } from "@/lib/type/editor/canvasElements";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { handleToolbarDrawing } from "@/lib/application/mouse/ToolbarDrawingHandler";

const createCanvasContext = () =>
  (() => {
    const noop = jest.fn();
    return {
      save: noop,
      restore: noop,
      fillText: noop,
      measureText: jest.fn((text: string) => ({ width: text.length * 5 })),
      getImageData: jest.fn(() => ({ data: [] })),
      putImageData: noop,
      clearRect: noop,
      setLineDash: noop,
      beginPath: noop,
      rect: noop,
      stroke: noop,
      clip: noop,
      arc: noop,
      fill: noop,
      moveTo: noop,
      lineTo: noop,
      closePath: noop,
      translate: noop,
      rotate: noop,
      scale: noop,
      canvas: { width: 200, height: 200 }
    } as unknown as CanvasRenderingContext2D;
  })();

const setupTextEnvironment = () => {
  const textInput = document.createElement("div");
  Object.defineProperty(textInput, "offsetHeight", { value: 10 });
  textInput.focus = jest.fn();

  const canvas = document.createElement("canvas");
  Object.defineProperty(canvas, "width", { value: 200, writable: true });
  Object.defineProperty(canvas, "height", { value: 200, writable: true });

  const canvasContext = createCanvasContext();
  Object.defineProperty(canvas, "getContext", {
    value: () => canvasContext
  });

  screenDomStore.screenShotController = canvas;
  screenDomStore.textInputController = textInput;
  screenShotCanvasStore.screenShotCanvas = canvasContext;
  drawingDataStore.updateMouseInsideCropBox(true);

  return { textInput, canvasContext };
};

const createToolbarDom = () => {
  const toolbar = document.createElement("div");
  toolbar.id = "toolPanel";
  const squareItem = document.createElement("div");
  squareItem.className = "item-panel square";
  squareItem.dataset.id = "1";
  toolbar.appendChild(squareItem);
  toolPanelDomStore.toolController = toolbar;
  return { toolbar, squareItem };
};

describe("TextToolInteraction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    drawingDataStore.reset();
    screenDomStore.reset();
    toolBarStore.reset();
    toolPanelDomStore.reset();
    textInputStore.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("committing text via mouse adds a history entry", () => {
    const { textInput, canvasContext } = setupTextEnvironment();

    handleTextToolInteraction(10, 10, {
      textInputController: textInput,
      canvasContext
    });
    jest.runAllTimers();

    textInput.innerText = "hello";

    handleTextToolInteraction(20, 20, {
      textInputController: textInput,
      canvasContext
    });
    jest.runAllTimers();

    expect(drawingDataStore.canvasElements).toHaveLength(1);
    expect(drawingDataStore.history).toHaveLength(1);
  });

  test("skips text insertion when moving non-text elements with text tool selected", () => {
    const { textInput, canvasContext } = setupTextEnvironment();
    textInput.innerText = "initial";

    drawingDataStore.addElement({
      id: "shape",
      type: "square",
      element: { id: "shape", x: 0, y: 0, width: 20, height: 20, color: "#000", borderWidth: 1 }
    });

    const result = handleTextToolInteraction(5, 5, {
      textInputController: textInput,
      canvasContext
    });
    jest.runAllTimers();

    expect(result).toBe(false);
    expect(textInput.innerText).toBe("initial");
    expect(drawingDataStore.textInputPosition).toEqual({ mouseX: 0, mouseY: 0 });
    expect(drawingDataStore.history).toHaveLength(0);
  });

  test("selecting an existing element syncs toolbar selection and resets text editing state", () => {
    const { textInput } = setupTextEnvironment();
    textInput.innerHTML = "draft";
    const { toolbar, squareItem } = createToolbarDom();

    const squareElement = {
      id: "shape",
      type: "square" as const,
      element: { id: "shape", x: 0, y: 0, width: 10, height: 10, color: "#000", borderWidth: 1 }
    };
    drawingDataStore.addElement(squareElement);
    drawingDataStore.updateActiveElementId("shape");
    cropBoxStore.updateDrawGraphPosition(5, 5);

    const pendingText: TextElement = {
      id: "txt",
      x: 1,
      y: 1,
      width: 2,
      height: 2,
      color: "#111",
      fontSize: 12,
      text: "pending",
      borderWidth: 1
    };
    drawingDataStore.updateEditingTextElementId("txt");
    drawingDataStore.updatePendingEditingTextElement(pendingText);
    drawingDataStore.updateTextInputPosition(10, 12);
    textInputStore.setTextStatus(true);

    showCanvasActiveElementBorder(2);

    expect(toolBarStore.toolName).toBe("square");
    expect(toolBarStore.activeTool).toBe("square");
    expect(toolBarStore.toolId).toBe(1);
    expect(squareItem.classList.contains("square-active")).toBe(true);
    expect(drawingDataStore.editingTextElementId).toBeNull();
    expect(drawingDataStore.pendingEditingTextElement).toBeNull();
    expect(drawingDataStore.textInputPosition).toEqual({ mouseX: 0, mouseY: 0 });
    expect(screenDomStore.textInputController?.innerHTML).toBe("");
  });

  test("dragging existing element while on another tool syncs toolbar and clears text editing", () => {
    const { textInput, canvasContext } = setupTextEnvironment();
    const { squareItem } = createToolbarDom();
    textInput.innerHTML = "draft";
    const pendingText: TextElement = {
      id: "txt",
      x: 1,
      y: 1,
      width: 2,
      height: 2,
      color: "#111",
      fontSize: 12,
      text: "pending",
      borderWidth: 1
    };
    drawingDataStore.updateEditingTextElementId("txt");
    drawingDataStore.updatePendingEditingTextElement(pendingText);
    drawingDataStore.updateTextInputPosition(10, 12);
    textInputStore.setTextStatus(true);

    drawingDataStore.addElement({
      id: "shape",
      type: "square",
      element: { id: "shape", x: 0, y: 0, width: 10, height: 10, color: "#000", borderWidth: 1 }
    });
    drawingDataStore.updateActiveElementId("shape");
    drawingDataStore.updateTempGraphPosition(0, 0, 200, 200);
    cropBoxStore.setCutOutBoxPosition(0, 0, 200, 200);

    screenDomStore.setCursorStyle("move");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("text");
    toolBarStore.setToolId(6);

    handleToolbarDrawing({
      startX: 5,
      startY: 5,
      currentX: 15,
      currentY: 15,
      tempWidth: 10,
      tempHeight: 10,
      event: new MouseEvent("mousemove"),
      drawArrow: { draw: jest.fn() } as any,
      dragOffset: { x: 0, y: 0 },
      prevElementId: "shape"
    });

    expect(toolBarStore.toolName).toBe("square");
    expect(squareItem.classList.contains("square-active")).toBe(true);
    expect(drawingDataStore.editingTextElementId).toBeNull();
    expect(drawingDataStore.pendingEditingTextElement).toBeNull();
    expect(drawingDataStore.textInputPosition).toEqual({ mouseX: 0, mouseY: 0 });
    expect(screenDomStore.textInputController?.innerHTML).toBe("");
  });
});
