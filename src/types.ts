import { z } from "zod";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";
import OpenAI from "openai";

export type { History };

export type Book = z.infer<typeof BookSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Image = z.infer<typeof ImageSchema>;

export const ImageSchema = z.object({
  url: z.string(),
  responseId: z.string().optional(),
});

export const PageSchema = z.object({
  content: z.string(),
  synopsis: z.string(),
});

export const BookSchema = z.object({
  title: z.string(),
  pages: z.array(PageSchema),
  randomFact: z.string(),
});

export type BookResponse = {
  content: Book | null;
  response: OpenAI.Chat.Completions.ChatCompletionMessage;
};
