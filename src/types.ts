import { z } from "zod";
import { BookSchema, ImageSchema, PageSchema } from "./system";
import { ChatCompletionMessageParam as History } from "openai/resources/index.mjs";

export type { History };

export type Book = z.infer<typeof BookSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Image = z.infer<typeof ImageSchema>;

export type BookWImages = Omit<Book, "pages"> & {
  pages: Array<Page & { image?: Image }>;
};

export type PageWImage = Page & { image: Image };
