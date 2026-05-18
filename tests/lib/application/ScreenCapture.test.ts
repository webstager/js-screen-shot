import { startCapture } from "@/lib/application/core/ScreenCapture";
import userParamStore from "@/store/UserParamStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { resetAllStores } from "@/store/utils/resetRegistry";

describe("ScreenCapture", () => {
  const originalMediaDevices = navigator.mediaDevices;

  beforeEach(() => {
    resetAllStores();
    drawingDataStore.dpr = 2;
    screenDomStore.videoController = document.createElement("video");
  });

  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices
    });
    resetAllStores();
    jest.clearAllMocks();
  });

  test("默认请求屏幕流时不捕获鼠标指针", async () => {
    const stream = {
      getTracks: jest.fn(() => []),
      getVideoTracks: jest.fn(() => [])
    } as unknown as MediaStream;
    const getDisplayMedia = jest.fn(() => Promise.resolve(stream));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getDisplayMedia }
    });
    const imageController = document.createElement("canvas");
    imageController.width = 300;
    imageController.height = 150;

    await startCapture(undefined, "browser-frame", imageController);

    expect(getDisplayMedia).toHaveBeenCalledWith({
      video: expect.objectContaining({
        cursor: "never",
        width: 600,
        height: 300,
        displaySurface: "browser"
      }),
      audio: false
    });
  });

  test("会使用 capture.cursor 覆盖默认鼠标捕获策略", async () => {
    const stream = {
      getTracks: jest.fn(() => []),
      getVideoTracks: jest.fn(() => [])
    } as unknown as MediaStream;
    const getDisplayMedia = jest.fn(() => Promise.resolve(stream));
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getDisplayMedia }
    });
    userParamStore.setCaptureCursor("motion");
    const imageController = document.createElement("canvas");
    imageController.width = 300;
    imageController.height = 150;

    await startCapture(undefined, "browser-frame", imageController);

    expect(getDisplayMedia).toHaveBeenCalledWith({
      video: expect.objectContaining({
        cursor: "motion"
      }),
      audio: false
    });
  });
});
