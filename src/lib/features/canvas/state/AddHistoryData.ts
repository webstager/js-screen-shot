import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import drawingDataStore from "@/store/DrawingDataStore";
import screenDomStore from "@/store/dom/ScreenDomStore";

/**
 * 保存当前画布状态
 *  1. 存储整个画布上的内容
 *  2. 存储当前画布上的元素位置信息
 */
export function addHistory() {
  const screenShotController = screenDomStore.screenShotController;
  if (screenShotController == null) return;
  // 获取canvas容器
  // 获取canvas画布与容器
  const context = screenShotController.getContext(
    "2d"
  ) as CanvasRenderingContext2D;
  const controller = screenShotController;
  if (drawingDataStore.history.length > userParamStore.maxUndoNum) {
    // 删除最早的一条画布记录
    drawingDataStore.shiftHistory();
  }
  // 保存当前画布状态
  drawingDataStore.pushHistory({
    data: context.getImageData(0, 0, controller.width, controller.height),
    // 存储当前画布上的元素信息
    canvasElements: JSON.parse(JSON.stringify(drawingDataStore.canvasElements))
  });
  // 启用撤销按钮
  toolBarStore.setUndoStatus(true);
}

export function showLastHistory(context: CanvasRenderingContext2D) {
  context.putImageData(
    drawingDataStore.history[drawingDataStore.history.length - 1]["data"],
    0,
    0
  );
}
