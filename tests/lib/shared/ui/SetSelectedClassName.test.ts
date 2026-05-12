import { setSelectedClassName } from "@/lib/shared/ui/SetSelectedClassName";

describe("setSelectedClassName", () => {
  const buildToolbar = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "toolbar";

    const first = document.createElement("div");
    first.setAttribute("data-id", "1");
    first.classList.add("tool", "item", "square-active");
    wrapper.appendChild(first);

    const custom = document.createElement("div");
    custom.setAttribute("data-id", "101");
    custom.setAttribute("data-icon", "custom.png");
    custom.classList.add("tool", "item", "mosaicPen-active");
    custom.style.backgroundImage = "url(active.png)";
    wrapper.appendChild(custom);

    return { wrapper, first, custom };
  };

  test("会移除兄弟元素 active class 并给目标元素添加对应 class", () => {
    const { wrapper, first, custom } = buildToolbar();
    const event = {
      path: [first, wrapper],
      target: first
    };

    setSelectedClassName(event, 2, false);

    expect(first.className).toContain("round-active");
    expect(custom.classList.contains("mosaicPen-active")).toBe(false);
    expect(custom.style.backgroundImage).toBe("url(custom.png)");
  });

  test("画笔选项使用 brush 专属 class", () => {
    const { wrapper, first } = buildToolbar();
    const event = {
      composedPath: () => [first, wrapper],
      target: first
    };

    setSelectedClassName(event, 3, true);

    expect(first.className).toContain("brush-big-active");
  });
});
