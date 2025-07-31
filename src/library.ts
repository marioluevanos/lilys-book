import type OpenAI from "openai";
import {
  BookDB,
  BookProps,
  BookResponsePayload,
  GenerateResponseOptions,
  ImageDB,
  ImageResponsePayload,
} from "./types";

const OPEN_AI_API = "https://api.openai.com/v1/responses";

/**
 * Generate an Image
 */
async function generateResponse(
  args: GenerateResponseOptions
): Promise<OpenAI.Responses.Response> {
  const request = await fetch(OPEN_AI_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
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
  const imageResponse = await generateResponse({
    ...args,
    asImage: true,
  });

  const imageResults = (imageResponse.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageResults.length > 0) {
    const imageBase64 = imageResults[0];

    if (imageBase64) {
      const url = `data:image/png;base64, ${imageBase64}`;
      const responseId = imageResponse.id;

      return {
        data: { url, responseId: imageResponse.id },
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
    .reduce<BookProps | undefined>((acc, output) => {
      const text = output.content.find((o) => o.type === "output_text");
      if (text && !acc) {
        try {
          const data = JSON.parse(text.text);
          acc = data;
        } catch (error) {
          console.error(error);
        }
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

export async function getBookDB(
  bookId: number | string
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}`
  );

  const data: BookDB = await response.json();

  if (data.title) {
    return data;
  }
}

export async function updateBookDB(
  book: BookProps,
  bookId: number
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(book),
    }
  );

  const data: BookDB = await response.json();

  console.log("updateBookDB", { data });

  if (data.title) {
    return data;
  }
}

export async function uploadBookDB(book: BookProps): Promise<BookDB> {
  const response = await fetch(`${import.meta.env.VITE_API}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(book),
  });

  const data: BookDB = await response.json();

  console.log("upload Book", { data });

  if (data.id) {
    return data;
  }

  return book;
}

export async function uploadBase64ImageDB(
  base64: string,
  fileName: string,
  responseId: string | undefined
): Promise<ImageDB> {
  const res = await fetch(base64); // Convert base64 to binary
  const blob = await res.blob(); // or use Buffer in Node.js
  const file = new File([blob], fileName, { type: "image/png" }); // Create a File (browser) or Blob
  const formData = new FormData();

  formData.append("file", file);
  formData.append("response_id", responseId || "");

  const response = await fetch(`${import.meta.env.VITE_API}/api/images`, {
    method: "POST",
    body: formData,
  });

  const data: ImageDB = await response.json();

  if (data.url) {
    return data;
  }

  return { url: base64, id: 0, filename: "test.png" };
}
