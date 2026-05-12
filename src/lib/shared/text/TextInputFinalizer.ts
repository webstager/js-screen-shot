import drawingDataStore from "@/store/DrawingDataStore";
import textInputStore from "@/store/TextInputStore";
import toolBarStore from "@/store/ToolBarStore";
import { drawText } from "@/lib/features/canvas/drawing/DrawText";
import { addHistory } from "@/lib/features/canvas/state/AddHistoryData";
import { persistTextElementSnapshot } from "@/lib/shared/canvas/TextElementSnapshot";
import {
  removeEditingTextElement,
  restoreEditingTextElement
} from "@/lib/shared/canvas/TextEditingController";
import { isTextContentEmpty } from "@/lib/shared/text/TextContentUtils";

type FinalizeTextInputOptions = {
  controller: HTMLDivElement;
  canvasContext: CanvasRenderingContext2D;
  persistText?: boolean;
};

/**
 * 统一处理文本输入的提交或清理逻辑
 */
export const finalizeTextInput = ({
  controller,
  canvasContext,
  persistText = true
}: FinalizeTextInputOptions) => {
  const textContent = controller.innerText;
  const isEmpty = isTextContentEmpty(textContent);
  const editingId = drawingDataStore.editingTextElementId;

  if (!persistText) {
    if (drawingDataStore.pendingEditingTextElement != null) {
      restoreEditingTextElement();
    } else {
      removeEditingTextElement();
      drawingDataStore.updateEditingTextElementId(null);
      drawingDataStore.updatePendingEditingTextElement(null);
    }
    controller.innerHTML = "";
    textInputStore.setTextStatus(false);
    return;
  }

  removeEditingTextElement();
  if (!isEmpty) {
    const { mouseX, mouseY } = drawingDataStore.textInputPosition;
    drawText(
      textContent,
      mouseX,
      mouseY,
      toolBarStore.selectedColor,
      toolBarStore.fontSize,
      canvasContext
    );
    persistTextElementSnapshot({
      text: textContent,
      mouseX,
      mouseY,
      color: toolBarStore.selectedColor,
      fontSize: toolBarStore.fontSize,
      context: canvasContext
    });
    addHistory();
    textInputStore.setTextStatus(false);
    drawingDataStore.updatePendingEditingTextElement(null);
  } else if (editingId != null) {
    addHistory();
  }

  controller.innerHTML = "";
};
