jest.mock("@/store/ToolBarStore", () => ({
  __esModule: true,
  default: {
    setPenSize: jest.fn(),
    setMosaicPenSize: jest.fn(),
    setColorPanelStatus: jest.fn(),
    setFontSize: jest.fn()
  }
}));

jest.mock("@/lib/shared/ui/SetSelectedClassName", () => ({
  setSelectedClassName: jest.fn()
}));

import toolBarStore from "@/store/ToolBarStore";
import { setSelectedClassName } from "@/lib/shared/ui/SetSelectedClassName";
import { setBrushSize, setMosaicPenSize } from "@/lib/shared/ui/SetBrushSize";

const fakeEvent = new MouseEvent("click");

describe("SetBrushSize helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("setBrushSize 根据 size 返回对应像素并更新 store", () => {
    expect(setBrushSize("medium", 2, fakeEvent)).toBe(5);
    expect(setSelectedClassName).toHaveBeenCalledWith(fakeEvent, 2, true);
    expect(toolBarStore.setPenSize).toHaveBeenCalledWith(5);

    expect(setBrushSize("big", 3, fakeEvent)).toBe(10);
    expect(toolBarStore.setPenSize).toHaveBeenLastCalledWith(10);
  });

  test("setMosaicPenSize 根据 size 返回对应像素并更新 store", () => {
    expect(setMosaicPenSize("small", 1, fakeEvent)).toBe(10);
    expect(toolBarStore.setMosaicPenSize).toHaveBeenCalledWith(10);

    expect(setMosaicPenSize("medium", 2, fakeEvent)).toBe(20);
    expect(toolBarStore.setMosaicPenSize).toHaveBeenLastCalledWith(20);
  });
});
