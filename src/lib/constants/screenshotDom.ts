import { BRUSH_SIZE_PRESETS } from "@/lib/constants/brush";

export type BrushSizeKey = keyof typeof BRUSH_SIZE_PRESETS;

export interface BrushOptionConfig {
  size: BrushSizeKey;
  index: number;
  baseClass: string;
  activeClass?: string;
}

export const BRUSH_OPTIONS: BrushOptionConfig[] = [
  {
    size: "small",
    index: 1,
    baseClass: "brush-small",
    activeClass: "brush-small-active"
  },
  {
    size: "medium",
    index: 2,
    baseClass: "brush-medium"
  },
  {
    size: "big",
    index: 3,
    baseClass: "brush-big"
  }
];

export const COLOR_ITEM_COUNT = 10;

export const TOOLBAR_DOM = {
  customInsertOffset: 2,
  minWidthWhenIconsHidden: "24px",
  itemClass: "item-panel",
  undoDisabledClass: "undo-disabled",
  undoId: "undoPanel",
  undoTitle: "undo"
} as const;

export const OPTION_PANEL_IDS = {
  textSize: "textSizePanel",
  textSelect: "textSelectPanel",
  brushSelect: "brushSelectPanel",
  colorSelect: "colorSelectPanel",
  colorList: "colorPanel",
  rightPanel: "rightPanel"
} as const;

export const OPTION_PANEL_CLASSES = {
  textSizeContainer: "text-size-panel",
  textSelectContainer: "text-select-panel",
  textItem: "text-item",
  brushSelectPanel: "brush-select-panel",
  colorSelectPanel: "color-select-panel",
  colorPanel: "color-panel",
  colorItem: "color-item",
  pullDownArrow: "pull-down-arrow",
  rightPanel: "right-panel"
} as const;

export const OPTION_PANEL_AUTO_HIDE_SELECTORS = [
  `#${OPTION_PANEL_IDS.colorSelect}`,
  `#${OPTION_PANEL_IDS.textSize}`,
  `#${OPTION_PANEL_IDS.textSelect}`,
  `#${OPTION_PANEL_IDS.colorList}`
] as const;
