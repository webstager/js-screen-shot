// 工具栏真实高度获取失败时的兜底值（单位：px）
export const TOOLBAR_HEIGHT_FALLBACK = 46;
// 工具栏在裁剪框上方显示时需要预留的垂直间距
export const TOOLBAR_VERTICAL_MARGIN = 10;
// 画笔选项面板三角角标高度
export const TOOLBAR_OPTION_TRIANGLE_HEIGHT = 6;
// 画笔选项面板真实高度获取失败时的兜底值
export const TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK = 40;
// 颜色面板真实高度获取失败时的兜底值
export const COLOR_PANEL_HEIGHT_FALLBACK = 225;
// 文字大小面板真实高度获取失败时的兜底值
export const TEXT_SIZE_PANEL_HEIGHT_FALLBACK = 321;
// 全屏模式下，工具栏距离底部的默认偏移
export const FULLSCREEN_TOOLBAR_OFFSET = 60;
// 裁剪尺寸标签相对裁剪框的垂直偏移
export const CUT_BOX_LABEL_VERTICAL_OFFSET = 35;
// 画笔选项面板的三角标定位表，键为工具下标，值为相对偏移
export const TOOL_OPTION_ICON_POSITIONS: Record<number, number> = Object.freeze({
  1: 16,
  2: 56,
  3: 90,
  4: 128,
  5: 174,
  6: 210
});
