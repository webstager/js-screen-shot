import type { CanvasElement } from "@/lib/type/editor/canvasElements";
import type { ToolName } from "@/lib/type/editor/toolNames";

export type RectangleDraft = {
  mouseX: number;
  mouseY: number;
  width: number;
  height: number;
  color: string;
  borderWidth: number;
};

export type CanvasElementSnapshot = {
  type: ToolName;
  id: string;
  element: CanvasElement;
};

export type CanvasClearPayload = {
  clearArea: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  elementArea: {
    mouseX: number;
    mouseY: number;
    width: number;
    height: number;
    borderWidth: number;
  };
};
