import { drawRectangle } from "@/lib/features/canvas/drawing/DrawRectangle";
import { TextElement } from "@/lib/type/editor/canvasElements";
import {
  LINE_BREAK_REGEX,
  LINE_DASH,
  TEXT_LINE_HEIGHT_MULTIPLIER
} from "@/lib/constants/text";
import cropBoxStore from "@/store/CropBoxStore";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const splitTextLines = (text: string | null | undefined) =>
  (text ?? "").split(LINE_BREAK_REGEX);

export const getTextLineHeight = (fontSize: number) =>
  fontSize * TEXT_LINE_HEIGHT_MULTIPLIER;

export type TextBlockMetrics = {
  width: number;
  height: number;
  lineHeight: number;
  lineCount: number;
};

export const measureTextBlock = (
  text: string | null | undefined,
  fontSize: number,
  context: CanvasRenderingContext2D
): TextBlockMetrics => {
  const lines = splitTextLines(text);
  const lineHeight = getTextLineHeight(fontSize);
  context.save();
  context.font = `bold ${fontSize}px none`;
  let maxWidth = 0;
  for (let i = 0; i < lines.length; i++) {
    const metrics = context.measureText(lines[i]);
    maxWidth = Math.max(maxWidth, metrics.width);
  }
  context.restore();
  const lineCount = Math.max(lines.length, 1);
  return {
    width: maxWidth,
    height: lineHeight * lineCount,
    lineHeight,
    lineCount
  };
};

const getCropBoxRect = (): Rect => {
  const { startX, startY, width, height } = cropBoxStore.cutOutBoxPosition;
  return {
    x: startX,
    y: startY,
    width,
    height
  };
};

const hasIntersection = (rect: Rect, target: Rect) =>
  rect.width > 0 &&
  rect.height > 0 &&
  target.width > 0 &&
  target.height > 0 &&
  rect.x < target.x + target.width &&
  rect.x + rect.width > target.x &&
  rect.y < target.y + target.height &&
  rect.y + rect.height > target.y;

const clipToRect = (
  context: CanvasRenderingContext2D,
  rect: Rect,
  draw: () => void
) => {
  if (rect.width <= 0 || rect.height <= 0) return;
  context.save();
  context.beginPath();
  context.rect(rect.x, rect.y, rect.width, rect.height);
  context.clip();
  draw();
  context.restore();
};

/**
 * 绘制文本
 * @param text 需要进行绘制的文字
 * @param mouseX 绘制位置的X轴坐标
 * @param mouseY 绘制位置的Y轴坐标（首行基线位置）
 * @param color 字体颜色
 * @param fontSize 字体大小
 * @param context 需要进行绘制的画布
 */
export function drawText(
  text: string | null | undefined,
  mouseX: number,
  mouseY: number,
  color: string,
  fontSize: number,
  context: CanvasRenderingContext2D
) {
  const lines = splitTextLines(text);
  const lineHeight = getTextLineHeight(fontSize);
  const metrics = measureTextBlock(text, fontSize, context);
  const textBounds: Rect = {
    x: mouseX,
    y: mouseY - lineHeight / 2,
    width: Math.max(metrics.width, fontSize * 0.6),
    height: metrics.height
  };
  const cropRect = getCropBoxRect();
  if (!hasIntersection(textBounds, cropRect)) {
    return;
  }
  clipToRect(context, cropRect, () => {
    context.save();
    context.lineWidth = 1;
    context.fillStyle = color;
    context.textBaseline = "middle";
    context.textAlign = "left";
    context.font = `bold ${fontSize}px none`;
    lines.forEach((line, index) => {
      const lineY = mouseY + lineHeight * index;
      context.fillText(line, mouseX, lineY);
    });
    context.restore();
  });
}

export const drawTextElement = (
  element: TextElement,
  context: CanvasRenderingContext2D
) => {
  const cropRect = getCropBoxRect();
  const textBounds: Rect = {
    x: element.x,
    y: element.y,
    width: element.width,
    height: element.height
  };
  if (!hasIntersection(textBounds, cropRect)) {
    return;
  }
  const lineHeight = getTextLineHeight(element.fontSize);
  clipToRect(context, cropRect, () => {
    drawText(
      element.text,
      element.x,
      element.y + lineHeight / 2,
      element.color,
      element.fontSize,
      context
    );
    if (!element.drawNode) {
      return;
    }
    const dotRadius = element.dotRadius ?? 0;
    const drawDots =
      dotRadius > 0
        ? {
            drawState: true,
            dotRadius
          }
        : undefined;

    drawRectangle(
      element.x,
      element.y,
      element.width,
      element.height,
      element.color,
      Math.max(element.borderWidth, 1),
      context,
      drawDots,
      LINE_DASH
    );
  });
};
