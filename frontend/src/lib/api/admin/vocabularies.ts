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
  example_audio_url?: string | null;
  status?: string;
  status_label_ja?: string;
  created_at?: string;
};

export async function listAdminVocabularies(
  token: string
): Promise<{ vocabularies: AdminVocabulary[] }> {
  return apiFetch("/api/v1/admin/vocabularies", { method: "GET", token });
}

export async function getAdminVocabulary(
  token: string,
  id: string
): Promise<{ vocabulary: AdminVocabulary }> {
  return apiFetch(`/api/v1/admin/vocabularies/${encodeURIComponent(id)}`, {
    method: "GET",
    token,
  });
}

export async function ensureAdminVocabularyAudio(
  token: string,
  vocabularyId: string
): Promise<{ audio_url: string }> {
  return apiFetch(`/api/v1/admin/vocabularies/${encodeURIComponent(vocabularyId)}/audio`, {
    method: "POST",
    token,
  });
}

export async function ensureAdminVocabularyExampleAudio(
  token: string,
  vocabularyId: string
): Promise<{ example_audio_url: string }> {
  return apiFetch(`/api/v1/admin/vocabularies/${encodeURIComponent(vocabularyId)}/audio/example`, {
    method: "POST",
    token,
  });
}

export type VocabularyFormData = {
  term: string;
  meaning_ja: string;
  pos: string;
  level: number;
  entry_type: string;
  example_sentence?: string | null;
  example_translation_ja?: string | null;
  audio_url?: string | null;
  example_audio_url?: string | null;
  status: string;
};

export async function createAdminVocabulary(
  token: string,
  data: VocabularyFormData
): Promise<{ vocabulary: AdminVocabulary }> {
  return apiFetch("/api/v1/admin/vocabularies", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function updateAdminVocabulary(
  token: string,
  id: string,
  data: VocabularyFormData
): Promise<{ vocabulary: AdminVocabulary }> {
  return apiFetch(`/api/v1/admin/vocabularies/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteAdminVocabulary(token: string, id: string): Promise<void> {
  return apiFetch(`/api/v1/admin/vocabularies/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}

