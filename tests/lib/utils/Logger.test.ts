import { logger, setDebugLogging } from "@/lib/utils/Logger";

describe("Logger", () => {
  let debugSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    debugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    setDebugLogging(false);
  });

  afterEach(() => {
    debugSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("debug/warn 默认关闭，error 始终输出", () => {
    logger.debug("msg");
    logger.warn("warn");
    logger.error("err");

    expect(debugSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith("err");
  });

  test("开启调试后会输出 debug/warn", () => {
    setDebugLogging(true);

    logger.debug("debug-info", { foo: 1 });
    logger.warn("warn-info");

    expect(debugSpy).toHaveBeenCalledWith("debug-info", { foo: 1 });
    expect(warnSpy).toHaveBeenCalledWith("warn-info");
  });
});
