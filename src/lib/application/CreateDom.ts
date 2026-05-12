import { CropBoxBounds } from "@/lib/type/components/cropBox";
import { ScreenShotOptions } from "@/lib/type/components/screenshot";
import {
  ToolbarItem,
  UserToolbarCallback
} from "@/lib/type/components/toolbar";
import {
  toolClickEvent,
  toolClickEventForUserDefined
} from "@/lib/features/canvas/events/ToolClickEvent";
import {
  setBrushSize,
  setMosaicPenSize
} from "@/lib/shared/ui/SetBrushSize";
import { selectColor, getColor } from "@/lib/shared/ui/ColorSelection";
import {
  getTextSize,
  hiddenColorPanelStatus,
  hiddenTextSizeOptionStatus,
  selectTextSize,
  setTextSize
} from "@/lib/shared/ui/SelectTextSize";
import { TOOLBAR_ITEMS } from "@/lib/constants/toolbarItems";

import toolBarStore from "@/store/ToolBarStore";
import userParamStore from "@/store/UserParamStore";
import { saveData } from "@/lib/features/canvas/state/SaveData";
import {
  appendScreenshotNodesToBody,
  createScreenshotDomNodes,
  hideScreenshotNodes
} from "@/lib/application/dom/DomFactory";
import { ScreenshotDomNodes } from "@/lib/type/dom/ScreenshotDomNodes";
import { TEXT_FONT_SIZE_OPTIONS } from "@/lib/constants/textTool";
import {
  BRUSH_OPTIONS,
  COLOR_ITEM_COUNT,
  OPTION_PANEL_AUTO_HIDE_SELECTORS,
  OPTION_PANEL_CLASSES,
  OPTION_PANEL_IDS,
  TOOLBAR_DOM
} from "@/lib/constants/screenshotDom";
import type { BrushSizeKey } from "@/lib/constants/screenshotDom";

interface DivConfig {
  className?: string;
  id?: string;
  text?: string;
  dataset?: Record<string, string>;
}

const ITEM_PANEL_SELECTOR = `.${TOOLBAR_DOM.itemClass}`;
const TEXT_ITEM_SELECTOR = `.${OPTION_PANEL_CLASSES.textItem}`;
const COLOR_ITEM_SELECTOR = `.${OPTION_PANEL_CLASSES.colorItem}`;

export default class CreateDom {
  private readonly domNodes: ScreenshotDomNodes;
  // 截图工具栏容器
  private readonly toolController: HTMLDivElement;
  // 绘制选项顶部ico容器
  private readonly optionIcoController: HTMLDivElement;
  // 画笔绘制选项容器
  private readonly optionController: HTMLDivElement;
  // 文字工具输入容器
  private readonly textInputController: HTMLDivElement;
  // 截图完成回调函数
  private readonly completeCallback: Function | undefined;
  // 截图关闭毁掉函数
  private readonly closeCallback: Function | undefined;
  // 需要隐藏的图标
  private readonly hiddenIcoArr: string[];

  // 截图工具栏图标
  private readonly toolbar: Array<ToolbarItem>;
  private readonly toolbarItemMap = new Map<number, ToolbarItem>();
  private toolbarEventsBound = false;

  private textSizeDisplay?: HTMLDivElement;
  private textSizeSelectPanel?: HTMLDivElement;

  constructor(options: ScreenShotOptions) {
    this.domNodes = createScreenshotDomNodes();
    this.toolController = this.domNodes.tool;
    this.optionIcoController = this.domNodes.optionIco;
    this.optionController = this.domNodes.option;
    this.textInputController = this.domNodes.textInput;
    this.completeCallback = this.resolveCompleteCallback(options);
    this.closeCallback = options?.closeCallback;
    this.hiddenIcoArr = [];
    this.toolbar = [...TOOLBAR_ITEMS];
    this.setupOptionPanelAutoHide();

    // 筛选需要隐藏的图标
    if (options?.hiddenToolIco) {
      for (const iconKey in options.hiddenToolIco) {
        if (options.hiddenToolIco[iconKey]) {
          this.filterHideIcon(iconKey);
        }
      }
    }
    // 为画笔绘制选项角标设置class
    this.setOptionIcoClassName();
    // 将自定义的数据插入到默认数据的倒数第二个位置
    const insertIndex = Math.max(
      this.toolbar.length - TOOLBAR_DOM.customInsertOffset,
      0
    );
    this.toolbar.splice(insertIndex, 0, ...userParamStore.userToolbar);
    // 渲染工具栏
    this.renderToolBar();
    // 渲染文字大小选择容器
    this.renderTextSizeSelectPanel();
    // 渲染画笔相关选项
    this.renderBrushSelectPanel();
    // 渲染文本输入
    this.setTextInputPanel();
    // 渲染页面
    appendScreenshotNodesToBody(this.domNodes);
    // 隐藏所有dom
    hideScreenshotNodes(this.domNodes);
  }

  private resolveCompleteCallback(
    options?: ScreenShotOptions
  ): Function | undefined {
    if (
      options &&
      Object.prototype.hasOwnProperty.call(options, "completeCallback")
    ) {
      return options.completeCallback;
    }
    return (imgInfo: { base64: string; cutInfo: CropBoxBounds }) => {
      // 将数据写入session或者IndexedDB
      saveData(imgInfo, "screenShotImg");
    };
  }

  private setupOptionPanelAutoHide() {
    this.optionController.addEventListener("click", evt => {
      const target = evt.target as HTMLElement;
      const shouldIgnore = OPTION_PANEL_AUTO_HIDE_SELECTORS.some(selector =>
        target.closest(selector)
      );
      if (shouldIgnore) {
        return;
      }
      // 点击工具栏的其他位置则隐藏文字大小选择面板与颜色选择面板
      hiddenTextSizeOptionStatus();
      hiddenColorPanelStatus();
    });
  }

  // 渲染截图工具栏图标
  private renderToolBar() {
    const fragment = document.createDocumentFragment();
    const hiddenIcons = new Set(this.hiddenIcoArr);
    this.toolbarItemMap.clear();
    for (let i = 0; i < this.toolbar.length; i++) {
      const item = this.toolbar[i];
      if (hiddenIcons.has(item.title)) {
        continue;
      }
      const itemPanel = this.createToolbarItem(item);
      this.toolbarItemMap.set(item.id, item);
      fragment.appendChild(itemPanel);
    }
    this.toolController.appendChild(fragment);
    if (hiddenIcons.size > 0) {
      this.toolController.style.minWidth =
        TOOLBAR_DOM.minWidthWhenIconsHidden;
    }
    this.bindToolbarEvents();
  }

  private createToolbarItem(item: ToolbarItem) {
    const isUndo = item.title === TOOLBAR_DOM.undoTitle;
    const baseClass = TOOLBAR_DOM.itemClass;
    const itemPanel = this.createDiv({
      className: isUndo
        ? `${baseClass} ${TOOLBAR_DOM.undoDisabledClass}`
        : `${baseClass} ${item.title}`,
      dataset: {
        title: item.title,
        id: `${item.id}`
      }
    });
    if (isUndo) {
      itemPanel.id = TOOLBAR_DOM.undoId;
      return itemPanel;
    }
    if (item.icon) {
      itemPanel.dataset.icon = item.icon;
      itemPanel.style.backgroundImage = `url(${item.icon})`;
      itemPanel.style.backgroundSize = "cover";
    }
    if (item.activeIcon) {
      itemPanel.dataset.activeIcon = item.activeIcon;
    }
    return itemPanel;
  }

  private bindToolbarEvents() {
    if (this.toolbarEventsBound) {
      return;
    }
    this.toolbarEventsBound = true;
    this.toolController.addEventListener("click", this.handleToolbarClick);
    this.toolController.addEventListener(
      "pointerover",
      this.handleToolbarPointerOver
    );
    this.toolController.addEventListener(
      "pointerout",
      this.handleToolbarPointerOut
    );
  }

  private handleToolbarClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      ITEM_PANEL_SELECTOR
    );
    if (!target || !this.toolController.contains(target)) {
      return;
    }
    if (target.dataset.title === TOOLBAR_DOM.undoTitle) {
      return;
    }
    const itemId = Number(target.dataset.id);
    if (Number.isNaN(itemId)) {
      return;
    }
    const toolbarItem = this.toolbarItemMap.get(itemId);
    if (!toolbarItem) {
      return;
    }
    if (itemId <= 100) {
      toolClickEvent(
        toolbarItem.title,
        toolbarItem.id,
        event,
        this.completeCallback,
        this.closeCallback
      );
      return;
    }
    toolClickEventForUserDefined(
      toolbarItem.id,
      toolbarItem.title,
      toolbarItem.activeIcon as string,
      toolbarItem.clickFn as UserToolbarCallback,
      event
    );
  };

  private handleToolbarPointerOver = (event: PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      ITEM_PANEL_SELECTOR
    );
    if (!target || !this.toolController.contains(target)) {
      return;
    }
    const itemId = Number(target.dataset.id);
    if (Number.isNaN(itemId) || toolBarStore.toolId === itemId) {
      return;
    }
    const activeIcon = target.dataset.activeIcon;
    if (activeIcon) {
      target.style.backgroundImage = `url(${activeIcon})`;
    }
  };

  private handleToolbarPointerOut = (event: PointerEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      ITEM_PANEL_SELECTOR
    );
    if (!target || !this.toolController.contains(target)) {
      return;
    }
    const itemId = Number(target.dataset.id);
    if (Number.isNaN(itemId) || toolBarStore.toolId === itemId) {
      return;
    }
    const icon = target.dataset.icon;
    if (icon) {
      target.style.backgroundImage = `url(${icon})`;
    }
  };

  // 渲染文字大小选择容器
  private renderTextSizeSelectPanel() {
    const textSizePanel = this.createDiv({
      className: OPTION_PANEL_CLASSES.textSizeContainer,
      id: OPTION_PANEL_IDS.textSize,
      text: `${getTextSize()} px`
    });
    const textSelectPanel = this.createDiv({
      className: OPTION_PANEL_CLASSES.textSelectContainer,
      id: OPTION_PANEL_IDS.textSelect
    });
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < TEXT_FONT_SIZE_OPTIONS.length; i++) {
      const size = TEXT_FONT_SIZE_OPTIONS[i];
      const itemPanel = this.createDiv({
        className: OPTION_PANEL_CLASSES.textItem,
        text: `${size} px`,
        dataset: {
          value: `${size}`
        }
      });
      fragment.appendChild(itemPanel);
    }
    textSelectPanel.appendChild(fragment);
    textSelectPanel.addEventListener("click", this.handleTextSizeOptionClick);
    textSizePanel.style.display = "none";
    textSelectPanel.style.display = "none";
    textSizePanel.addEventListener("click", () => {
      selectTextSize();
    });
    this.textSizeDisplay = textSizePanel;
    this.textSizeSelectPanel = textSelectPanel;
    this.optionController.appendChild(textSizePanel);
    this.optionController.appendChild(textSelectPanel);
  }

  private handleTextSizeOptionClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      TEXT_ITEM_SELECTOR
    );
    if (!target || !this.textSizeSelectPanel?.contains(target)) {
      return;
    }
    this.textSizeSelectPanel.style.display = "none";
    const currentTextSize = target.dataset.value;
    if (currentTextSize) {
      if (this.textSizeDisplay) {
        this.textSizeDisplay.innerText = `${currentTextSize} px`;
      }
      setTextSize(+currentTextSize);
    }
  };

  // 渲染画笔大小选择图标与颜色选择容器
  private renderBrushSelectPanel() {
    const brushSelectPanel = this.createDiv({
      id: OPTION_PANEL_IDS.brushSelect,
      className: OPTION_PANEL_CLASSES.brushSelectPanel
    });
    const brushFragment = document.createDocumentFragment();
    for (let i = 0; i < BRUSH_OPTIONS.length; i++) {
      const option = BRUSH_OPTIONS[i];
      const classes = [TOOLBAR_DOM.itemClass, option.baseClass];
      if (option.activeClass) {
        classes.push(option.activeClass);
      }
      const itemPanel = this.createDiv({
        className: classes.join(" "),
        dataset: {
          brushSize: option.size,
          brushIndex: `${option.index}`
        }
      });
      brushFragment.appendChild(itemPanel);
    }
    brushSelectPanel.appendChild(brushFragment);
    brushSelectPanel.addEventListener("click", this.handleBrushSelectClick);

    const rightPanel = this.createDiv({
      className: OPTION_PANEL_CLASSES.rightPanel,
      id: OPTION_PANEL_IDS.rightPanel
    });
    const colorSelectPanel = this.createDiv({
      className: OPTION_PANEL_CLASSES.colorSelectPanel,
      id: OPTION_PANEL_IDS.colorSelect
    });
    colorSelectPanel.addEventListener("click", () => {
      selectColor();
    });

    const colorPanel = this.createDiv({
      className: OPTION_PANEL_CLASSES.colorPanel,
      id: OPTION_PANEL_IDS.colorList
    });
    colorPanel.style.display = "none";
    const colorFragment = document.createDocumentFragment();
    for (let i = 0; i < COLOR_ITEM_COUNT; i++) {
      const colorItem = this.createDiv({
        className: OPTION_PANEL_CLASSES.colorItem,
        dataset: {
          colorIndex: `${i + 1}`
        }
      });
      colorFragment.appendChild(colorItem);
    }
    colorPanel.appendChild(colorFragment);
    colorPanel.addEventListener("click", this.handleColorPanelClick);

    const pullDownArrow = this.createDiv({
      className: OPTION_PANEL_CLASSES.pullDownArrow
    });
    pullDownArrow.addEventListener("click", () => {
      selectColor();
    });

    rightPanel.appendChild(colorPanel);
    rightPanel.appendChild(colorSelectPanel);
    rightPanel.appendChild(pullDownArrow);

    this.optionController.appendChild(brushSelectPanel);
    this.optionController.appendChild(rightPanel);
  }

  private handleBrushSelectClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      ITEM_PANEL_SELECTOR
    );
    if (!target || !target.dataset.brushSize) {
      return;
    }
    const brushSize = target.dataset.brushSize as BrushSizeKey;
    const brushIndex = Number(target.dataset.brushIndex);
    if (!brushSize || Number.isNaN(brushIndex)) {
      return;
    }
    setBrushSize(brushSize, brushIndex, event);
    setMosaicPenSize(brushSize, brushIndex, event);
  };

  private handleColorPanelClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLDivElement>(
      COLOR_ITEM_SELECTOR
    );
    if (!target) {
      return;
    }
    const colorIndex = Number(target.dataset.colorIndex);
    if (!Number.isNaN(colorIndex)) {
      getColor(colorIndex);
    }
  };

  // 渲染文本输入区域容器
  private setTextInputPanel() {
    // 让div可编辑
    this.textInputController.contentEditable = "true";
    // 关闭拼写检查
    this.textInputController.spellcheck = false;
  }

  // 设置画笔绘制选项顶部ico样式
  private setOptionIcoClassName() {
    this.optionIcoController.className = "ico-panel";
  }

  // 将需要隐藏的图标放入对应的数组中
  private filterHideIcon(icons: string) {
    switch (icons) {
      case "rightTop":
        this.hiddenIcoArr.push("right-top");
        break;
      default:
        this.hiddenIcoArr.push(icons);
        break;
    }
  }

  private createDiv(config: DivConfig = {}) {
    const div = document.createElement("div");
    if (config.className) {
      div.className = config.className;
    }
    if (config.id) {
      div.id = config.id;
    }
    if (typeof config.text === "string") {
      div.innerText = config.text;
    }
    if (config.dataset) {
      Object.entries(config.dataset).forEach(([key, value]) => {
        if (value != null) {
          div.dataset[key] = value;
        }
      });
    }
    return div;
  }
}
