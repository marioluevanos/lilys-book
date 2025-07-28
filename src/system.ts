import { z } from "zod";
import { BookSchema, GenerateResponseOptions, History } from "./types";

const numberOfPages = 6;

export const initialImages = Array.from({ length: numberOfPages }).map(() => ({
  responseId: "",
  url: "",
}));

export const system: { initial: History } = {
  initial: {
    role: "system",
    content: `You are an award winning children's book author and illustrator.`,
  },
};

export const mainCharacters = `
  1. Popcorn, a Miniature Schnauzer puppy, white fur, and female. She barks a lot.
  2. Lily, a 5-year-old girl, has a round face, a round nose, long eyelashes, fair skin, and light-brown hair that is very messy, as if she had just woken up. She wears clothing inspired by Hello Kitty.`;

export function bookPrompt(input: string): GenerateResponseOptions {
  return {
    instructions: `You are going to write a book in the children's genre. 
The book should focus on the text content in the <book-summary> markup, and the protagonists should always be the main characters of the story, even if not mentioned in the <book-summary>.
    
The protagonists are the following characters:
${mainCharacters}

Requirements:
  - Each book should contain ${numberOfPages} pages.
  - Each page should get about 60 words.
  - It should rhyme a little.
  - The book should have a random fact related to the book's subject matter shown at the end.
  - The response should be in JSON format, should be minified, and have the following schema:

\`\`\`
  ${JSON.stringify(schema, null, 2)}
\`\`\`
`,
    input: `<book-summary>${input}</book-summary>`,
    previousResponseId: undefined,
  };
}

export function imagePrompt(
  args: Omit<GenerateResponseOptions, "instructions">
): GenerateResponseOptions {
  return {
    instructions: `The image should be 820/1030 aspect ratio and in a Disney art style.`,
    input: args.input,
    previousResponseId: args.previousResponseId,
  };
}

const schema: z.infer<typeof BookSchema> = {
  title: "A tagline for the book",
  pages: [
    {
      content: "Part of the story's plot (no more than 60 words)",
      synopsis:
        "A very detailed scene synopsis. If it's needed, it should mention the environment, the weather, the characters involved, the time of day, etc.",
    },
  ],
  randomFact: "A random fact about the story.",
};
