jest.mock("@/store/ToolBarStore", () => ({
  __esModule: true,
  default: {
    setFontSize: jest.fn(),
    setColorPanelStatus: jest.fn(),
    fontSize: 17
  }
}));

jest.mock("@/store/TextInputStore", () => ({
  __esModule: true,
  default: {
    setTextSizeOptionStatus: jest.fn()
  }
}));

import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";
import {
  selectTextSize,
  setTextSize,
  getTextSize,
  hiddenTextSizeOptionStatus,
  hiddenColorPanelStatus
} from "@/lib/shared/ui/SelectTextSize";

describe("SelectTextSize helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("selectTextSize/hiddenTextSizeOptionStatus 负责面板显隐", () => {
    selectTextSize();
    expect(textInputStore.setTextSizeOptionStatus).toHaveBeenCalledWith(true);

    hiddenTextSizeOptionStatus();
    expect(textInputStore.setTextSizeOptionStatus).toHaveBeenCalledWith(false);
  });

  test("setTextSize 与 hiddenColorPanelStatus 使用 toolBarStore", () => {
    setTextSize(22);
    expect(toolBarStore.setFontSize).toHaveBeenCalledWith(22);

    hiddenColorPanelStatus();
    expect(toolBarStore.setColorPanelStatus).toHaveBeenCalledWith(false);
  });

  test("getTextSize 直接读取 toolBarStore.fontSize", () => {
    expect(getTextSize()).toBe(toolBarStore.fontSize);
  });
});
