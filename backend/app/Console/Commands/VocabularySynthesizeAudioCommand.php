<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Vocabulary;
use App\Services\Vocabulary\Contracts\VocabularySpeechSynthesizerInterface;
use App\Services\Vocabulary\VocabularyTtsSourceText;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Throwable;

class VocabularySynthesizeAudioCommand extends Command
{
    protected $signature = 'vocabulary:synthesize-audio
                            {--status=published : 対象 status（published / draft / all）}
                            {--with-example : 見出し語のあとに例文も同じ音声に含める}
                            {--only-missing : audio_url が未設定の行だけ処理}
                            {--force : 既存の audio_url があっても上書き}
                            {--limit= : 処理件数の上限（検証用）}
                            {--dry-run : API を呼ばず対象件数のみ表示}';

    protected $description = 'Google Cloud Text-to-Speech で語彙の MP3 を生成し public ディスクに保存して audio_url を更新する';

    public function handle(VocabularySpeechSynthesizerInterface $synthesizer): int
    {
        $credPath = (string) (config('services.google.text_to_speech.credentials_path') ?? '');
        if ($credPath === '' || ! is_file($credPath)) {
            $this->error('GOOGLE_APPLICATION_CREDENTIALS にサービスアカウント JSON の絶対パスを設定してください（.env または実行環境）。');

            return self::FAILURE;
        }

        $query = Vocabulary::query()->orderBy('id');
        $status = (string) $this->option('status');
        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($this->option('only-missing')) {
            $query->where(function ($q): void {
                $q->whereNull('audio_url')->orWhere('audio_url', '');
            });
        }

        $includeExample = (bool) $this->option('with-example');
        $force = (bool) $this->option('force');
        $dryRun = (bool) $this->option('dry-run');
        $limit = $this->option('limit');
        $limitN = $limit !== null && $limit !== '' ? max(1, (int) $limit) : null;
        if ($limitN !== null) {
            $query->limit($limitN);
        }

        $count = (clone $query)->count();
        $this->info("対象件数: {$count}");

        if ($dryRun) {
            $this->comment('dry-run のため API は呼び出しません。');

            return self::SUCCESS;
        }

        $relativePrefix = 'vocabulary-audio';
        $processed = 0;
        $failed = 0;

        $query->chunkById(25, function ($rows) use (
            $synthesizer,
            $includeExample,
            $force,
            $relativePrefix,
            &$processed,
            &$failed
        ): void {
            foreach ($rows as $vocabulary) {
                /** @var Vocabulary $vocabulary */
                if (! $force && $vocabulary->audio_url !== null && $vocabulary->audio_url !== '') {
                    continue;
                }

                $text = VocabularyTtsSourceText::build($vocabulary, $includeExample);
                if ($text === '') {
                    $this->warn("スキップ (空テキスト): id={$vocabulary->id}");

                    continue;
                }

                try {
                    $binary = $synthesizer->synthesizeKoreanToMp3($text);
                } catch (Throwable $e) {
                    $this->error("失敗 id={$vocabulary->id}: {$e->getMessage()}");
                    $failed++;

                    continue;
                }

                if ($binary === '') {
                    $this->error("空の音声 id={$vocabulary->id}");
                    $failed++;

                    continue;
                }

                $relativePath = "{$relativePrefix}/{$vocabulary->id}.mp3";
                Storage::disk('public')->put($relativePath, $binary, 'public');
                $vocabulary->audio_url = $relativePath;
                $vocabulary->save();
                $processed++;
                $this->line('OK id='.$vocabulary->id.' bytes='.strlen($binary));
            }
        });

        $this->info("完了: 成功 {$processed} 件, 失敗 {$failed} 件");
        $this->comment('ブラウザから /storage/... で配信するには `php artisan storage:link` が必要です。');

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}
