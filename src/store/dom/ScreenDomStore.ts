import { makeAutoObservable } from "mobx";
import { ScreenDomStoreDataType } from "@/lib/type/components/stores";
import { componentDomView } from "@/lib/shared/view/ComponentDomView";
import { initializeStoreState } from "@/store/utils/initializeStore";
import { registerStoreReset } from "@/store/utils/resetRegistry";

class ScreenDomStore {
  private initialState(): ScreenDomStoreDataType {
    return {
      screenShotController: null,
      cutBoxSizeContainer: null,
      textInputController: null,
      videoController: null,
      noScrollStatus: false,
      resetScrollbarState: false,
      mousePointer: "default",
      keyboardEventHandler: null
    };
  }

  screenShotController!: ScreenDomStoreDataType["screenShotController"];
  cutBoxSizeContainer!: ScreenDomStoreDataType["cutBoxSizeContainer"];
  textInputController!: ScreenDomStoreDataType["textInputController"];
  videoController!: ScreenDomStoreDataType["videoController"];
  noScrollStatus!: ScreenDomStoreDataType["noScrollStatus"];
  resetScrollbarState!: ScreenDomStoreDataType["resetScrollbarState"];
  mousePointer!: ScreenDomStoreDataType["mousePointer"];
  keyboardEventHandler!: ScreenDomStoreDataType["keyboardEventHandler"];

  private readonly applyInitialState: () => void;

  constructor() {
    this.applyInitialState = initializeStoreState(this, () =>
      this.initialState()
    );
    makeAutoObservable(this, {}, { autoBind: true });
    registerStoreReset(this.reset);
  }

  hydrateDomRefs() {
    this.screenShotController = document.getElementById(
      "screenShotContainer"
    ) as HTMLCanvasElement | null;
    this.textInputController = document.getElementById(
      "textInputPanel"
    ) as HTMLDivElement | null;
    this.cutBoxSizeContainer = document.getElementById(
      "cutBoxSizePanel"
    ) as HTMLDivElement | null;
  }

  setNoScrollStatus(status?: boolean) {
    if (status != null) {
      this.noScrollStatus = status;
    }
  }

  setKeyboardEventHandler(handler: ((event: KeyboardEvent) => void) | null) {
    this.keyboardEventHandler = handler;
  }

  setResetScrollbarState(state: boolean) {
    this.resetScrollbarState = state;
  }

  initWebRtcDom() {
    this.videoController = document.createElement("video");
    this.videoController.autoplay = true;
  }

  setVideoSrcObject(videoSrcObject: MediaStream | null) {
    if (this.videoController == null) return;
    this.videoController.srcObject = videoSrcObject;
  }

  showScreenShotPanel() {
    componentDomView.setDisplay(this.screenShotController, "block");
  }

  updateCutBoxSizeShowState(domStyleState: "flex" | "none") {
    componentDomView.setDisplay(this.cutBoxSizeContainer, domStyleState);
  }

  updateTextInputShowState(domStyleState: "block" | "none") {
    componentDomView.setDisplay(this.textInputController, domStyleState);
  }

  updateCutBoxSizePosition(left: number, top: number, sscTop: number) {
    componentDomView.setPosition(
      this.cutBoxSizeContainer,
      `${left}px`,
      `${top + sscTop}px`
    );
  }

  updateCutBoxSizeInfo(width: number, height: number) {
    componentDomView.ensureCutBoxSizeText(
      this.cutBoxSizeContainer,
      Math.floor(width),
      Math.floor(height)
    );
  }

  updateScreenShotControllerSize(width: number, height: number) {
    componentDomView.setCanvasSize(this.screenShotController, width, height);
  }

  updateScreenShotPosition(rLeft: number, rTop: number) {
    componentDomView.setPosition(
      this.screenShotController,
      `${rLeft}px`,
      `${rTop}px`
    );
  }

  setCursorStyle(style: string) {
    componentDomView.setCursor(this.screenShotController, style);
    this.mousePointer = style;
  }

  destroyDOM() {
    if (this.keyboardEventHandler) {
      document.body.removeEventListener("keydown", this.keyboardEventHandler);
      this.keyboardEventHandler = null;
    }
    if (this.noScrollStatus) {
      document.body.classList.remove("__screenshot-lock-scroll");
    }
    this.screenShotController?.classList.remove("no-cursor");
    this.removeElement(this.screenShotController);
    this.removeElement(this.textInputController);
    this.removeElement(this.cutBoxSizeContainer);
    if (document.body.classList.contains("no-cursor")) {
      document.body.classList.remove("no-cursor");
    }
    if (this.resetScrollbarState) {
      document.documentElement.classList.remove("hidden-screen-shot-scroll");
      document.body.classList.remove("hidden-screen-shot-scroll");
    }
    if (this.videoController != null) {
      this.videoController.srcObject = null;
    }
  }

  private removeElement(element: HTMLElement | null) {
    element?.parentElement?.removeChild(element);
  }

  reset() {
    this.applyInitialState();
  }
}

const screenDomStore = new ScreenDomStore();

export default screenDomStore;
