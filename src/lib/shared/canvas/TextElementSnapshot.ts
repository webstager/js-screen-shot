import { nanoid } from "nanoid";
import drawingDataStore from "@/store/DrawingDataStore";
import { measureTextBlock } from "@/lib/features/canvas/drawing/DrawText";
import { TextElement } from "@/lib/type/editor/canvasElements";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import { logger } from "@/lib/utils/Logger";

const DEFAULT_TEXT_FONT_SIZE = 12;

export type TextElementSnapshotPayload = {
  text: string;
  mouseX: number;
  mouseY: number;
  color: string;
  fontSize: number;
  context: CanvasRenderingContext2D;
  borderWidth?: number;
};

const normalizeTextFontSize = (fontSize: number) =>
  Number.isFinite(fontSize) && fontSize > 0 ? fontSize : DEFAULT_TEXT_FONT_SIZE;

export const buildTextElement = ({
  text,
  mouseX,
  mouseY,
  color,
  fontSize,
  context,
  borderWidth = 1
}: TextElementSnapshotPayload): TextElement => {
  const normalizedFontSize = normalizeTextFontSize(fontSize);
  const metrics = measureTextBlock(text, normalizedFontSize, context);
  const minWidth = Math.max(metrics.width, normalizedFontSize * 0.6);
  const topY = mouseY - metrics.lineHeight / 2;
  return {
    id: nanoid(),
    x: mouseX,
    y: topY,
    width: minWidth,
    height: metrics.height,
    color,
    fontSize: normalizedFontSize,
    text,
    borderWidth
  };
};

export const persistTextElementSnapshot = (
  payload: TextElementSnapshotPayload
): CanvasElementSnapshot => {
  const element = buildTextElement(payload);
  const snapshot: CanvasElementSnapshot = {
    id: element.id,
    type: "text",
    element
  };
  logger.debug("保存文本快照", snapshot);
  drawingDataStore.addElement(snapshot);
  drawingDataStore.updateActiveElementId(element.id);
  return snapshot;
};
