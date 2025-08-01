import type OpenAI from "openai";
import {
  BookDB,
  BookProps,
  BookResponsePayload,
  BooksPreviewtate,
  GenerateResponseOptions,
  ImageDB,
  ImageResponsePayload,
  InputOptions,
} from "./types";

const OPEN_AI_API = "https://api.openai.com/v1/responses";

/**
 * Generate an Image
 */
async function generateResponse(
  args: GenerateResponseOptions,
  options: InputOptions | undefined
): Promise<OpenAI.Responses.Response | undefined> {
  if (!options?.apikey) {
    console.error("Missing API Key");
    return undefined;
  }

  const request = await fetch(OPEN_AI_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options?.apikey}`,
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
    tool_choice: args.as_image ? "required" : undefined,
    tools: args.as_image ? [{ type: "image_generation" }] : undefined,
    instructions: args.instructions,
  };

  if (args.previous_response_id) {
    options.previous_response_id = args.previous_response_id;
  }

  return options;
}

export async function generateImage(
  args: GenerateResponseOptions,
  options: InputOptions | undefined
): Promise<ImageResponsePayload & { error?: unknown }> {
  const imageResponse = await generateResponse(
    {
      ...args,
      as_image: true,
    },
    options
  );

  const imageResults = (imageResponse?.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageResults.length > 0) {
    const imageBase64 = imageResults[0];

    if (imageBase64 && imageResponse?.id) {
      return {
        url: `data:image/png;base64, ${imageBase64}`,
        response_id: imageResponse.id,
      };
    }
  }

  return {
    url: "",
    response_id: "",
    error: imageResponse,
  };
}

/**
 * Generate a book with AI. Handles the prompt engineering and book creation.
 * @param prompt The engineered prompt
 */
export async function generateBook(
  args: GenerateResponseOptions,
  options: InputOptions
): Promise<BookResponsePayload | undefined> {
  const bookResponse = await generateResponse(args, options);

  const book = (bookResponse?.output || [])
    .filter((output) => output.type === "message")
    .reduce<BookProps | undefined>((acc, output) => {
      const text = output.content.find((o) => o.type === "output_text");
      if (text && !acc) {
        try {
          const data = JSON.parse(text.text);

          if (bookResponse?.id) {
            acc = {
              ...data,
              response_id: bookResponse.id,
            };
          }
        } catch (error) {
          console.error(error);
        }
      }
      return acc;
    }, undefined);

  if (book) {
    return book;
  }
}

export async function getBooksPreviewDB(): Promise<BookDB[] | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books?populate=images`,
    {
      method: "GET",
    }
  );

  const data: BookDB[] = await response.json();

  if (Array.isArray(data)) {
    return data;
  }
}

export async function getBookDB(
  bookId: number | string
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}?populate=images`,
    {
      method: "GET",
    }
  );

  const data: BookDB = await response.json();

  if (data.title) {
    return data;
  }
}

export async function updateBookDB(
  book: BooksPreviewtate,
  bookId: number
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    }
  );

  const data: BookDB = await response.json();

  if (data.title) {
    return data;
  }
}

export async function uploadBookDB(
  book: BookProps
): Promise<BookDB | undefined> {
  const response = await fetch(`${import.meta.env.VITE_API}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  const data: BookDB = await response.json();

  if (data.id) {
    return data;
  }
}

export async function uploadBase64ImageDB(
  base64: string,
  fileName: string,
  response_id: string | undefined
): Promise<ImageDB> {
  const res = await fetch(base64); // Convert base64 to binary
  const blob = await res.blob(); // or use Buffer in Node.js
  const file = new File([blob], fileName, { type: "image/png" }); // Create a File (browser) or Blob
  const formData = new FormData();

  formData.append("file", file);
  formData.append("response_id", response_id || "");

  const response = await fetch(`${import.meta.env.VITE_API}/api/images`, {
    method: "POST",
    body: formData,
  });

  const data: ImageDB = await response.json();

  if (data.url) {
    return data;
  }

  return { url: base64, id: 0, filename: "", response_id: "" };
}

export async function getImageDB(imageId: string | number): Promise<ImageDB> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/images/${imageId}`,
    {
      method: "GET",
    }
  );

  const data: ImageDB = await response.json();

  if (data.url) {
    return data;
  }

  return { url: "", id: 0, filename: "", response_id: "" };
}
