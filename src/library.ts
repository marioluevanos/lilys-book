import OpenAI from "openai";
import {
  Book,
  BookResponsePayload,
  GenerateResponseOptions,
  Image,
  ImageResponsePayload,
} from "./types";

/**
 * Generate an Image
 */
async function generateResponse(
  args: GenerateResponseOptions
): Promise<OpenAI.Responses.Response> {
  const request = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(getResponseOptions(args)),
  });
  const response = await request.json();

  return response;
}

function getResponseOptions(
  args: GenerateResponseOptions
): OpenAI.Responses.ResponseCreateParams {
  const options: OpenAI.Responses.ResponseCreateParams = {
    model: "gpt-4.1-mini",
    input: args.input,
    tool_choice: args.asImage ? "required" : undefined,
    tools: args.asImage ? [{ type: "image_generation" }] : undefined,
    instructions: args.instructions,
  };

  if (args.previousResponseId) {
    options.previous_response_id = args.previousResponseId;
  }

  return options;
}

export async function generateImage(
  args: GenerateResponseOptions
): Promise<ImageResponsePayload> {
  const imageResponse = await generateResponse(args);

  const imageResults = (imageResponse.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageResults.length > 0) {
    const imageBase64 = imageResults[0];

    if (imageBase64) {
      const url = `data:image/png;base64, ${imageBase64}`;
      const responseId = imageResponse.id;

      return {
        data: { url },
        responseId,
      };
    }
  }

  return {
    data: { url: "" },
    responseId: "",
  };
}

/**
 * Generate a book with AI. Handles the prompt engineering and book creation.
 * @param prompt The engineered prompt
 */
export async function generateBook(
  args: GenerateResponseOptions
): Promise<BookResponsePayload | undefined> {
  const bookResponse = await generateResponse(args);

  const book = (bookResponse.output || [])
    .filter((output) => output.type === "message")
    .reduce<Book | undefined>((acc, output) => {
      const text = output.content.find((o) => o.type === "output_text");
      if (text && !acc) {
        acc = JSON.parse(text.text);
      }
      return acc;
    }, undefined);

  if (book) {
    return {
      data: book,
      responseId: bookResponse.id,
    };
  }
}

export async function uploadBase64Image(base64: string): Promise<Image> {
  const res = await fetch(base64); // Convert base64 to binary
  const blob = await res.blob(); // or use Buffer in Node.js

  // Create a File (browser) or Blob
  const file = new File([blob], "image.png", { type: "image/png" });

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5171/api/upload", {
    method: "POST",
    body: formData,
  });

  const data: { url: string } = await response.json();

  return { url: `http://localhost:5171${data.url}` };
}
