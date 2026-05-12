export interface BaseCanvasElement {
  id: string;
  x: number;
  y: number;
  drawNode?: boolean;
  dotRadius?: number;
}

export interface SquareElement extends BaseCanvasElement {
  width: number;
  height: number;
  borderWidth: number;
  color: string;
}

export type RoundElement = SquareElement;

export interface LineArrowElement extends SquareElement {
  arrowType: "line";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  x2: number;
  y2: number;
  theta: number;
  slashLength: number;
}

export interface ArrowElement extends SquareElement {
  arrowType: "filled";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  x2: number;
  y2: number;
}

export type CanvasPoint = {
  x: number;
  y: number;
};

export interface PencilElement extends BaseCanvasElement {
  width: number;
  height: number;
  size: number;
  color: string;
  points: CanvasPoint[];
}

export interface MosaicElement extends BaseCanvasElement {
  width: number;
  height: number;
  size: number;
  degreeOfBlur: number;
  points: CanvasPoint[];
  color: string;
}

export interface TextElement extends BaseCanvasElement {
  width: number;
  height: number;
  color: string;
  fontSize: number;
  text: string;
  borderWidth: number;
}

export interface CustomCanvasElement extends BaseCanvasElement {
  customType: "custom";
  width: number;
  height: number;
  toolId?: number;
  toolName?: string;
  payload?: unknown;
}

export type CanvasElement =
  | SquareElement
  | RoundElement
  | LineArrowElement
  | ArrowElement
  | PencilElement
  | MosaicElement
  | TextElement
  | CustomCanvasElement;
