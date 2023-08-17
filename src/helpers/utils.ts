type Image = {
  dimensions: { width: number; height: number };
  rgb: number[][];
};

export function getRGBImage(
  img: HTMLImageElement,
  ctx: CanvasRenderingContext2D
): Image {
  ctx.drawImage(img, 0, 0);
  var imgData = ctx.getImageData(0, 0, img.width, img.height).data;

  const regularArray = Array.from(imgData);

  const result: [number, number, number][] = [];
  let i = 0;

  while (i < regularArray.length) {
    const chunk = regularArray.slice(i, i + 3);
    if (chunk.length === 3) {
      result.push([chunk[0], chunk[1], chunk[2]]);
    }
    i += 4;
  }

  return { dimensions: { width: img.width, height: img.height }, rgb: result };
}

export function rgbToGrayscale(
  rgb: number[][],
  method: "AVERAGE" | "WEIGHTED" | "YUV"
) {
  const grayscale: number[][] = [];

  for (let [r, g, b] of rgb) {
    let gray = 0;
    if (method === "AVERAGE") {
      gray = (r + g + b) / 3;
    }
    if (method === "WEIGHTED") {
      gray = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    if (method === "YUV") {
      gray = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    grayscale.push([gray, gray, gray]);
  }

  return grayscale;
}

export function clampValue(
  value: number,
  options?: { min?: number; max?: number }
) {
  const { min, max } = options || {};
  if (min != undefined && value < min) {
    return min;
  }
  if (max != undefined && value > max) {
    return max;
  }
  return value;
}

export function addSaltPepper(
  rgb: number[][],
  weight?: { salt: number; pepper: number }
) {
  if (weight == undefined) {
    weight = { salt: 0.1, pepper: 0.1 };
  }

  const saltpepper: number[][] = [];

  for (let pixel of rgb) {
    if (Math.random() < weight.salt) {
      saltpepper.push([255, 255, 255]);
      continue;
    }
    if (Math.random() < weight.pepper) {
      saltpepper.push([0, 0, 0]);
      continue;
    }
    saltpepper.push(pixel);
  }

  return saltpepper;
}

export function removeSaltPepperFromGrayscale(
  image: Image,
  method: "ARITHMETIC" | "HARMONIC",
  neighbours?: number
) {
  function rcToi(r: number, c: number) {
    return r * image.dimensions.width + c;
  }

  const fixed: number[][] = [];

  for (let i = 0; i < image.rgb.length; i++) {
    if (image.rgb[i][0] === 0 || image.rgb[i][0] === 255) {
      const r = Math.floor(i / image.dimensions.width);
      const c = i % image.dimensions.width;

      let s = 0;

      for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
          try {
            if (a || b) {
              s +=
                image.rgb[
                  rcToi(
                    clampValue(r + a, { min: 0, max: image.dimensions.width }),
                    clampValue(c + b, { min: 0, max: image.dimensions.width })
                  )
                ][0];
            }
          } catch (_) {
            console.log(
              r,
              c,
              a,
              b,
              i,
              rcToi(r, c),
              rcToi(
                clampValue(r + a, { min: 0, max: image.dimensions.width }),
                clampValue(c + b, { min: 0, max: image.dimensions.width })
              )
            );
          }
        }
      }

      fixed.push([s / 9, s / 9, s / 9]);
      continue;
    }
    fixed.push(image.rgb[i]);
  }

  return fixed;
}
