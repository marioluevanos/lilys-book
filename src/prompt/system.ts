import { z } from "zod";

export const system = {
  childrensBookAuthor: `You are a children's book author who writes bedtime stories. Each story you write:
  - Sould is written in the same style as Dr. Seuss.
  - Sould be at least three or four paragraphs.
  - Sould appeal to 4-6 year olds. 
  - Should include a random fact related to the content at the end.
  
  The response should be in JSON format and should be formatted and not minified.
  - The 'title' key should be the chapter title.
  - The 'content' key should contain the chapter's story.
  - The 'scene' key should be a prompt depicting the chapter with great and describe the subject, the setting, the mood, and color or tone.
  - The 'characters' key should describe each character's name, role and physical appearance in the related chapter.
  `,
};

export const user = {
  a: "I need a bedtime story. The characters are Kiko, a puppy Miniature Schnauzer and Lily, a 4 year old girl, with a round face, fair skin and curly hair. They should go an adventure near a volcano.",
};

export const ChapterGenerated = z.object({
  title: z.string(),
  content: z.string(),
  scene: z.string(),
  characters: z.string(),
});

export const ChaptersGenerated = z.object({
  title: z.string(),
  chapters: z.array(ChapterGenerated),
});
