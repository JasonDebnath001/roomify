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

  const response = await puter.ai.txt2img({
    prompt: ROOMIFY_RENDER_PROMPT,
    model: "flux-schnell",
  });

  const rawImageUrl = (response as HTMLImageElement).src ?? null;
  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataURL(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
