import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { Book, BookResponse, BookSchema } from "./types";
import { userPrompt } from "./system";

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Generate an Image
 */
export async function generateImage(args: {
  prompt: string;
  previousResponseId: string | undefined;
}): Promise<{ url: string; responseId: string }> {
  const options: OpenAI.Responses.ResponseCreateParams = {
    model: "gpt-4.1-mini",
    input: args.prompt,
    tool_choice: "required",
    tools: [{ type: "image_generation" }],
    instructions: "The image should be 820/1030 aspect ratio",
  };

  if (args.previousResponseId) {
    options.previous_response_id = args.previousResponseId;
  }

  const response = await openai.responses.create(options);
  console.log({ response });
  const imageResults = (response.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  console.log({ imageResults });
  if (imageResults.length > 0) {
    const imageBase64 = imageResults[0];

    if (imageBase64) {
      const url = `data:image/png;base64, ${imageBase64}`;
      const responseId = response.id;

      return { url, responseId };
    }
  }

  return { url: "", responseId: "" };
}

/**
 * Create a Chapter
 */
export async function createBook(
  history: History[],
  message: History
): Promise<BookResponse | undefined> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [...history, message],
    model: "gpt-4.1",
    temperature: 0.2,
    response_format: zodResponseFormat(BookSchema, "data"),
  });

  const response = chatCompletion.choices[0].message;

  if (response.content) {
    return {
      content: parseResponse(response.content),
      response,
    };
  }
}

/**
 * Create a prompt message
 */
function createMessage(formInput: string): History {
  return {
    role: "user",
    content: formInput,
  };
}

/**
 * Chat sends back json, parse the string as JSON
 */
function parseResponse(content: string): Book | null {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error(error);
  }

  return null;
}

/**
 * Generate a book with AI. Handles the prompt engineering and book creation.
 * @param prompt The engineered prompt
 * @param history Message history
 */
export async function generateBook(
  prompt: { summary: string; numberOfPages: number },
  history: History[]
) {
  const engineeredPrompt = userPrompt(prompt);
  const userHistory = createMessage(engineeredPrompt);
  const bookResponse = await createBook(history, userHistory);

  return { bookResponse, userHistory };
}

export async function createBookProps(
  bookResponse: BookResponse | undefined
): Promise<Book | undefined> {
  const { content, response } = bookResponse || {};

  if (content && response) {
    const bookCreated: Book = {
      title: content.title,
      pages: content.pages,
      randomFact: content.randomFact,
    };

    return bookCreated;
  }
}

export async function uploadBase64Image(base64: string) {
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
  console.log("Upload result:", data);

  return {
    url: `http://localhost:5171${data.url}`,
  };
}
