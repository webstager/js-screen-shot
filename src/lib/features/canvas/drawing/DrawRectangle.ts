import { RectangleDraft } from "@/lib/type/components/canvas";

export function calculateRectangleCorners(
  mouseX: number,
  mouseY: number,
  width: number,
  height: number
) {
  return [
    { x: mouseX, y: mouseY }, // 左上角
    { x: mouseX + width, y: mouseY }, // 右上角
    { x: mouseX + width, y: mouseY + height }, // 右下角
    { x: mouseX, y: mouseY + height }, // 左下角
    { x: mouseX + width / 2, y: mouseY }, // 上中点
    { x: mouseX + width, y: mouseY + height / 2 }, // 右中点
    { x: mouseX + width / 2, y: mouseY + height }, // 下中点
    { x: mouseX, y: mouseY + height / 2 } // 左中点
  ];
}

/**
 * 绘制矩形并在边框上添加圆点
 * @param mouseX
 * @param mouseY
 * @param width
 * @param height
 * @param color 边框颜色
 * @param borderWidth 边框大小
 * @param drawDots 是否在边框上绘制圆点
 * @param context 需要进行绘制的canvas画布
 * @param lineDash 虚线尺寸
 */
export function drawRectangle(
  mouseX: RectangleDraft["mouseX"],
  mouseY: RectangleDraft["mouseY"],
  width: RectangleDraft["width"],
  height: RectangleDraft["height"],
  color: RectangleDraft["color"],
  borderWidth: RectangleDraft["borderWidth"],
  context: CanvasRenderingContext2D,
  drawDots?: {
    drawState: boolean; // 控制是否绘制圆点
    dotRadius: number; // 圆点的半径
  },
  lineDash?: number[]
) {
  context.save();
  // 设置边框颜色
  context.strokeStyle = color;
  // 设置边框大小
  context.lineWidth = borderWidth;
  if (lineDash && lineDash.length > 0) {
    context.setLineDash(lineDash);
  }
  context.beginPath();
  // 绘制矩形
  context.rect(mouseX, mouseY, width, height);
  context.stroke();

  if (drawDots && drawDots.drawState) {
    // 计算矩形的8个角的位置
    const corners = calculateRectangleCorners(mouseX, mouseY, width, height);
    // 在每个角绘制一个圆点
    corners.forEach(corner => {
      context.beginPath();
      context.arc(corner.x, corner.y, drawDots.dotRadius, 0, Math.PI * 2);
      context.fillStyle = "#ffffff";
      context.fill();
      // 设置圆点边框
      context.lineWidth = 1; // 设置边框宽度为1px
      context.strokeStyle = color; // 设置边框颜色
      context.stroke();
    });
  }

  // 绘制结束
  context.restore();
}
