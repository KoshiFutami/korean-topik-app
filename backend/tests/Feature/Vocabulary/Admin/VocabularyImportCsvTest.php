<?php

namespace Tests\Feature\Vocabulary\Admin;

use App\Models\Admin;
use App\Models\Vocabulary;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class VocabularyImportCsvTest extends TestCase
{
    private function authHeader(): array
    {
        $admin = Admin::query()->create([
            'name' => 'Admin',
            'email' => 'admin-import@example.com',
            'password' => Hash::make('password123'),
        ]);

        $token = $admin->createToken('admin')->plainTextToken;

        return ['Authorization' => "Bearer {$token}"];
    }

    private function makeCsv(string $content): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('vocab.csv', $content);
    }

    public function test_import_creates_new_vocabularies(): void
    {
        $csv = "term,meaning_ja,pos,level,entry_type\n";
        $csv .= "먹다,食べる,verb,1,word\n";
        $csv .= "마시다,飲む,verb,1,word\n";

        $res = $this->postJson(
            '/api/v1/admin/vocabularies/import',
            ['file' => $this->makeCsv($csv)],
            $this->authHeader(),
        );

        $res->assertOk();
        $res->assertJson(['created' => 2, 'updated' => 0]);
        $this->assertDatabaseHas('vocabularies', ['term' => '먹다', 'meaning_ja' => '食べる']);
        $this->assertDatabaseHas('vocabularies', ['term' => '마시다', 'meaning_ja' => '飲む']);
    }

    public function test_import_updates_existing_vocabulary(): void
    {
        Vocabulary::query()->create([
            'term' => '가다',
            'meaning_ja' => '行く',
            'pos' => 'verb',
            'level' => 1,
            'entry_type' => 'word',
            'status' => 'published',
        ]);

        $csv = "term,meaning_ja,pos,level,entry_type\n";
        $csv .= "가다,行く,verb,2,word\n";

        $res = $this->postJson(
            '/api/v1/admin/vocabularies/import',
            ['file' => $this->makeCsv($csv)],
            $this->authHeader(),
        );

        $res->assertOk();
        $res->assertJson(['created' => 0, 'updated' => 1]);
        $this->assertDatabaseHas('vocabularies', ['term' => '가다', 'level' => 2]);
    }

    public function test_import_handles_bom_and_header(): void
    {
        $csv = "\xEF\xBB\xBFterm,meaning_ja,pos,level,entry_type\n";
        $csv .= "오다,来る,verb,1,word\n";

        $res = $this->postJson(
            '/api/v1/admin/vocabularies/import',
            ['file' => $this->makeCsv($csv)],
            $this->authHeader(),
        );

        $res->assertOk();
        $res->assertJson(['created' => 1, 'updated' => 0]);
    }

    public function test_import_returns_422_for_invalid_pos(): void
    {
        $csv = "term,meaning_ja,pos,level,entry_type\n";
        $csv .= "테스트,テスト,invalid_pos,1,word\n";

        $res = $this->postJson(
            '/api/v1/admin/vocabularies/import',
            ['file' => $this->makeCsv($csv)],
            $this->authHeader(),
        );

        $res->assertStatus(422);
    }

    public function test_import_returns_422_for_empty_file(): void
    {
        $csv = "term,meaning_ja,pos,level,entry_type\n";

        $res = $this->postJson(
            '/api/v1/admin/vocabularies/import',
            ['file' => $this->makeCsv($csv)],
            $this->authHeader(),
        );

        $res->assertStatus(422);
        $res->assertJson(['message' => 'インポートするデータがありません。']);
    }

    public function test_import_returns_401_for_unauthenticated(): void
    {
        $csv = "term,meaning_ja,pos,level,entry_type\n먹다,食べる,verb,1,word\n";

        $res = $this->postJson('/api/v1/admin/vocabularies/import', [
            'file' => $this->makeCsv($csv),
        ]);

        $res->assertStatus(401);
    }
}
