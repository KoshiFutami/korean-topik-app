import { apiFetch } from "./http";

export type UserVocabulary = {
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
  /** 公開ストレージの MP3 など（未生成のときは null） */
  audio_url?: string | null;
  example_audio_url?: string | null;
};

export type UserVocabularyDetail = UserVocabulary & {
  audio_url?: string | null;
};

export async function listVocabularies(
  token: string | null,
  input: { level?: number; entry_type?: string; pos?: string; compact?: boolean; q?: string } = {}
): Promise<{ vocabularies: UserVocabulary[] }> {
  const qs = new URLSearchParams();
  if (typeof input.level === "number") qs.set("level", String(input.level));
  if (input.entry_type) qs.set("entry_type", input.entry_type);
  if (input.pos) qs.set("pos", input.pos);
  if (input.compact) qs.set("compact", "1");
  if (input.q) qs.set("q", input.q);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return apiFetch(`/api/v1/vocabularies${suffix}`, { method: "GET", token });
}

export async function getVocabulary(
  token: string | null,
  id: string
): Promise<{ vocabulary: UserVocabularyDetail }> {
  return apiFetch(`/api/v1/vocabularies/${encodeURIComponent(id)}`, { method: "GET", token });
}

export type EnsureVocabularyAudioResponse = {
  audio_url: string;
};

/** 公開語彙の音声を生成またはキャッシュから返す（認証不要） */
export async function ensureVocabularyAudio(vocabularyId: string): Promise<EnsureVocabularyAudioResponse> {
  return apiFetch(`/api/v1/vocabularies/${encodeURIComponent(vocabularyId)}/audio`, {
    method: "POST",
  });
}

export type EnsureVocabularyExampleAudioResponse = {
  example_audio_url: string;
};

/** 例文のみの音声を生成またはキャッシュから返す（認証不要） */
export async function ensureVocabularyExampleAudio(
  vocabularyId: string
): Promise<EnsureVocabularyExampleAudioResponse> {
  return apiFetch(`/api/v1/vocabularies/${encodeURIComponent(vocabularyId)}/audio/example`, {
    method: "POST",
  });
}

