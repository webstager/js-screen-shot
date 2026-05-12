export function drawImgToCanvas(
  imgSrc: string,
  width: number,
  height: number,
  dpr: number
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvasElement = document.createElement("canvas");
    const ctx = canvasElement.getContext("2d");
    canvasElement.width = width * dpr;
    canvasElement.height = height * dpr;
    // 设置canvas的显示大小
    canvasElement.style.width = `${width}px`;
    canvasElement.style.height = `${height}px`;
    const imgContainer = new Image();
    if (!isInlineImageSource(imgSrc)) {
      imgContainer.crossOrigin = "Anonymous";
    }
    imgContainer.width = width;
    imgContainer.height = height;
    imgContainer.onload = () => {
      if (ctx == null) {
        reject("图像绘制失败");
        return;
      }
      ctx.scale(dpr, dpr);
      ctx.drawImage(imgContainer, 0, 0, width, height);
      resolve(canvasElement);
    };
    imgContainer.onerror = () => {
      reject(new Error(`图像加载失败: ${imgSrc}`));
    };
    imgContainer.onabort = () => {
      reject(new Error(`图像加载中断: ${imgSrc}`));
    };
    imgContainer.src = imgSrc;
  });
}

const isInlineImageSource = (imgSrc: string) =>
  /^(data|blob):/i.test(imgSrc.trim());
