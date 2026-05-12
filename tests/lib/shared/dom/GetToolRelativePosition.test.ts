import { getToolRelativePosition } from "@/lib/shared/dom/GetToolRelativePosition";

describe("getToolRelativePosition", () => {
  test("返回传入 DOM 的反向偏移量", () => {
    const fakeDom = document.createElement("div");
    fakeDom.getBoundingClientRect = jest.fn(() => ({
      left: -75,
      top: -120,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => {}
    }));

    const pos = getToolRelativePosition(undefined, undefined, fakeDom);
    expect(pos).toEqual({ left: 75, top: 120 });
  });

  test("左上偏移可被参数覆盖", () => {
    const result = getToolRelativePosition(10, 20);
    expect(result).toEqual({ left: 10, top: 20 });
  });
});
