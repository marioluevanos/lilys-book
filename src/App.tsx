import { FormEvent, useCallback, useEffect, useState } from "react";
import { openai } from "./openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const HISTORY_KEY = "history";

function App() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatCompletionMessageParam[]>([
    {
      role: "system",
      content: `You will be a children's book author, that writes bedtime stories. The stories are for 4-6 year olds. The response will be in paragraphs and include a chapter number for each paragraph. Each chapter will include a description of the scene, added at the end as a seperate note, aside from the story.`,
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
        model: "gpt-3.5-turbo",
      });

      return chatCompletion.choices[0].message;
    },
    []
  );

  /**
   * Generate Image
   */
  const generateImage = useCallback(async () => {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: "An image of a fat dog",
      size: "1024x1024",
      quality: "standard",
      n: 1,
    });

    if (response) {
      console.log(response.data);
    }
  }, []);

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
      const userInput = form.firstElementChild as HTMLInputElement;
      const message = createMessage(userInput.value);
      const response = await addMessage(history, message);

      await generateImage();

      setHistory((prev) => {
        const payload = [...prev, message, response];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(payload));
        return payload;
      });

      userInput.value = "";
      setLoading(false);
    },
    [addMessage, generateImage, history]
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
            <pre className="content">
              <div dangerouslySetInnerHTML={{ __html: String(h.content) }} />
            </pre>
          </div>
        )
      )}
      <form onSubmit={onSubmit}>
        <input placeholder="Enter a message" />
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
