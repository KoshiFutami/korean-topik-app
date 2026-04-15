import { apiFetch } from "../http";

export type AdminQuestionOption = {
  option_number: number;
  text: string;
  text_ja: string | null;
  is_correct: boolean;
};

export type AdminQuestion = {
  id: string;
  level: number;
  level_label_ja: string;
  question_type: string;
  question_type_label_ja: string;
  question_text: string;
  question_text_ja: string | null;
  explanation_ja: string | null;
  status: string;
  status_label_ja: string;
  options: AdminQuestionOption[];
  correct_option_number: number;
  created_at: string;
};

export type QuestionOptionFormData = {
  option_number: number;
  text: string;
  text_ja: string | null;
  is_correct: boolean;
};

export type QuestionFormData = {
  level: number;
  question_type: string;
  question_text: string;
  question_text_ja: string | null;
  explanation_ja: string | null;
  status: string;
  options: QuestionOptionFormData[];
};

export async function listAdminQuestions(
  token: string
): Promise<{ questions: AdminQuestion[] }> {
  return apiFetch("/api/v1/admin/questions", { method: "GET", token });
}

export async function getAdminQuestion(
  token: string,
  id: string
): Promise<{ question: AdminQuestion }> {
  return apiFetch(`/api/v1/admin/questions/${encodeURIComponent(id)}`, {
    method: "GET",
    token,
  });
}

export async function createAdminQuestion(
  token: string,
  data: QuestionFormData
): Promise<{ question: AdminQuestion }> {
  return apiFetch("/api/v1/admin/questions", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function updateAdminQuestion(
  token: string,
  id: string,
  data: QuestionFormData
): Promise<{ question: AdminQuestion }> {
  return apiFetch(`/api/v1/admin/questions/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

export async function deleteAdminQuestion(token: string, id: string): Promise<void> {
  return apiFetch(`/api/v1/admin/questions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    token,
  });
}
