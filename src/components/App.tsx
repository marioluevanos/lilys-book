import { FormEvent, useCallback, useEffect, useState } from "react";
import { openai } from "../openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { zodResponseFormat } from "openai/src/helpers/zod.js";
import { z } from "zod";
import { useModes } from "../hooks/useModes";
import { ChapterGenerated, system } from "../prompt/system";
import { Asset, Chapter } from "../types";

const HISTORY_KEY = "history";
const CHAPTERS_KEY = "chapters";

function App() {
  const { size, theme } = useModes();
  const [loadingProgress, setLoadingProgress] = useState<number>(1);
  const loading = loadingProgress !== 1;
  const [story, setStory] = useState<Chapter>();
  const [history, setHistory] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content: system.childrensBookAuthor,
    },
  ]);

  /**
   * Create a Chapter
   */
  const requestChapters = useCallback(
    async (
      history: ChatCompletionMessageParam[],
      message: ChatCompletionMessageParam
    ) => {
      const chatCompletion = await openai.chat.completions.create({
        messages: [...history, message],
        model: "gpt-4o",
        response_format: zodResponseFormat(ChapterGenerated, "chapters"),
      });

      return chatCompletion.choices[0].message;
    },
    []
  );

  /**
   * Generate an image with a prompt
   */
  const generateImage = useCallback(async (prompt: string): Promise<Asset> => {
    const WIDTH = 1024;
    const HEIGHT = 1024;
    const img = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      style: "natural",
      size: `${WIDTH}x${HEIGHT}`,
      quality: "hd",
      user: "user",
      response_format: "url",
      n: 1,
    });

    return {
      width: WIDTH,
      height: HEIGHT,
      title: prompt,
      url: img.data[0].url || "",
    };
  }, []);

  /**
   * Generate ChaptersGenerated
   */
  const generateChapter = useCallback(
    async (chapter: z.infer<typeof ChapterGenerated>) => {
      const story = {
        title: chapter.title,
        content: chapter.content,
        characters: chapter.characters,
        image: await generateImage(`${chapter.characters} ${chapter.scene}`),
      };

      setLoadingProgress((prev) => prev + 0.1);

      return story;
    },
    [generateImage]
  );

  /**
   * Create a prompt message
   */
  const createMessage = (formInput: string): ChatCompletionMessageParam => ({
    role: "user",
    content: formInput,
  });

  /**
   * Chat sends back json, parse the string as JSON
   */
  const parseChapters = (
    content: string
  ): z.infer<typeof ChapterGenerated> | null => {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.warn(error);
    }

    return null;
  };

  /**
   * Handle form submit
   */
  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setLoadingProgress(0);

      const form = event.target as HTMLFormElement;
      const formInput = form.firstElementChild as HTMLTextAreaElement;
      const message = createMessage(formInput.value);
      const chapters = await requestChapters(history, message);

      setLoadingProgress(0.6);

      if (chapters.content) {
        const data = parseChapters(chapters.content);
        if (data) {
          const chapters = await generateChapter(data);
          setStory(() => {
            localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
            return chapters;
          });
        }
      }

      setHistory((prev) => {
        const payload: typeof prev = [
          ...prev,
          message,
          {
            role: "assistant",
            content: chapters.content,
          },
        ];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
        return payload;
      });

      formInput.value = "";

      setLoadingProgress(1);
    },
    [requestChapters, generateChapter, history]
  );

  /**
   * Load from local storage
   */
  const preloadStorage = useCallback(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        if (Array.isArray(history)) {
          setHistory(history);
        }
      } catch (error) {
        console.warn(error);
      }
    }

    const savedChapters = localStorage.getItem(CHAPTERS_KEY);
    if (savedChapters) {
      try {
        const story = JSON.parse(savedChapters);
        if (story && typeof story === "object") {
          setStory(story);
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
    <div className="app" data-size={size} data-theme={theme}>
      {loadingProgress === 1 ? "" : `Progress: ${100 * loadingProgress}%`}

      {history.map((h, i) =>
        h.role === "system" ? null : (
          <div
            key={String(h.content) + i}
            className={`message ${String(h.role)}`}
          >
            <p className="role">{String(h.role)}</p>
            <pre
              className="content"
              dangerouslySetInnerHTML={{
                __html: String(h.content),
              }}
            />
          </div>
        )
      )}

      {story && (
        <div className="message chapter">
          <h2>{story.title}</h2>
          <p
            dangerouslySetInnerHTML={{
              __html: String(story.content).replace(/\\n/g, "<br/>"),
            }}
          />
          <p
            dangerouslySetInnerHTML={{
              __html: String(story.characters).replace(/\\n/g, "<br/>"),
            }}
          />
          <img
            alt={story.image.title}
            src={story.image.url}
            width={story.image.width}
            height={story.image.height}
          />
        </div>
      )}

      <form onSubmit={onSubmit} aria-disabled={loading}>
        <textarea
          disabled={loading}
          rows={4}
          placeholder="I need a bedtime story about..."
        />
        <button
          type="submit"
          disabled={loading}
          className={`${loading ? "loading " : ""}`}
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default App;
