import { z } from "zod";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";

export type { History };

export type Book = z.infer<typeof BookSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Image = z.infer<typeof ImageSchema>;

export type BookWImages = Omit<Book, "pages"> & {
  pages: Array<Page & { image?: Image }>;
};

export type PageWImage = Page & { image: Image };

export const ImageSchema = z.object({
  url: z.string(),
  id: z.string().optional(),
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
