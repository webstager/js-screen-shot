import { TextEncoder, TextDecoder } from "util";

(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

if (typeof (global as any).ImageData === "undefined") {
  (global as any).ImageData = class ImageData {
    width: number;
    height: number;
    data: Uint8ClampedArray;

    constructor(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.data = new Uint8ClampedArray(width * height * 4);
    }
  };
}

if (typeof window === "undefined" || typeof document === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { JSDOM } = require("jsdom");
  const dom = new JSDOM("<!doctype html><html><body></body></html>");
  (global as any).window = dom.window;
  (global as any).document = dom.window.document;
}

(global as any).navigator = {
  userAgent: "node.js",
  maxTouchPoints: 0
};
(global as any).innerWidth = 1024;
(global as any).innerHeight = 768;
(global as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  addListener: () => {},
  removeListener: () => {}
});

const canvasProto = window.HTMLCanvasElement?.prototype;
if (canvasProto) {
  const context = {} as CanvasRenderingContext2D;
  context.fillRect = () => undefined;
  context.clearRect = () => undefined;
  context.getImageData = () => new ImageData(0, 0);
  context.putImageData = () => undefined;
  context.drawImage = () => undefined;
  context.beginPath = () => undefined;
  context.rect = () => undefined;
  context.fill = () => undefined;
  context.moveTo = () => undefined;
  context.lineTo = () => undefined;
  context.arc = () => undefined;
  context.stroke = () => undefined;
  context.scale = () => undefined;
  context.closePath = () => undefined;
  (canvasProto as any).getContext = () => context;
}
