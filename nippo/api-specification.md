# 営業日報システム API仕様書

## 目次

1. [API概要](#api概要)
2. [認証](#認証)
3. [共通仕様](#共通仕様)
4. [エンドポイント一覧](#エンドポイント一覧)
5. [認証API](#認証api)
6. [日報API](#日報api)
7. [訪問記録API](#訪問記録api)
8. [コメントAPI](#コメントapi)
9. [営業マスタAPI](#営業マスタapi)
10. [顧客マスタAPI](#顧客マスタapi)
11. [レポートAPI](#レポートapi)
12. [ダッシュボードAPI](#ダッシュボードapi)

---

## API概要

### ベースURL

```
# 開発環境
https://dev-api.nippo-system.example.com/api/v1

# 本番環境
https://api.nippo-system.example.com/api/v1
```

### プロトコル

- HTTPS必須
- HTTP/2対応

### データフォーマット

- リクエスト: JSON
- レスポンス: JSON
- 文字エンコーディング: UTF-8

---

## 認証

### 認証方式

JWT (JSON Web Token) ベースの認証を使用

### 認証フロー

1. ログインAPIでメールアドレス・パスワードを送信
2. アクセストークンとリフレッシュトークンを取得
3. 以降のリクエストでアクセストークンをAuthorizationヘッダーに含める
4. アクセストークン期限切れ時はリフレッシュトークンで更新

### トークン有効期限

- アクセストークン: 1時間
- リフレッシュトークン: 7日間

### Authorizationヘッダー

```
Authorization: Bearer {access_token}
```

---

## 共通仕様

### HTTPメソッド

- `GET`: リソースの取得
- `POST`: リソースの作成
- `PUT`: リソースの更新
- `DELETE`: リソースの削除

### HTTPステータスコード

| コード | 意味                  | 説明                                   |
| ------ | --------------------- | -------------------------------------- |
| 200    | OK                    | リクエスト成功                         |
| 201    | Created               | リソース作成成功                       |
| 204    | No Content            | リクエスト成功（レスポンスボディなし） |
| 400    | Bad Request           | リクエストパラメータ不正               |
| 401    | Unauthorized          | 認証エラー                             |
| 403    | Forbidden             | 権限エラー                             |
| 404    | Not Found             | リソースが存在しない                   |
| 409    | Conflict              | リソースの競合                         |
| 422    | Unprocessable Entity  | バリデーションエラー                   |
| 500    | Internal Server Error | サーバーエラー                         |

### 共通レスポンスフォーマット

#### 成功時

```json
{
  "status": "success",
  "data": {
    // レスポンスデータ
  }
}
```

#### エラー時

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": [
      {
        "field": "email",
        "message": "メールアドレスの形式が正しくありません"
      }
    ]
  }
}
```

### ページネーション

リスト取得APIでは以下のクエリパラメータを使用：

| パラメータ | 型      | デフォルト | 説明                                          |
| ---------- | ------- | ---------- | --------------------------------------------- |
| page       | integer | 1          | ページ番号                                    |
| limit      | integer | 20         | 1ページあたりの件数（最大100）                |
| sort       | string  | -          | ソート項目（例: `created_at`, `-created_at`） |

レスポンス例：

```json
{
  "status": "success",
  "data": {
    "items": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### 日時フォーマット

- ISO 8601形式: `2026-02-21T15:30:00+09:00`
- タイムゾーン: JST (UTC+9)

---

## エンドポイント一覧

### 認証

| メソッド | エンドポイント       | 説明                 | 認証 |
| -------- | -------------------- | -------------------- | ---- |
| POST     | /auth/login          | ログイン             | 不要 |
| POST     | /auth/logout         | ログアウト           | 必要 |
| POST     | /auth/refresh        | トークンリフレッシュ | 不要 |
| POST     | /auth/reset-password | パスワードリセット   | 不要 |

### 日報

| メソッド | エンドポイント       | 説明         | 認証             |
| -------- | -------------------- | ------------ | ---------------- |
| GET      | /reports             | 日報一覧取得 | 必要             |
| GET      | /reports/:id         | 日報詳細取得 | 必要             |
| POST     | /reports             | 日報作成     | 必要             |
| PUT      | /reports/:id         | 日報更新     | 必要             |
| DELETE   | /reports/:id         | 日報削除     | 必要             |
| POST     | /reports/:id/submit  | 日報提出     | 必要             |
| POST     | /reports/:id/approve | 日報承認     | 必要（上長のみ） |
| POST     | /reports/:id/reject  | 日報差し戻し | 必要（上長のみ） |

### 訪問記録

| メソッド | エンドポイント                | 説明         | 認証 |
| -------- | ----------------------------- | ------------ | ---- |
| POST     | /reports/:reportId/visits     | 訪問記録追加 | 必要 |
| PUT      | /reports/:reportId/visits/:id | 訪問記録更新 | 必要 |
| DELETE   | /reports/:reportId/visits/:id | 訪問記録削除 | 必要 |

### コメント

| メソッド | エンドポイント              | 説明             | 認証             |
| -------- | --------------------------- | ---------------- | ---------------- |
| GET      | /reports/:reportId/comments | コメント一覧取得 | 必要             |
| POST     | /reports/:reportId/comments | コメント追加     | 必要（上長のみ） |
| PUT      | /comments/:id               | コメント更新     | 必要（上長のみ） |
| DELETE   | /comments/:id               | コメント削除     | 必要（上長のみ） |

### 営業マスタ

| メソッド | エンドポイント | 説明         | 認証             |
| -------- | -------------- | ------------ | ---------------- |
| GET      | /sales         | 営業一覧取得 | 必要             |
| GET      | /sales/:id     | 営業詳細取得 | 必要             |
| POST     | /sales         | 営業作成     | 必要（上長のみ） |
| PUT      | /sales/:id     | 営業更新     | 必要（上長のみ） |
| DELETE   | /sales/:id     | 営業削除     | 必要（上長のみ） |

### 顧客マスタ

| メソッド | エンドポイント | 説明         | 認証 |
| -------- | -------------- | ------------ | ---- |
| GET      | /customers     | 顧客一覧取得 | 必要 |
| GET      | /customers/:id | 顧客詳細取得 | 必要 |
| POST     | /customers     | 顧客作成     | 必要 |
| PUT      | /customers/:id | 顧客更新     | 必要 |
| DELETE   | /customers/:id | 顧客削除     | 必要 |

### レポート

| メソッド | エンドポイント             | 説明               | 認証             |
| -------- | -------------------------- | ------------------ | ---------------- |
| GET      | /analytics/sales-summary   | 営業別サマリー     | 必要（上長のみ） |
| GET      | /analytics/visit-trends    | 訪問推移           | 必要（上長のみ） |
| GET      | /analytics/customer-visits | 顧客別訪問履歴     | 必要             |
| GET      | /analytics/export          | データエクスポート | 必要（上長のみ） |

### ダッシュボード

| メソッド | エンドポイント        | 説明               | 認証             |
| -------- | --------------------- | ------------------ | ---------------- |
| GET      | /dashboard/sales      | 営業ダッシュボード | 必要             |
| GET      | /dashboard/supervisor | 上長ダッシュボード | 必要（上長のみ） |

---

## 認証API

### POST /auth/login

ログイン認証を行い、アクセストークンを取得

#### リクエスト

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "sato@example.com",
  "password": "password123",
  "remember_me": true
}
```

#### リクエストパラメータ

| パラメータ  | 型      | 必須 | 説明                                  |
| ----------- | ------- | ---- | ------------------------------------- |
| email       | string  | ○    | メールアドレス                        |
| password    | string  | ○    | パスワード                            |
| remember_me | boolean | -    | ログイン状態保持（デフォルト: false） |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": 2,
      "name": "佐藤花子",
      "email": "sato@example.com",
      "is_supervisor": false,
      "supervisor_id": 1,
      "department": "営業部"
    }
  }
}
```

#### エラーレスポンス (401 Unauthorized)

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

---

### POST /auth/logout

ログアウト（トークンの無効化）

#### リクエスト

```http
POST /api/v1/auth/logout
Authorization: Bearer {access_token}
```

#### レスポンス (204 No Content)

```
（レスポンスボディなし）
```

---

### POST /auth/refresh

アクセストークンのリフレッシュ

#### リクエスト

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

---

### POST /auth/reset-password

パスワードリセットメールの送信

#### リクエスト

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "email": "sato@example.com"
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "message": "パスワードリセット用のメールを送信しました"
  }
}
```

---

## 日報API

### GET /reports

日報一覧を取得

#### リクエスト

```http
GET /api/v1/reports?start_date=2026-02-01&end_date=2026-02-28&status=submitted&page=1&limit=20
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ  | 型      | 必須 | 説明                                            |
| ----------- | ------- | ---- | ----------------------------------------------- |
| start_date  | date    | -    | 検索開始日（YYYY-MM-DD）                        |
| end_date    | date    | -    | 検索終了日（YYYY-MM-DD）                        |
| status      | string  | -    | ステータス（draft/submitted/approved/rejected） |
| sales_id    | integer | -    | 営業ID（上長の場合、部下の絞り込み）            |
| customer_id | integer | -    | 顧客ID                                          |
| page        | integer | -    | ページ番号（デフォルト: 1）                     |
| limit       | integer | -    | 1ページあたりの件数（デフォルト: 20）           |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "report_date": "2026-02-21",
        "status": "submitted",
        "visit_count": 3,
        "comment_count": 2,
        "problem": "新規顧客の開拓方法について",
        "plan": "ABC社との契約条件の詰め",
        "submitted_at": "2026-02-21T18:30:00+09:00",
        "approved_at": null,
        "approved_by": null,
        "created_at": "2026-02-21T17:00:00+09:00",
        "updated_at": "2026-02-21T18:30:00+09:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

---

### GET /reports/:id

日報の詳細を取得

#### リクエスト

```http
GET /api/v1/reports/1
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "sales_id": 2,
    "sales_name": "佐藤花子",
    "report_date": "2026-02-21",
    "status": "approved",
    "problem": "新規顧客の開拓方法について",
    "plan": "ABC社との契約条件の詰め\nXYZ社への契約書持参",
    "submitted_at": "2026-02-21T18:30:00+09:00",
    "approved_at": "2026-02-22T09:30:00+09:00",
    "approved_by": 1,
    "approved_by_name": "山田太郎",
    "visits": [
      {
        "id": 1,
        "customer_id": 1,
        "customer_name": "株式会社ABC",
        "visit_content": "新商品の提案を実施。好感触を得た。",
        "visit_time": "14:00",
        "display_order": 1,
        "created_at": "2026-02-21T17:00:00+09:00",
        "updated_at": "2026-02-21T17:00:00+09:00"
      },
      {
        "id": 2,
        "customer_id": 2,
        "customer_name": "有限会社XYZ",
        "visit_content": "既存契約の更新について打ち合わせ。",
        "visit_time": "16:30",
        "display_order": 2,
        "created_at": "2026-02-21T17:15:00+09:00",
        "updated_at": "2026-02-21T17:15:00+09:00"
      }
    ],
    "comments": [
      {
        "id": 1,
        "supervisor_id": 1,
        "supervisor_name": "山田太郎",
        "comment_type": "problem",
        "comment_text": "新規開拓は既存顧客からの紹介も有効です",
        "created_at": "2026-02-22T09:30:00+09:00",
        "updated_at": "2026-02-22T09:30:00+09:00"
      },
      {
        "id": 2,
        "supervisor_id": 1,
        "supervisor_name": "山田太郎",
        "comment_type": "plan",
        "comment_text": "契約条件は事前に法務と相談してください",
        "created_at": "2026-02-22T09:30:00+09:00",
        "updated_at": "2026-02-22T09:30:00+09:00"
      }
    ],
    "created_at": "2026-02-21T17:00:00+09:00",
    "updated_at": "2026-02-22T09:30:00+09:00"
  }
}
```

#### エラーレスポンス (404 Not Found)

```json
{
  "status": "error",
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "指定された日報が見つかりません"
  }
}
```

---

### POST /reports

新規日報を作成

#### リクエスト

```http
POST /api/v1/reports
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "report_date": "2026-02-21",
  "problem": "新規顧客の開拓方法について",
  "plan": "ABC社との契約条件の詰め",
  "visits": [
    {
      "customer_id": 1,
      "visit_content": "新商品の提案を実施",
      "visit_time": "14:00",
      "display_order": 1
    },
    {
      "customer_id": 2,
      "visit_content": "契約更新の打ち合わせ",
      "visit_time": "16:30",
      "display_order": 2
    }
  ]
}
```

#### リクエストパラメータ

| パラメータ             | 型      | 必須 | 説明                      |
| ---------------------- | ------- | ---- | ------------------------- |
| report_date            | date    | ○    | 日報日付（YYYY-MM-DD）    |
| problem                | string  | -    | 課題・相談（最大500文字） |
| plan                   | string  | -    | 明日の予定（最大500文字） |
| visits                 | array   | -    | 訪問記録の配列            |
| visits[].customer_id   | integer | ○    | 顧客ID                    |
| visits[].visit_content | string  | ○    | 訪問内容（最大1000文字）  |
| visits[].visit_time    | time    | -    | 訪問時間（HH:MM）         |
| visits[].display_order | integer | ○    | 表示順                    |

#### レスポンス (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "sales_id": 2,
    "report_date": "2026-02-21",
    "status": "draft",
    "problem": "新規顧客の開拓方法について",
    "plan": "ABC社との契約条件の詰め",
    "visits": [
      {
        "id": 1,
        "customer_id": 1,
        "customer_name": "株式会社ABC",
        "visit_content": "新商品の提案を実施",
        "visit_time": "14:00",
        "display_order": 1
      }
    ],
    "created_at": "2026-02-21T17:00:00+09:00",
    "updated_at": "2026-02-21T17:00:00+09:00"
  }
}
```

#### エラーレスポンス (422 Unprocessable Entity)

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容にエラーがあります",
    "details": [
      {
        "field": "report_date",
        "message": "日付を入力してください"
      },
      {
        "field": "visits[0].customer_id",
        "message": "顧客を選択してください"
      }
    ]
  }
}
```

---

### PUT /reports/:id

日報を更新（下書きのみ）

#### リクエスト

```http
PUT /api/v1/reports/1
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "problem": "新規顧客の開拓方法について（更新）",
  "plan": "ABC社との契約条件の詰め（更新）",
  "visits": [
    {
      "id": 1,
      "customer_id": 1,
      "visit_content": "新商品の提案を実施（更新）",
      "visit_time": "14:00",
      "display_order": 1
    }
  ]
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "sales_id": 2,
    "report_date": "2026-02-21",
    "status": "draft",
    "problem": "新規顧客の開拓方法について（更新）",
    "plan": "ABC社との契約条件の詰め（更新）",
    "updated_at": "2026-02-21T18:00:00+09:00"
  }
}
```

#### エラーレスポンス (403 Forbidden)

```json
{
  "status": "error",
  "error": {
    "code": "REPORT_ALREADY_SUBMITTED",
    "message": "提出済みの日報は編集できません"
  }
}
```

---

### DELETE /reports/:id

日報を削除（下書きのみ）

#### リクエスト

```http
DELETE /api/v1/reports/1
Authorization: Bearer {access_token}
```

#### レスポンス (204 No Content)

```
（レスポンスボディなし）
```

---

### POST /reports/:id/submit

日報を提出

#### リクエスト

```http
POST /api/v1/reports/1/submit
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "status": "submitted",
    "submitted_at": "2026-02-21T18:30:00+09:00"
  }
}
```

#### エラーレスポンス (422 Unprocessable Entity)

```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "訪問記録を1件以上入力してください"
  }
}
```

---

### POST /reports/:id/approve

日報を承認（上長のみ）

#### リクエスト

```http
POST /api/v1/reports/1/approve
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "comments": [
    {
      "comment_type": "problem",
      "comment_text": "新規開拓は既存顧客からの紹介も有効です"
    },
    {
      "comment_type": "general",
      "comment_text": "今日も良い活動ができていますね"
    }
  ]
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "status": "approved",
    "approved_at": "2026-02-22T09:30:00+09:00",
    "approved_by": 1
  }
}
```

---

### POST /reports/:id/reject

日報を差し戻し（上長のみ）

#### リクエスト

```http
POST /api/v1/reports/1/reject
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "comments": [
    {
      "comment_type": "general",
      "comment_text": "訪問内容をもう少し詳しく記載してください"
    }
  ]
}
```

#### リクエストパラメータ

| パラメータ              | 型     | 必須 | 説明                    |
| ----------------------- | ------ | ---- | ----------------------- |
| comments                | array  | ○    | コメント配列（最低1件） |
| comments[].comment_type | string | ○    | problem/plan/general    |
| comments[].comment_text | string | ○    | コメント内容            |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "status": "rejected",
    "updated_at": "2026-02-22T09:30:00+09:00"
  }
}
```

---

## 訪問記録API

### POST /reports/:reportId/visits

訪問記録を追加

#### リクエスト

```http
POST /api/v1/reports/1/visits
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "customer_id": 3,
  "visit_content": "見積もり提示",
  "visit_time": "10:00",
  "display_order": 3
}
```

#### レスポンス (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "report_id": 1,
    "customer_id": 3,
    "customer_name": "〇〇商事",
    "visit_content": "見積もり提示",
    "visit_time": "10:00",
    "display_order": 3,
    "created_at": "2026-02-21T18:00:00+09:00"
  }
}
```

---

### PUT /reports/:reportId/visits/:id

訪問記録を更新

#### リクエスト

```http
PUT /api/v1/reports/1/visits/3
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "visit_content": "見積もり提示と契約条件の説明",
  "visit_time": "10:30"
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "visit_content": "見積もり提示と契約条件の説明",
    "visit_time": "10:30",
    "updated_at": "2026-02-21T18:15:00+09:00"
  }
}
```

---

### DELETE /reports/:reportId/visits/:id

訪問記録を削除

#### リクエスト

```http
DELETE /api/v1/reports/1/visits/3
Authorization: Bearer {access_token}
```

#### レスポンス (204 No Content)

```
（レスポンスボディなし）
```

---

## コメントAPI

### GET /reports/:reportId/comments

日報のコメント一覧を取得

#### リクエスト

```http
GET /api/v1/reports/1/comments
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "report_id": 1,
        "supervisor_id": 1,
        "supervisor_name": "山田太郎",
        "comment_type": "problem",
        "comment_text": "新規開拓は既存顧客からの紹介も有効です",
        "created_at": "2026-02-22T09:30:00+09:00",
        "updated_at": "2026-02-22T09:30:00+09:00"
      }
    ]
  }
}
```

---

### POST /reports/:reportId/comments

コメントを追加（上長のみ）

#### リクエスト

```http
POST /api/v1/reports/1/comments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "comment_type": "general",
  "comment_text": "良い活動ができていますね"
}
```

#### レスポンス (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 3,
    "report_id": 1,
    "supervisor_id": 1,
    "comment_type": "general",
    "comment_text": "良い活動ができていますね",
    "created_at": "2026-02-22T10:00:00+09:00"
  }
}
```

---

## 営業マスタAPI

### GET /sales

営業一覧を取得

#### リクエスト

```http
GET /api/v1/sales?status=active
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ    | 型      | 必須 | 説明                          |
| ------------- | ------- | ---- | ----------------------------- |
| status        | string  | -    | ステータス（active/inactive） |
| department    | string  | -    | 部署名                        |
| is_supervisor | boolean | -    | 上長フラグ                    |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "山田太郎",
        "email": "yamada@example.com",
        "is_supervisor": true,
        "supervisor_id": null,
        "supervisor_name": null,
        "department": "営業部",
        "status": "active",
        "created_at": "2026-01-01T00:00:00+09:00",
        "updated_at": "2026-01-01T00:00:00+09:00"
      },
      {
        "id": 2,
        "name": "佐藤花子",
        "email": "sato@example.com",
        "is_supervisor": false,
        "supervisor_id": 1,
        "supervisor_name": "山田太郎",
        "department": "営業部",
        "status": "active",
        "created_at": "2026-01-01T00:00:00+09:00",
        "updated_at": "2026-01-01T00:00:00+09:00"
      }
    ]
  }
}
```

---

### GET /sales/:id

営業詳細を取得

#### リクエスト

```http
GET /api/v1/sales/2
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 2,
    "name": "佐藤花子",
    "email": "sato@example.com",
    "is_supervisor": false,
    "supervisor_id": 1,
    "supervisor_name": "山田太郎",
    "department": "営業部",
    "status": "active",
    "created_at": "2026-01-01T00:00:00+09:00",
    "updated_at": "2026-01-01T00:00:00+09:00"
  }
}
```

---

### POST /sales

営業を作成（上長のみ）

#### リクエスト

```http
POST /api/v1/sales
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "田中次郎",
  "email": "tanaka@example.com",
  "password": "password123",
  "department": "営業部",
  "supervisor_id": 1,
  "is_supervisor": false
}
```

#### レスポンス (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 4,
    "name": "田中次郎",
    "email": "tanaka@example.com",
    "is_supervisor": false,
    "supervisor_id": 1,
    "department": "営業部",
    "status": "active",
    "created_at": "2026-02-21T10:00:00+09:00"
  }
}
```

---

### PUT /sales/:id

営業情報を更新（上長のみ）

#### リクエスト

```http
PUT /api/v1/sales/4
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "田中次郎",
  "department": "営業第2部",
  "supervisor_id": 1
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 4,
    "name": "田中次郎",
    "department": "営業第2部",
    "updated_at": "2026-02-21T11:00:00+09:00"
  }
}
```

---

### DELETE /sales/:id

営業を削除（上長のみ）

#### リクエスト

```http
DELETE /api/v1/sales/4
Authorization: Bearer {access_token}
```

#### レスポンス (204 No Content)

```
（レスポンスボディなし）
```

---

## 顧客マスタAPI

### GET /customers

顧客一覧を取得

#### リクエスト

```http
GET /api/v1/customers?status=active&assigned_sales_id=2
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ        | 型      | 必須 | 説明                                    |
| ----------------- | ------- | ---- | --------------------------------------- |
| status            | string  | -    | ステータス（active/inactive/potential） |
| assigned_sales_id | integer | -    | 担当営業ID                              |
| industry          | string  | -    | 業種                                    |
| keyword           | string  | -    | 検索キーワード（顧客名・住所）          |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "customer_name": "株式会社ABC",
        "address": "東京都千代田区〇〇1-2-3",
        "phone": "03-1234-5678",
        "assigned_sales_id": 2,
        "assigned_sales_name": "佐藤花子",
        "industry": "製造業",
        "status": "active",
        "created_at": "2026-01-15T00:00:00+09:00",
        "updated_at": "2026-01-15T00:00:00+09:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 50,
      "items_per_page": 20
    }
  }
}
```

---

### GET /customers/:id

顧客詳細を取得

#### リクエスト

```http
GET /api/v1/customers/1
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "customer_name": "株式会社ABC",
    "address": "東京都千代田区〇〇1-2-3",
    "phone": "03-1234-5678",
    "assigned_sales_id": 2,
    "assigned_sales_name": "佐藤花子",
    "industry": "製造業",
    "status": "active",
    "visit_count": 8,
    "last_visit_date": "2026-02-21",
    "created_at": "2026-01-15T00:00:00+09:00",
    "updated_at": "2026-01-15T00:00:00+09:00"
  }
}
```

---

### POST /customers

顧客を作成

#### リクエスト

```http
POST /api/v1/customers
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "customer_name": "〇〇商事株式会社",
  "address": "大阪府大阪市〇〇区1-2-3",
  "phone": "06-1111-2222",
  "industry": "卸売業",
  "assigned_sales_id": 2,
  "status": "potential"
}
```

#### レスポンス (201 Created)

```json
{
  "status": "success",
  "data": {
    "id": 10,
    "customer_name": "〇〇商事株式会社",
    "address": "大阪府大阪市〇〇区1-2-3",
    "phone": "06-1111-2222",
    "industry": "卸売業",
    "assigned_sales_id": 2,
    "status": "potential",
    "created_at": "2026-02-21T12:00:00+09:00"
  }
}
```

---

### PUT /customers/:id

顧客情報を更新

#### リクエスト

```http
PUT /api/v1/customers/10
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "customer_name": "〇〇商事株式会社",
  "status": "active",
  "assigned_sales_id": 3
}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "id": 10,
    "customer_name": "〇〇商事株式会社",
    "status": "active",
    "assigned_sales_id": 3,
    "updated_at": "2026-02-21T13:00:00+09:00"
  }
}
```

---

### DELETE /customers/:id

顧客を削除

#### リクエスト

```http
DELETE /api/v1/customers/10
Authorization: Bearer {access_token}
```

#### レスポンス (204 No Content)

```
（レスポンスボディなし）
```

---

## レポートAPI

### GET /analytics/sales-summary

営業別サマリーを取得（上長のみ）

#### リクエスト

```http
GET /api/v1/analytics/sales-summary?start_date=2026-02-01&end_date=2026-02-28
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ | 型      | 必須 | 説明                   |
| ---------- | ------- | ---- | ---------------------- |
| start_date | date    | ○    | 集計開始日             |
| end_date   | date    | ○    | 集計終了日             |
| sales_id   | integer | -    | 営業ID（指定時は個別） |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "summary": [
      {
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "visit_count": 45,
        "report_submitted_count": 19,
        "report_approved_count": 19,
        "submission_rate": 95.0,
        "approval_rate": 100.0
      },
      {
        "sales_id": 3,
        "sales_name": "鈴木一郎",
        "visit_count": 52,
        "report_submitted_count": 20,
        "report_approved_count": 19,
        "submission_rate": 100.0,
        "approval_rate": 95.0
      }
    ],
    "total": {
      "visit_count": 135,
      "report_submitted_count": 55,
      "report_approved_count": 53,
      "submission_rate": 92.0,
      "approval_rate": 96.4
    }
  }
}
```

---

### GET /analytics/visit-trends

訪問推移を取得（上長のみ）

#### リクエスト

```http
GET /api/v1/analytics/visit-trends?start_date=2026-02-01&end_date=2026-02-28&interval=weekly
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ | 型      | 必須 | 説明                                                |
| ---------- | ------- | ---- | --------------------------------------------------- |
| start_date | date    | ○    | 集計開始日                                          |
| end_date   | date    | ○    | 集計終了日                                          |
| interval   | string  | -    | 集計間隔（daily/weekly/monthly、デフォルト: daily） |
| sales_id   | integer | -    | 営業ID（指定時は個別）                              |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "trends": [
      {
        "period": "2026-W08",
        "period_label": "第8週",
        "visit_count": 32,
        "sales_breakdown": [
          {
            "sales_id": 2,
            "sales_name": "佐藤花子",
            "visit_count": 12
          },
          {
            "sales_id": 3,
            "sales_name": "鈴木一郎",
            "visit_count": 20
          }
        ]
      }
    ]
  }
}
```

---

### GET /analytics/customer-visits

顧客別訪問履歴を取得

#### リクエスト

```http
GET /api/v1/analytics/customer-visits?start_date=2026-02-01&end_date=2026-02-28&limit=10
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ  | 型      | 必須 | 説明                       |
| ----------- | ------- | ---- | -------------------------- |
| start_date  | date    | ○    | 集計開始日                 |
| end_date    | date    | ○    | 集計終了日                 |
| customer_id | integer | -    | 顧客ID（指定時は個別）     |
| limit       | integer | -    | 取得件数（デフォルト: 20） |

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "items": [
      {
        "customer_id": 1,
        "customer_name": "株式会社ABC",
        "visit_count": 8,
        "last_visit_date": "2026-02-21",
        "last_visit_sales_name": "佐藤花子",
        "assigned_sales_id": 2,
        "assigned_sales_name": "佐藤花子"
      },
      {
        "customer_id": 2,
        "customer_name": "有限会社XYZ",
        "visit_count": 6,
        "last_visit_date": "2026-02-20",
        "last_visit_sales_name": "鈴木一郎",
        "assigned_sales_id": 3,
        "assigned_sales_name": "鈴木一郎"
      }
    ]
  }
}
```

---

### GET /analytics/export

データをエクスポート（上長のみ）

#### リクエスト

```http
GET /api/v1/analytics/export?start_date=2026-02-01&end_date=2026-02-28&format=csv
Authorization: Bearer {access_token}
```

#### クエリパラメータ

| パラメータ | 型      | 必須 | 説明                                       |
| ---------- | ------- | ---- | ------------------------------------------ |
| start_date | date    | ○    | 期間開始日                                 |
| end_date   | date    | ○    | 期間終了日                                 |
| format     | string  | -    | フォーマット（csv/excel、デフォルト: csv） |
| sales_id   | integer | -    | 営業ID                                     |

#### レスポンス (200 OK)

```
Content-Type: text/csv
Content-Disposition: attachment; filename="nippo_export_20260201_20260228.csv"

日付,営業名,顧客名,訪問内容,ステータス
2026-02-21,佐藤花子,株式会社ABC,新商品の提案,承認済み
...
```

---

## ダッシュボードAPI

### GET /dashboard/sales

営業担当者ダッシュボード情報を取得

#### リクエスト

```http
GET /api/v1/dashboard/sales
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "today_report": {
      "exists": true,
      "status": "draft",
      "visit_count": 2,
      "report_id": 15
    },
    "unread_comments": {
      "count": 3,
      "recent_comments": [
        {
          "report_id": 14,
          "report_date": "2026-02-20",
          "supervisor_name": "山田太郎",
          "comment_text": "良い活動ができていますね",
          "created_at": "2026-02-21T09:00:00+09:00"
        }
      ]
    },
    "weekly_summary": {
      "week_start": "2026-02-17",
      "week_end": "2026-02-21",
      "visit_count": 12,
      "submitted_reports": 4,
      "total_business_days": 5
    },
    "recent_reports": [
      {
        "id": 14,
        "report_date": "2026-02-20",
        "status": "approved",
        "visit_count": 3,
        "comment_count": 2
      }
    ]
  }
}
```

---

### GET /dashboard/supervisor

上長ダッシュボード情報を取得（上長のみ）

#### リクエスト

```http
GET /api/v1/dashboard/supervisor
Authorization: Bearer {access_token}
```

#### レスポンス (200 OK)

```json
{
  "status": "success",
  "data": {
    "pending_approvals": {
      "count": 5,
      "reports": [
        {
          "id": 20,
          "sales_id": 2,
          "sales_name": "佐藤花子",
          "report_date": "2026-02-21",
          "visit_count": 3,
          "submitted_at": "2026-02-21T18:30:00+09:00"
        }
      ]
    },
    "team_summary": {
      "week_start": "2026-02-17",
      "week_end": "2026-02-21",
      "total_visit_count": 45,
      "total_business_days": 5,
      "team_size": 3
    },
    "submission_status": [
      {
        "sales_id": 2,
        "sales_name": "佐藤花子",
        "submitted_count": 4,
        "total_days": 5,
        "submission_rate": 80.0
      },
      {
        "sales_id": 3,
        "sales_name": "鈴木一郎",
        "submitted_count": 5,
        "total_days": 5,
        "submission_rate": 100.0
      }
    ],
    "recent_activities": [
      {
        "type": "report_submitted",
        "sales_name": "佐藤花子",
        "report_date": "2026-02-21",
        "timestamp": "2026-02-21T18:30:00+09:00"
      },
      {
        "type": "report_approved",
        "sales_name": "鈴木一郎",
        "report_date": "2026-02-21",
        "timestamp": "2026-02-21T15:20:00+09:00"
      }
    ]
  }
}
```

---

## エラーコード一覧

| エラーコード             | HTTPステータス | 説明                                 |
| ------------------------ | -------------- | ------------------------------------ |
| INVALID_CREDENTIALS      | 401            | 認証情報が正しくありません           |
| TOKEN_EXPIRED            | 401            | トークンの有効期限切れ               |
| UNAUTHORIZED             | 401            | 認証が必要です                       |
| FORBIDDEN                | 403            | アクセス権限がありません             |
| NOT_FOUND                | 404            | リソースが見つかりません             |
| REPORT_NOT_FOUND         | 404            | 日報が見つかりません                 |
| CUSTOMER_NOT_FOUND       | 404            | 顧客が見つかりません                 |
| SALES_NOT_FOUND          | 404            | 営業が見つかりません                 |
| VALIDATION_ERROR         | 422            | バリデーションエラー                 |
| REPORT_ALREADY_SUBMITTED | 403            | 提出済みの日報は編集できません       |
| DUPLICATE_EMAIL          | 409            | メールアドレスが既に登録されています |
| DUPLICATE_REPORT         | 409            | 同じ日付の日報が既に存在します       |
| INTERNAL_SERVER_ERROR    | 500            | サーバーエラー                       |

---

## レート制限

### 制限値

- 認証済みユーザー: 1000リクエスト/時間
- 未認証: 100リクエスト/時間

### レスポンスヘッダー

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1645516800
```

### 制限超過時のレスポンス (429 Too Many Requests)

```json
{
  "status": "error",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "リクエスト数の上限を超えました。しばらくしてから再度お試しください",
    "retry_after": 3600
  }
}
```

---

## Webhook（将来拡張）

### 対応イベント

- `report.submitted`: 日報が提出された
- `report.approved`: 日報が承認された
- `report.rejected`: 日報が差し戻された
- `comment.created`: コメントが追加された

### Webhookペイロード例

```json
{
  "event": "report.submitted",
  "timestamp": "2026-02-21T18:30:00+09:00",
  "data": {
    "report_id": 1,
    "sales_id": 2,
    "sales_name": "佐藤花子",
    "report_date": "2026-02-21"
  }
}
```

---

## バージョニング

### バージョン管理方針

- URLパスにバージョンを含める（`/api/v1/...`）
- 破壊的変更時は新バージョンを作成
- 旧バージョンは最低6ヶ月間サポート

### 現在のバージョン

- v1: 初期リリース（2026年3月予定）

---

## サンプルコード

### JavaScript (Fetch API)

#### ログイン

```javascript
const login = async (email, password) => {
  const response = await fetch('https://api.nippo-system.example.com/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (data.status === 'success') {
    localStorage.setItem('access_token', data.data.access_token);
    localStorage.setItem('refresh_token', data.data.refresh_token);
    return data.data.user;
  } else {
    throw new Error(data.error.message);
  }
};
```

#### 日報取得

```javascript
const getReports = async (startDate, endDate) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  });

  const response = await fetch(`https://api.nippo-system.example.com/api/v1/reports?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data.data.items;
};
```

#### 日報作成

```javascript
const createReport = async (reportData) => {
  const token = localStorage.getItem('access_token');

  const response = await fetch('https://api.nippo-system.example.com/api/v1/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reportData),
  });

  const data = await response.json();

  if (data.status === 'success') {
    return data.data;
  } else {
    throw new Error(data.error.message);
  }
};
```

### Python (requests)

#### ログイン

```python
import requests

def login(email, password):
    url = 'https://api.nippo-system.example.com/api/v1/auth/login'
    payload = {
        'email': email,
        'password': password
    }

    response = requests.post(url, json=payload)
    data = response.json()

    if data['status'] == 'success':
        return data['data']
    else:
        raise Exception(data['error']['message'])
```

#### 日報取得

```python
def get_reports(access_token, start_date, end_date):
    url = 'https://api.nippo-system.example.com/api/v1/reports'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'start_date': start_date,
        'end_date': end_date
    }

    response = requests.get(url, headers=headers, params=params)
    data = response.json()

    return data['data']['items']
```

---

## 付録

### テスト環境

```
ベースURL: https://dev-api.nippo-system.example.com/api/v1
テストアカウント:
  - 営業: test-sales@example.com / password123
  - 上長: test-supervisor@example.com / password123
```

### Postmanコレクション

API仕様のPostmanコレクションを提供予定

### OpenAPI仕様書

Swagger/OpenAPI 3.0形式の仕様書を別途提供予定
