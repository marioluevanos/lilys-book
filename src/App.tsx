import { FormEvent, useCallback, useEffect, useState } from "react";
import { openai } from "./openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { zodResponseFormat } from "openai/src/helpers/zod.js";
import { z } from "zod";

const HISTORY_KEY = "history";

type Asset = {
  width: string | number;
  height: string | number;
  url: string;
  title: string;
};

type ChapterResponse = {
  messages: ChatCompletionMessageParam[];
  images: Asset[];
};

const Chapter = z.object({
  title: z.string(),
  content: z.string(),
  illustration: z.string(),
});

const Chapters = z.object({
  title: z.string(),
  chapters: z.array(Chapter),
});

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content:
        "You will be a children's book author, that writes bedtime stories. Each story should be at least 4 chapters. The stories are for 4-6 year olds. The response should be in JSON format. It will also be formatted and not minified. The 'content' key should contain the story of the chapter, and the 'illustration key' should be an image depicting the chapter with great detail. The image should contain a subject, the setting, the mood or color, and in an art style for kids.",
    },
  ]);

  /**
   * New Message
   */
  const addMessage = useCallback(
    async (
      history: ChatCompletionMessageParam[],
      message: ChatCompletionMessageParam
    ) => {
      const chatCompletion = await openai.chat.completions.create({
        messages: [...history, message],
        model: "gpt-4o",
        response_format: zodResponseFormat(Chapters, "chapters"),
      });

      return chatCompletion.choices[0].message;
    },
    []
  );

  /**
   * Generate Chapters
   */
  const generateChapters = useCallback(
    async (chapters: z.infer<typeof Chapter>[]) => {
      return chapters.reduce<Promise<ChapterResponse>>(
        async (_acc, chapter) => {
          const acc = await _acc;
          const WIDTH = 1024;
          const HEIGHT = 1024;
          const img = await openai.images.generate({
            model: "dall-e-3",
            prompt: chapter.illustration,
            size: `${WIDTH}x${HEIGHT}`,
            quality: "standard",
            response_format: "url",
            n: 1,
          });

          acc.messages.push({
            role: "assistant",
            content: chapter.content,
          });

          acc.images.push({
            width: WIDTH,
            height: HEIGHT,
            title: chapter.illustration,
            url: img.data[0].url || "",
          });

          return acc;
        },
        Promise.resolve({
          images: [],
          messages: [],
        })
      );
    },
    []
  );

  /**
   * Create a prompt message
   */
  const createMessage = (userInput: string): ChatCompletionMessageParam => ({
    role: "user",
    content: userInput,
  });

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setLoading(true);
      const form = event.target as HTMLFormElement;
      const userInput = form.firstElementChild as HTMLTextAreaElement;
      const message = createMessage(userInput.value);
      const response = await addMessage(history, message);
      let chapters: ChatCompletionMessageParam[] = [];

      if (response.content) {
        try {
          const data: z.infer<typeof Chapters> | null = JSON.parse(
            response.content
          );

          if (data) {
            const response = await generateChapters(data.chapters);
            const img = (asset: Asset) =>
              `<img
                src="${asset.url}"
                alt="${asset.title}"
                width"${asset.width}"
                height="${asset.height}"
              />
            `;
            chapters = response.messages.map((chapter, index) => ({
              ...chapter,
              content: `
                <p>${chapter.content}</p>
                ${img(response.images[index])}
              `.trim(),
            }));
          }
        } catch (error) {
          console.warn(error);
        }
      }

      setHistory((prev) => {
        const payload = [...prev, message, ...chapters];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
        return payload;
      });

      userInput.value = "";
      setLoading(false);
    },
    [addMessage, generateChapters, history]
  );

  /**
   * Load from local storage
   */
  const preloadStorage = useCallback(() => {
    const data = localStorage.getItem(HISTORY_KEY);
    if (data) {
      try {
        const history = JSON.parse(data);
        if (Array.isArray(history)) {
          setHistory(history);
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }, []);

  /**
   * Run preload
   */
  useEffect(() => {
    preloadStorage();
  }, [preloadStorage]);

  return (
    <>
      {history.map((h, i) =>
        h.role === "system" ? null : (
          <div
            key={String(h.content) + i}
            className={`message ${String(h.role)}`}
          >
            <p className="role">{String(h.role)}</p>
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: String(h.content) }}
            />
          </div>
        )
      )}
      <form onSubmit={onSubmit}>
        <textarea rows={2} placeholder="What kind of bedtime story?" />
        <button
          type="submit"
          disabled={loading}
          className={`${loading ? "loading " : ""}`}
        >
          {loading ? "Generating" : "Enter"}
        </button>
      </form>
    </>
  );
}

export default App;
