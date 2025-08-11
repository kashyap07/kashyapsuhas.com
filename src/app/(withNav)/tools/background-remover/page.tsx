"use client";

import React, { useRef, useState } from "react";

import * as ort from "onnxruntime-web";

import { Wrapper } from "@components/ui";

// set WASM path for onnxruntime-web
ort.env.wasm.wasmPaths = "/";

const MODEL_PATH = "/models/u2netp.onnx";
const INPUT_SIZE = 320;

function resizeImageToCanvas(
  image: HTMLImageElement,
  size: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(image, 0, 0, size, size);
  return canvas;
}

function imageToTensor(canvas: HTMLCanvasElement): Float32Array {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // U^2-Net expects CHW, normalized to [0,1]
  const floatArr = new Float32Array(3 * canvas.width * canvas.height);
  for (let i = 0; i < canvas.width * canvas.height; i++) {
    floatArr[i] = data[i * 4] / 255; // R
    floatArr[i + canvas.width * canvas.height] = data[i * 4 + 1] / 255; // G
    floatArr[i + 2 * canvas.width * canvas.height] = data[i * 4 + 2] / 255; // B
  }
  return floatArr;
}

function maskToImageData(
  mask: Float32Array | number[],
  width: number,
  height: number,
): ImageData {
  // mask: Float32Array, values in [0,1]
  const imgData = new ImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    imgData.data[i * 4] = 0; // R
    imgData.data[i * 4 + 1] = 0; // G
    imgData.data[i * 4 + 2] = 0; // B
    imgData.data[i * 4 + 3] = Math.round(mask[i] * 255); // Alpha
  }
  return imgData;
}

function applyMaskToImage(
  origImg: HTMLImageElement,
  maskCanvas: HTMLCanvasElement,
): HTMLCanvasElement {
  // origImg: HTMLImageElement, maskCanvas: canvas with alpha mask
  const canvas = document.createElement("canvas");
  canvas.width = origImg.naturalWidth;
  canvas.height = origImg.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");
  ctx.drawImage(origImg, 0, 0, canvas.width, canvas.height);
  // Resize mask to match original size
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

const BackgroundRemover: React.FC = () => {
  const [origUrl, setOrigUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setResultUrl(null);
    const url = URL.createObjectURL(file);
    setOrigUrl(url);
    setLoading(true);
    try {
      // wait for image to load
      const img = new window.Image();
      img.src = url;
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
      });
      // preprocess
      const resized = resizeImageToCanvas(img, INPUT_SIZE);
      const inputTensor = imageToTensor(resized);
      const tensor = new ort.Tensor("float32", inputTensor, [
        1,
        3,
        INPUT_SIZE,
        INPUT_SIZE,
      ]);
      // load model
      const session = await ort.InferenceSession.create(MODEL_PATH, {
        executionProviders: ["wasm"],
      });
      const feeds: Record<string, ort.Tensor> = { "input.1": tensor };
      const results = await session.run(feeds);
      // U^2-Netp output is usually 'output' or 'd1'
      const output = results[Object.keys(results)[0]];
      // postprocess mask
      const maskArr = output.data as Float32Array;
      // normalize mask to [0,1] (find min/max manually for compatibility)
      let min = maskArr[0],
        max = maskArr[0];
      for (let i = 1; i < maskArr.length; i++) {
        if (maskArr[i] < min) min = maskArr[i];
        if (maskArr[i] > max) max = maskArr[i];
      }
      const normMask = new Array(maskArr.length);
      for (let i = 0; i < maskArr.length; i++) {
        normMask[i] = (maskArr[i] - min) / (max - min);
      }
      // convert to ImageData
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = INPUT_SIZE;
      maskCanvas.height = INPUT_SIZE;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) throw new Error("Could not get canvas context");
      const maskImgData = maskToImageData(normMask, INPUT_SIZE, INPUT_SIZE);
      maskCtx.putImageData(maskImgData, 0, 0);
      // apply mask to original image
      const finalCanvas = applyMaskToImage(img, maskCanvas);
      setResultUrl(finalCanvas.toDataURL("image/png"));
    } catch (e) {
      setError(
        "Failed to process image. " +
          (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper className="mb-12 w-full md:mb-20">
      <h1 className="text-5xl font-medium md:text-8xl">
        AI Background Remover
      </h1>
      <div className="mt-2 flex flex-col gap-6">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0])
              handleFile(e.target.files[0]);
          }}
          className="file:mr-4 file:rounded file:border-0 file:px-4 file:py-2 file:text-black hover:file:bg-columbiaYellow"
          disabled={loading}
        />
        {(origUrl || resultUrl) && (
          <div className="mt-8 flex w-full flex-col gap-8 md:flex-row">
            {/* original image */}
            <div className="flex flex-1 flex-col items-center">
              {origUrl && (
                <div className="w-full">
                  <div className="mb-2 text-center text-sm text-gray-500">
                    Original
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imgRef}
                    src={origUrl}
                    alt="Original"
                    className="max-h-96 w-full rounded bg-white object-contain shadow"
                  />
                </div>
              )}
            </div>

            {/* background removed image */}
            <div className="flex flex-1 flex-col items-center">
              {resultUrl && (
                <div className="w-full">
                  <div className="mb-2 text-center text-sm text-gray-500">
                    Background Removed
                  </div>
                  {/* TODO: use Image instead? */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Result"
                    className="max-h-96 w-full rounded bg-white object-contain shadow"
                  />
                  <a
                    href={resultUrl}
                    download="background-removed.png"
                    className="mt-4 flex items-center justify-center rounded bg-columbiaYellow py-2 font-medium text-black transition-all duration-100 ease-in-out hover:text-black hover:no-underline hover:shadow-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="mr-2 h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5v-13m0 13l-3.75-3.75M12 16.5l3.75-3.75M4.5 19.5h15"
                      />
                    </svg>
                    Download Image
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
        {error && <div className="mb-4 text-red-600">{error}</div>}
      </div>

      {/* loader overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="flex flex-col items-center gap-4 rounded bg-white p-8 shadow-lg">
            <svg
              className="h-10 w-10 animate-spin text-columbiaYellow"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-lg font-semibold text-gray-800">
              Processing...
            </span>
          </div>
        </div>
      )}
    </Wrapper>
  );
};

export default BackgroundRemover;
