import { z } from "zod";
import { BookSchema, GenerateResponseOptions } from "./types";

const numberOfPages = 6;

export const initialImages = Array.from({ length: numberOfPages }).map(() => ({
  response_id: "",
  url: "",
}));

export const mainCharacters = `
  1. Lily, a 5-year-old girl, has a round face, a round nose, long eyelashes, fair skin, and light-brown hair that is very messy, as if she had just woken up. She wears clothing inspired by Hello Kitty and enjoys dancing.
  2. Popcorn, a Miniature Schnauzer puppy, white fur, and female. She is very clumsy and she barks a lot.`;

export const optionalCharacters = `
  1. Mommy, the mother of Lily, is 5'6", medium size, has beautiful eyes, dark wavy brow hair, light brow skin, and a round nose. She is half American, half Salvadoran descent. She is a hair stylist for a high-end boutique.
  2. Daddy, the father of Lily, is 6'0", medium size, has dark short hair, fair skin, a short beard and a sharp nose. He wears jeans, boots, and collared shirts. He is half American, Half Mexican descent. He is a Software Engineer and Designer.
  3. Kiko, the older and bigger brother of Popcorn, an athletic Miniature Schnauzer with gray fur, is male. He barks a lot.`;

export function bookResponseOptions(input: string): GenerateResponseOptions {
  return {
    instructions: `
You are an award winning children's book author and illustrator.
You are going to write a book in the children's genre. 
The book should focus on the text content in the <book-summary> markup, and the protagonists should always be the main characters of the story, even if not mentioned in the <book-summary>. You can use the optional characters as needed for storyline support.
    
The protagonists are the following characters:
${mainCharacters}

The optional characters are:
${optionalCharacters}

Requirements:
  - Each book should contain ${numberOfPages} pages.
  - Each page should get about 90 words.
  - It should rhyme a little.
  - The book should have a random fact related to the book's subject matter shown at the end.
  - The response should be in JSON format, should be minified, and have the following schema:

\`\`\`
  ${JSON.stringify(schema, null, 2)}
\`\`\`
`,
    input: `<book-summary>${input}</book-summary>`,
    previous_response_id: undefined,
  };
}

export function imageResponseOptions(
  args: Omit<GenerateResponseOptions, "instructions">
): GenerateResponseOptions {
  return {
    instructions: `The image should have an aspect ratio of 820/1030 and a ${
      args.art_style || "Dr. Seuss"
    } art style.
 Include the main characters, if applicable, with these characteristics:
    ${mainCharacters}
  And the optional characters, if applicable:
    ${optionalCharacters}
    `,
    input: args.input,
    as_image: true,
    previous_response_id: args.previous_response_id,
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
  random_fact: "A random fact about the story.",
};
