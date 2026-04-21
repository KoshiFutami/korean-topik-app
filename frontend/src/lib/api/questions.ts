import { apiFetch } from "./http";

export type QuestionOption = {
  option_number: number;
  text: string;
  text_ja: string | null;
};

export type TopikQuestion = {
  id: string;
  level: number;
  level_label_ja: string;
  question_type: string;
  question_type_label_ja: string;
  question_text: string;
  question_text_ja: string | null;
  question_text_ja_filled: string | null;
  explanation_ja: string | null;
  options: QuestionOption[];
  correct_option_number: number;
};

export async function listQuestions(
  input: { level?: number; type?: string } = {}
): Promise<{ questions: TopikQuestion[] }> {
  const qs = new URLSearchParams();
  if (typeof input.level === "number") qs.set("level", String(input.level));
  if (input.type) qs.set("type", input.type);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  return apiFetch(`/api/v1/questions${suffix}`, { method: "GET" });
}
