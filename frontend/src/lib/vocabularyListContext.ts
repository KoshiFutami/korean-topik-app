const SESSION_KEY = "vocabularyListIds";

/**
 * 語彙一覧から詳細へ遷移する際、スワイプナビゲーション用に語彙 ID リストを保存する。
 */
export function saveVocabularyListContext(ids: string[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage が利用できない環境では無視する
  }
}

/**
 * 保存された語彙 ID リストを取得する。未保存の場合は空配列を返す。
 */
export function getVocabularyListContext(): string[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
      return parsed as string[];
    }
    return [];
  } catch {
    return [];
  }
}
