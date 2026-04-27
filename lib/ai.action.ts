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

  // Use chat with vision to analyze the source image and generate a detailed prompt
  const analysisPrompt = `Analyze this floor plan image and provide a detailed description of the layout, rooms, walls, doors, windows, and any furniture or fixtures shown. Be very specific about dimensions, positions, and types of rooms.`;

  let detailedDescription = "";
  try {
    const analysisResponse = await puter.ai.chat(analysisPrompt, dataUrl, {
      model: "gpt-5.4-nano",
    });
    // Extract text from response (handle various response formats)
    if (typeof analysisResponse === "string") {
      detailedDescription = analysisResponse;
    } else if (analysisResponse && typeof analysisResponse === "object") {
      detailedDescription =
        (analysisResponse as any).message?.content ??
        (analysisResponse as any).text ??
        (analysisResponse as any).content ??
        "";
    }
  } catch (chatError) {
    console.error("Error analyzing floor plan:", chatError);
    detailedDescription = "";
  }

  // Combine the analysis with the render prompt
  const fullPrompt = `${ROOMIFY_RENDER_PROMPT}\n\nFloor plan details: ${detailedDescription}`;

  const response = await puter.ai.txt2img({
    prompt: fullPrompt,
    model: "flux-schnell",
  });

  const rawImageUrl = (response as HTMLImageElement).src ?? null;
  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataURL(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
