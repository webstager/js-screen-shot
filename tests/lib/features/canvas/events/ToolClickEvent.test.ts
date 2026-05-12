jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

jest.mock("@/lib/features/canvas/drawing/DrawCutOutBox", () => ({
  drawCutOutBox: jest.fn()
}));

jest.mock("@/lib/shared/canvas/CanvasElementEditUtils", () => ({
  hideCanvasActiveElementBorder: jest.fn()
}));

jest.mock("@/lib/shared/canvas/GetCanvasImgData", () => ({
  getCanvasImgData: jest.fn(() => "data:image/png;base64,test")
}));

import {
  configureToolContext,
  drawCutOutBoxWithoutPixel,
  toolClickEvent,
  toolClickEventForUserDefined
} from "@/lib/features/canvas/events/ToolClickEvent";
import cropBoxStore from "@/store/CropBoxStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import toolBarStore from "@/store/ToolBarStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import userParamStore from "@/store/UserParamStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import { resetAllStores } from "@/store/utils/resetRegistry";

const createCanvasContext = () =>
  ({
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    getImageData: jest.fn(() => ({ data: [] })),
    putImageData: jest.fn()
  } as unknown as CanvasRenderingContext2D);

const mountToolbarContext = () => {
  const canvas = document.createElement("canvas");
  const imageCanvas = document.createElement("canvas");
  const context = createCanvasContext();
  Object.defineProperty(canvas, "getContext", {
    value: () => context
  });

  const toolbar = document.createElement("div");
  const confirmButton = document.createElement("div");
  const customButton = document.createElement("div");
  toolbar.appendChild(confirmButton);
  toolbar.appendChild(customButton);
  const optionIco = document.createElement("div");
  const optionPanel = document.createElement("div");
  const textInput = document.createElement("div");

  document.body.append(canvas, toolbar, optionIco, optionPanel, textInput);
  screenDomStore.screenShotController = canvas;
  screenDomStore.textInputController = textInput;
  screenShotCanvasStore.setImageController(imageCanvas);
  toolPanelDomStore.toolController = toolbar;
  toolPanelDomStore.optionIcoController = optionIco;
  toolPanelDomStore.optionController = optionPanel;

  return {
    confirmButton,
    customButton,
    toolbar,
    optionIco,
    optionPanel
  };
};

describe("ToolClickEvent", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetAllStores();
  });

  afterEach(() => {
    configureToolContext({ destroyDom: destroyScreenShotDom });
    resetAllStores();
    document.body.innerHTML = "";
  });

  test("destroyContainer 为 false 时确认截图会保留 DOM 并隐藏工具栏", () => {
    const destroyDom = jest.fn();
    const completeCallback = jest.fn();
    const {
      confirmButton,
      toolbar,
      optionIco,
      optionPanel
    } = mountToolbarContext();
    cropBoxStore.setCutOutBoxPosition(1, 2, 30, 40);
    userParamStore.setDestroyContainerState(false);
    configureToolContext({ destroyDom });

    toolClickEvent(
      "confirm",
      7,
      {
        target: confirmButton,
        path: [confirmButton, toolbar]
      } as unknown as MouseEvent,
      completeCallback,
      undefined
    );

    expect(completeCallback).toHaveBeenCalledWith({
      base64: "data:image/png;base64,test",
      cutInfo: { startX: 1, startY: 2, width: 30, height: 40 }
    });
    expect(destroyDom).not.toHaveBeenCalled();
    expect(toolbar.style.display).toBe("none");
    expect(optionIco.style.display).toBe("none");
    expect(optionPanel.style.display).toBe("none");
  });

  test("自定义工具栏点击回调会携带当前图像与裁剪框信息", () => {
    const clickFn = jest.fn();
    const { customButton, toolbar } = mountToolbarContext();
    cropBoxStore.setCutOutBoxPosition(5, 6, 70, 80);

    toolClickEventForUserDefined(
      101,
      "star",
      "./active-star.png",
      clickFn,
      {
        target: customButton,
        path: [customButton, toolbar]
      } as unknown as MouseEvent
    );

    expect(clickFn).toHaveBeenCalledWith(
      expect.objectContaining({
        currentInfo: { toolName: "star", toolId: 101 },
        imgInfo: {
          base64: "data:image/png;base64,test",
          cutInfo: { startX: 5, startY: 6, width: 70, height: 80 }
        }
      })
    );
  });

  test("工具栏在选区上方时首次点击工具不会再二次上移", () => {
    mountToolbarContext();
    const canvas = screenDomStore.screenShotController as HTMLCanvasElement;
    const imageCanvas = screenShotCanvasStore.imageController as HTMLCanvasElement;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const mockToolBarStore = {
      ...toolBarStore,
      setToolStatus: jest.fn(),
      setToolInfo: jest.fn(),
      getToolPosition: jest.fn(() => ({ left: 20, top: 100 })),
      isToolbarAnchoredAbove: jest.fn(() => true)
    };
    cropBoxStore.setCutOutBoxPosition(10, 10, 100, 100);
    configureToolContext({
      toolBarStore: mockToolBarStore as unknown as typeof toolBarStore
    });

    drawCutOutBoxWithoutPixel(context, canvas, imageCanvas);

    expect(mockToolBarStore.setToolStatus).toHaveBeenCalledWith(true);
    expect(mockToolBarStore.setToolInfo).not.toHaveBeenCalled();
  });
});
