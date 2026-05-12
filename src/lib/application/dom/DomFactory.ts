import { ScreenshotDomNodes } from "@/lib/type/dom/ScreenshotDomNodes";

const NODE_IDS = {
  screenShot: "screenShotContainer",
  tool: "toolPanel",
  optionIco: "optionIcoController",
  option: "optionPanel",
  cutBoxSize: "cutBoxSizePanel",
  textInput: "textInputPanel"
} as const;

export function createScreenshotDomNodes(): ScreenshotDomNodes {
  const screenShot = document.createElement("canvas");
  const tool = document.createElement("div");
  const optionIco = document.createElement("div");
  const option = document.createElement("div");
  const cutBoxSize = document.createElement("div");
  const textInput = document.createElement("div");

  screenShot.id = NODE_IDS.screenShot;
  tool.id = NODE_IDS.tool;
  optionIco.id = NODE_IDS.optionIco;
  option.id = NODE_IDS.option;
  cutBoxSize.id = NODE_IDS.cutBoxSize;
  textInput.id = NODE_IDS.textInput;

  return {
    screenShot,
    tool,
    optionIco,
    option,
    cutBoxSize,
    textInput
  };
}

export function removeExistingScreenshotNodes() {
  Object.values(NODE_IDS).forEach(id => {
    document.getElementById(id)?.remove();
  });
}

export function appendScreenshotNodesToBody(nodes: ScreenshotDomNodes) {
  removeExistingScreenshotNodes();
  const orderedNodes = [
    nodes.screenShot,
    nodes.tool,
    nodes.optionIco,
    nodes.option,
    nodes.cutBoxSize,
    nodes.textInput
  ];
  orderedNodes.forEach(node => document.body.appendChild(node));
}

export function hideScreenshotNodes(nodes: ScreenshotDomNodes) {
  const orderedNodes = [
    nodes.screenShot,
    nodes.tool,
    nodes.optionIco,
    nodes.option,
    nodes.cutBoxSize,
    nodes.textInput
  ];
  orderedNodes.forEach(node => {
    node.style.display = "none";
  });
}
