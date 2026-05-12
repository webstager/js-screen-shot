export type BuiltInToolName =
  | "square"
  | "round"
  | "right-top"
  | "brush"
  | "mosaicPen"
  | "separateLine"
  | ""
  | "text"
  | "undo"
  | "close"
  | "confirm"
  | "save"
  | "custom";

export type ToolName = BuiltInToolName | (string & {});
