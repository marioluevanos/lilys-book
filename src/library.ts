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
export async function generatePageWithImage(page: Page): Promise<PageWImage> {
  const image = await generateImage({
    prompt: page.synopsis,
  });

  return {
    ...page,
    image,
  };
}

async function generateImage(args: {
  prompt: string;
}): Promise<{ url: string }> {
  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt: args.prompt,
    n: 1,
  });

  const data = imageResponse?.data;
  const imgFile = (data || [])[0];
  const imageBase64 = imgFile?.b64_json || "";

  if (imageBase64) {
    return {
      url: `data:image/png;base64, ${imageBase64}`,
    };
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
  const userHistory = createMessage(engineeredPrompt);
  const bookResponse = await requestBook(history, userHistory);

  return { bookResponse, userHistory };
}

export async function createBookProps(
  bookResponse: BookResponse | undefined
): Promise<Book | undefined> {
  const { content, response } = bookResponse || {};

  if (content && response) {
    const bookCreated: BookWImages = {
      title: content.title,
      pages: content.pages,
      randomFact: content.randomFact,
    };

    localStorage.setItem(KEYS.BOOK_KEY, JSON.stringify(bookCreated));

    return bookCreated;
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
