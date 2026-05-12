import { isPC, isTouchDevice } from "@/lib/shared/platform/DeviceTypeVerif";

const setUserAgent = (value: string) => {
  Object.defineProperty(window.navigator, "userAgent", {
    value,
    configurable: true
  });
};

describe("DeviceTypeVerif", () => {
  const originalUA = navigator.userAgent;
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    setUserAgent(originalUA);
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      value: 0,
      configurable: true
    });
    (window as any).matchMedia = originalMatchMedia;
  });

  test("isPC 在移动端 UA 下返回 false", () => {
    setUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)");
    expect(isPC()).toBe(false);

    setUserAgent("Mozilla/5.0 (X11; Linux x86_64)");
    expect(isPC()).toBe(true);
  });

  test("isTouchDevice 根据多种探测条件返回 true", () => {
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      value: 1,
      configurable: true
    });
    expect(isTouchDevice()).toBe(true);
  });

  test("isTouchDevice 会 fallback 到 matchMedia", () => {
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      value: 0,
      configurable: true
    });
    (window as any).matchMedia = jest
      .fn()
      .mockReturnValue({ matches: true, media: "", addListener: jest.fn(), removeListener: jest.fn() });

    expect(isTouchDevice()).toBe(true);
  });
});
