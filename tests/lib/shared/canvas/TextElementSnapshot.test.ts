jest.mock("nanoid", () => ({ nanoid: () => "test-id" }));

import { buildTextElement } from "@/lib/shared/canvas/TextElementSnapshot";

const createContext = () => {
  const noop = jest.fn();
  return {
    save: noop,
    restore: noop,
    measureText: jest.fn(() => ({ width: 0 }))
  } as unknown as CanvasRenderingContext2D;
};

describe("TextElementSnapshot", () => {
  test("buildTextElement 为测量异常提供非零宽高兜底", () => {
    const context = createContext();
    const element = buildTextElement({
      text: "hello",
      mouseX: 10,
      mouseY: 20,
      color: "#000",
      fontSize: 0,
      context
    });

    expect(element.width).toBeGreaterThan(0);
    expect(element.height).toBeGreaterThan(0);
    expect(element.fontSize).toBeGreaterThan(0);
  });
});
