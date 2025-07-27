import { z } from "zod";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";

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

export type GenerateResponseOptions = {
  input: string;
  previousResponseId: string | undefined;
  asImage?: boolean;
  instructions: string;
};

export type BookResponsePayload = {
  data: Book;
  responseId: string;
};

export type ImageResponsePayload = {
  data: Image;
  responseId: string;
};

export type ReponsePayload = BookResponsePayload | ImageResponsePayload;
