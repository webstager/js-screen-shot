import drawingDataStore from "@/store/DrawingDataStore";
import textInputStore from "@/store/TextInputStore";
import toolBarStore from "@/store/ToolBarStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { restoreEditingTextElement } from "@/lib/shared/canvas/TextEditingController";
import { CanvasElementSnapshot } from "@/lib/type/components/canvas";
import { CustomCanvasElement } from "@/lib/type/editor/canvasElements";
import type { ToolName } from "@/lib/type/editor/toolNames";
import { TOOLBAR_ITEMS } from "@/lib/constants/toolbarItems";
import { setSelectedClassNameById } from "@/lib/shared/ui/SetSelectedClassName";
import { isCustomCanvasElementSnapshot } from "@/lib/shared/canvas/CustomCanvasElementUtils";

const resetTextEditingState = () => {
  restoreEditingTextElement();
  const textInputController = screenDomStore.textInputController;
  if (textInputController != null) {
    textInputController.innerHTML = "";
  }
  textInputStore.setTextStatus(false);
  drawingDataStore.updateTextInputPosition(0, 0);
  drawingDataStore.updateEditingTextElementId(null);
  drawingDataStore.updatePendingEditingTextElement(null);
};

const hideElementOptionPanelForCustomTool = () => {
  toolBarStore.setOptionStatus(false);
  toolBarStore.hiddenOptionIcoStatus();
  toolBarStore.setBrushSelectionStatus(false);
  toolBarStore.setColorPanelStatus(false);
  toolBarStore.setRightPanel(false);
  textInputStore.setTextSizePanelStatus(false);
  textInputStore.setTextSizeOptionStatus(false);
};

export const syncToolbarWithElement = (
  elementSnapshot: CanvasElementSnapshot | null | undefined
) => {
  if (elementSnapshot == null) return;
  const isCustomElement = isCustomCanvasElementSnapshot(elementSnapshot);
  const customElement = isCustomElement
    ? (elementSnapshot.element as CustomCanvasElement)
    : null;
  const toolName = (customElement?.toolName ??
    elementSnapshot.type) as ToolName;
  const toolId =
    customElement?.toolId ??
    TOOLBAR_ITEMS.find(item => item.title === elementSnapshot.type)?.id ??
    null;
  toolBarStore.setToolClickStatus(true);
  toolBarStore.setToolName(toolName);
  toolBarStore.setActiveToolName(toolName);
  toolBarStore.setToolId(toolId);
  if (isCustomElement) {
    hideElementOptionPanelForCustomTool();
  } else {
    toolBarStore.syncOptionContent(toolName);
    toolBarStore.syncOptionLayout(toolId, toolName);
  }
  setSelectedClassNameById(toolPanelDomStore.toolController, toolId);
  resetTextEditingState();
};
