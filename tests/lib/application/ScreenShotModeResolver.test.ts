import { resolveScreenShotMode } from "@/lib/application/core/ScreenShotModeResolver";

jest.mock("@/store/UserParamStore", () => ({
  __esModule: true,
  default: {
    enableWebRtc: true,
    imgSrc: null,
    screenFlow: null
  }
}));

const userParamStore = require("@/store/UserParamStore").default;

describe("ScreenShotModeResolver", () => {
  afterEach(() => {
    userParamStore.enableWebRtc = true;
    userParamStore.imgSrc = null;
    userParamStore.screenFlow = null;
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

  test("存在 screenFlow 时选择 injected-stream", () => {
    userParamStore.screenFlow = {} as MediaStream;
    expect(resolveScreenShotMode()).toBe("injected-stream");
  });

  test("默认走 webrtc", () => {
    expect(resolveScreenShotMode()).toBe("webrtc");
  });
});
