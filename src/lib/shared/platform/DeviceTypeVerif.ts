import { MOBILE_USER_AGENT_KEYWORDS } from "@/lib/constants/device";
import { getNavigator, isBrowserEnv } from "@/lib/shared/platform/BrowserEnv";

export function isPC(): boolean {
  const runtimeNavigator = getNavigator();
  if (runtimeNavigator == null) {
    return true;
  }

  const userAgentInfo = runtimeNavigator.userAgent;
  let flag = true;
  for (let v = 0; v < MOBILE_USER_AGENT_KEYWORDS.length; v++) {
    if (userAgentInfo.indexOf(MOBILE_USER_AGENT_KEYWORDS[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

// 检测设备是否支持触摸
export function isTouchDevice(): boolean {
  const runtimeNavigator = getNavigator();
  if (!isBrowserEnv() || runtimeNavigator == null) {
    return false;
  }

  // 检查navigator.maxTouchPoints
  const maxTouchPoints =
    "maxTouchPoints" in runtimeNavigator && runtimeNavigator.maxTouchPoints > 0;
  // 检查旧版API navigator.msMaxTouchPoints
  const msMaxTouchPoints =
    "msMaxTouchPoints" in runtimeNavigator &&
    (runtimeNavigator as any).msMaxTouchPoints > 0;
  // 检查触摸事件处理器
  const touchEvent = "ontouchstart" in window;
  // 使用CSS媒体查询检查指针类型
  const coarsePointer =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  // 如果以上任何一种方法返回true，则设备支持触摸
  return maxTouchPoints || msMaxTouchPoints || touchEvent || coarsePointer;
}
