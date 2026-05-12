import {
  HiddenScrollbarOptions,
  ScreenShotOptions,
  ViewportOffset
} from "@/lib/type/components/screenshot";
import { UserParamStoreDataType } from "@/lib/type/components/stores";
import userParamStore from "@/store/UserParamStore";
import screenDomStore from "@/store/dom/ScreenDomStore";
import { applyOptions } from "@/lib/shared/config/OptionApplier";
import { OptionApplicator } from "@/lib/type/config/OptionApplicator";

const optionalApplicators: OptionApplicator<ScreenShotOptions>[] = [
  {
    keys: ["clickCutFullScreen"],
    always: true,
    apply: options => {
      userParamStore.setClickCutFullScreenStatus(
        Boolean(options.clickCutFullScreen)
      );
    }
  },
  {
    keys: ["loadCrossImg"],
    always: true,
    apply: options => {
      userParamStore.setLoadCrossImg(Boolean(options.loadCrossImg));
    }
  },
  {
    keys: ["imgSrc"],
    apply: options => {
      if (options.imgSrc != null) {
        userParamStore.setImgSrc(options.imgSrc);
      }
    }
  },
  {
    keys: ["proxyUrl"],
    apply: options => {
      if (options.proxyUrl) {
        userParamStore.setProxyUrl(options.proxyUrl);
      }
    }
  },
  {
    keys: ["useCORS"],
    apply: options => {
      if (options.useCORS !== undefined) {
        userParamStore.setUseCORS(options.useCORS);
      }
    }
  },
  {
    keys: ["h2cIgnoreElementsCallback"],
    apply: options => {
      if (options.h2cIgnoreElementsCallback) {
        userParamStore.setH2cIgnoreElementsFn(
          options.h2cIgnoreElementsCallback
        );
      }
    }
  },
  {
    keys: ["position"],
    apply: options => {
      if (options.position) {
        handlePosition(options.position);
      }
    }
  },
  {
    keys: ["wrcReplyTime"],
    apply: options => {
      if (options.wrcReplyTime) {
        userParamStore.setWrcReplyTime(options.wrcReplyTime);
      }
    }
  },
  {
    keys: ["cropBoxInfo"],
    apply: options => {
      if (options.cropBoxInfo) {
        userParamStore.setCropBoxInfo(options.cropBoxInfo);
      }
    }
  },
  {
    keys: ["toolPosition"],
    apply: options => {
      if (options.toolPosition) {
        userParamStore.setToolPosition(options.toolPosition);
      }
    }
  },
  {
    keys: ["wrcImgPosition"],
    apply: options => {
      if (options.wrcImgPosition) {
        handleWrcImgPosition(options.wrcImgPosition);
      }
    }
  },
  {
    keys: ["hiddenScrollBar"],
    apply: options => {
      if (options.hiddenScrollBar) {
        handleHiddenScrollBar(options.hiddenScrollBar);
      }
    }
  },
  {
    keys: ["noScroll"],
    apply: options => {
      screenDomStore.setNoScrollStatus(options.noScroll);
    }
  },
  {
    keys: ["wrcWindowMode"],
    apply: options => {
      if (options.wrcWindowMode != null) {
        userParamStore.setWrcWindowMode(options.wrcWindowMode);
      }
    }
  },
  {
    keys: ["customRightClickEvent"],
    apply: options => {
      if (options.customRightClickEvent != null) {
        userParamStore.setCustomRightClickEvent(options.customRightClickEvent);
      }
    }
  }
];

export function setOptionalParameter(options: ScreenShotOptions) {
  try {
    applyOptions(options, optionalApplicators);
  } catch (error) {
    console.error("设置截图参数时出错:", error);
  }
}

// 处理隐藏滚动条
const handleHiddenScrollBar = (hiddenScrollBar: HiddenScrollbarOptions) => {
  const {
    state,
    color = "#000000",
    fillWidth = 0,
    fillHeight = 0,
    fillState = false
  } = hiddenScrollBar;

  userParamStore.setHiddenScrollBar({
    state,
    color,
    fillWidth,
    fillHeight,
    fillState
  });

  if (state) {
    screenDomStore.setResetScrollbarState(true);
    document.documentElement.classList.add("hidden-screen-shot-scroll");
    document.body.classList.add("hidden-screen-shot-scroll");
  }
};

// 处理位置
const handlePosition = (position: Partial<ViewportOffset>) => {
  const { top, left } = position;
  if (top != null || left != null) {
    userParamStore.setPosition({
      top: top ?? 0,
      left: left ?? 0
    });
  }
};

// 处理 webrtc 图片位置
const handleWrcImgPosition = (
  wrcImgPosition: UserParamStoreDataType["wrcImgPosition"]
) => {
  const { x, y } = wrcImgPosition;
  userParamStore.setWrcImgPosition({
    x: -Math.abs(x),
    y: -Math.abs(y),
    w: 0,
    h: 0
  });
};
