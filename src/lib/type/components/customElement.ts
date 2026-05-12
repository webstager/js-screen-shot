import type { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import type { CropBoxBounds } from "@/lib/type/components/cropBox";
import type {
  CanvasElement,
  CustomCanvasElement
} from "@/lib/type/editor/canvasElements";

export type CustomCanvasElementInput =
  | CustomCanvasElement
  | CanvasElementSnapshot;

export type CustomCanvasElementApi = {
  addElement: (
    input: CustomCanvasElementInput
  ) => CanvasElementSnapshot | null;
  updateElement: (element: CanvasElement) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string) => boolean;
  getElement: (id: string) => CanvasElementSnapshot | undefined;
  getActiveElement: () => CanvasElementSnapshot | undefined;
  redraw: () => void;
};

export type CustomCanvasElementAdapter = {
  toolId?: number;
  toolName?: string;
  draw: (
    element: CustomCanvasElement,
    context: CanvasRenderingContext2D
  ) => void;
  hitTest?: (
    element: CustomCanvasElement,
    point: { x: number; y: number }
  ) => boolean;
  move?: (
    element: CustomCanvasElement,
    delta: { x: number; y: number },
    bounds: CropBoxBounds
  ) => CustomCanvasElement | void;
  resize?: (
    element: CustomCanvasElement,
    handleIndex: number,
    point: { x: number; y: number },
    bounds: CropBoxBounds
  ) => CustomCanvasElement | void;
  drawActiveBorder?: (
    element: CustomCanvasElement,
    context: CanvasRenderingContext2D,
    dotRadius: number
  ) => void;
};
