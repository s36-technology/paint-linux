export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function hexToRgb(hex: string): RgbaColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255,
      }
    : { r: 0, g: 0, b: 0, a: 255 };
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: RgbaColor,
) {
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const data = imageData.data;

  const startPos = (startY * canvasWidth + startX) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];

  if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b && startA === fillColor.a) return;

  const matchStartColor = (pos: number) => (
    data[pos] === startR &&
    data[pos + 1] === startG &&
    data[pos + 2] === startB &&
    data[pos + 3] === startA
  );

  const colorPixel = (pos: number) => {
    data[pos] = fillColor.r;
    data[pos + 1] = fillColor.g;
    data[pos + 2] = fillColor.b;
    data[pos + 3] = fillColor.a;
  };

  const pixelStack = [[startX, startY]];

  while (pixelStack.length) {
    const newPos = pixelStack.pop()!;
    const x = newPos[0];
    let y = newPos[1];
    let pixelPos = (y * canvasWidth + x) * 4;

    while (y >= 0 && matchStartColor(pixelPos)) {
      y--;
      pixelPos -= canvasWidth * 4;
    }
    pixelPos += canvasWidth * 4;
    y++;

    let reachLeft = false;
    let reachRight = false;

    while (y < canvasHeight && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvasWidth - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      y++;
      pixelPos += canvasWidth * 4;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
