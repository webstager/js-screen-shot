import { normalizeScreenShotOptions } from "@/lib/features/canvas/config/NormalizeScreenShotOptions";

describe("NormalizeScreenShotOptions", () => {
  const originalWarn = console.warn;

  beforeAll(() => {
    class MediaStreamMock {}

    Object.defineProperty(globalThis, "MediaStream", {
      configurable: true,
      writable: true,
      value: MediaStreamMock
    });
  });

  beforeEach(() => {
    console.warn = jest.fn();
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  test("display-media 模式会覆盖旧来源配置并映射窗口渲染策略", () => {
    const normalized = normalizeScreenShotOptions({
      capture: {
        source: "display-media",
        render: "window-frame"
      },
      screenFlow: new MediaStream(),
      imgSrc: "data:image/png;base64,old",
      enableWebRtc: false
    });

    expect(normalized.enableWebRtc).toBe(true);
    expect(normalized.wrcWindowMode).toBe(true);
    expect(normalized.screenFlow).toBeUndefined();
    expect(normalized.imgSrc).toBeUndefined();
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("image 模式会写入新 imageSrc 并关闭 webrtc", () => {
    const normalized = normalizeScreenShotOptions({
      capture: {
        source: "image",
        imageSrc: "data:image/png;base64,new"
      }
    });

    expect(normalized.enableWebRtc).toBe(false);
    expect(normalized.imgSrc).toBe("data:image/png;base64,new");
    expect(normalized.screenFlow).toBeUndefined();
  });

  test("snapdom 模式会关闭 webrtc 并清空旧截图来源", () => {
    const normalized = normalizeScreenShotOptions({
      capture: {
        source: "snapdom"
      },
      imgSrc: "data:image/png;base64,old",
      screenFlow: {} as MediaStream
    });

    expect(normalized.enableWebRtc).toBe(false);
    expect(normalized.imgSrc).toBeUndefined();
    expect(normalized.screenFlow).toBeUndefined();
  });

  test("injected-stream 模式会写入新 stream", () => {
    const stream = new MediaStream();
    const normalized = normalizeScreenShotOptions({
      capture: {
        source: "injected-stream",
        stream
      }
    });

    expect(normalized.enableWebRtc).toBe(true);
    expect(normalized.screenFlow).toBe(stream);
    expect(normalized.imgSrc).toBeUndefined();
  });

  test("仅传 render 时保留旧来源解析并映射到 wrcWindowMode", () => {
    const normalized = normalizeScreenShotOptions({
      capture: {
        render: "window-frame"
      },
      enableWebRtc: true
    });

    expect(normalized.enableWebRtc).toBe(true);
    expect(normalized.wrcWindowMode).toBe(true);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("仅使用旧参数时会输出废弃提示", () => {
    const normalized = normalizeScreenShotOptions({
      enableWebRtc: false,
      wrcWindowMode: true
    });

    expect(normalized.enableWebRtc).toBe(false);
    expect(normalized.wrcWindowMode).toBe(true);
    expect(console.warn).toHaveBeenCalledTimes(1);
  });

  test("image 模式缺少 imageSrc 时抛出明确错误", () => {
    expect(() =>
      normalizeScreenShotOptions({
        capture: {
          source: "image"
        }
      })
    ).toThrow('capture.source 为 "image" 时，必须同时传入非空的 capture.imageSrc。');
  });

  test("injected-stream 模式缺少 stream 时抛出明确错误", () => {
    expect(() =>
      normalizeScreenShotOptions({
        capture: {
          source: "injected-stream"
        }
      })
    ).toThrow(
      'capture.source 为 "injected-stream" 时，必须同时传入 capture.stream。'
    );
  });
});
