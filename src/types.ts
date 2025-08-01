import { z } from "zod";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";

export type { History };

export type BookProps = z.infer<typeof BookSchema> & { response_id: string };
export type PageProps = z.infer<typeof PageSchema>;
export type ImageProps = z.infer<typeof ImageSchema>;

export const ImageSchema = z.object({
  url: z.string(),
  response_id: z.string(),
});

export const PageSchema = z.object({
  content: z.string(),
  synopsis: z.string(),
});

export const BookSchema = z.object({
  title: z.string(),
  pages: z.array(PageSchema),
  random_fact: z.string(),
});

export type GenerateResponseOptions = {
  input: string;
  previous_response_id: string | undefined;
  as_image?: boolean;
  instructions: string;
  art_style?: (typeof ART_STYLES)[number] | (string & {});
};

export const ART_STYLES = ["Dr. Seuss", "Disney"] as const;

export type InputOptions = {
  prompt: string;
  apikey: string;
  art_style: GenerateResponseOptions["art_style"] | (string & {});
};

export type BookResponsePayload = BookProps;

export type ImageResponsePayload = ImageProps;

export type PageDB = PageProps & {
  image_id?: number;
};

export type PageState = PageProps & {
  image?: ImageDB;
  image_id?: string | number;
};

export type BookDB<T = PageDB> = BookProps & {
  id?: number;
  pages: T[];
  created_at?: string;
  updated_at?: string;
};

export type ImageDB = {
  filename: string;
  id: number;
  url: string;
  response_id: string;
};

export type BooksPreviewtate = Partial<BookDB<PageState>> & {
  response_id?: string;
};
