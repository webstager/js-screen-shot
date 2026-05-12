import {
  SelectionBorderNode,
  CropBoxBounds,
  BorderContext
} from "@/lib/type/components/cropBox";
import { CROP_BOX_BORDER_TEMPLATES } from "@/lib/constants/cropBoxBorderTemplates";

/**
 * 保存边框节点的相关信息
 * @param borderSize 边框节点直径大小
 * @param positionInfo 裁剪框位置信息
 * @private
 */
export function saveBorderArrInfo(
  borderSize: number,
  positionInfo: CropBoxBounds
): SelectionBorderNode[] {
  const { startX, startY, width, height } = positionInfo;
  // 无效尺寸时直接返回空，避免后续计算出负值
  if (borderSize <= 0 || width <= 0 || height <= 0) {
    return [];
  }

  const halfBorderSize = borderSize / 2;
  // 预计算边缘、中心与内侧尺寸，供模板复用
  const context: BorderContext = {
    startX,
    startY,
    width,
    height,
    endX: startX + width,
    endY: startY + height,
    centerX: startX + width / 2,
    centerY: startY + height / 2,
    halfBorderSize,
    innerWidth: Math.max(width - borderSize, 0),
    innerHeight: Math.max(height - borderSize, 0),
    borderSize
  };

  // 按模板顺序生成 13 个边框节点
  return CROP_BOX_BORDER_TEMPLATES.map<SelectionBorderNode>(template => ({
    x: template.x(context),
    y: template.y(context),
    width: template.width(context),
    height: template.height(context),
    index: template.index,
    option: template.option
  }));
}
