import screenDomStore from "@/store/dom/ScreenDomStore";
import toolPanelDomStore from "@/store/dom/ToolPanelDomStore";
import { disposeDomDisposers } from "@/store/dom/domDisposers";
import { disposeStoreObservers } from "@/store/StoreObserver";
import { resetAllStores } from "@/store/utils/resetRegistry";

export function destroyScreenShotDom() {
  disposeStoreObservers();
  disposeDomDisposers();
  screenDomStore.destroyDOM();
  toolPanelDomStore.destroyDOM();
  resetAllStores();
}
