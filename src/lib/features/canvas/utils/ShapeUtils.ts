import { calculateRectangleCorners } from "@/lib/features/canvas/drawing/DrawRectangle";
import { CropBoxBounds } from "@/lib/type/components/cropBox";
import { RECT_BORDER_HIT_BUFFER } from "@/lib/constants/shape";

/**
 * 判断鼠标是否处于矩形边框上
 * @param mouseX
 * @param mouseY
 * @param rect
 * @param borderWidth
 * @param borderBuffer
 */
const isMouseInRectangle = (
  mouseX: number,
  mouseY: number,
  rect: { x: number; y: number; width: number; height: number },
  borderWidth: number,
  borderBuffer: number = RECT_BORDER_HIT_BUFFER
): boolean => {
  const { x: rectX, y: rectY, width: rectWidth, height: rectHeight } = rect;

  // 扩展矩形的外边框区域
  const extendedBorderWidth = borderWidth + borderBuffer;

  // 检查鼠标是否在矩形的外框边界，边框宽度扩展
  const isOnTopBorder =
    mouseY >= rectY - extendedBorderWidth &&
    mouseY <= rectY + extendedBorderWidth &&
    mouseX >= rectX &&
    mouseX <= rectX + rectWidth;
  const isOnBottomBorder =
    mouseY >= rectY + rectHeight - extendedBorderWidth &&
    mouseY <= rectY + rectHeight + extendedBorderWidth &&
    mouseX >= rectX &&
    mouseX <= rectX + rectWidth;
  const isOnLeftBorder =
    mouseX >= rectX - extendedBorderWidth &&
    mouseX <= rectX + extendedBorderWidth &&
    mouseY >= rectY &&
    mouseY <= rectY + rectHeight;
  const isOnRightBorder =
    mouseX >= rectX + rectWidth - extendedBorderWidth &&
    mouseX <= rectX + rectWidth + extendedBorderWidth &&
    mouseY >= rectY &&
    mouseY <= rectY + rectHeight;

  // 如果鼠标在边框区域内，返回true
  return isOnTopBorder || isOnBottomBorder || isOnLeftBorder || isOnRightBorder;
};

// 获取当前鼠标处于矩形的第几个圆点上
const getMousePositionOnCornerInRectangle = (
  mouseX: number,
  mouseY: number,
  rectX: number,
  rectY: number,
  width: number,
  height: number,
  dotRadius: number
): number | null => {
  // 计算矩形的8个角的位置
  const corners = calculateRectangleCorners(rectX, rectY, width, height);

  // 遍历每个角点，判断鼠标是否接触该点
  for (let i = 0; i < corners.length; i++) {
    const corner = corners[i];
    // 计算鼠标位置与角点的距离
    const distance = Math.sqrt(
      (mouseX - corner.x) ** 2 + (mouseY - corner.y) ** 2
    );

    // 如果距离小于或等于点的半径，说明鼠标在该点上
    if (distance <= dotRadius) {
      return i; // 返回角点的索引
    }
  }

  return null; // 如果鼠标不在任何角点上，返回 null
};

// 根据圆点索引获取节点缩放方法所需的索引
const getScaleIndex = (index: number) => {
  let scaleIndex = null;
  switch (index) {
    case 0: // 左上角
      scaleIndex = 6; // nw
      break;
    case 1: // 右上角
      scaleIndex = 8; // ne
      break;
    case 2: // 右下角
      scaleIndex = 7; // se
      break;
    case 3: // 左下角
      scaleIndex = 9; // sw
      break;
    case 4: // 上中点
      scaleIndex = 2; // n
      break;
    case 5: // 右中点
      scaleIndex = 5; // e
      break;
    case 6: // 下中点
      scaleIndex = 3; // s
      break;
    case 7: // 左中点
      scaleIndex = 4; // w
      break;
    default:
      break;
  }
  return scaleIndex;
};

// 根据矩形的操作圆点索引获取对应的鼠标样式
const getMouseRectangleCursorStyle = (cornerIndex: number) => {
  let styleTxt = null;
  switch (cornerIndex) {
    case 0: // 左上角
    case 2: // 右下角
      styleTxt = "nwse-resize"; // 左上右下对角线
      break;
    case 1: // 右上角
    case 3: // 左下角
      styleTxt = "nesw-resize"; // 右上左下对角线
      break;
    case 4: // 上中点
    case 6: // 下中点
      styleTxt = "ns-resize"; // 垂直拖动
      break;
    case 5: // 右中点
    case 7: // 左中点
      styleTxt = "ew-resize"; // 水平拖动
      break;
    default:
      break;
  }
  return styleTxt;
};

// 判断鼠标是否在矩形内
const isMouseInsideRectangle = (
  rectangle: CropBoxBounds,
  mouse: { mouseX: number; mouseY: number }
): boolean => {
  const { startX, startY, width, height } = rectangle;
  const { mouseX, mouseY } = mouse;

  return (
    mouseX >= startX &&
    mouseX <= startX + width &&
    mouseY >= startY &&
    mouseY <= startY + height
  );
};

export {
  isMouseInRectangle,
  getMousePositionOnCornerInRectangle,
  getMouseRectangleCursorStyle,
  getScaleIndex,
  isMouseInsideRectangle
};
