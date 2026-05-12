// 允许在画布上触发缩放交互的鼠标指针集合
export const CANVAS_RESIZE_POINTERS = new Set([
  "nwse-resize",
  "nesw-resize",
  "ns-resize",
  "ew-resize",
  "crosshair"
]);

// 固定比例箭头的默认夹角
export const ARROW_LINE_DEFAULT_THETA = 30;
// 固定比例箭头的默认箭翼长度
export const ARROW_LINE_DEFAULT_SLASH_LENGTH = 10;
// 命中箭头边界时的额外容差，用来提升编辑体验
export const ARROW_HIT_TOLERANCE = 8;

// 马赛克绘制时的偏移量，让鼠标居中在模糊块上
export const MOSAIC_PEN_OFFSET = 10;
// 画笔/节点的半径系数，通常为 penSize 的倍数
export const TOOL_HANDLE_RADIUS_MULTIPLIER = 2;
