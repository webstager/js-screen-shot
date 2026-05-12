import { makeAutoObservable } from "mobx";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { TEXT_SIZE_PANEL_HEIGHT_FALLBACK } from "@/lib/constants/toolbar";

class TextInputStore {
  private initialState() {
    return {
      textSizeContainer: null,
      optionTextSizeController: null
    };
  }

  textSizeContainer!: null | HTMLDivElement;
  optionTextSizeController!: null | HTMLDivElement;

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  private getTextSizeContainer() {
    this.textSizeContainer = document.getElementById(
      "textSizePanel"
    ) as HTMLDivElement | null;
  }

  private getOptionTextSizeController() {
    this.optionTextSizeController = document.getElementById(
      "textSelectPanel"
    ) as HTMLDivElement | null;
  }

  // 设置文本输入工具栏展示状态
  setTextStatus(status: boolean) {
    if (screenDomStore.textInputController == null) return;
    if (status) {
      // 显示文本输入工具
      screenDomStore.updateTextInputShowState("block");
      return;
    }
    screenDomStore.updateTextInputShowState("none");
  }

  // 设置截图工具栏文字大小下拉框选项选择工具展示状态
  setTextSizeOptionStatus(status: boolean) {
    this.getOptionTextSizeController();
    if (this.optionTextSizeController == null) return;
    if (status) {
      this.optionTextSizeController.style.display = "flex";
      toolPanelDomStore.updateFloatingPanelVerticalPosition(
        this.optionTextSizeController,
        TEXT_SIZE_PANEL_HEIGHT_FALLBACK
      );
      return;
    }
    this.optionTextSizeController.style.display = "none";
  }

  setTextSizePanelStatus(status: boolean) {
    this.getTextSizeContainer();
    if (this.textSizeContainer == null) return;
    if (status) {
      this.textSizeContainer.style.display = "flex";
      return;
    }
    this.textSizeContainer.style.display = "none";
  }
  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const textInputStore = new TextInputStore();

export default textInputStore;
