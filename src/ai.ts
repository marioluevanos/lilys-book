import { BookProps, GenerateResponseOptions, ImageProps } from "./types";

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
