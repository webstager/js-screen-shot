import drawingDataStore from "@/store/DrawingDataStore";
import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";

export type TextInputPlacementOptions = {
  controller: HTMLDivElement;
  canvasX: number;
  baselineY: number;
  color: string;
  fontSize: number;
  selectExistingContent?: boolean;
};

export const applyTextInputStyles = (
  controller: HTMLDivElement,
  viewX: number,
  color: string,
  fontSize: number,
  content?: string
) => {
  // 复用样式初始化，避免每处重复设置
  if (content != null) {
    controller.innerText = content;
  }
  controller.style.left = `${viewX}px`;
  controller.style.fontSize = `${fontSize}px`;
  controller.style.fontFamily = "none";
  controller.style.color = color;
};

export const placeTextInputController = ({
  controller,
  canvasX,
  baselineY,
  color,
  fontSize,
  selectExistingContent = false
}: TextInputPlacementOptions) => {
  // 读取高度后再计算垂直居中位置
  const containerHeight = controller.offsetHeight;
  const textMouseY =
    baselineY - Math.floor(containerHeight / 2) + userParamStore.position.top;
  controller.style.top = `${textMouseY}px`;
  controller.focus();
  if (selectExistingContent) {
    const selection = window.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(controller);
      range.collapse(false);
      selection.addRange(range);
    }
  }
  drawingDataStore.updateTextInputPosition(canvasX, baselineY);
  toolBarStore.setTextInfo({
    positionX: canvasX,
    positionY: baselineY,
    color,
    size: fontSize
  });
};

export const scheduleTextPlacement = (options: TextInputPlacementOptions) => {
  // 推迟到下一帧（或微任务）再测量高度，避免布局抖动
  const task = () => placeTextInputController(options);
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(task);
  } else {
    setTimeout(task);
  }
};
