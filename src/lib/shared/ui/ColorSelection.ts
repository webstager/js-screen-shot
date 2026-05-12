import toolBarStore from "@/store/ToolBarStore";

export function selectColor() {
  toolBarStore.setColorPanelStatus(true);
}

export function getColor(index: number) {
  const palette: Record<number, string> = {
    1: "#F53440",
    2: "#F65E95",
    3: "#D254CF",
    4: "#12A9D7",
    5: "#30A345",
    6: "#FACF50",
    7: "#F66632",
    8: "#989998",
    9: "#000000",
    10: "#FEFFFF"
  };
  const color = palette[index] ?? "#F53440";
  toolBarStore.setSelectedColor(color);
  toolBarStore.setColorPanelStatus(false);
  return color;
}
