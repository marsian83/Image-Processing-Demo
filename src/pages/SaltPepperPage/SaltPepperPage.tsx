import { useEffect, useRef, useState } from "react";
import {
  addSaltPepper,
  removeSaltPepperFromGrayscale,
  rgbToGrayscale,
} from "../../helpers/utils";

type Image = {
  dimensions: { width: number; height: number };
  rgb: number[][];
};

interface Output {
  grayscale: {
    avg: Image;
    weighted: Image;
    yuv: Image;
  };
}

export default function SaltPepperPage() {
  const [inputImg, setInputImg] = useState<Image>({
    dimensions: { width: 0, height: 0 },
    rgb: [],
  });
  const [output, setOutput] = useState();

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = (event.target.files as FileList)[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const image = new Image();

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;

          const context = canvas.getContext("2d") as CanvasRenderingContext2D;
          context.drawImage(image, 0, 0, image.width, image.height);

          const imageData = context.getImageData(
            0,
            0,
            image.width,
            image.height
          );
          const rgbArray: [number, number, number][] = [];

          for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            rgbArray.push([r, g, b]);
          }

          setInputImg({
            dimensions: { width: image.width, height: image.height },
            rgb: rgbArray,
          });
        };

        image.src = (e.target as any).result;
      };

      reader.readAsDataURL(file);
    }
  }

  return (
    <article className="h-screen flex flex-col p-10 items-center gap-y-12">
      <div>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>

      {inputImg.dimensions.width && inputImg.dimensions.height && (
        <RGBImageDisplay
          className="max-w-3/4"
          width={inputImg.dimensions.width}
          height={inputImg.dimensions.height}
          rgbArray={inputImg.rgb}
        />
      )}

      <div className="flex flex-col items-center">
        <h1 className="text-xl font-medium">Grayscale Images</h1>
        {inputImg.dimensions.width && inputImg.dimensions.height && (
          <div className="flex justify-between my-8">
            {(["AVERAGE", "WEIGHTED", "YUV"] as const).map((method, key) => (
              <div
                className="w-[30%] flex flex-col gap-y-2 items-center"
                key={key}
              >
                <RGBImageDisplay
                  className="w-full"
                  width={inputImg.dimensions.width}
                  height={inputImg.dimensions.height}
                  rgbArray={rgbToGrayscale(inputImg.rgb, method)}
                />
                <p>{method} method</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-y-3">
        <h1 className="text-xl font-medium">Added salt and pepper</h1>
        {inputImg.dimensions.width && inputImg.dimensions.height && (
          <RGBImageDisplay
            className="max-w-3/4"
            width={inputImg.dimensions.width}
            height={inputImg.dimensions.height}
            rgbArray={addSaltPepper(rgbToGrayscale(inputImg.rgb, "WEIGHTED"), {
              pepper: 0.06,
              salt: 0.06,
            })}
          />
        )}
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-xl font-medium">Fixed Images</h1>
        {inputImg.dimensions.width && inputImg.dimensions.height && (
          <div className="flex justify-between my-8">
            {(["ARITHMETIC"] as const).map((method, key) => (
              <div
                className="w-[30%] flex flex-col gap-y-2 items-center"
                key={key}
              >
                <RGBImageDisplay
                  className="max-w-3/4"
                  width={inputImg.dimensions.width}
                  height={inputImg.dimensions.height}
                  rgbArray={removeSaltPepperFromGrayscale(
                    {
                      dimensions: {
                        width: inputImg.dimensions.width,
                        height: inputImg.dimensions.height,
                      },
                      rgb: addSaltPepper(
                        rgbToGrayscale(inputImg.rgb, "WEIGHTED"),
                        {
                          pepper: 0.06,
                          salt: 0.06,
                        }
                      ),
                    },
                    method
                  )}
                />
                <p>{method} method</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

const RGBImageDisplay = (props: {
  rgbArray: number[][];
  width: number;
  height: number;
  className?: string;
}) => {
  const { rgbArray, width, height } = props;

  const canvasRef = useRef() as React.MutableRefObject<HTMLCanvasElement>;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const imageData = context.createImageData(width, height);

    let pixelIndex = 0;

    for (let i = 0; i < rgbArray.length; i++) {
      const [r, g, b] = rgbArray[i];
      imageData.data[pixelIndex++] = r;
      imageData.data[pixelIndex++] = g;
      imageData.data[pixelIndex++] = b;
      imageData.data[pixelIndex++] = 255; // Alpha value
    }

    context.putImageData(imageData, 0, 0);
  }, [rgbArray, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={props.className}
      style={{ border: "1px solid black" }}
    />
  );
};
