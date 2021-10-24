/**
 * 将指定区域的canvas转换为base64格式的图片
 */
export function saveCanvasToBase64(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  width: number,
  height: number,
  quality = 0.75
) {
  // 获取裁剪框区域图片信息
  const img = context.getImageData(startX, startY, width, height);
  // 创建canvas标签，用于存放裁剪区域的图片
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  // 获取裁剪框区域画布
  const imgContext = canvas.getContext("2d");
  if (imgContext) {
    // 将图片放进canvas中
    imgContext.putImageData(img, 0, 0);
    // 将图片放进剪贴板中
    canvas.toBlob(
      (blob: any) => {
        const clipboardItem = new (window as any).ClipboardItem({
          [blob.type]: blob
        });
        (navigator.clipboard as any).write([clipboardItem]);
        console.log("copy success!!!");
      },
      "image/png",
      quality
    );

    return canvas.toDataURL("png");
  }
  return "";
}

// clipboard demo
// async function writeClipImg(imgURL: string) {
//   try {
//     const data = await fetch(imgURL);
//     const blob = await data.blob();

//     await navigator.clipboard.write([
//       new ClipboardItem({
//         [blob.type]: blob
//       })
//     ]);
//     console.log('Fetched image copied.');
//   } catch(err: any) {
//     console.error(err.name, err.message);
//   }
// }
