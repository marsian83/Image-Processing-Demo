type Image = {
  dimensions: { width: number; height: number };
  rgb: number[][];
};

export function deepCopy(src: object | Array<any>) {
  return JSON.parse(JSON.stringify(src));
}

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
  img: Image,
  method: "AVERAGE" | "WEIGHTED" | "YUV"
) {
  const { rgb } = img;
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
      gray = (r + g + b) / 3;
      gray += 0.299 * r + 0.587 * g + 0.114 * b;
      gray /= 2;
    }
    grayscale.push([gray, gray, gray]);
  }

  const newImg = deepCopy(img);
  newImg.rgb = grayscale;

  return newImg;
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
  img: Image,
  weight?: { salt: number; pepper: number }
) {
  if (weight == undefined) {
    weight = { salt: 0.06, pepper: 0.06 };
  }

  const saltpepper: number[][] = [];

  for (let pixel of img.rgb) {
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

  const newImg = deepCopy(img);
  newImg.rgb = saltpepper;
  return newImg;
}

export function removeSaltPepperFromGrayscale(
  image: Image,
  method: "ARITHMETIC" | "HARMONIC" | "GEOMETRIC" | "CONTRAHARMONIC",
  neighbours?: number,
  Q?: number
) {
  function rcToi(r: number, c: number) {
    return r * image.dimensions.width + c;
  }

  const fixed: number[][] = [];

  neighbours = neighbours || 1;
  Q = Q || -1.5;

  for (let i = 0; i < image.rgb.length; i++) {
    if (image.rgb[i][0] === 0 || image.rgb[i][0] === 255) {
      const r = Math.floor(i / image.dimensions.width);
      const c = i % image.dimensions.width;

      let s = 0;
      let s1 = 0;

      for (let a = -neighbours; a <= neighbours; a++) {
        for (let b = -neighbours; b <= neighbours; b++) {
          try {
            if (a || b) {
              const gray =
                image.rgb[
                  rcToi(
                    clampValue(r + a, {
                      min: 0,
                      max: image.dimensions.width,
                    }),
                    clampValue(c + b, { min: 0, max: image.dimensions.width })
                  )
                ][0];
              if (method === "ARITHMETIC") {
                s += gray;
              }
              if (method === "HARMONIC") {
                s += 1 / gray;
              }
              if (method === "GEOMETRIC") {
                s *= gray;
              }
              if (method === "CONTRAHARMONIC") {
                s += Math.pow(gray, Q);
                s1 += Math.pow(gray, Q + 1);
              }
            }
          } catch (_) {}
        }
      }

      let newGray = 0;
      if (method === "ARITHMETIC") {
        newGray = s / Math.pow(2 * neighbours + 1, 2);
      }
      if (method === "HARMONIC") {
        newGray = Math.pow(neighbours, 2) / s;
      }
      if (method === "GEOMETRIC") {
        newGray = Math.pow(s, 1 / Math.pow(neighbours, 2));
      }
      if (method === "CONTRAHARMONIC") {
        newGray = s1 / s;
      }

      fixed.push([newGray, newGray, newGray]);
      continue;
    }
    fixed.push(image.rgb[i]);
  }

  const newImg = deepCopy(image);
  newImg.rgb = fixed;

  return newImg;
}
