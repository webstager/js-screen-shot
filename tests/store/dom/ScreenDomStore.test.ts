import screenDomStore from "@/store/dom/ScreenDomStore";

if (!("innerText" in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, "innerText", {
    configurable: true,
    enumerable: true,
    get(this: HTMLElement) {
      return this.textContent ?? "";
    },
    set(this: HTMLElement, value: string) {
      this.textContent = value;
    }
  });
}

const mountScreenDom = () => {
  document.body.innerHTML = "";
  const canvas = document.createElement("canvas");
  canvas.id = "screenShotContainer";
  document.body.appendChild(canvas);

  const textPanel = document.createElement("div");
  textPanel.id = "textInputPanel";
  document.body.appendChild(textPanel);

  const cutBox = document.createElement("div");
  cutBox.id = "cutBoxSizePanel";
  document.body.appendChild(cutBox);
};

describe("ScreenDomStore", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    document.documentElement.className = "";
    document.body.className = "";
    screenDomStore.reset();
  });

  afterEach(() => {
    screenDomStore.reset();
  });

  test("可以初始化 DOM 引用并更新样式/尺寸信息", () => {
    mountScreenDom();
    screenDomStore.hydrateDomRefs();

    expect(screenDomStore.screenShotController).not.toBeNull();
    expect(screenDomStore.textInputController).not.toBeNull();
    expect(screenDomStore.cutBoxSizeContainer).not.toBeNull();

    screenDomStore.updateCutBoxSizeShowState("flex");
    const cutBox = screenDomStore.cutBoxSizeContainer as HTMLDivElement;
    expect(cutBox.style.display).toBe("flex");

    screenDomStore.updateTextInputShowState("none");
    expect(
      (screenDomStore.textInputController as HTMLDivElement).style.display
    ).toBe("none");

    screenDomStore.updateCutBoxSizeInfo(18.8, 22.4);
    expect(
      (screenDomStore.cutBoxSizeContainer as HTMLDivElement).textContent
    ).toBe("18 * 22");

    screenDomStore.updateScreenShotControllerSize(120, 80);
    expect(
      (screenDomStore.screenShotController as HTMLCanvasElement).width
    ).toBe(120);
    expect(
      (screenDomStore.screenShotController as HTMLCanvasElement).height
    ).toBe(80);

    screenDomStore.updateScreenShotPosition(10, 20);
    expect(
      (screenDomStore.screenShotController as HTMLCanvasElement).style.left
    ).toBe("10px");
    expect(
      (screenDomStore.screenShotController as HTMLCanvasElement).style.top
    ).toBe("20px");

    screenDomStore.initWebRtcDom();
    const fakeStream = {} as MediaStream;
    screenDomStore.setVideoSrcObject(fakeStream);
    expect(screenDomStore.videoController?.srcObject).toBe(fakeStream);

    screenDomStore.setCursorStyle("crosshair");
    expect(
      (screenDomStore.screenShotController as HTMLCanvasElement).style.cursor
    ).toBe("crosshair");
    expect(screenDomStore.mousePointer).toBe("crosshair");
  });

  test("destroyDOM 会移除监听、DOM 以及滚动/视频状态", () => {
    mountScreenDom();
    screenDomStore.hydrateDomRefs();
    screenDomStore.setNoScrollStatus(true);
    document.body.classList.add("__screenshot-lock-scroll");
    screenDomStore.setResetScrollbarState(true);
    document.documentElement.classList.add("hidden-screen-shot-scroll");
    document.body.classList.add("hidden-screen-shot-scroll");
    screenDomStore.initWebRtcDom();
    const fakeStream = {} as MediaStream;
    screenDomStore.setVideoSrcObject(fakeStream);
    const handler = jest.fn();
    const removeSpy = jest.spyOn(document.body, "removeEventListener");
    document.body.addEventListener("keydown", handler);
    screenDomStore.setKeyboardEventHandler(handler);

    screenDomStore.destroyDOM();

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#screenShotContainer")).toBeNull();
    expect(document.querySelector("#textInputPanel")).toBeNull();
    expect(document.querySelector("#cutBoxSizePanel")).toBeNull();
    expect(document.body.classList.contains("__screenshot-lock-scroll")).toBe(
      false
    );
    expect(
      document.documentElement.classList.contains("hidden-screen-shot-scroll")
    ).toBe(false);
    expect(screenDomStore.videoController?.srcObject).toBeNull();
    expect(screenDomStore.keyboardEventHandler).toBeNull();
    removeSpy.mockRestore();
  });
});
