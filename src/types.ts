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
  with_images?: boolean;
  as_image?: boolean;
  instructions: string;
  art_style?: (typeof ART_STYLES)[number] | (string & {});
};

export const ART_STYLES = [
  // People or entities
  "Dr. Seuss",
  "Disney",
  "Eric Carle",
  "Shel Silverstein",
  "Chris Van Allsburg",
  "Lisbeth Zwerger",
  "Beatrix Potter",
  "Dan Santat",
  // Styles
  "Cartoonish",
  "Realistic",
  "Whimsical",
  "Line Drawing",
  "Sketch",
  "Abstract",
  "Vintage",
  "Bold and Bright",
  "Muted or Subdued",
] as const;

export type StorageOptions = {
  input: string;
  api_key: string;
  art_style: GenerateResponseOptions["art_style"] | (string & {});
};

export type PageDB = PageProps & {
  image?: ImageDB;
  image_id?: string | number;
};

export type BookDB = BookProps & {
  id: string;
  pages: PageDB[];
  created_at?: string;
  updated_at?: string;
  response_id: string;
};

export type ImageDB = {
  filename: string;
  id: string;
  url: string;
  response_id: string;
};
