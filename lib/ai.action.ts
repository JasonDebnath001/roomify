import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

export async function fetchAsDataURL(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`,
    );
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read blob as data URL"));
    reader.readAsDataURL(blob);
  });
}

interface Generate3DViewParams {
  sourceImage: string;
}

interface Generate3DViewResult {
  renderedImage: string | null;
  renderedPath: string | undefined;
}

export const generate3DView = async ({
  sourceImage,
}: Generate3DViewParams): Promise<Generate3DViewResult> => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataURL(sourceImage);
  const dataUrlRegex = /^data:([^;]+)(;base64)?,(.+)$/;
  const match = dataUrl.match(dataUrlRegex);
  if (!match) throw new Error("Invalid data URL");
  const mimeType = match[1];
  const isBase64 = !!match[2];
  let base64Data = match[3];
  if (!isBase64) {
    // If not base64, URL-decode and convert to base64
    const decoded = decodeURIComponent(base64Data);
    base64Data = btoa(decoded);
  }
  if (!mimeType || !base64Data) throw new Error("Invalid image data");

  try {
    const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
      model: "gemini-2.5-flash-image-preview",
      input_image: base64Data,
      input_image_mime_type: mimeType,
    });

    const rawImageUrl = (response as HTMLImageElement).src ?? null;
    if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

    const renderedImage = rawImageUrl.startsWith("data:")
      ? rawImageUrl
      : await fetchAsDataURL(rawImageUrl);

    return { renderedImage, renderedPath: undefined };
  } catch (error) {
    throw error;
  }
};
