import { apiFetch } from "./http";

export type BookmarkVocabulary = {
  id: string;
  term: string;
  meaning_ja: string;
  pos: string;
  pos_label_ja: string;
  level: number;
  level_label_ja: string;
  entry_type: string;
  entry_type_label_ja: string;
  example_sentence?: string | null;
  example_translation_ja?: string | null;
  audio_url?: string | null;
  example_audio_url?: string | null;
  bookmarked_at: string;
};

export async function listBookmarks(
  token: string
): Promise<{ bookmarks: BookmarkVocabulary[] }> {
  return apiFetch("/api/v1/bookmarks", { method: "GET", token });
}

export async function addBookmark(token: string, vocabularyId: string): Promise<void> {
  await apiFetch("/api/v1/bookmarks", {
    method: "POST",
    token,
    body: JSON.stringify({ vocabulary_id: vocabularyId }),
  });
}

export async function removeBookmark(token: string, vocabularyId: string): Promise<void> {
  await apiFetch(`/api/v1/bookmarks/${encodeURIComponent(vocabularyId)}`, {
    method: "DELETE",
    token,
  });
}
