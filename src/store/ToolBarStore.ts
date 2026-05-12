import { makeAutoObservable } from "mobx";
import { getToolRelativePosition } from "@/lib/shared/dom/GetToolRelativePosition";
import { TextToolInfo } from "@/lib/type/components/text";
import { ToolBarStoreDataType } from "@/lib/type/components/stores";
import { ToolName } from "@/lib/type/editor/toolNames";
import { ToolVerticalAnchor } from "@/lib/type/components/toolbar";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { calculateOptionIcoPosition } from "@/lib/features/canvas/calculations/CalculateOptionIcoPosition";
import textInputStore from "@/store/TextInputStore";
import {
  TOOLBAR_HEIGHT_FALLBACK,
  TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK,
  TOOLBAR_OPTION_TRIANGLE_HEIGHT
} from "@/lib/constants/toolbar";

class ToolBarStore {
  private initialState(): ToolBarStoreDataType {
    return {
      toolClickStatus: false,
      selectedColor: "#F53340",
      toolName: "",
      toolId: null,
      penSize: 2,
      fontSize: 17,
      mosaicPenSize: 10,
      toolVerticalAnchor: "below",
      activeTool: "",
      textEditState: false,
      textInfo: {
        positionX: 0,
        positionY: 0,
        color: "#000000",
        size: 0
      }
    };
  }

  toolClickStatus!: boolean;
  selectedColor!: string;
  toolName!: ToolName;
  toolId!: number | null;
  // 当前选择的画笔大小
  penSize!: number;
  // 当前选择的字体大小
  fontSize!: number;
  // 马赛克工具的笔触大小
  mosaicPenSize!: number;

  // 工具栏竖直方向锚点
  toolVerticalAnchor!: ToolVerticalAnchor;
  // 当前选中的工具
  activeTool!: string;
  // 当前是否处于文本编辑状态
  textEditState!: boolean;
  textInfo!: TextToolInfo;

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  // 设置截图工具栏展示状态
  setToolStatus(status: boolean) {
    toolPanelDomStore.updateToolShowStatus(status ? "block" : "none");
  }

  // 设置截图工具位置信息
  setToolInfo(left: number, top: number) {
    if (toolPanelDomStore.toolController == null) return;
    const { left: rLeft, top: rTop } = getToolRelativePosition(left, top);
    toolPanelDomStore.updateToolPosition(rTop, rLeft);
  }

  // 获取工具栏位置
  getToolPosition() {
    if (toolPanelDomStore.toolController == null) return;
    return {
      left: toolPanelDomStore.toolController.offsetLeft,
      top: toolPanelDomStore.toolController.offsetTop
    };
  }

  // 设置选项状态
  setOptionStatus(status: boolean) {
    toolPanelDomStore.updateToolOptionShowState(status ? "block" : "none");
  }

  // 隐藏画笔工具栏三角形角标
  hiddenOptionIcoStatus() {
    toolPanelDomStore.updateToolOptIcon("none");
  }

  // 设置画笔选择工具栏位置
  setOptionPosition(position: number) {
    // 修改位置
    const toolPosition = this.getToolPosition();
    if (toolPosition == null) return;
    const toolbarHeight =
      toolPanelDomStore.toolController?.offsetHeight ?? TOOLBAR_HEIGHT_FALLBACK;
    const optionHeight =
      toolPanelDomStore.optionController?.offsetHeight ||
      TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK;
    const icoLeft = `${toolPosition.left + position}px`;
    const optionLeft = `${toolPosition.left}px`;
    let icoTop = toolPosition.top + toolbarHeight;
    let optionTop = icoTop + TOOLBAR_OPTION_TRIANGLE_HEIGHT;
    let optionIcoTransform = "rotate(180deg)";

    if (this.isToolbarAnchoredAbove()) {
      icoTop = toolPosition.top - TOOLBAR_OPTION_TRIANGLE_HEIGHT;
      optionTop = icoTop - optionHeight;
      optionIcoTransform = "rotate(0deg)";
    }

    toolPanelDomStore.updateToolOptionPosition(
      icoLeft,
      `${icoTop}px`,
      optionLeft,
      `${optionTop}px`,
      optionIcoTransform
    );
  }

  // 设置工具点击状态
  setToolClickStatus(status: boolean) {
    this.toolClickStatus = status;
  }

  // 设置选中的颜色
  setSelectedColor(color: string) {
    this.selectedColor = color;
    toolPanelDomStore.updateColorSelectPanelColor(color);
  }

  // 设置工具名称
  setToolName(itemName: ToolName) {
    this.toolName = itemName;
  }

  // 设置工具 ID
  setToolId(id: number | null) {
    this.toolId = id;
  }

  // 同步选项面板与角标的显示与位置
  syncOptionLayout(toolId: number | null, toolName: ToolName) {
    if (toolId == null) return;
    this.setOptionStatus(true);
    this.setOptionPosition(calculateOptionIcoPosition(toolId));
    if (toolName === "mosaicPen") {
      this.setRightPanel(false);
      this.hiddenOptionIcoStatus();
    } else {
      this.setRightPanel(true);
    }
  }

  // 根据工具类型同步选项面板内部内容状态
  syncOptionContent(toolName: ToolName) {
    if (toolName === "text") {
      textInputStore.setTextSizePanelStatus(true);
      this.setBrushSelectionStatus(false);
      toolPanelDomStore.addColorSelectPanelClassStyle("text-select-status");
      return;
    }
    textInputStore.setTextSizePanelStatus(false);
    this.setBrushSelectionStatus(true);
  }

  // 设置画笔大小
  setPenSize(size: number) {
    this.penSize = size;
  }

  // 设置马赛克笔触大小
  setMosaicPenSize(size: number) {
    this.mosaicPenSize = size;
  }

  // 设置工具栏竖直锚点
  setToolVerticalAnchor(anchor: ToolVerticalAnchor) {
    this.toolVerticalAnchor = anchor;
  }

  resetToolVerticalAnchor() {
    this.toolVerticalAnchor = "below";
  }

  isToolbarAnchoredAbove() {
    return this.toolVerticalAnchor === "above";
  }

  // 设置字体大小
  setFontSize(size: number) {
    this.fontSize = size;
  }

  // 设置当前激活的工具名称
  setActiveToolName(toolName: string) {
    this.activeTool = toolName;
  }

  // 设置文本信息
  setTextInfo(info: TextToolInfo) {
    this.textInfo = info;
  }

  // 设置文本编辑状态
  setTextEditState(state: boolean) {
    this.textEditState = state;
  }

  // 设置画笔选择状态
  setBrushSelectionStatus(status: boolean) {
    toolPanelDomStore.getBrushSelectionController();
    toolPanelDomStore.updateBrushSelectionShowState(status ? "block" : "none");
  }

  // 设置颜色面板状态
  setColorPanelStatus(status: boolean) {
    toolPanelDomStore.getColorPanel();
    toolPanelDomStore.updateColorPanelShowState(status ? "flex" : "none");
  }

  // 设置右侧面板状态
  setRightPanel(status: boolean) {
    toolPanelDomStore.getRightPanel();
    toolPanelDomStore.updateRightPanelShowState(status ? "flex" : "none");
  }

  // 设置撤销按钮状态
  setUndoStatus(status: boolean) {
    toolPanelDomStore.getUndoController();

    if (status) {
      // 启用撤销按钮
      toolPanelDomStore.enableUndoButton();
      return;
    }
    // 禁用撤销按钮
    toolPanelDomStore.disableUndoButton();
  }

  // 重置状态
  reset() {
    this.applyInitialState();
  }
}

const toolBarStore = new ToolBarStore();

export default toolBarStore;
