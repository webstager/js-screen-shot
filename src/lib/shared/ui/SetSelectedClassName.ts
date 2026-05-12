import { logger } from "@/lib/utils/Logger";

/**
 * 为当前点击项添加选中时的class，移除其兄弟元素选中时的class
 * @param mouseEvent 需要进行操作的元素
 * @param index 当前点击项
 * @param isOption 是否为画笔选项
 */
export function setSelectedClassName(
  mouseEvent: any,
  index: number,
  isOption: boolean
) {
  // 获取当前点击项选中时的class名
  let className = getSelectedClassName(index);
  if (isOption) {
    // 获取画笔选项选中时的对应的class
    className = getBrushSelectedName(index);
  }
  // 解决event 在火狐和Safari浏览上的兼容性问题
  const path =
    mouseEvent.path || (mouseEvent.composedPath && mouseEvent.composedPath());
  // 获取div下的所有子元素
  const nodes = path[1].children;
  for (let i = 0; i < nodes.length; i++) {
    const item = nodes[i] as HTMLDivElement;
    const itemId: string | number = Number(item.getAttribute("data-id"));
    // 自定义的图标则重置其选中状态
    if (itemId > 100 && index !== Number.MAX_VALUE) {
      logger.debug("reset custom icon state");
      const icon = item.getAttribute("data-icon") as string;
      item.style.backgroundImage = `url(${icon})`;
    }
    // 如果工具栏中已经有选中的class则将其移除
    if (item.className.includes("active")) {
      item.classList.remove(item.classList[2]);
    }
  }
  if (className) {
    // 给当前点击项添加选中时的class
    mouseEvent.target.className += " " + className;
  }
}

const getAllActiveClassNames = () =>
  new Set([
    ...Object.values(baseSelectionClasses),
    ...Object.values(brushSelectionClasses)
  ]);

export function setSelectedClassNameById(
  container: HTMLElement | null,
  toolId: number | null
) {
  if (container == null || toolId == null) return;
  const className = getSelectedClassName(toolId);
  if (!className) return;
  const activeClasses = getAllActiveClassNames();
  const nodes = container.children;
  for (let i = 0; i < nodes.length; i++) {
    const item = nodes[i] as HTMLDivElement;
    item.classList.forEach(cls => {
      if (activeClasses.has(cls)) {
        item.classList.remove(cls);
      }
    });
    const itemId = Number(item.getAttribute("data-id"));
    if (!Number.isNaN(itemId) && itemId === toolId) {
      item.classList.add(className);
    }
  }
}

const baseSelectionClasses: Record<number, string> = {
  1: "square-active",
  2: "round-active",
  3: "right-top-active",
  4: "brush-active",
  5: "mosaicPen-active",
  6: "text-active"
};

const brushSelectionClasses: Record<number, string> = {
  1: "brush-small-active",
  2: "brush-medium-active",
  3: "brush-big-active"
};

const getSelectedClassName = (index: number) =>
  baseSelectionClasses[index] ?? "";

const getBrushSelectedName = (index: number) =>
  brushSelectionClasses[index] ?? "";
