jest.mock("@/store/ToolBarStore", () => ({
  __esModule: true,
  default: {
    setColorPanelStatus: jest.fn(),
    setSelectedColor: jest.fn()
  }
}));

import toolBarStore from "@/store/ToolBarStore";
import { selectColor, getColor } from "@/lib/shared/ui/ColorSelection";

describe("ColorSelection helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("selectColor 打开颜色面板", () => {
    selectColor();
    expect(toolBarStore.setColorPanelStatus).toHaveBeenCalledWith(true);
  });

  test("getColor 根据索引返回调色盘颜色并关闭面板", () => {
    expect(getColor(2)).toBe("#F65E95");
    expect(toolBarStore.setSelectedColor).toHaveBeenCalledWith("#F65E95");
    expect(toolBarStore.setColorPanelStatus).toHaveBeenLastCalledWith(false);
  });

  test("未知索引用默认颜色", () => {
    expect(getColor(99)).toBe("#F53440");
    expect(toolBarStore.setSelectedColor).toHaveBeenLastCalledWith("#F53440");
  });
});
