import toolBarStore from "@/store/ToolBarStore";
import screenShotCanvasStore from "@/store/ScreenShotCanvasStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import drawingDataStore from "@/store/DrawingDataStore";
import { TextToolContext } from "@/lib/type/mouse/TextToolContext";

const toolInteraction = {
  isToolbarDrawing(): boolean {
    return toolBarStore.toolClickStatus;
  },
  getBrushContext(): CanvasRenderingContext2D | null {
    if (toolBarStore.toolName !== "brush") {
      return null;
    }
    return screenShotCanvasStore.screenShotCanvas;
  },
  getTextToolContext(): TextToolContext | null {
    if (toolBarStore.toolName !== "text") {
      return null;
    }
    const { textInputController } = screenDomStore;
    const canvasContext = screenShotCanvasStore.screenShotCanvas;
    if (textInputController == null || canvasContext == null) {
      return null;
    }
    return {
      textInputController,
      canvasContext
    };
  },
  isCropBoxManipulation(): boolean {
    return Boolean(drawingDataStore.borderOption);
  }
};

export default toolInteraction;
