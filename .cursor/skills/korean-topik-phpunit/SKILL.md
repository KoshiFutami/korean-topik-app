---
name: korean-topik-phpunit
description: korean-topik-app の PHPUnit / Laravel テスト規約。命名・Feature/Unit・APIテスト・DBテストの実践ルール。
---

# korean-topik-app PHPUnit スキル

## いつ使うか

- `backend/tests/` のテストを新規追加・修正するとき
- API テストの書き方を揃えたいとき
- バグ修正時に再発防止テストを追加するとき

## 基本方針

- テストは **振る舞い** を検証する（実装詳細への過剰依存を避ける）
- 1 テスト 1 意図。失敗理由がすぐ分かる粒度に分ける
- `Feature` テスト（HTTP 層）を優先し、ユニットテストは複雑なロジックに絞る

## ディレクトリ構成

```
backend/tests/
├── Feature/          # HTTPリクエストを通じたエンドツーエンドテスト
│   └── Api/V1/       # API エンドポイントのテスト
└── Unit/             # Service・モデルの単体テスト
```

## 命名ルール

- ファイル名: `<対象>Test.php`
- メソッド名: `test_<条件>_<期待結果>` または `it_<期待する振る舞い>`
  - 例: `test_post_vocabulary_with_invalid_data_returns_422`
  - 例: `it_returns_vocabulary_list_when_authenticated`

## テスト構造（AAA）

```php
public function test_create_vocabulary_returns_201(): void
{
    // Arrange
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    // Act
    $response = $this->withToken($token)
        ->postJson('/api/v1/vocabulary', [
            'korean' => '안녕하세요',
            'japanese' => 'こんにちは',
            'level' => 1,
        ]);

    // Assert
    $response->assertStatus(201)
             ->assertJsonFragment(['korean' => '안녕하세요']);
    $this->assertDatabaseHas('vocabulary', ['korean' => '안녕하세요']);
}
```

## Laravel テストのポイント

- DB を触るテストは `RefreshDatabase` トレイトを使う（テスト後にロールバック）
- 認証が必要な API は `$this->withToken($token)` または `$this->actingAs($user)`
- Factory でテストデータを生成する: `User::factory()->create()`
- 時刻固定: `Carbon::setTestNow('2024-01-01 00:00:00')`（テスト後に `Carbon::setTestNow(null)`）

## API テストの作法

```php
// JSON POST
$response = $this->postJson('/api/v1/vocabulary', $data);

// 認証付き
$response = $this->actingAs($user)->getJson('/api/v1/vocabulary');

// よく使うアサーション
$response->assertStatus(200);
$response->assertOk();
$response->assertCreated();     // 201
$response->assertUnprocessable(); // 422
$response->assertUnauthorized(); // 401
$response->assertForbidden();    // 403
$response->assertJsonStructure(['data' => ['id', 'korean', 'japanese']]);
$response->assertJsonFragment(['korean' => '안녕하세요']);
$this->assertDatabaseHas('vocabulary', ['korean' => '안녕하세요']);
$this->assertDatabaseMissing('vocabulary', ['id' => $id]);
```

## Mock / Fake の目安

- 外部 API 呼び出しは `Http::fake()` でモック
- メール送信は `Mail::fake()` でモック
- キュー・イベントは `Queue::fake()` / `Event::fake()`
- DB アクセスは原則 **実 DB（RefreshDatabase）を使う**

## 避けること

- 実装内部（private メソッド）を直接テストする
- 1 テストメソッドで複数のシナリオをまとめる
- 非決定的な値（`now()` 等）をそのままアサートする
- `vendor/` のコードをテストする

## 最低テスト観点（PR 時）

- 機能追加: 正常系 + 代表的な異常系（バリデーションエラー等）
- バグ修正: 再現テスト → 修正後に成功するテスト
- バリデーション変更: 境界値 / 不正値

## 実行コマンド

```bash
make test
# または特定のテストのみ
make test-filter FILTER=VocabularyTest
# Docker 内で直接
docker compose exec backend php artisan test --parallel
```

CI は `.github/workflows/backend-tests.yml` で `php artisan test --parallel` を実行。

## レビュー時チェックリスト

- [ ] テスト名で意図が分かる
- [ ] DB 操作を含むテストに `RefreshDatabase` が付いている
- [ ] API エラー時に適切なステータスコードを検証している
- [ ] 変更の主目的に対して正常系と異常系のどちらかが欠けていない
- [ ] テストが順序依存・時刻依存になっていない
