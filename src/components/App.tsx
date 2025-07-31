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
import { BookDB, BookState, PageState } from "../types";
import { bookPrompt, imagePrompt } from "../system";
import { preloadStorage, updateBookStorage, updatePrompt } from "../storage";
import { Form } from "./Form/Form";
import { Drawer } from "./Drawer/Drawer";
import { EventMap, events } from "../events";
import { LoadingProgress } from "./LoadingProgress/LoadingProgress";
import { ActionButton } from "./ActionButton";
import { Book } from "./Book/Book";
import { toKebabCase } from "../utils/toKebabCase";

const { log } = console;

function App() {
  const { size, theme } = useModes();
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState("");
  const [book, setBook] = useState<BookState>();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const onPageChange = useCallback(
    async (pageIdx: EventMap["pagechange"]) => {
      const pages = book?.pages || [];
      const currentPage = pages[pageIdx];
      const currentImage = pages[pageIdx]?.image?.url;

      if (!currentImage && currentPage?.image?.id) {
        const image = await getImageDB(currentPage.image.id);

        setBook((prev) => ({
          ...prev,
          pages: (prev?.pages || []).reduce<PageState[]>((acc, p, i) => {
            if (i === pageIdx) {
              acc.push({ ...p, image });
            }

            acc.push(p);
            return acc;
          }, []),
        }));
      }
    },
    [book]
  );
  /**
   * Handle the generated image
   */
  const onGeneratedImage = useCallback(
    async (payload: EventMap["generatedimage"]) => {
      const pageIndex = payload?.pageIndex || 0;
      const generatedImage = payload?.image;
      const filename = `${toKebabCase(
        payload?.bookTitle || "image"
      )}-${pageIndex}.png`;

      log(payload, { generatedImage, filename, pageIndex, payload });

      if (generatedImage?.url && (generatedImage?.url || "").length > 0) {
        log("calling uploadBase64Image...", {
          generatedImage,
          book,
          filename,
        });
        const uploadImage = await uploadBase64ImageDB(
          generatedImage.url,
          filename,
          generatedImage.response_id
        );

        log("uploadBase64Image results:", { uploadImage });

        if (book && book.id) {
          const pages = book.pages || [];
          const pageToUpdate = pages[pageIndex];

          // Important assignment, make reference to page to image
          pageToUpdate.image_id = uploadImage.id;

          if (book) {
            const bookUpdated: BookState = {
              ...book,
              pages: (book?.pages || []).map((p, i) => {
                return i === pageIndex ? pageToUpdate : p;
              }),
            };

            log("bookUpdated", {
              bookUpdated,
              pageIndex,
              pageToUpdate,
            });

            const bookImageUpdated = await updateBookDB(bookUpdated, book.id);
            updateBookStorage(bookImageUpdated);
            setBook(bookImageUpdated);
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

      console.log({ previous_response_id, page, prevImage, pages, pageIndex });
      if (page && previous_response_id) {
        try {
          const hasImage = (page?.image?.url || "").length > 0;

          if (!hasImage) {
            setIsGeneratingImage(true);
            const prompt = imagePrompt({
              input: page.synopsis,
              previous_response_id,
            });
            log("imagePrompt", { prompt });
            const response = await generateImage(prompt);
            log("generateImage", { response });

            if (response.url.length <= 0) {
              console.error("Failed", response);
              setIsGeneratingImage(false);
              return;
            }

            if (book) {
              onGeneratedImage({
                image: response,
                pageIndex,
                bookTitle: book.title,
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
    [book]
  );

  const getUserInput = useCallback((event: BaseSyntheticEvent): string => {
    const form = event.target;
    const textArea = form.firstElementChild;
    return textArea.value;
  }, []);

  /**
   * Handle form submit
   */
  const onSubmit = useCallback(
    async (event: BaseSyntheticEvent) => {
      event.preventDefault();
      setLoading(true);

      const userInput = getUserInput(event);
      const prompt = bookPrompt(userInput);

      updatePrompt(userInput);

      const bookResponse = await generateBook(prompt);

      if (bookResponse) {
        const uploadedBook = await uploadBookDB({
          ...bookResponse,
          response_id: bookResponse.response_id,
        });

        setBook(uploadedBook);
        updateBookStorage(uploadedBook);
      }

      event.target.value = "";

      setLoading(false);
      events.emit("drawerclose", undefined);
      events.emit("generatedbook", undefined);
    },
    [getUserInput]
  );

  /**
   * Handle the main action button click
   */
  const onActionClick = useCallback(() => {
    events.emit("drawer", {
      children: <Form onSubmit={onSubmit} disabled={loading} />,
    });
  }, [loading, onSubmit]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    events.on("pagechange", onPageChange);
  }, [onGeneratedImage, onPageChange]);

  /**
   * Set state from browser storage
   */
  useEffect(() => {
    preloadStorage({
      getPrompt: (p) => setPrompt(p),
      getBookIds: async (b) => {
        if (!book) {
          try {
            const promises = (b || []).map((id) => getBookDB(id));
            if (promises.some((v) => v)) {
              const responses = await Promise.all(promises);

              if (responses.some((v) => v)) {
                const [dbBook] = responses;

                if (dbBook) {
                  console.log(dbBook);
                  setBook(dbBook as BookDB);
                }
              } else {
                updateBookStorage(undefined);
              }
            }
          } catch (error) {
            log(error);
            updateBookStorage(undefined);
          }
        }
      },
    });
  }, [book]);

  return (
    <div className="app" data-size={size} data-theme={theme}>
      {loading && <LoadingProgress />}
      {book ? (
        <>
          <Book
            onGenerateImageClick={onGenerateImage}
            isGeneratingImage={isGeneratingImage}
            book={{
              ...book,
              pages: book.pages || [],
              title: book.title || "",
              response_id: book.response_id || "",
              random_fact: book.random_fact || "",
            }}
            key="Novel"
            form={<Form onSubmit={onSubmit} disabled={loading} />}
          />
          <Drawer />
          <ActionButton onClick={onActionClick} />
        </>
      ) : (
        <Form onSubmit={onSubmit} disabled={loading} defaultValue={prompt} />
      )}
    </div>
  );
}

export default App;
