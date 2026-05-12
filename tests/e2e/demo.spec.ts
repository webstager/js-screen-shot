import { expect, test, type Page } from "@playwright/test";

const startScreenshot = async (page: Page) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "点击截图" })).toBeVisible();
  await page.getByRole("button", { name: "点击截图" }).click();
  await expect(page.locator("#screenShotContainer")).toBeVisible();
};

const dragOnCanvas = async (
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number }
) => {
  const box = await page.locator("#screenShotContainer").boundingBox();
  if (box == null) {
    throw new Error("screenShotContainer is not mounted");
  }
  await page.mouse.move(box.x + from.x, box.y + from.y);
  await page.mouse.down();
  await page.mouse.move(box.x + to.x, box.y + to.y, { steps: 6 });
  await page.mouse.up();
};

const canvasHasPixels = async (page: Page) =>
  page.locator("#screenShotContainer").evaluate(canvas => {
    const target = canvas as HTMLCanvasElement;
    const context = target.getContext("2d");
    if (context == null) return false;
    const { data } = context.getImageData(0, 0, target.width, target.height);
    for (let index = 0; index < data.length; index += 4) {
      if (data[index] !== 0 || data[index + 1] !== 0 || data[index + 2] !== 0 || data[index + 3] !== 0) {
        return true;
      }
    }
    return false;
  });

test("demo 页面可以加载", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/screen\s+shot\s+demo/);
  await expect(page.getByRole("button", { name: "点击截图" })).toBeVisible();
  await expect(page.locator("#app img")).toBeVisible();
});

test("可以框选区域并让 canvas 产生非空像素", async ({ page }) => {
  await startScreenshot(page);

  await dragOnCanvas(page, { x: 80, y: 80 }, { x: 360, y: 260 });

  await expect(page.locator("#toolPanel")).toBeVisible();
  await expect(page.locator("#cutBoxSizePanel")).toHaveCount(1);
  await expect.poll(() => canvasHasPixels(page)).toBe(true);
});

test("可以点击工具栏绘制矩形、撤销并确认截图", async ({ page }) => {
  await startScreenshot(page);
  await dragOnCanvas(page, { x: 80, y: 80 }, { x: 360, y: 260 });

  await page.locator('#toolPanel [data-title="square"]').click();
  await dragOnCanvas(page, { x: 120, y: 120 }, { x: 240, y: 200 });
  await expect.poll(() => canvasHasPixels(page)).toBe(true);

  await page.locator('#toolPanel [data-title="undo"]').click();
  await expect(page.locator("#screenShotContainer")).toBeVisible();

  await page.locator('#toolPanel [data-title="confirm"]').click();
  await expect(page.locator("#screenShotContainer")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem("screenShotImg")))
    .not.toBeNull();
});
