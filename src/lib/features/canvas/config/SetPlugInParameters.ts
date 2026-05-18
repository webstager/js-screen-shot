import { ScreenShotOptions } from "@/lib/type/components/screenshot";
import userParamStore from "@/store/UserParamStore";
import { logger } from "@/lib/utils/Logger";
import { applyOptions } from "@/lib/shared/config/OptionApplier";
import { OptionApplicator } from "@/lib/type/config/OptionApplicator";

const plugInApplicators: OptionApplicator<ScreenShotOptions>[] = [
  {
    keys: ["enableWebRtc"],
    apply: options => {
      if (options.enableWebRtc === false) {
        userParamStore.setWebRtcStatus(false);
      }
    }
  },
  {
    keys: ["screenFlow"],
    apply: options => {
      if (options.screenFlow instanceof MediaStream) {
        userParamStore.setScreenFlow(options.screenFlow);
      }
    }
  },
  {
    keys: ["capture"],
    apply: options => {
      if (options.capture?.source === "snapdom") {
        userParamStore.setDomRenderEngine("snapdom");
      } else if (options.capture?.source === "dom") {
        userParamStore.setDomRenderEngine("html2canvas");
      }
      if (options.capture?.snapdom) {
        userParamStore.setSnapDomRenderer(options.capture.snapdom);
      }
      if (options.capture?.snapdomOptions) {
        userParamStore.setSnapDomOptions(options.capture.snapdomOptions);
      }
      if (options.capture?.cursor) {
        userParamStore.setCaptureCursor(options.capture.cursor);
      }
    }
  },
  {
    keys: ["menuBarHeight"],
    apply: options => {
      if (typeof options.menuBarHeight === "number") {
        userParamStore.setMenuBarHeight(options.menuBarHeight);
      }
    }
  },
  {
    keys: ["canvasWidth", "canvasHeight"],
    when: options => Boolean(options.canvasWidth && options.canvasHeight),
    apply: options => {
      userParamStore.setCanvasSize(
        options.canvasWidth as number,
        options.canvasHeight as number
      );
    }
  },
  {
    keys: ["showScreenData"],
    apply: options => {
      if (options.showScreenData) {
        userParamStore.setShowScreenDataStatus(true);
      }
    }
  },
  {
    keys: ["maskColor"],
    apply: options => {
      if (options.maskColor && typeof options.maskColor === "object") {
        userParamStore.setMaskColor(options.maskColor);
      }
    }
  },
  {
    keys: ["writeBase64"],
    apply: options => {
      if (options.writeBase64 === false) {
        userParamStore.setWriteImgState(false);
      }
    }
  },
  {
    keys: ["exportOptions"],
    apply: options => {
      if (options.exportOptions) {
        userParamStore.setExportOptions(options.exportOptions);
      }
    }
  },
  {
    keys: ["screenShotDom"],
    apply: options => {
      if (options.screenShotDom) {
        userParamStore.setScreenShotDom(options.screenShotDom);
      }
    }
  },
  {
    keys: ["cutBoxBdColor"],
    apply: options => {
      if (options.cutBoxBdColor) {
        userParamStore.setCutBoxBdColor(options.cutBoxBdColor);
      }
    }
  },
  {
    keys: ["saveCallback"],
    apply: options => {
      if (typeof options.saveCallback === "function") {
        userParamStore.setSaveCallback(options.saveCallback);
      }
    }
  },
  {
    keys: ["maxUndoNum"],
    apply: options => {
      if (options.maxUndoNum !== undefined) {
        userParamStore.setMaxUndoNum(options.maxUndoNum);
      }
    }
  },
  {
    keys: ["useRatioArrow"],
    apply: options => {
      if (options.useRatioArrow) {
        userParamStore.setRatioArrow(options.useRatioArrow);
      }
    }
  },
  {
    keys: ["imgAutoFit"],
    apply: options => {
      if (options.imgAutoFit) {
        userParamStore.setImgAutoFit(options.imgAutoFit);
      }
    }
  },
  {
    keys: ["useCustomImgSize", "customImgSize"],
    when: options => Boolean(options.useCustomImgSize && options.customImgSize),
    apply: options => {
      userParamStore.setUseCustomImgSize(
        Boolean(options.useCustomImgSize),
        options.customImgSize
      );
    }
  },
  {
    keys: ["saveImgTitle"],
    apply: options => {
      if (options.saveImgTitle) {
        userParamStore.setSaveImgTitle(options.saveImgTitle);
      }
    }
  },
  {
    keys: ["destroyContainer"],
    apply: options => {
      if (options.destroyContainer === false) {
        logger.debug("destroyContainer disabled");
        userParamStore.setDestroyContainerState(false);
      }
    }
  },
  {
    keys: ["userToolbar"],
    apply: options => {
      if (Array.isArray(options.userToolbar)) {
        userParamStore.setUserToolbar(options.userToolbar);
      }
    }
  },
  {
    keys: ["h2cImgLoadErrCallback"],
    apply: options => {
      if (options.h2cImgLoadErrCallback) {
        userParamStore.setH2cCrossImgLoadErrFn(options.h2cImgLoadErrCallback);
      }
    }
  },
  {
    keys: ["canvasEvents"],
    apply: options => {
      if (options.canvasEvents) {
        userParamStore.setCanvasEvents(options.canvasEvents);
      }
    }
  },
  {
    keys: ["customElementAdapters"],
    apply: options => {
      if (Array.isArray(options.customElementAdapters)) {
        userParamStore.setCustomElementAdapters(options.customElementAdapters);
      }
    }
  },
  {
    keys: ["canvasElements"],
    apply: options => {
      if (Array.isArray(options.canvasElements)) {
        userParamStore.setCanvasElements(options.canvasElements);
      }
    }
  },
  {
    keys: ["x", "y"],
    always: true,
    apply: options => {
      userParamStore.setRenderOptions({
        x: options.x ?? 0,
        y: options.y ?? 0
      });
    }
  }
];

// 为插件的全局参数设置数据
export function setPlugInParameters(options: ScreenShotOptions) {
  if (!options) return;

  applyOptions(options, plugInApplicators);
}
