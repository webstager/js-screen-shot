import { makeAutoObservable } from "mobx";
import { ToolPanelDomStoreDataType } from "@/lib/type/components/stores";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";
import { componentDomView } from "@/lib/shared/view/ComponentDomView";
import screenDomStore from "@/store/dom/ScreenDomStore";
import drawingDataStore from "@/store/DrawingDataStore";
import {
  COLOR_PANEL_HEIGHT_FALLBACK,
  TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK
} from "@/lib/constants/toolbar";

class ToolPanelDomStore {
  private initialState(): ToolPanelDomStoreDataType {
    return {
      toolController: null,
      optionIcoController: null,
      optionController: null,
      colorSelectPanel: null,
      brushSelectionController: null,
      colorSelectController: null,
      rightPanel: null,
      undoController: null
    };
  }

  toolController!: ToolPanelDomStoreDataType["toolController"];
  optionIcoController!: ToolPanelDomStoreDataType["optionIcoController"];
  optionController!: ToolPanelDomStoreDataType["optionController"];
  colorSelectPanel!: ToolPanelDomStoreDataType["colorSelectPanel"];
  brushSelectionController!: ToolPanelDomStoreDataType["brushSelectionController"];
  colorSelectController!: ToolPanelDomStoreDataType["colorSelectController"];
  rightPanel!: ToolPanelDomStoreDataType["rightPanel"];
  undoController!: ToolPanelDomStoreDataType["undoController"];

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () => this.initialState());
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  hydrateDomRefs() {
    this.toolController = document.getElementById(
      "toolPanel"
    ) as HTMLDivElement | null;
    this.optionController = document.getElementById(
      "optionPanel"
    ) as HTMLDivElement | null;
    this.optionIcoController = document.getElementById(
      "optionIcoController"
    ) as HTMLDivElement | null;
  }

  updateToolShowStatus(status: "block" | "none") {
    componentDomView.setDisplay(this.toolController, status);
  }

  updateToolPosition(rTop: number, rLeft: number) {
    if (this.toolController == null) return;
    let sscTop = 0;
    if (screenDomStore.screenShotController) {
      sscTop = parseInt(screenDomStore.screenShotController.style.top);
    }
    componentDomView.setPosition(
      this.toolController,
      `${rLeft}px`,
      `${rTop + sscTop}px`
    );
  }

  updateToolOptionShowState(domStyleState: "block" | "none") {
    componentDomView.setDisplay(this.optionIcoController, domStyleState);
    componentDomView.setDisplay(this.optionController, domStyleState);
  }

  updateToolOptIcon(domStyleState: "block" | "none") {
    componentDomView.setDisplay(this.optionIcoController, domStyleState);
  }

  updateToolOptionPosition(
    icoLeft: string,
    icoTop: string,
    optionLeft: string,
    optionTop: string,
    optionIcoTransform?: string
  ) {
    componentDomView.setPosition(this.optionIcoController, icoLeft, icoTop);
    componentDomView.setPosition(this.optionController, optionLeft, optionTop);
    if (this.optionIcoController != null && optionIcoTransform) {
      this.optionIcoController.style.transform = optionIcoTransform;
    }
  }

  addColorSelectPanelClassStyle(className: string) {
    this.ensureColorSelectPanel();
    componentDomView.addClass(this.colorSelectPanel, className);
  }

  updateColorSelectPanelColor(color: string) {
    this.ensureColorSelectPanel();
    componentDomView.setBackgroundColor(this.colorSelectPanel, color);
  }

  getBrushSelectionController() {
    this.brushSelectionController = document.getElementById(
      "brushSelectPanel"
    ) as HTMLDivElement | null;
  }

  updateBrushSelectionShowState(domStyleState: "block" | "none") {
    componentDomView.setDisplay(this.brushSelectionController, domStyleState);
  }

  getColorPanel() {
    this.colorSelectController = document.getElementById("colorPanel");
  }

  updateColorPanelShowState(domStyleState: "flex" | "none") {
    componentDomView.setDisplay(this.colorSelectController, domStyleState);
    if (domStyleState === "flex") {
      this.updateFloatingPanelVerticalPosition(
        this.colorSelectController,
        COLOR_PANEL_HEIGHT_FALLBACK
      );
    }
  }

  updateFloatingPanelVerticalPosition(
    panel: HTMLElement | null,
    fallbackPanelHeight: number
  ) {
    if (panel == null) return;
    const optionController =
      this.optionController ?? document.getElementById("optionPanel");
    if (optionController == null) return;
    const panelHeight =
      panel.offsetHeight || panel.scrollHeight || fallbackPanelHeight;
    const optionHeight =
      optionController.offsetHeight || TOOLBAR_OPTION_PANEL_HEIGHT_FALLBACK;
    const spaceAbove = optionController.getBoundingClientRect().top;
    panel.style.top =
      spaceAbove >= panelHeight ? `-${panelHeight}px` : `${optionHeight}px`;
  }

  getRightPanel() {
    this.rightPanel = document.getElementById("rightPanel");
  }

  updateRightPanelShowState(domStyleState: "flex" | "none") {
    componentDomView.setDisplay(this.rightPanel, domStyleState);
  }

  getUndoController() {
    this.undoController = document.getElementById("undoPanel");
  }

  private undoFn() {
    drawingDataStore.undoHistory(
      screenDomStore.screenShotController?.getContext("2d"),
      () => {
        drawingDataStore.updateCanUndo(false);
      }
    );
  }

  enableUndoButton() {
    componentDomView.configureUndoButton(this.undoController, this.undoFn, true);
  }

  disableUndoButton() {
    componentDomView.configureUndoButton(
      this.undoController,
      this.undoFn,
      false
    );
  }

  destroyDOM() {
    this.removeElement(this.toolController);
    this.removeElement(this.optionIcoController);
    this.removeElement(this.optionController);
    this.removeElement(this.brushSelectionController);
    this.removeElement(this.colorSelectController);
    this.removeElement(this.rightPanel);
    this.removeElement(this.undoController);
    this.removeElement(this.colorSelectPanel);
  }

  private ensureColorSelectPanel() {
    if (this.colorSelectPanel == null) {
      this.colorSelectPanel = document.getElementById("colorSelectPanel");
    }
  }

  private removeElement(element: HTMLElement | null) {
    element?.parentElement?.removeChild(element);
  }

  reset() {
    this.applyInitialState();
  }
}

const toolPanelDomStore = new ToolPanelDomStore();

export default toolPanelDomStore;
