jest.mock("nanoid", () => ({ nanoid: () => "mock-id" }));

jest.mock("@/lib/shared/canvas/GetCanvasImgData", () => ({
  getCanvasImgData: jest.fn(() => "data:image/png;base64,integration")
}));

import {
  handleCanvasPointerDown,
  handleCanvasPointerMove,
  handleCanvasPointerUp
} from "@/lib/application/CanvasPointerHandlers";
import { DrawArrow } from "@/lib/features/canvas/drawing/DrawArrow";
import {
  configureToolContext,
  toolClickEvent
} from "@/lib/features/canvas/events/ToolClickEvent";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { handleTextToolInteraction } from "@/lib/application/mouse/TextToolInteraction";
import cropBoxStore from "@/store/CropBoxStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import { resetAllStores } from "@/store/utils/resetRegistry";
import {
  createCanvasWithContext,
  createPointerEvent
} from "../../helpers/canvas";
import { squareSnapshot } from "../../fixtures/canvasElements";

const mountInteractionEnvironment = () => {
  document.body.innerHTML = "";
  const { canvas, context } = createCanvasWithContext();

  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = 200;
  imageCanvas.height = 200;
  const textInput = document.createElement("div");
  Object.defineProperty(textInput, "offsetHeight", { value: 10 });
  textInput.focus = jest.fn();

  const toolbar = document.createElement("div");
  const button = document.createElement("div");
  button.dataset.id = "7";
  toolbar.appendChild(button);
  const optionIco = document.createElement("div");
  const optionPanel = document.createElement("div");

  document.body.append(canvas, textInput, toolbar, optionIco, optionPanel);

  screenDomStore.screenShotController = canvas;
  screenDomStore.textInputController = textInput;
  screenShotCanvasStore.updateScreenShotCanvas(context);
  screenShotCanvasStore.setImageController(imageCanvas);
  drawingDataStore.updateMouseInsideCropBox(true);
  toolPanelDomStore.toolController = toolbar;
  toolPanelDomStore.optionIcoController = optionIco;
  toolPanelDomStore.optionController = optionPanel;

  return { canvas, context, imageCanvas, textInput, toolbar, button };
};

const setCropBox = (x = 0, y = 0, width = 120, height = 100) => {
  cropBoxStore.updateDrawGraphPosition(x, y, width, height);
  cropBoxStore.setCutOutBoxPosition(x, y, width, height);
  drawingDataStore.updateTempGraphPosition(x, y, width, height);
};

describe("core interaction integration", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetAllStores();
    configureToolContext({ destroyDom: destroyScreenShotDom });
  });

  afterEach(() => {
    configureToolContext({ destroyDom: destroyScreenShotDom });
    jest.useRealTimers();
    resetAllStores();
    document.body.innerHTML = "";
  });

  test("框选截图区域后同步裁剪框位置、尺寸和边框节点", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 10, 20));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 80, 60),
      imageCanvas,
      new DrawArrow()
    );
    handleCanvasPointerUp(true, imageCanvas, jest.fn());

    expect(cropBoxStore.cutOutBoxPosition).toEqual({
      startX: 10,
      startY: 20,
      width: 70,
      height: 40
    });
    expect(drawingDataStore.selectionBorderNodes.length).toBeGreaterThan(0);
  });

  test("绘制矩形后写入 canvasElements 并记录历史", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox();
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    toolBarStore.setToolId(1);
    toolBarStore.setSelectedColor("#123456");
    toolBarStore.setPenSize(3);
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 20, 20));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 60, 50),
      imageCanvas,
      new DrawArrow()
    );
    handleCanvasPointerUp(false, imageCanvas, jest.fn());

    expect(drawingDataStore.canvasElements).toHaveLength(1);
    expect(drawingDataStore.canvasElements[0]).toMatchObject({
      id: "mock-id",
      type: "square",
      element: {
        x: 20,
        y: 20,
        width: 40,
        height: 30,
        color: "#123456",
        borderWidth: 3
      }
    });
    expect(drawingDataStore.history.length).toBeGreaterThanOrEqual(1);
    expect(drawingDataStore.history.at(-1)?.canvasElements[0]).toMatchObject({
      type: "square",
      element: { width: 40, height: 30 }
    });
  });

  test("开始绘制新元素时会取消已有元素选中状态", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox();
    drawingDataStore.addElement(
      squareSnapshot({
        drawNode: true,
        dotRadius: 4
      })
    );
    drawingDataStore.updateActiveElementId("shape");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    toolBarStore.setToolId(1);
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 70, 70));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 90, 90),
      imageCanvas,
      new DrawArrow()
    );

    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      drawNode: false
    });
    expect(drawingDataStore.activeElementId).toBe("mock-id");
  });

  test("拖拽已有元素后再次开始绘制会取消拖拽元素选中状态", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox(0, 0, 120, 100);
    drawingDataStore.addElement(squareSnapshot());
    drawingDataStore.updateActiveElementId("shape");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    screenDomStore.setCursorStyle("move");
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 15, 15));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 25, 25),
      imageCanvas,
      new DrawArrow()
    );
    handleCanvasPointerUp(true, imageCanvas, jest.fn());

    expect(
      drawingDataStore.history.at(-1)?.canvasElements[0].element?.drawNode
    ).not.toBe(true);
    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      drawNode: true
    });

    handleCanvasPointerDown(createPointerEvent("mousedown", 80, 70));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 100, 90),
      imageCanvas,
      new DrawArrow()
    );

    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      drawNode: false
    });
    expect(drawingDataStore.activeElementId).toBe("mock-id");
  });

  test("拖拽已有元素后开始新建文本会取消拖拽元素选中状态", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox(0, 0, 120, 100);
    drawingDataStore.addElement(squareSnapshot());
    drawingDataStore.updateActiveElementId("shape");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    screenDomStore.setCursorStyle("move");
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 15, 15));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 25, 25),
      imageCanvas,
      new DrawArrow()
    );
    handleCanvasPointerUp(true, imageCanvas, jest.fn());

    toolBarStore.setToolName("text");
    handleCanvasPointerDown(createPointerEvent("mousedown", 80, 70));

    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      drawNode: false
    });
    expect(drawingDataStore.activeElementId).toBeNull();
  });

  test("绘制文字后保存位置、颜色、字号、内容并记录历史", () => {
    const { context, textInput } = mountInteractionEnvironment();
    toolBarStore.setSelectedColor("#654321");
    toolBarStore.setFontSize(18);

    handleTextToolInteraction(30, 40, {
      textInputController: textInput,
      canvasContext: context
    });
    jest.runAllTimers();
    textInput.innerText = "hello";
    handleTextToolInteraction(80, 90, {
      textInputController: textInput,
      canvasContext: context
    });
    jest.runAllTimers();

    expect(drawingDataStore.canvasElements).toHaveLength(1);
    expect(drawingDataStore.canvasElements[0]).toMatchObject({
      type: "text",
      element: {
        x: 30,
        color: "#654321",
        fontSize: 18,
        text: "hello"
      }
    });
    expect(drawingDataStore.history).toHaveLength(1);
  });

  test("移动已有元素时坐标变化且被限制在裁剪框内", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox(0, 0, 100, 100);
    drawingDataStore.addElement(squareSnapshot());
    drawingDataStore.updateActiveElementId("shape");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    screenDomStore.setCursorStyle("move");
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 15, 15));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 120, 120),
      imageCanvas,
      new DrawArrow()
    );

    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      x: 70,
      y: 80
    });
  });

  test("拖拽其他已有元素结束后会选中本次拖拽的元素", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox(0, 0, 120, 100);
    drawingDataStore.addElement(
      squareSnapshot({
        drawNode: true,
        dotRadius: 4
      })
    );
    drawingDataStore.addElement({
      ...squareSnapshot({
        id: "target",
        x: 50,
        y: 10,
        width: 20,
        height: 20,
        drawNode: false
      }),
      id: "target"
    });
    drawingDataStore.updateActiveElementId("shape");
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    screenDomStore.setCursorStyle("move");
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 55, 15));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 65, 25),
      imageCanvas,
      new DrawArrow()
    );
    handleCanvasPointerUp(true, imageCanvas, jest.fn());

    expect(drawingDataStore.activeElementId).toBe("target");
    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      drawNode: false
    });
    expect(drawingDataStore.getCanvasElement("target")?.element).toMatchObject({
      x: 60,
      y: 20,
      drawNode: true
    });
  });

  test("缩放已有矩形后更新元素尺寸", () => {
    const { imageCanvas } = mountInteractionEnvironment();
    setCropBox(0, 0, 100, 100);
    drawingDataStore.addElement(squareSnapshot());
    drawingDataStore.updateActiveElementId("shape");
    drawingDataStore.updateRectOperateIndex(2);
    toolBarStore.setToolClickStatus(true);
    toolBarStore.setToolName("square");
    cropBoxStore.setDragging(true);

    handleCanvasPointerDown(createPointerEvent("mousedown", 40, 30));
    handleCanvasPointerMove(
      createPointerEvent("mousemove", 60, 50),
      imageCanvas,
      new DrawArrow()
    );

    expect(drawingDataStore.getCanvasElement("shape")?.element).toMatchObject({
      width: 50,
      height: 40
    });
  });

  test("撤销会回退 history 和 canvasElements", () => {
    const { button, toolbar } = mountInteractionEnvironment();
    const firstElements = [
      {
        id: "shape",
        type: "square",
        element: {
          id: "shape",
          x: 10,
          y: 10,
          width: 20,
          height: 20,
          color: "#000",
          borderWidth: 2
        }
      }
    ];
    const secondElements = [
      {
        ...firstElements[0],
        element: { ...firstElements[0].element, x: 40 }
      }
    ];
    drawingDataStore.pushHistory({ data: {} as ImageData, canvasElements: firstElements });
    drawingDataStore.pushHistory({ data: {} as ImageData, canvasElements: secondElements });
    drawingDataStore.replaceCanvasElements(secondElements as any);
    toolBarStore.setToolClickStatus(true);

    toolClickEvent(
      "undo",
      8,
      { target: button, path: [button, toolbar] } as unknown as MouseEvent,
      undefined,
      undefined
    );

    expect(drawingDataStore.history).toHaveLength(1);
    expect(drawingDataStore.canvasElements[0].element).toMatchObject({ x: 10 });
  });

  test("确认截图返回 base64 和 cutInfo，关闭截图触发 closeCallback", () => {
    const { button, toolbar } = mountInteractionEnvironment();
    setCropBox(3, 4, 50, 60);
    const completeCallback = jest.fn();
    const closeCallback = jest.fn();
    const destroyDom = jest.fn();
    configureToolContext({ destroyDom });
    toolBarStore.setToolClickStatus(true);

    toolClickEvent(
      "confirm",
      7,
      { target: button, path: [button, toolbar] } as unknown as MouseEvent,
      completeCallback,
      closeCallback
    );

    expect(completeCallback).toHaveBeenCalledWith({
      base64: "data:image/png;base64,integration",
      cutInfo: { startX: 3, startY: 4, width: 50, height: 60 }
    });
    expect(destroyDom).toHaveBeenCalledTimes(1);

    toolClickEvent(
      "close",
      9,
      { target: button, path: [button, toolbar] } as unknown as MouseEvent,
      completeCallback,
      closeCallback
    );

    expect(closeCallback).toHaveBeenCalledTimes(1);
  });
});
