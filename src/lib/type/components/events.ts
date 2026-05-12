import type { CustomCanvasElementApi } from "@/lib/type/components/customElement";

export type CanvasEventCallbacks = {
  mouseDownFn: (
    event: MouseEvent | TouchEvent,
    mouseX: number,
    mouseY: number,
    addHistory: () => void,
    customElementApi: CustomCanvasElementApi
  ) => void;
  mouseMoveFn: (
    event: MouseEvent | TouchEvent,
    mouseInfo: {
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    },
    showLastHistory: (context: CanvasRenderingContext2D) => void,
    customElementApi: CustomCanvasElementApi
  ) => void;
  mouseUpFn: (
    showLastHistory: (context: CanvasRenderingContext2D) => void,
    customElementApi: CustomCanvasElementApi
  ) => void;
};

export type CanvasEventHandlers = {
  mouseDownEvent: (event: MouseEvent | TouchEvent) => void;
  mouseMoveEvent: (event: MouseEvent | TouchEvent) => void;
  mouseUpEvent: () => void;
};

export type RightClickEventConfig = {
  state: boolean;
  handleFn?: () => void;
};
