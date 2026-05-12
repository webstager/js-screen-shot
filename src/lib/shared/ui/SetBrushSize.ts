import { setSelectedClassName } from "@/lib/shared/ui/SetSelectedClassName";
import toolBarStore from "@/store/ToolBarStore";
import {
  BRUSH_SIZE_PRESETS,
  MOSAIC_BRUSH_SIZE_PRESETS
} from "@/lib/constants/brush";

/**
 * 设置画笔大小
 * @param size
 * @param index
 * @param mouseEvent
 */
export function setBrushSize(
  size: keyof typeof BRUSH_SIZE_PRESETS,
  index: number,
  mouseEvent: MouseEvent
) {
  // 将点击状态同步到 UI
  setSelectedClassName(mouseEvent, index, true);
  const sizeNum = BRUSH_SIZE_PRESETS[size] ?? BRUSH_SIZE_PRESETS.small;
  toolBarStore.setPenSize(sizeNum);
  return sizeNum;
}

/**
 * 设置马赛克工具的笔触大小
 * @param size
 * @param index
 * @param mouseEvent
 */
export function setMosaicPenSize(
  size: keyof typeof MOSAIC_BRUSH_SIZE_PRESETS,
  index: number,
  mouseEvent: MouseEvent
) {
  // 马赛克工具的笔触尺寸表也抽成常量，便于统一调参数
  setSelectedClassName(mouseEvent, index, true);
  const sizeNum =
    MOSAIC_BRUSH_SIZE_PRESETS[size] ?? MOSAIC_BRUSH_SIZE_PRESETS.small;
  toolBarStore.setMosaicPenSize(sizeNum);
  return sizeNum;
}
