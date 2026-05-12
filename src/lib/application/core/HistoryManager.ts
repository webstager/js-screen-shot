import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import drawingDataStore from "@/store/DrawingDataStore";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import toolBarStore from "@/store/ToolBarStore";

export const showCanvasLastHistory = () => {
  if (screenShotCanvasStore.screenShotCanvas != null) {
    const context = screenShotCanvasStore.screenShotCanvas;
    if (drawingDataStore.history.length <= 0) {
      addHistory();
    }
    context.putImageData(
      drawingDataStore.history[drawingDataStore.history.length - 1]["data"],
      0,
      0
    );
  }
};

export const isCustomTool = () => {
  const toolId = toolBarStore.toolId;
  return toolId && toolId > 100;
};
