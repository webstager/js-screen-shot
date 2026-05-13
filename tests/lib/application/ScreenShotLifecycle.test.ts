jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

jest.mock("@/lib/application/LoadCoreComponents", () => ({
  adjustContainerLevels: jest.fn(),
  executeLoadPlan: jest.fn(),
  isCustomTool: jest.fn(() => false),
  registerContainerShortcuts: jest.fn(),
  registerForRightClickEvent: jest.fn(),
  resolveScreenShotPlan: jest.fn(() => ({
    captureSource: "dom-render",
    renderStrategy: "browser-frame"
  })),
  setScreenShotContainerSize: jest.fn((canvas: HTMLCanvasElement) => {
    canvas.width = 320;
    canvas.height = 180;
  }),
  showCanvasLastHistory: jest.fn()
}));

import ScreenShot from "@/main";
import {
  adjustContainerLevels,
  executeLoadPlan,
  registerContainerShortcuts
} from "@/lib/application/LoadCoreComponents";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import cropBoxStore from "@/store/CropBoxStore";
import { destroyScreenShotDom } from "@/store/dom/domCleanup";
import { resetAllStores } from "@/store/utils/resetRegistry";

const SCREENSHOT_NODE_IDS = [
  "screenShotContainer",
  "toolPanel",
  "optionIcoController",
  "optionPanel",
  "cutBoxSizePanel",
  "textInputPanel"
];

const createScreenShot = () =>
  new ScreenShot({
    enableWebRtc: false,
    canvasWidth: 320,
    canvasHeight: 180
  });

describe("ScreenShot lifecycle", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetAllStores();
    jest.clearAllMocks();
  });

  afterEach(() => {
    destroyScreenShotDom();
    document.body.innerHTML = "";
  });

  test("创建实例后会生成基础 DOM、hydrate store 并启动加载流程", () => {
    createScreenShot();

    SCREENSHOT_NODE_IDS.forEach(id => {
      expect(document.getElementById(id)).not.toBeNull();
    });
    expect(screenDomStore.screenShotController).toBe(
      document.getElementById("screenShotContainer")
    );
    expect(screenDomStore.textInputController).toBe(
      document.getElementById("textInputPanel")
    );
    expect(toolPanelDomStore.toolController).toBe(
      document.getElementById("toolPanel")
    );
    expect(screenDomStore.screenShotController?.style.display).toBe("block");
    expect(adjustContainerLevels).toHaveBeenCalledWith(0);
    expect(registerContainerShortcuts).toHaveBeenCalledWith(
      screenDomStore.textInputController
    );
    expect(executeLoadPlan).toHaveBeenCalledTimes(1);
  });

  test("destroyComponents 会移除 DOM、键盘监听并重置 store 引用", () => {
    const removeSpy = jest.spyOn(document.body, "removeEventListener");
    const screenShot = createScreenShot();
    const keyboardHandler = screenDomStore.keyboardEventHandler;

    expect(keyboardHandler).toEqual(expect.any(Function));

    screenShot.destroyComponents();

    SCREENSHOT_NODE_IDS.forEach(id => {
      expect(document.getElementById(id)).toBeNull();
    });
    expect(removeSpy).toHaveBeenCalledWith("keydown", keyboardHandler);
    expect(screenDomStore.keyboardEventHandler).toBeNull();
    expect(screenDomStore.screenShotController).toBeNull();
    expect(toolPanelDomStore.toolController).toBeNull();

    removeSpy.mockRestore();
  });

  test("重复创建实例时只保留一组截图 DOM", () => {
    createScreenShot();
    const firstDom = document.getElementById("screenShotContainer");

    createScreenShot();

    expect(document.querySelectorAll("#screenShotContainer")).toHaveLength(1);
    expect(firstDom?.isConnected).toBe(false);
  });

  test("getCutBoxInfo 会返回当前裁剪框位置快照", () => {
    const screenShot = createScreenShot();
    cropBoxStore.setCutOutBoxPosition(1, 2, 30, 40);

    const cutBoxInfo = screenShot.getCutBoxInfo();
    cutBoxInfo.startX = 99;

    expect(cutBoxInfo).toEqual({ startX: 99, startY: 2, width: 30, height: 40 });
    expect(cropBoxStore.cutOutBoxPosition).toEqual({
      startX: 1,
      startY: 2,
      width: 30,
      height: 40
    });
  });
});
