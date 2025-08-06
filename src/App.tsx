import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import { aiGenerateBook, aiGenerateImage } from "./ai";
import { useModes } from "./hooks/useModes";
import { BookDB, StorageOptions } from "./types";
import { bookResponseOptions, imageResponseOptions } from "./system";
import { preloadStorage, updateUserOptions } from "./storage";
import { Drawer } from "./components/Drawer/Drawer";
import { events } from "./events";
import { LoadingProgress } from "./components/LoadingProgress/LoadingProgress";
import { HomeView } from "./components/Views/HomeView";
import { BookView } from "./components/Views/BookView";
import { getBookDB, mergeBook, saveGeneratedImage, uploadBookDB } from "./db";

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<StorageOptions>();
  const [book, setBook] = useState<BookDB>();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  /**
   * Handle generate image click
   */
  const onGenerateImageClick = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      const pageIndex = +event.target.dataset.pageIndex;
      const pages = book?.pages || [];
      const page = pages[pageIndex];
      const prevImage = pages[pageIndex - 1]?.image;
      const previous_response_id = prevImage?.response_id || book?.response_id;

      if (page && previous_response_id) {
        try {
          const hasImage = (page?.image?.url || "").length > 0;

          if (!hasImage) {
            setIsGeneratingImage(true);

            const prompt = imageResponseOptions({
              input: page.synopsis,
              previous_response_id,
              art_style: options?.art_style,
            });

            console.log("%cIMAGE Promt", "color: lime; background: black", {
              prompt,
              JSON: JSON.stringify(prompt),
            });
            const response = await aiGenerateImage(prompt);
            console.log("%cIMAGE Response", "color: white; background: blue", {
              response,
              JSON: JSON.stringify(response),
            });
            if (response.url.length <= 0) {
              console.error("Failed", response);
              setIsGeneratingImage(false);
              return;
            }

            if (book) {
              const updatedBook = await saveGeneratedImage(
                {
                  bookTitle: book.title,
                  image: response,
                  pageIndex,
                },
                book
              );

              setBook(mergeBook(book, updatedBook, pageIndex));
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingImage(false);
        }
      }
    },
    [book, options]
  );

  /**
   * Get the users input as StorageOptions
   */
  const getUserInput = useCallback(
    (event: BaseSyntheticEvent): StorageOptions => {
      const form = event.target as HTMLFormElement;
      const prompt = form.elements.namedItem("prompt") as HTMLTextAreaElement;
      const apikey = form.elements.namedItem("apikey") as HTMLInputElement;
      const art_style = form.elements.namedItem(
        "art_style"
      ) as HTMLSelectElement;

      return {
        apikey: apikey.value,
        input: prompt.value,
        art_style: art_style.value,
      };
    },
    []
  );

  /**
   * Handle form submit
   */
  const onChangeOptions = useCallback(
    async (event: BaseSyntheticEvent) => {
      const art_style = event.target.value as StorageOptions["art_style"];

      if (art_style) {
        const _options = {
          ...options,
          input: options?.input || "",
          apikey: options?.apikey || "",
          art_style,
        };
        setOptions(_options);
        updateUserOptions(_options);
      }
    },
    [options]
  );

  /**
   * Cleanup events and reset form inputs
   */
  const onFinalize = useCallback((event: BaseSyntheticEvent) => {
    const textArea = event.target.elements.namedItem(
      "prompt"
    ) as HTMLTextAreaElement | null;

    if (textArea) textArea.value = "";

    setLoading(false);
    events.emit("drawerclose", undefined);
    events.emit("generatedbook", undefined);
  }, []);

  /**
   * Handle form submit
   */
  const onSubmitAIRequest = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      setLoading(true);

      const inputOptions = getUserInput(event);
      const options = bookResponseOptions(inputOptions.input);

      setOptions(inputOptions);
      console.log("%cBOOK options", "color: green; background: yellow", {
        options,
        JSON: JSON.stringify(options),
      });
      const bookResponse = await aiGenerateBook(options);
      console.log("%cBOOK bookResponse", "color: green; background: yellow", {
        bookResponse,
        JSON: JSON.stringify(bookResponse),
      });

      if (bookResponse) {
        const uploadedBook = await uploadBookDB({
          ...bookResponse,
          response_id: bookResponse.response_id,
        });

        setBook(uploadedBook);
        updateUserOptions(inputOptions);
      }

      onFinalize(event);
    },
    [getUserInput, onFinalize]
  );

  /**
   * Handle the main action button click
   */
  const onHomeView = useCallback(() => {
    setBook(undefined);
  }, []);

  /**
   * Handle book clicks
   */
  const onBookClick = useCallback(async (event: BaseSyntheticEvent) => {
    const bookId = event?.target.dataset.bookId;

    if (bookId) {
      const book = await getBookDB(bookId);
      if (book) {
        setBook(book);
      }
    }
  }, []);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    events.on("home-view", onHomeView);
  }, [onHomeView]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    preloadStorage({
      getSettings: (p) => setOptions(p),
    });
  }, []);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      {loading && <LoadingProgress />}
      {book ? (
        <BookView
          isGeneratingImage={isGeneratingImage}
          onGenerateImageClick={onGenerateImageClick}
          book={book}
        />
      ) : (
        <HomeView
          onSubmit={onSubmitAIRequest}
          onChange={onChangeOptions}
          onBookClick={onBookClick}
        />
      )}
      <Drawer />
    </div>
  );
}

export default App;
