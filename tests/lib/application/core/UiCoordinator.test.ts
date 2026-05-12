jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

import {
  registerContainerShortcuts,
  registerForRightClickEvent,
  showToolBar
} from "@/lib/application/core/UiCoordinator";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { disposeDomDisposers } from "@/store/dom/domDisposers";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("UiCoordinator disposer registration", () => {
  beforeEach(() => {
    disposeDomDisposers();
    resetAllStores();
  });

  afterEach(() => {
    disposeDomDisposers();
    resetAllStores();
  });

  test("右键监听会通过 disposer 释放", () => {
    const container = document.createElement("div");
    const addSpy = jest.spyOn(container, "addEventListener");
    const removeSpy = jest.spyOn(container, "removeEventListener");

    registerForRightClickEvent(container);
    const handler = addSpy.mock.calls.find(([type]) => type === "contextmenu")?.[1];

    disposeDomDisposers();

    expect(handler).toEqual(expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("contextmenu", handler);
  });

  test("文本输入快捷键监听会通过 disposer 释放", () => {
    const container = document.createElement("div");
    const addSpy = jest.spyOn(container, "addEventListener");
    const removeSpy = jest.spyOn(container, "removeEventListener");

    registerContainerShortcuts(container);
    const handler = addSpy.mock.calls.find(([type]) => type === "keydown")?.[1];

    disposeDomDisposers();

    expect(handler).toEqual(expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("keydown", handler);
  });

  test("全屏截图工具栏定位会扣除 Electron 菜单栏高度", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.top = "0px";
    canvas.style.height = "600px";
    Object.defineProperty(canvas, "clientHeight", { value: 600 });

    const toolbar = document.createElement("div");
    Object.defineProperty(toolbar, "offsetWidth", { value: 200 });
    Object.defineProperty(toolbar, "offsetHeight", { value: 44 });

    screenDomStore.screenShotController = canvas;
    toolPanelDomStore.toolController = toolbar;
    userParamStore.setMenuBarHeight(22);

    showToolBar(
      { startX: 0, startY: 0, width: 800, height: 578 },
      1,
      "center",
      true,
      64
    );

    expect(toolbar.style.top).toBe("514px");
    expect(toolbar.style.left).toBe("300px");
    expect(toolBarStore.isToolbarAnchoredAbove()).toBe(true);
  });

  test("选区下方空间不足时会为工具栏和选项面板整体预留上方空间", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.top = "0px";
    Object.defineProperty(canvas, "clientHeight", { value: 600 });

    const toolbar = document.createElement("div");
    Object.defineProperty(toolbar, "offsetWidth", { value: 200 });
    Object.defineProperty(toolbar, "offsetHeight", { value: 44 });
    Object.defineProperty(toolbar, "offsetTop", {
      get: () => parseInt(toolbar.style.top || "0", 10)
    });
    Object.defineProperty(toolbar, "offsetLeft", {
      get: () => parseInt(toolbar.style.left || "0", 10)
    });

    const optionIco = document.createElement("div");
    const optionPanel = document.createElement("div");
    Object.defineProperty(optionPanel, "offsetHeight", { value: 40 });

    screenDomStore.screenShotController = canvas;
    toolPanelDomStore.toolController = toolbar;
    toolPanelDomStore.optionIcoController = optionIco;
    toolPanelDomStore.optionController = optionPanel;

    showToolBar(
      { startX: 200, startY: 450, width: 300, height: 100 },
      1,
      "center",
      false,
      64
    );
    toolBarStore.setOptionPosition(16);

    expect(toolbar.style.top).toBe("396px");
    expect(toolBarStore.isToolbarAnchoredAbove()).toBe(true);
    expect(optionIco.style.top).toBe("390px");
    expect(optionIco.style.transform).toBe("rotate(0deg)");
    expect(optionPanel.style.top).toBe("350px");
  });

  test("选区下方空间充足时选项面板保持在工具栏下方", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.top = "0px";
    Object.defineProperty(canvas, "clientHeight", { value: 600 });

    const toolbar = document.createElement("div");
    Object.defineProperty(toolbar, "offsetWidth", { value: 200 });
    Object.defineProperty(toolbar, "offsetHeight", { value: 44 });
    Object.defineProperty(toolbar, "offsetTop", {
      get: () => parseInt(toolbar.style.top || "0", 10)
    });
    Object.defineProperty(toolbar, "offsetLeft", {
      get: () => parseInt(toolbar.style.left || "0", 10)
    });

    const optionIco = document.createElement("div");
    const optionPanel = document.createElement("div");
    Object.defineProperty(optionPanel, "offsetHeight", { value: 40 });

    screenDomStore.screenShotController = canvas;
    toolPanelDomStore.toolController = toolbar;
    toolPanelDomStore.optionIcoController = optionIco;
    toolPanelDomStore.optionController = optionPanel;

    showToolBar(
      { startX: 200, startY: 100, width: 300, height: 100 },
      1,
      "center",
      false,
      64
    );
    toolBarStore.setOptionPosition(16);

    expect(toolbar.style.top).toBe("210px");
    expect(toolBarStore.isToolbarAnchoredAbove()).toBe(false);
    expect(optionIco.style.top).toBe("254px");
    expect(optionIco.style.transform).toBe("rotate(180deg)");
    expect(optionPanel.style.top).toBe("260px");
  });
});
