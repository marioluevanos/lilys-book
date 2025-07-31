import { z } from "zod";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";

export type { History };

export type BookProps = z.infer<typeof BookSchema>;
export type PageProps = z.infer<typeof PageSchema>;
export type ImageProps = z.infer<typeof ImageSchema>;

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
  data: BookProps;
  responseId: string;
};

export type ImageResponsePayload = {
  data: ImageProps;
  responseId: string;
};

export type ReponsePayload = BookResponsePayload | ImageResponsePayload;

export type PageDB = PageProps & {
  imageId?: number; // Reference to images table
  responseId?: string;
};

export type BookDB = BookProps & {
  id?: number;
  pages: PageDB[];
  created_at?: string;
  updated_at?: string;
};

export type ImageDB = {
  id: number;
  filename: string;
  url: string;
};
