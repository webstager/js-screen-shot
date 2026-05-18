import {
  resolveRenderStrategy,
  resolveScreenShotMode,
  resolveScreenShotPlan
} from "@/lib/application/core/ScreenShotModeResolver";

jest.mock("@/store/UserParamStore", () => ({
  __esModule: true,
  default: {
    enableWebRtc: true,
    imgSrc: null,
    screenFlow: null,
    wrcWindowMode: false,
    domRenderEngine: "html2canvas"
  }
}));

const userParamStore = require("@/store/UserParamStore").default;

describe("ScreenShotModeResolver", () => {
  afterEach(() => {
    userParamStore.enableWebRtc = true;
    userParamStore.imgSrc = null;
    userParamStore.screenFlow = null;
    userParamStore.wrcWindowMode = false;
    userParamStore.domRenderEngine = "html2canvas";
  });

  test("image 模式优先级最高", () => {
    userParamStore.enableWebRtc = false;
    userParamStore.imgSrc = "data:image/png;base64,xxx";
    expect(resolveScreenShotMode()).toBe("image");
  });

  test("没有 imgSrc 时走 html2canvas", () => {
    userParamStore.enableWebRtc = false;
    userParamStore.imgSrc = null;
    expect(resolveScreenShotMode()).toBe("html2canvas");
  });

  test("DOM 渲染引擎为 snapdom 时走 snapdom 模式", () => {
    userParamStore.enableWebRtc = false;
    userParamStore.domRenderEngine = "snapdom";
    expect(resolveScreenShotMode()).toBe("snapdom");
    expect(resolveScreenShotPlan()).toEqual({
      captureSource: "snapdom-render",
      renderStrategy: "browser-frame"
    });
  });

  test("存在 screenFlow 时选择 injected-stream", () => {
    userParamStore.screenFlow = {} as MediaStream;
    expect(resolveScreenShotMode()).toBe("injected-stream");
  });

  test("默认走 webrtc", () => {
    expect(resolveScreenShotMode()).toBe("webrtc");
  });

  test("统一 plan 会同时返回 capture source 和 render strategy", () => {
    userParamStore.screenFlow = {} as MediaStream;
    userParamStore.wrcWindowMode = true;

    expect(resolveScreenShotPlan()).toEqual({
      captureSource: "injected-media-stream",
      renderStrategy: "window-frame"
    });
    expect(resolveRenderStrategy()).toBe("window-frame");
  });
});
