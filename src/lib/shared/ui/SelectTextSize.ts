import toolBarStore from "@/store/ToolBarStore";
import textInputStore from "@/store/TextInputStore";

export function selectTextSize() {
  // 显示文字大小选择面板
  textInputStore.setTextSizeOptionStatus(true);
}

export function setTextSize(size: number) {
  // 设置字体大小
  toolBarStore.setFontSize(size);
}

export function getTextSize() {
  // 获取字体大小
  return toolBarStore.fontSize;
}

export function hiddenTextSizeOptionStatus() {
  // 隐藏文字大小选择面板
  textInputStore.setTextSizeOptionStatus(false);
}

export function hiddenColorPanelStatus() {
  // 隐藏颜色选择面板
  toolBarStore.setColorPanelStatus(false);
}
