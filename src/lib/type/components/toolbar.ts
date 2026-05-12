import type { ToolName } from "@/lib/type/editor/toolNames";
import type { CropBoxBounds } from "@/lib/type/components/cropBox";

export type ToolPlacement = "left" | "right" | "center";
export type ToolVerticalAnchor = "below" | "above";

export type ToolVisibilityMap = {
  [key: string]: boolean | undefined;
  square?: boolean;
  round?: boolean;
  rightTop?: boolean;
  brush?: boolean;
  mosaicPen?: boolean;
  text?: boolean;
  separateLine?: boolean;
  save?: boolean;
  undo?: boolean;
  confirm?: boolean;
};

export type ToolbarItem = {
  id: number;
  title: ToolName;
  icon?: string;
  activeIcon?: string;
  clickFn?: UserToolbarCallback;
};

export type ScreenShotImageInfo = {
  base64: string;
  cutInfo: CropBoxBounds;
};

export type UserToolbarCallback = (canvasInfo: {
  screenShotCanvas: CanvasRenderingContext2D;
  screenShotController: HTMLCanvasElement;
  ScreenShotImageController: HTMLCanvasElement;
  currentInfo: { toolName: ToolName; toolId: number };
  imgInfo: ScreenShotImageInfo;
}) => void;

export type UserToolbarItem = {
  title: ToolName;
  icon: string;
  activeIcon: string;
  clickFn: UserToolbarCallback;
};

export type CustomToolbarItem = UserToolbarItem & { id: number };
