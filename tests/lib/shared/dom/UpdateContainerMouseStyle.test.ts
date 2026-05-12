import { updateContainerMouseStyle } from "@/lib/shared/dom/UpdateContainerMouseStyle";
import { logger } from "@/lib/utils/Logger";

jest.mock("@/lib/utils/Logger", () => ({
  logger: {
    debug: jest.fn()
  }
}));

describe("updateContainerMouseStyle", () => {
  test("文本工具设置 text 光标", () => {
    const canvas = document.createElement("canvas");
    updateContainerMouseStyle(canvas, "text");
    expect(canvas.style.cursor).toBe("text");
    expect(logger.debug).not.toHaveBeenCalled();
  });

  test("默认情况下 fallback 为 default 并输出调试日志", () => {
    const canvas = document.createElement("canvas");
    updateContainerMouseStyle(canvas, "unknown");
    expect(canvas.style.cursor).toBe("default");
    expect(logger.debug).toHaveBeenCalledWith("fallback cursor applied");
  });
});
