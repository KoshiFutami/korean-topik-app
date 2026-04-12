import { getServerApiBaseUrl } from "./server-api-base-url";

export type PlannedFeature = {
  id: string;
  title_ja: string;
  summary_ja: string | null;
  subtitle_ko: string | null;
  sort_order: number;
};

/**
 * 公開中の「Coming soon」予定機能一覧（ゲスト可・認証不要）。
 * サーバーコンポーネントから呼ぶ想定。
 */
export async function listPublishedPlannedFeatures(): Promise<PlannedFeature[]> {
  const base = getServerApiBaseUrl();
  if (!base) {
    return [];
  }
  try {
    const res = await fetch(`${base}/api/v1/planned-features`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as { planned_features?: PlannedFeature[] };
    return json.planned_features ?? [];
  } catch {
    return [];
  }
}
