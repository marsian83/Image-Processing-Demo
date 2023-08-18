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
  grayscale?: {
    avg: Image;
    weighted: Image;
    yuv: Image;
  };
  saltPepper?: Image;
}

export default function SaltPepperPage() {
  const [inputImg, setInputImg] = useState<Image>({
    dimensions: { width: 0, height: 0 },
    rgb: [],
  });
  const [grayscaleInput, setGrayscaleInput] = useState<Image>();
  const [output, setOutput] = useState<Output>();

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

  function generateGrayScaleOutputs() {
    setOutput({
      ...output,
      grayscale: {
        avg: rgbToGrayscale(inputImg, "AVERAGE"),
        weighted: rgbToGrayscale(inputImg, "WEIGHTED"),
        yuv: rgbToGrayscale(inputImg, "YUV"),
      },
    });
  }

  useEffect(() => {
    if (inputImg.dimensions.width && inputImg.dimensions.height) {
      generateGrayScaleOutputs();
    }
  }, [inputImg]);

  useEffect(() => {
    if (grayscaleInput) {
      setOutput({
        ...output,
        saltPepper: addSaltPepper(grayscaleInput),
      });
    }
  }, [grayscaleInput]);

  return (
    <article className="h-screen flex flex-col p-10 items-center gap-y-12">
      <div className="relative rounded-md hover:saturate-200 duration-150">
        <div className="absolute top-0 left-0 pointer-events-none w-full h-full bg-primary flex justify-center items-center rounded-inherit">
          Upload Image
        </div>
        <input
          className="rounded-inherit p-2 cursor-pointer"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>

      {output && output.grayscale && (
        <>
          <RGBImageDisplay className="max-w-3/4" image={inputImg} />

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-medium">Grayscale Images</h1>
            <div className="flex justify-between my-8">
              {(["avg", "weighted", "yuv"] as const).map((method, key) => (
                <div
                  className="w-[30%] flex flex-col gap-y-2 items-center"
                  key={key}
                >
                  <button
                    className="w-full"
                    onClick={() => {
                      output.grayscale &&
                        setGrayscaleInput(output.grayscale[method]);
                    }}
                  >
                    <RGBImageDisplay
                      className="w-full"
                      image={
                        output.grayscale ? output.grayscale[method] : inputImg
                      }
                    />
                  </button>
                  <p>{method} method</p>
                </div>
              ))}
            </div>
          </div>

          {grayscaleInput && output.saltPepper && (
            <>
              <div className="flex flex-col items-center gap-y-3">
                <h1 className="text-xl font-medium">Added salt and pepper</h1>
                <RGBImageDisplay
                  className="max-w-3/4"
                  image={output.saltPepper}
                />
              </div>

              <div className="flex flex-col items-center">
                <h1 className="text-xl font-medium">Fixed Images</h1>
                <div className="flex flex-wrap gap-y-8 justify-between my-8">
                  {(
                    [
                      "ARITHMETIC",
                      "HARMONIC",
                      "GEOMETRIC",
                      "CONTRAHARMONIC",
                    ] as const
                  ).map((method, key) => (
                    <div
                      className="w-[48%] flex flex-col gap-y-2 items-center"
                      key={key}
                    >
                      <RGBImageDisplay
                        className="max-w-full"
                        image={
                          output.saltPepper &&
                          removeSaltPepperFromGrayscale(
                            output.saltPepper,
                            method
                          )
                        }
                      />
                      <p>{method} method</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </article>
  );
}

const RGBImageDisplay = (props: { image: Image; className?: string }) => {
  const rgbArray = props.image.rgb;
  const { width, height } = props.image.dimensions;

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
