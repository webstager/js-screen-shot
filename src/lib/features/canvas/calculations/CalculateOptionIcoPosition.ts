import { TOOL_OPTION_ICON_POSITIONS } from "@/lib/constants/toolbar";

/**
 * 计算截图工具栏画笔选项三角形角标位置
 * @param index
 */
export function calculateOptionIcoPosition(index: number) {
  return TOOL_OPTION_ICON_POSITIONS[index] ?? 0;
}
