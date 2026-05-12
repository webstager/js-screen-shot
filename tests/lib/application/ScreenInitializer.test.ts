jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

const mockIsPC = jest.fn();
const mockIsTouchDevice = jest.fn();

jest.mock("@/lib/shared/platform/DeviceTypeVerif", () => ({
  isPC: mockIsPC,
  isTouchDevice: mockIsTouchDevice
}));

jest.mock("@/lib/features/canvas/drawing/DrawMasking", () => ({
  drawMasking: jest.fn()
}));

import { initScreenShot } from "@/lib/application/core/ScreenInitializer";
import screenDomStore from "@/store/dom/ScreenDomStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import { disposeDomDisposers } from "@/store/dom/domDisposers";
import { resetAllStores } from "@/store/utils/resetRegistry";

const createCanvasContext = () =>
  ({
    canvas: document.createElement("canvas"),
    clearRect: jest.fn(),
    drawImage: jest.fn()
  } as unknown as CanvasRenderingContext2D);

describe("ScreenInitializer", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    resetAllStores();
    disposeDomDisposers();
    mockIsPC.mockReset();
    mockIsTouchDevice.mockReset();
  });

  afterEach(() => {
    disposeDomDisposers();
    resetAllStores();
  });

  test("initScreenShot 注册的鼠标监听会通过 disposer 释放", () => {
    mockIsPC.mockReturnValue(true);
    mockIsTouchDevice.mockReturnValue(false);
    const controller = document.createElement("canvas");
    const addSpy = jest.spyOn(controller, "addEventListener");
    const removeSpy = jest.spyOn(controller, "removeEventListener");
    const mouseEvents = {
      mouseDownEvent: jest.fn(),
      mouseMoveEvent: jest.fn(),
      mouseUpEvent: jest.fn()
    };
    screenDomStore.screenShotController = controller;

    initScreenShot(undefined, createCanvasContext(), document.createElement("canvas"), mouseEvents);

    expect(addSpy).toHaveBeenCalledWith("mousedown", mouseEvents.mouseDownEvent);
    expect(addSpy).toHaveBeenCalledWith("mousemove", mouseEvents.mouseMoveEvent);
    expect(addSpy).toHaveBeenCalledWith("mouseup", mouseEvents.mouseUpEvent);
    expect(screenShotCanvasStore.screenShotCanvas).not.toBeNull();

    disposeDomDisposers();

    expect(removeSpy).toHaveBeenCalledWith("mousedown", mouseEvents.mouseDownEvent);
    expect(removeSpy).toHaveBeenCalledWith("mousemove", mouseEvents.mouseMoveEvent);
    expect(removeSpy).toHaveBeenCalledWith("mouseup", mouseEvents.mouseUpEvent);
  });

  test("initScreenShot 注册的触摸监听会通过 disposer 释放", () => {
    mockIsPC.mockReturnValue(false);
    mockIsTouchDevice.mockReturnValue(true);
    const controller = document.createElement("canvas");
    const addSpy = jest.spyOn(controller, "addEventListener");
    const removeSpy = jest.spyOn(controller, "removeEventListener");
    const mouseEvents = {
      mouseDownEvent: jest.fn(),
      mouseMoveEvent: jest.fn(),
      mouseUpEvent: jest.fn()
    };
    screenDomStore.screenShotController = controller;

    initScreenShot(undefined, createCanvasContext(), document.createElement("canvas"), mouseEvents);

    expect(addSpy).toHaveBeenCalledWith("touchstart", mouseEvents.mouseDownEvent, false);
    expect(addSpy).toHaveBeenCalledWith("touchmove", mouseEvents.mouseMoveEvent, false);
    expect(addSpy).toHaveBeenCalledWith("touchend", mouseEvents.mouseUpEvent, false);

    disposeDomDisposers();

    expect(removeSpy).toHaveBeenCalledWith("touchstart", mouseEvents.mouseDownEvent, false);
    expect(removeSpy).toHaveBeenCalledWith("touchmove", mouseEvents.mouseMoveEvent, false);
    expect(removeSpy).toHaveBeenCalledWith("touchend", mouseEvents.mouseUpEvent, false);
  });
});
