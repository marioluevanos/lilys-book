import { EventMap } from "./events";
import { BookDB, BookProps, ImageDB, PageDB } from "./types";
import { toKebabCase } from "./utils/toKebabCase";

export async function getBooksDB(): Promise<BookDB[] | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books?populate=images`,
    {
      method: "GET",
    }
  );

  const data: BookDB[] = await response.json();

  if (Array.isArray(data)) {
    return data;
  }
}

export async function getBookDB(
  bookId: number | string
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}?populate=images`,
    {
      method: "GET",
    }
  );

  const data: BookDB = await response.json();

  if (data.title) {
    return data;
  }
}

export async function updateBookDB(
  book: BookDB,
  bookId: string
): Promise<BookDB | undefined> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(book),
    }
  );

  const data: BookDB = await response.json();

  if (data.title) {
    return data;
  }
}

export async function deleteBookDB(
  bookId: string
): Promise<{ message?: string; error?: string }> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/books/${bookId}`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    }
  );

  const data: { message?: string; error?: string } = await response.json();

  return data;
}

export async function uploadBookDB(
  book: BookProps
): Promise<BookDB | undefined> {
  const response = await fetch(`${import.meta.env.VITE_API}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });

  const data: BookDB = await response.json();

  if (data.id) {
    return data;
  }
}

export async function uploadBase64ImageDB(
  base64: string,
  fileName: string,
  response_id: string | undefined
): Promise<ImageDB> {
  const res = await fetch(base64); // Convert base64 to binary
  const blob = await res.blob(); // or use Buffer in Node.js
  const file = new File([blob], fileName, { type: "image/png" }); // Create a File (browser) or Blob
  const formData = new FormData();

  formData.append("file", file);
  formData.append("response_id", response_id || "");

  const response = await fetch(`${import.meta.env.VITE_API}/api/images`, {
    method: "POST",
    body: formData,
  });

  const data: ImageDB = await response.json();

  if (data.url) {
    return data;
  }

  return { url: base64, id: "", filename: "", response_id: "" };
}

export async function getImageDB(imageId: string | number): Promise<ImageDB> {
  const response = await fetch(
    `${import.meta.env.VITE_API}/api/images/${imageId}`,
    { method: "GET" }
  );

  const data: ImageDB = await response.json();

  if (data.url) {
    return data;
  }

  return { url: "", id: "", filename: "", response_id: "" };
}

/**
 * Handle the generated image
 */

export async function saveGeneratedImage(
  payload: EventMap["generatedimage"],
  book: BookDB
): Promise<{
  uploadImage: ImageDB | undefined;
  updatedBook: BookDB | undefined;
  updatedPage: PageDB | undefined;
}> {
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
      const updatedPage: PageDB = {
        ...pageToUpdate,
        image_id: uploadImage.id,
      };
      // pageToUpdate.image_id = uploadImage.id;

      const bookUpdated: BookDB = {
        ...book,
        pages: (book?.pages || []).map((p, i) => {
          return i === pageIndex ? updatedPage : p;
        }),
      };

      const updatedBook = await updateBookDB(bookUpdated, book.id);

      return {
        uploadImage,
        updatedBook,
        updatedPage,
      };
    }
  }

  return {
    uploadImage: undefined,
    updatedBook: undefined,
    updatedPage: undefined,
  };
}

export function mergeBook(
  currentBook: BookDB | undefined,
  updated: Awaited<ReturnType<typeof saveGeneratedImage>>,
  pageIndex: number
): BookDB {
  const { updatedBook, updatedPage, uploadImage } = updated;
  return {
    id: updatedBook?.id || "",
    title: updatedBook?.title || "",
    random_fact: updatedBook?.random_fact || "",
    response_id: updatedBook?.response_id || "",
    pages: (currentBook?.pages || []).map((p, i) => {
      return i === pageIndex && (updatedPage?.content || updatedPage?.synopsis)
        ? {
            synopsis: updatedPage?.synopsis,
            content: updatedPage?.content,
            image_id: updatedPage?.image_id,
            image: uploadImage,
          }
        : p;
    }),
  };
}
