export const createMockCanvasContext = (
  overrides: Partial<CanvasRenderingContext2D> = {}
) => {
  const noop = jest.fn();
  return {
    save: noop,
    restore: noop,
    fillRect: noop,
    clearRect: noop,
    drawImage: noop,
    getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(4) })),
    putImageData: noop,
    beginPath: noop,
    closePath: noop,
    rect: noop,
    strokeRect: noop,
    stroke: noop,
    fill: noop,
    arc: noop,
    moveTo: noop,
    lineTo: noop,
    setLineDash: noop,
    translate: noop,
    rotate: noop,
    scale: noop,
    clip: noop,
    fillText: noop,
    measureText: jest.fn((text: string) => ({ width: text.length * 8 })),
    canvas: { width: 200, height: 200 },
    ...overrides
  } as unknown as CanvasRenderingContext2D;
};

export const createCanvasWithContext = (
  width = 200,
  height = 200,
  context = createMockCanvasContext()
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  Object.defineProperty(canvas, "getContext", {
    value: () => context
  });
  return { canvas, context };
};

export const createPointerEvent = (type: string, x: number, y: number) => {
  const event = new MouseEvent(type, { button: 0 });
  Object.defineProperty(event, "offsetX", { value: x });
  Object.defineProperty(event, "offsetY", { value: y });
  return event;
};
