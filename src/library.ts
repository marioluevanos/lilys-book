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
    tools: [{ type: "image_generation" }],
  };

  if (args.previousResponseId) {
    options.previous_response_id = args.previousResponseId;
  }

  const imageResponse = await openai.responses.create(options);

  const imageData = (imageResponse.output || [])
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];

    if (imageBase64) {
      const url = `data:image/png;base64, ${imageBase64}`;
      const responseId = imageResponse.id;

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
 * Get book, internall handle the prompt engineering and boo creation
 * @param prompt The engineered prompt
 * @param history Message history
 * @returns
 */
export async function generateBook(prompt: string, history: History[]) {
  const engineeredPrompt = userPrompt({ summary: prompt });
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
