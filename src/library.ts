import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import { Book, BookSchema, BookWImages, Page, PageWImage } from "./types";
import { userPrompt } from "./system";
import { KEYS } from "./storage";

export const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Generate a page with an Image
 */
export async function generatePageWithImage(
  page: Page,
  previousResponseId: string | undefined
): Promise<PageWImage> {
  const image = await generateImage({
    prompt: page.synopsis,
    previousResponseId,
  });

  return {
    ...page,
    image,
  };
}

export async function generateImage(args: {
  prompt: string;
  previousResponseId?: string;
}): Promise<{ url: string; imageId?: string }> {
  const imageResponse = await openai.responses.create({
    model: "gpt-4.1",
    input: args.prompt,
    previous_response_id: args.previousResponseId,
    tools: [{ type: "image_generation" }],
  });

  console.log({ imageResponse });
  const imageData = imageResponse.output
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (imageData.length > 0) {
    const imageBase64 = imageData[0];

    if (imageBase64) {
      const fs = await import("fs");
      fs.writeFileSync("ass.png", Buffer.from(imageBase64, "base64"));
      return { url: imageBase64, imageId: imageResponse.id };
    }
  }

  return { url: "" };
}

type BookResponse = {
  content: Book | null;
  response: OpenAI.Chat.Completions.ChatCompletionMessage;
};

/**
 * Create a Chapter
 */
export async function requestBook(
  history: History[],
  message: History
): Promise<BookResponse | undefined> {
  const chatCompletion = await openai.chat.completions.create({
    messages: [...history, message],
    model: "gpt-4.1",
    temperature: 0.2,
    response_format: zodResponseFormat(BookSchema, "data"),
  });

  console.log({ chatCompletion });
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
  console.log({ formInput });
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
    console.warn(error);
  }

  return null;
}

/**
 * Get book, internall handle the prompt engineering and boo creation
 * @param prompt The engineered prompt
 * @param history Message history
 * @returns
 */
export async function getBook(prompt: string, history: History[]) {
  localStorage.setItem(KEYS.USER_PROMPT, prompt);

  const engineeredPrompt = userPrompt({ summary: prompt });

  console.log({ engineeredPrompt });

  const userHistory = createMessage(engineeredPrompt);

  const bookResponse = await requestBook(history, userHistory);

  return { bookResponse, userHistory };
}

export async function createBookProps(
  bookResponse: BookResponse | undefined,
  book: BookWImages | undefined
): Promise<BookWImages | undefined> {
  const { content, response } = bookResponse || {};

  if (content && response) {
    const bookCreated: BookWImages = {
      title: content.title,
      pages: await Promise.all(content.pages.map(mapPage)),
      randomFact: content.randomFact,
    };

    return bookCreated;
  }

  function mapPage(ch: Page, idx: number) {
    const p = book?.pages[idx - 1];
    const previousResponseId = p?.image?.id;
    return generatePageWithImage(ch, previousResponseId);
  }
}

export function updateHistory(
  userInput: History,
  bookResponse: BookResponse | undefined,
  prev: History[]
) {
  const payload: typeof prev = [
    ...prev,
    userInput,
    {
      role: "assistant",
      content: bookResponse?.response?.content,
    },
  ];

  localStorage.setItem(KEYS.HISTORY_KEY, JSON.stringify(payload));

  return payload;
}
