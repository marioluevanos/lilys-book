import { BaseSyntheticEvent, useCallback, useEffect, useState } from "react";
import {
  generateBook,
  generateImage,
  getBookDB,
  getImageDB,
  updateBookDB,
  uploadBase64ImageDB,
  uploadBookDB,
} from "../library";
import { useModes } from "../hooks/useModes";
import { BooksPreviewtate, InputOptions } from "../types";
import { bookPrompt, imagePrompt } from "../system";
import { preloadStorage, updateUserOptions } from "../storage";
import { Drawer } from "./Drawer/Drawer";
import { EventMap, events } from "../events";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";
import { toKebabCase } from "../utils/toKebabCase";
import { HomeView } from "./Views/HomeView";
import { BookView } from "./Views/BookView";

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<InputOptions>();
  const [book, setBook] = useState<BooksPreviewtate>();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  /**
   * On page change (horizontal page change)
   */
  const onPageChange = useCallback(
    async (pageIdx: EventMap["pagechange"]) => {
      const pages = book?.pages || [];
      const currentPage = pages[pageIdx];
      const currentImageUrl = pages[pageIdx]?.image?.url;
      const imageId = currentPage?.image_id || currentPage?.image?.id;

      if (!currentImageUrl && imageId) {
        const image = await getImageDB(imageId);
        const pageWImage = {
          ...currentPage,
          image,
        };
        setBook((prev) => ({
          ...prev,
          pages: pages.map((p, i) => (i === pageIdx ? pageWImage : p)),
        }));
      }
    },
    [book]
  );

  /**
   * Handle the generated image
   */
  const saveGeneratedImage = useCallback(
    async (payload: EventMap["generatedimage"]) => {
      const pageIndex = payload?.pageIndex || 0;
      const generatedImage = payload?.image;
      const filename = `${toKebabCase(
        payload?.bookTitle || "image"
      )}-${pageIndex}.png`;

      if (generatedImage?.url && (generatedImage?.url || "").length > 0) {
        const uploadImage = await uploadBase64ImageDB(
          generatedImage.url,
          filename,
          generatedImage.response_id
        );

        if (book && book.id) {
          const pages = book.pages || [];
          const { image: _, ...pageToUpdate } = pages[pageIndex];

          // Important assignment, make reference to page to image
          pageToUpdate.image_id = uploadImage.id;

          if (book) {
            const bookUpdated: BooksPreviewtate = {
              ...book,
              pages: (book?.pages || []).map((p, i) => {
                return i === pageIndex ? pageToUpdate : p;
              }),
            };

            const bookImageUpdated = await updateBookDB(bookUpdated, book.id);

            setBook({
              ...bookImageUpdated,
              pages: (book?.pages || []).map((p, i) => {
                return i === pageIndex
                  ? {
                      ...pageToUpdate,
                      image: uploadImage,
                    }
                  : p;
              }),
            });
          }
        }
      }
    },
    [book]
  );

  /**
   * Handle generate image click
   */
  const onGenerateImage = useCallback(
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

            const prompt = imagePrompt({
              input: page.synopsis,
              previous_response_id,
              art_style: options?.art_style,
            });

            console.log({ prompt });
            const response = await generateImage(prompt);
            console.log({ response });
            if (response.url.length <= 0) {
              console.error("Failed", response);
              setIsGeneratingImage(false);
              return;
            }

            if (book) {
              saveGeneratedImage({
                bookTitle: book.title,
                image: response,
                pageIndex,
              });
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsGeneratingImage(false);
        }
      }
    },
    [book, saveGeneratedImage, options]
  );

  /**
   * Get the users input as InputOptions
   */
  const getUserInput = useCallback(
    (event: BaseSyntheticEvent): InputOptions => {
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
  const onChange = useCallback(
    async (event: BaseSyntheticEvent) => {
      const art_style = event.target.value as InputOptions["art_style"];

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
  const onSubmit = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      setLoading(true);

      const inputOptions = getUserInput(event);
      const prompt = bookPrompt(inputOptions.input);

      setOptions(inputOptions);

      console.log({ inputOptions, prompt });

      const bookResponse = await generateBook(prompt);

      console.log({ bookResponse });
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
    events.on("pagechange", onPageChange);
    events.on("home-view", onHomeView);
  }, [saveGeneratedImage, onHomeView, onPageChange]);

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
          onGenerateImage={onGenerateImage}
          book={book}
        />
      ) : (
        <HomeView
          onSubmit={onSubmit}
          onChange={onChange}
          onBookClick={onBookClick}
        />
      )}
      <Drawer />
    </div>
  );
}

export default App;
