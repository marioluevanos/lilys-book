import {
  BookDB,
  BookProps,
  GenerateResponseOptions,
  ImageDB,
  ImageProps,
} from "./types";

export async function aiGenerateImage(
  args: GenerateResponseOptions
): Promise<ImageProps & { error?: unknown }> {
  const response = await fetch(`${import.meta.env.VITE_API}/api/ai`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...args,
      as_image: true,
    }),
  });

  if (response.ok) {
    return response.json();
  }

  return {
    url: "",
    response_id: "",
  };
}

/**
 * Generate a book with AI. Handles the prompt engineering and book creation.
 * @param prompt The engineered prompt
 */
export async function aiGenerateBook(
  args: GenerateResponseOptions
): Promise<(BookProps & { response_id: string }) | undefined> {
  const response = await fetch(`${import.meta.env.VITE_API}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });

  if (response.ok) {
    return response.json();
  }
}

export async function getBooksPreviewDB(): Promise<BookDB[] | undefined> {
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
