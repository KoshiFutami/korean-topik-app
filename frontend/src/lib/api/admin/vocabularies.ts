import { apiFetch } from "../http";

export type AdminVocabulary = {
  id: string;
  term: string;
  meaning_ja: string;
  pos: string;
  pos_label_ja?: string;
  level: number;
  level_label_ja?: string;
  entry_type: string;
  entry_type_label_ja?: string;
  example_sentence?: string | null;
  example_translation_ja?: string | null;
  audio_url?: string | null;
  status?: string;
};

export async function listAdminVocabularies(
  token: string
): Promise<{ vocabularies: AdminVocabulary[] }> {
  return apiFetch("/api/v1/admin/vocabularies", { method: "GET", token });
}

