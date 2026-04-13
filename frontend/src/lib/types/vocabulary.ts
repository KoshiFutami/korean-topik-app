export type Vocabulary = {
  id: number;
  korean: string;
  japanese: string;
  level: number;
  example_sentence: string | null;
  created_at: string;
  updated_at: string;
};

export type VocabularyFormData = {
  korean: string;
  japanese: string;
  level: number;
  example_sentence?: string;
};
