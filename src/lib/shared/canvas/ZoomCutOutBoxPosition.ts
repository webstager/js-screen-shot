import { nonNegativeData } from "@/lib/shared/platform/FixedData";
import { CropBoxResizeState } from "@/lib/type/components/cropBox";
import { CropBoxBorderOption } from "@/lib/constants/cropBoxOptions";
/**
 * 缩放裁剪框
 * @param currentX 当前鼠标X轴坐标
 * @param currentY 当前鼠标Y轴坐标
 * @param startX 裁剪框当前X轴坐标
 * @param startY 裁剪框当前Y轴坐标
 * @param width 裁剪框宽度
 * @param height 裁剪框高度
 * @param option 当前操作的节点
 * @private
 */
export function zoomCutOutBoxPosition(
  currentX: number,
  currentY: number,
  startX: number,
  startY: number,
  width: number,
  height: number,
  option: CropBoxBorderOption
): CropBoxResizeState | undefined {
  // 临时坐标
  let tempStartX,
    tempStartY,
    tempWidth,
    tempHeight = 0;
  // 判断操作方向
  switch (option) {
    case CropBoxBorderOption.North:
      tempStartY =
        currentY - (startY + height) > 0 ? startY + height : currentY;
      tempHeight = nonNegativeData(height - (currentY - startY));
      return {
        tempStartX: startX,
        tempStartY,
        tempWidth: width,
        tempHeight
      };
    case CropBoxBorderOption.South:
      tempHeight = nonNegativeData(currentY - startY);
      return {
        tempStartX: startX,
        tempStartY: startY,
        tempWidth: width,
        tempHeight
      };
    case CropBoxBorderOption.West:
      tempStartX = currentX - (startX + width) > 0 ? startX + width : currentX;
      tempWidth = nonNegativeData(width - (currentX - startX));
      return {
        tempStartX,
        tempStartY: startY,
        tempWidth,
        tempHeight: height
      };
    case CropBoxBorderOption.East:
      tempWidth = nonNegativeData(currentX - startX);
      return {
        tempStartX: startX,
        tempStartY: startY,
        tempWidth,
        tempHeight: height
      };
    case CropBoxBorderOption.NorthWest:
      tempStartX = currentX - (startX + width) > 0 ? startX + width : currentX;
      tempStartY =
        currentY - (startY + height) > 0 ? startY + height : currentY;
      tempWidth = nonNegativeData(width - (currentX - startX));
      tempHeight = nonNegativeData(height - (currentY - startY));
      return {
        tempStartX,
        tempStartY,
        tempWidth,
        tempHeight
      };
    case CropBoxBorderOption.SouthEast:
      tempWidth = nonNegativeData(currentX - startX);
      tempHeight = nonNegativeData(currentY - startY);
      return {
        tempStartX: startX,
        tempStartY: startY,
        tempWidth,
        tempHeight
      };
    case CropBoxBorderOption.NorthEast:
      tempStartY =
        currentY - (startY + height) > 0 ? startY + height : currentY;
      tempWidth = nonNegativeData(currentX - startX);
      tempHeight = nonNegativeData(height - (currentY - startY));
      return {
        tempStartX: startX,
        tempStartY,
        tempWidth,
        tempHeight
      };
    case CropBoxBorderOption.SouthWest:
      tempStartX = currentX - (startX + width) > 0 ? startX + width : currentX;
      tempWidth = nonNegativeData(width - (currentX - startX));
      tempHeight = nonNegativeData(currentY - startY);
      return {
        tempStartX,
        tempStartY: startY,
        tempWidth,
        tempHeight
      };
  }
}
