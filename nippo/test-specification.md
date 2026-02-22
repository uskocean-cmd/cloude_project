# 営業日報システム テスト仕様書

## 目次

1. [テスト計画](#テスト計画)
2. [テスト方針](#テスト方針)
3. [テスト環境](#テスト環境)
4. [テストツール](#テストツール)
5. [単体テスト](#単体テスト)
6. [統合テスト](#統合テスト)
7. [E2Eテスト](#e2eテスト)
8. [APIテスト](#apiテスト)
9. [性能テスト](#性能テスト)
10. [セキュリティテスト](#セキュリティテスト)
11. [テストデータ](#テストデータ)
12. [テスト実施スケジュール](#テスト実施スケジュール)

---

## テスト計画

### 目的

営業日報システムの品質を保証し、要件定義書に記載された機能が正しく動作することを検証する。

### スコープ

#### テスト対象

- フロントエンド（React/Next.js）
- バックエンドAPI（Node.js/Express）
- データベース（PostgreSQL）
- 認証・認可機能
- ビジネスロジック

#### テスト対象外

- インフラストラクチャ（初期フェーズ）
- サードパーティライブラリの内部動作

### テスト品質目標

| 指標                                 | 目標値          |
| ------------------------------------ | --------------- |
| コードカバレッジ（全体）             | 80%以上         |
| コードカバレッジ（ビジネスロジック） | 90%以上         |
| クリティカルバグ                     | 0件             |
| メジャーバグ                         | リリース前に0件 |
| 性能要件達成率                       | 100%            |

---

## テスト方針

### テストピラミッド戦略

```
        ┌─────────┐
        │  E2E    │  少数（10-20件）
        │  テスト  │  主要フロー
        ├─────────┤
        │  統合    │  中程度（50-100件）
        │  テスト  │  API、DB連携
        ├─────────┤
        │  単体    │  多数（200-300件）
        │  テスト  │  関数、コンポーネント
        └─────────┘
```

### テスト駆動開発（TDD）原則

#### Red-Green-Refactorサイクルの徹底

1. **Red**: まずテストを書き、失敗することを確認
2. **Green**: テストが通る最小限の実装
3. **Refactor**: コードをリファクタリング

#### テストコード品質基準

**✅ 必須事項**

- テストは実装の機能を検証すること
- 各テストは具体的な入力と期待される出力を検証すること
- テストケース名は何をテストしているのか明確に記述すること
- 境界値、異常系、エラーケースも必ずテストに含めること

**❌ 禁止事項**

- `expect(true).toBe(true)`のような意味のないアサーション
- テストを通すためだけのハードコーディング
- 本番コードに`if(testMode)`のような条件分岐
- テスト用のマジックナンバーを本番コードに埋め込む
- 環境変数を使わずにテスト環境と本番環境を混在させる

### AAA（Arrange-Act-Assert）パターン

すべてのテストは以下の3段階で構成：

```javascript
test('日報を作成できる', async () => {
  // Arrange: テストデータの準備
  const reportData = {
    report_date: '2026-02-21',
    problem: 'テスト課題',
    plan: 'テスト予定',
    visits: [{ customer_id: 1, visit_content: 'テスト訪問', display_order: 1 }],
  };

  // Act: 実際の処理を実行
  const result = await createReport(reportData);

  // Assert: 結果を検証
  expect(result.status).toBe('draft');
  expect(result.visits).toHaveLength(1);
  expect(result.problem).toBe('テスト課題');
});
```

---

## テスト環境

### 環境構成

| 環境         | 用途                         | URL                                  |
| ------------ | ---------------------------- | ------------------------------------ |
| ローカル     | 開発者の手元での開発・テスト | http://localhost:3000                |
| CI/CD        | 自動テスト実行               | GitHub Actions                       |
| ステージング | 本番リリース前の最終確認     | https://stg.nippo-system.example.com |
| 本番         | 実運用                       | https://nippo-system.example.com     |

### テストデータベース

- 各開発者がローカルにPostgreSQLを構築
- CI/CD環境ではDockerコンテナでPostgreSQLを起動
- テストデータはシードスクリプトで自動投入

### テスト実行環境変数

```bash
# .env.test
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/nippo_test
JWT_SECRET=test_secret_key_do_not_use_in_production
API_BASE_URL=http://localhost:3001/api/v1
```

---

## テストツール

### フロントエンド

| ツール                    | 用途                 | バージョン |
| ------------------------- | -------------------- | ---------- |
| Vitest                    | 単体テスト           | ^2.0.0     |
| React Testing Library     | コンポーネントテスト | ^14.0.0    |
| Playwright                | E2Eテスト            | ^1.40.0    |
| MSW (Mock Service Worker) | APIモック            | ^2.0.0     |

### バックエンド

| ツール    | 用途             | バージョン |
| --------- | ---------------- | ---------- |
| Jest      | 単体・統合テスト | ^29.0.0    |
| Supertest | APIテスト        | ^6.3.0     |
| Faker.js  | テストデータ生成 | ^8.0.0     |

### 共通

| ツール   | 用途               | バージョン |
| -------- | ------------------ | ---------- |
| ESLint   | 静的解析           | ^8.0.0     |
| Prettier | コードフォーマット | ^3.0.0     |
| Codecov  | カバレッジ計測     | -          |

---

## 単体テスト

### フロントエンド単体テスト

#### コンポーネントテスト

**対象**: React コンポーネント

**テストケース例: DailyReportForm.test.tsx**

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import DailyReportForm from './DailyReportForm';

describe('DailyReportForm', () => {
  test('初期表示時に日付が今日の日付になっている', () => {
    render(<DailyReportForm />);

    const dateInput = screen.getByLabelText('日付');
    const today = new Date().toISOString().split('T')[0];

    expect(dateInput).toHaveValue(today);
  });

  test('訪問記録を追加できる', async () => {
    render(<DailyReportForm />);

    const addButton = screen.getByRole('button', { name: '訪問記録を追加' });
    fireEvent.click(addButton);

    await waitFor(() => {
      const visitForms = screen.getAllByTestId('visit-record-form');
      expect(visitForms).toHaveLength(1);
    });
  });

  test('顧客が未選択の場合、エラーメッセージが表示される', async () => {
    const onSubmit = vi.fn();
    render(<DailyReportForm onSubmit={onSubmit} />);

    const submitButton = screen.getByRole('button', { name: '提出' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('顧客を選択してください')).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  test('訪問内容が1000文字を超える場合、エラーメッセージが表示される', async () => {
    render(<DailyReportForm />);

    const visitContent = screen.getByLabelText('訪問内容');
    const longText = 'あ'.repeat(1001);

    fireEvent.change(visitContent, { target: { value: longText } });
    fireEvent.blur(visitContent);

    await waitFor(() => {
      expect(screen.getByText('訪問内容は1000文字以内で入力してください')).toBeInTheDocument();
    });
  });

  test('必須項目を入力して提出できる', async () => {
    const onSubmit = vi.fn();
    render(<DailyReportForm onSubmit={onSubmit} />);

    // 訪問記録を追加
    fireEvent.click(screen.getByRole('button', { name: '訪問記録を追加' }));

    // 顧客選択
    const customerSelect = screen.getByLabelText('顧客');
    fireEvent.change(customerSelect, { target: { value: '1' } });

    // 訪問内容入力
    const visitContent = screen.getByLabelText('訪問内容');
    fireEvent.change(visitContent, { target: { value: '新商品の提案' } });

    // 提出
    fireEvent.click(screen.getByRole('button', { name: '提出' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          visits: expect.arrayContaining([
            expect.objectContaining({
              customer_id: 1,
              visit_content: '新商品の提案'
            })
          ])
        })
      );
    });
  });
});
```

#### ユーティリティ関数テスト

**テストケース例: dateUtils.test.ts**

```typescript
import { describe, test, expect } from 'vitest';
import { formatDate, isBusinessDay, getWeekRange } from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    test('日付を YYYY-MM-DD 形式にフォーマットできる', () => {
      const date = new Date('2026-02-21T15:30:00+09:00');
      expect(formatDate(date)).toBe('2026-02-21');
    });

    test('nullの場合は空文字を返す', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('isBusinessDay', () => {
    test('平日はtrueを返す', () => {
      const monday = new Date('2026-02-23'); // 月曜日
      expect(isBusinessDay(monday)).toBe(true);
    });

    test('土曜日はfalseを返す', () => {
      const saturday = new Date('2026-02-21'); // 土曜日
      expect(isBusinessDay(saturday)).toBe(false);
    });

    test('日曜日はfalseを返す', () => {
      const sunday = new Date('2026-02-22'); // 日曜日
      expect(isBusinessDay(sunday)).toBe(false);
    });
  });

  describe('getWeekRange', () => {
    test('指定した日付を含む週の範囲を取得できる', () => {
      const date = new Date('2026-02-25'); // 水曜日
      const range = getWeekRange(date);

      expect(range.start).toEqual(new Date('2026-02-23')); // 月曜日
      expect(range.end).toEqual(new Date('2026-02-27')); // 金曜日
    });
  });
});
```

### バックエンド単体テスト

#### ビジネスロジックテスト

**テストケース例: reportService.test.js**

```javascript
const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const reportService = require('./reportService');
const db = require('../database');

describe('ReportService', () => {
  beforeEach(async () => {
    // テストデータの準備
    await db.query('BEGIN');
    await db.seed.run();
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await db.query('ROLLBACK');
  });

  describe('createReport', () => {
    test('正常に日報を作成できる', async () => {
      const reportData = {
        sales_id: 1,
        report_date: '2026-02-21',
        problem: 'テスト課題',
        plan: 'テスト予定',
        visits: [
          {
            customer_id: 1,
            visit_content: 'テスト訪問',
            visit_time: '14:00',
            display_order: 1,
          },
        ],
      };

      const result = await reportService.createReport(reportData);

      expect(result).toHaveProperty('id');
      expect(result.status).toBe('draft');
      expect(result.sales_id).toBe(1);
      expect(result.visits).toHaveLength(1);
    });

    test('同じ日付の日報が既に存在する場合、エラーを返す', async () => {
      const reportData = {
        sales_id: 1,
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [],
      };

      // 1回目の作成
      await reportService.createReport(reportData);

      // 2回目の作成（重複）
      await expect(reportService.createReport(reportData)).rejects.toThrow(
        '同じ日付の日報が既に存在します'
      );
    });

    test('未来日の日報は作成できない', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const reportData = {
        sales_id: 1,
        report_date: futureDate.toISOString().split('T')[0],
        problem: '課題',
        plan: '予定',
        visits: [],
      };

      await expect(reportService.createReport(reportData)).rejects.toThrow(
        '未来日の日報は作成できません'
      );
    });
  });

  describe('submitReport', () => {
    test('訪問記録が1件以上あれば提出できる', async () => {
      // 下書き日報を作成
      const report = await reportService.createReport({
        sales_id: 1,
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [{ customer_id: 1, visit_content: '訪問', display_order: 1 }],
      });

      const result = await reportService.submitReport(report.id, 1);

      expect(result.status).toBe('submitted');
      expect(result.submitted_at).toBeDefined();
    });

    test('訪問記録が0件の場合、提出できない', async () => {
      const report = await reportService.createReport({
        sales_id: 1,
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [],
      });

      await expect(reportService.submitReport(report.id, 1)).rejects.toThrow(
        '訪問記録を1件以上入力してください'
      );
    });

    test('提出済みの日報は再提出できない', async () => {
      const report = await reportService.createReport({
        sales_id: 1,
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [{ customer_id: 1, visit_content: '訪問', display_order: 1 }],
      });

      // 1回目の提出
      await reportService.submitReport(report.id, 1);

      // 2回目の提出（エラー）
      await expect(reportService.submitReport(report.id, 1)).rejects.toThrow('既に提出済みです');
    });
  });

  describe('approveReport', () => {
    test('上長が日報を承認できる', async () => {
      // 提出済み日報を作成
      const report = await createSubmittedReport();

      const result = await reportService.approveReport(report.id, 2); // 上長ID: 2

      expect(result.status).toBe('approved');
      expect(result.approved_by).toBe(2);
      expect(result.approved_at).toBeDefined();
    });

    test('自分の部下以外の日報は承認できない', async () => {
      const report = await createSubmittedReport();

      await expect(reportService.approveReport(report.id, 999)) // 他部署の上長
        .rejects.toThrow('この日報を承認する権限がありません');
    });

    test('下書き状態の日報は承認できない', async () => {
      const report = await reportService.createReport({
        sales_id: 1,
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [{ customer_id: 1, visit_content: '訪問', display_order: 1 }],
      });

      await expect(reportService.approveReport(report.id, 2)).rejects.toThrow(
        '下書き状態の日報は承認できません'
      );
    });
  });
});
```

#### バリデーションテスト

**テストケース例: reportValidator.test.js**

```javascript
const { describe, test, expect } = require('@jest/globals');
const { validateReportData, validateVisitRecord } = require('./validators');

describe('ReportValidator', () => {
  describe('validateReportData', () => {
    test('正常なデータはバリデーションを通過する', () => {
      const data = {
        report_date: '2026-02-21',
        problem: '課題',
        plan: '予定',
        visits: [
          {
            customer_id: 1,
            visit_content: '訪問内容',
            display_order: 1,
          },
        ],
      };

      const result = validateReportData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('日付が未入力の場合、エラーを返す', () => {
      const data = {
        problem: '課題',
        plan: '予定',
        visits: [],
      };

      const result = validateReportData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'report_date',
        message: '日付を入力してください',
      });
    });

    test('Problemが500文字を超える場合、エラーを返す', () => {
      const data = {
        report_date: '2026-02-21',
        problem: 'あ'.repeat(501),
        plan: '予定',
        visits: [],
      };

      const result = validateReportData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'problem',
        message: '課題は500文字以内で入力してください',
      });
    });
  });

  describe('validateVisitRecord', () => {
    test('正常な訪問記録はバリデーションを通過する', () => {
      const data = {
        customer_id: 1,
        visit_content: '訪問内容',
        visit_time: '14:00',
        display_order: 1,
      };

      const result = validateVisitRecord(data);
      expect(result.isValid).toBe(true);
    });

    test('顧客IDが未指定の場合、エラーを返す', () => {
      const data = {
        visit_content: '訪問内容',
        display_order: 1,
      };

      const result = validateVisitRecord(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'customer_id',
        message: '顧客を選択してください',
      });
    });

    test('訪問内容が1000文字を超える場合、エラーを返す', () => {
      const data = {
        customer_id: 1,
        visit_content: 'あ'.repeat(1001),
        display_order: 1,
      };

      const result = validateVisitRecord(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'visit_content',
        message: '訪問内容は1000文字以内で入力してください',
      });
    });

    test('訪問時間の形式が不正な場合、エラーを返す', () => {
      const data = {
        customer_id: 1,
        visit_content: '訪問内容',
        visit_time: '25:00', // 不正な時間
        display_order: 1,
      };

      const result = validateVisitRecord(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'visit_time',
        message: '正しい時間を入力してください（HH:MM形式）',
      });
    });
  });
});
```

---

## 統合テスト

### API統合テスト

**テストケース例: reportAPI.integration.test.js**

```javascript
const request = require('supertest');
const app = require('../app');
const db = require('../database');

describe('Report API Integration Tests', () => {
  let authToken;
  let salesId;

  beforeAll(async () => {
    // テストデータベースの初期化
    await db.migrate.latest();
    await db.seed.run();

    // ログインしてトークン取得
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'test-sales@example.com',
      password: 'password123',
    });

    authToken = loginRes.body.data.access_token;
    salesId = loginRes.body.data.user.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('POST /api/v1/reports', () => {
    test('認証済みユーザーは日報を作成できる', async () => {
      const reportData = {
        report_date: '2026-02-21',
        problem: '新規顧客の開拓方法について',
        plan: 'ABC社との契約条件の詰め',
        visits: [
          {
            customer_id: 1,
            visit_content: '新商品の提案を実施',
            visit_time: '14:00',
            display_order: 1,
          },
        ],
      };

      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportData)
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.visits).toHaveLength(1);
    });

    test('認証なしではアクセスできない', async () => {
      const res = await request(app).post('/api/v1/reports').send({}).expect(401);

      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    test('バリデーションエラーが発生する', async () => {
      const invalidData = {
        report_date: '2026-02-21',
        problem: 'あ'.repeat(501), // 500文字超過
        visits: [],
      };

      const res = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(422);

      expect(res.body.status).toBe('error');
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toContainEqual({
        field: 'problem',
        message: '課題は500文字以内で入力してください',
      });
    });
  });

  describe('POST /api/v1/reports/:id/submit', () => {
    test('訪問記録がある日報を提出できる', async () => {
      // 日報作成
      const createRes = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          report_date: '2026-02-21',
          problem: '課題',
          plan: '予定',
          visits: [{ customer_id: 1, visit_content: '訪問', display_order: 1 }],
        });

      const reportId = createRes.body.data.id;

      // 提出
      const submitRes = await request(app)
        .post(`/api/v1/reports/${reportId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(submitRes.body.data.status).toBe('submitted');
      expect(submitRes.body.data.submitted_at).toBeDefined();
    });

    test('訪問記録がない日報は提出できない', async () => {
      // 訪問記録なしの日報作成
      const createRes = await request(app)
        .post('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          report_date: '2026-02-22',
          problem: '課題',
          plan: '予定',
          visits: [],
        });

      const reportId = createRes.body.data.id;

      // 提出（エラー）
      const submitRes = await request(app)
        .post(`/api/v1/reports/${reportId}/submit`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(422);

      expect(submitRes.body.error.message).toContain('訪問記録を1件以上');
    });
  });

  describe('GET /api/v1/reports', () => {
    test('日報一覧を取得できる', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          start_date: '2026-02-01',
          end_date: '2026-02-28',
        })
        .expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    test('ページネーションが正しく動作する', async () => {
      const res = await request(app)
        .get('/api/v1/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          page: 2,
          limit: 10,
        })
        .expect(200);

      expect(res.body.data.pagination.current_page).toBe(2);
      expect(res.body.data.pagination.items_per_page).toBe(10);
    });
  });
});
```

### データベース統合テスト

**テストケース例: database.integration.test.js**

```javascript
const db = require('../database');
const { Report, VisitRecord, SupervisorComment } = require('../models');

describe('Database Integration Tests', () => {
  beforeEach(async () => {
    await db.query('BEGIN');
    await db.seed.run();
  });

  afterEach(async () => {
    await db.query('ROLLBACK');
  });

  test('日報と訪問記録がカスケード削除される', async () => {
    const report = await Report.create({
      sales_id: 1,
      report_date: '2026-02-21',
      status: 'draft',
    });

    await VisitRecord.create({
      report_id: report.id,
      customer_id: 1,
      visit_content: 'テスト訪問',
      display_order: 1,
    });

    // 日報を削除
    await Report.delete(report.id);

    // 訪問記録も削除されていることを確認
    const visits = await VisitRecord.findByReportId(report.id);
    expect(visits).toHaveLength(0);
  });

  test('同一日付の日報作成でユニーク制約エラーが発生する', async () => {
    await Report.create({
      sales_id: 1,
      report_date: '2026-02-21',
      status: 'draft',
    });

    await expect(
      Report.create({
        sales_id: 1,
        report_date: '2026-02-21', // 同じ日付
        status: 'draft',
      })
    ).rejects.toThrow();
  });

  test('外部キー制約により存在しない顧客は登録できない', async () => {
    const report = await Report.create({
      sales_id: 1,
      report_date: '2026-02-21',
      status: 'draft',
    });

    await expect(
      VisitRecord.create({
        report_id: report.id,
        customer_id: 99999, // 存在しない顧客ID
        visit_content: 'テスト訪問',
        display_order: 1,
      })
    ).rejects.toThrow();
  });
});
```

---

## E2Eテスト

### Playwrightによるエンドツーエンドテスト

**テストケース例: dailyReport.e2e.test.ts**

```typescript
import { test, expect } from '@playwright/test';

test.describe('日報作成フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-sales@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('日報を新規作成して提出できる', async ({ page }) => {
    // 日報作成画面へ遷移
    await page.click('text=日報作成');
    await expect(page).toHaveURL('/reports/new');

    // 訪問記録を追加
    await page.click('button:has-text("訪問記録を追加")');

    // 顧客選択
    await page.selectOption('select[name="visits[0].customer_id"]', '1');

    // 訪問内容入力
    await page.fill(
      'textarea[name="visits[0].visit_content"]',
      '新商品の提案を実施。好感触を得た。'
    );

    // 訪問時間入力
    await page.fill('input[name="visits[0].visit_time"]', '14:00');

    // Problem入力
    await page.fill('textarea[name="problem"]', '新規顧客の開拓方法について');

    // Plan入力
    await page.fill('textarea[name="plan"]', 'ABC社との契約条件の詰め');

    // 下書き保存
    await page.click('button:has-text("下書き保存")');

    // 成功メッセージを確認
    await expect(page.locator('text=下書きを保存しました')).toBeVisible();

    // 提出
    await page.click('button:has-text("提出")');

    // 確認ダイアログでOK
    page.on('dialog', (dialog) => dialog.accept());

    // 成功メッセージを確認
    await expect(page.locator('text=日報を提出しました')).toBeVisible();

    // 日報一覧に遷移
    await expect(page).toHaveURL('/reports');

    // 提出した日報が一覧に表示されることを確認
    await expect(page.locator('text=提出済み')).toBeVisible();
  });

  test('バリデーションエラーが正しく表示される', async ({ page }) => {
    await page.goto('/reports/new');

    // 訪問記録なしで提出
    await page.click('button:has-text("提出")');

    // エラーメッセージを確認
    await expect(page.locator('text=訪問記録を1件以上入力してください')).toBeVisible();

    // 訪問記録を追加
    await page.click('button:has-text("訪問記録を追加")');

    // 顧客未選択で提出
    await page.fill('textarea[name="visits[0].visit_content"]', '訪問内容');
    await page.click('button:has-text("提出")');

    // エラーメッセージを確認
    await expect(page.locator('text=顧客を選択してください')).toBeVisible();
  });

  test('複数の訪問記録を追加できる', async ({ page }) => {
    await page.goto('/reports/new');

    // 1件目
    await page.click('button:has-text("訪問記録を追加")');
    await page.selectOption('select[name="visits[0].customer_id"]', '1');
    await page.fill('textarea[name="visits[0].visit_content"]', '1件目の訪問');

    // 2件目
    await page.click('button:has-text("訪問記録を追加")');
    await page.selectOption('select[name="visits[1].customer_id"]', '2');
    await page.fill('textarea[name="visits[1].visit_content"]', '2件目の訪問');

    // 3件目
    await page.click('button:has-text("訪問記録を追加")');
    await page.selectOption('select[name="visits[2].customer_id"]', '3');
    await page.fill('textarea[name="visits[2].visit_content"]', '3件目の訪問');

    // 訪問記録が3件表示されていることを確認
    const visitForms = await page.locator('[data-testid="visit-record-form"]').count();
    expect(visitForms).toBe(3);
  });
});

test.describe('日報承認フロー（上長）', () => {
  test.beforeEach(async ({ page }) => {
    // 上長でログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test-supervisor@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('部下の日報を承認できる', async ({ page }) => {
    // 未承認の日報へ
    await page.click('text=未承認の日報');
    await expect(page).toHaveURL(/\/reports\/approve/);

    // 最初の日報を選択
    await page.click('[data-testid="report-item"]:first-child');

    // コメント入力
    await page.fill('textarea[name="comments[0].comment_text"]', '良い活動ができていますね');

    // 承認
    await page.click('button:has-text("承認する")');

    // 成功メッセージを確認
    await expect(page.locator('text=日報を承認しました')).toBeVisible();
  });

  test('コメントなしで差し戻しできない', async ({ page }) => {
    await page.goto('/reports/approve');
    await page.click('[data-testid="report-item"]:first-child');

    // コメントなしで差し戻し
    await page.click('button:has-text("差し戻し")');

    // エラーメッセージを確認
    await expect(page.locator('text=差し戻しの際はコメントを入力してください')).toBeVisible();
  });
});
```

---

## APIテスト

### Postman/Newman テストスクリプト

**テストケース例: NippoAPI.postman_collection.json の一部**

```javascript
// POST /api/v1/auth/login のテストスクリプト
pm.test('Status code is 200', function () {
  pm.response.to.have.status(200);
});

pm.test('Response has access_token', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property('access_token');
  pm.environment.set('access_token', jsonData.data.access_token);
});

pm.test('Response has user data', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.user).to.have.property('id');
  pm.expect(jsonData.data.user).to.have.property('name');
  pm.expect(jsonData.data.user).to.have.property('email');
});

// POST /api/v1/reports のテストスクリプト
pm.test('Status code is 201', function () {
  pm.response.to.have.status(201);
});

pm.test('Report is created with draft status', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.status).to.equal('draft');
  pm.environment.set('report_id', jsonData.data.id);
});

pm.test('Response time is less than 500ms', function () {
  pm.expect(pm.response.responseTime).to.be.below(500);
});

// GET /api/v1/reports のテストスクリプト
pm.test('Returns paginated results', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data).to.have.property('items');
  pm.expect(jsonData.data).to.have.property('pagination');
  pm.expect(jsonData.data.items).to.be.an('array');
});

pm.test('Pagination data is correct', function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.data.pagination).to.have.property('current_page');
  pm.expect(jsonData.data.pagination).to.have.property('total_pages');
  pm.expect(jsonData.data.pagination).to.have.property('total_items');
});
```

---

## 性能テスト

### 性能要件

| 項目                         | 目標値      | 測定方法           |
| ---------------------------- | ----------- | ------------------ |
| ページ読み込み時間           | 3秒以内     | Lighthouse         |
| API レスポンス時間（平均）   | 200ms以内   | k6                 |
| API レスポンス時間（95%ile） | 500ms以内   | k6                 |
| 同時接続数                   | 100ユーザー | k6                 |
| データベースクエリ時間       | 50ms以内    | pg_stat_statements |

### k6 負荷テストスクリプト

**テストケース例: load-test.js**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 10 }, // 1分で10ユーザーまで増加
    { duration: '3m', target: 50 }, // 3分で50ユーザーまで増加
    { duration: '5m', target: 100 }, // 5分で100ユーザーまで増加
    { duration: '2m', target: 0 }, // 2分で0ユーザーまで減少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%のリクエストが500ms以内
    errors: ['rate<0.01'], // エラー率1%未満
  },
};

const BASE_URL = 'https://api.nippo-system.example.com/api/v1';

export default function () {
  // ログイン
  let loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'test-sales@example.com',
      password: 'password123',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json('data.access_token') !== undefined,
  }) || errorRate.add(1);

  const token = loginRes.json('data.access_token');

  sleep(1);

  // 日報一覧取得
  let reportsRes = http.get(`${BASE_URL}/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  check(reportsRes, {
    'reports status is 200': (r) => r.status === 200,
    'reports response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  sleep(1);

  // 日報作成
  let createRes = http.post(
    `${BASE_URL}/reports`,
    JSON.stringify({
      report_date: '2026-02-21',
      problem: '負荷テスト用の課題',
      plan: '負荷テスト用の予定',
      visits: [
        {
          customer_id: 1,
          visit_content: '負荷テスト用の訪問記録',
          display_order: 1,
        },
      ],
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  check(createRes, {
    'create status is 201': (r) => r.status === 201,
    'create response time < 300ms': (r) => r.timings.duration < 300,
  }) || errorRate.add(1);

  sleep(2);
}
```

### Lighthouse 性能テスト

**目標スコア**

- Performance: 90以上
- Accessibility: 90以上
- Best Practices: 90以上
- SEO: 90以上

**CI/CDでの実行例**

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun --config=lighthouserc.json
```

---

## セキュリティテスト

### 脆弱性スキャン

#### 実施項目

| テスト項目               | ツール          | 実施頻度   |
| ------------------------ | --------------- | ---------- |
| 依存関係の脆弱性チェック | npm audit, Snyk | 毎ビルド   |
| SQLインジェクション      | OWASP ZAP       | リリース前 |
| XSS脆弱性                | OWASP ZAP       | リリース前 |
| CSRF対策確認             | 手動テスト      | リリース前 |
| 認証・認可テスト         | 手動テスト      | リリース前 |

### セキュリティテストケース

#### 認証テスト

```javascript
describe('Authentication Security Tests', () => {
  test('無効なトークンは拒否される', async () => {
    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);

    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  test('期限切れトークンは拒否される', async () => {
    const expiredToken = generateExpiredToken();

    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });

  test('パスワードは平文で返されない', async () => {
    const res = await request(app)
      .get('/api/v1/sales/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(res.body.data).not.toHaveProperty('password');
  });
});
```

#### SQLインジェクション対策テスト

```javascript
describe('SQL Injection Prevention', () => {
  test('顧客名検索でSQLインジェクションが防止される', async () => {
    const maliciousInput = "'; DROP TABLE customers; --";

    const res = await request(app)
      .get('/api/v1/customers')
      .set('Authorization', `Bearer ${validToken}`)
      .query({ keyword: maliciousInput })
      .expect(200);

    // テーブルが削除されていないことを確認
    const customers = await db.query('SELECT COUNT(*) FROM customers');
    expect(customers.rows[0].count).toBeGreaterThan(0);
  });
});
```

#### XSS対策テスト

```javascript
describe('XSS Prevention', () => {
  test('訪問内容にスクリプトタグが含まれていてもエスケープされる', async () => {
    const xssPayload = '<script>alert("XSS")</script>';

    const createRes = await request(app)
      .post('/api/v1/reports')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        report_date: '2026-02-21',
        visits: [
          {
            customer_id: 1,
            visit_content: xssPayload,
            display_order: 1,
          },
        ],
      })
      .expect(201);

    // データベースには保存されるが、HTMLエスケープされていることを期待
    const reportId = createRes.body.data.id;
    const report = await db.query('SELECT * FROM visit_records WHERE report_id = $1', [reportId]);

    // レスポンスがエスケープされていることを確認
    expect(report.rows[0].visit_content).toContain('&lt;script&gt;');
  });
});
```

---

## テストデータ

### シードデータ

**seeds/test_data.js**

```javascript
exports.seed = async function (knex) {
  // 既存データを削除
  await knex('supervisor_comments').del();
  await knex('visit_records').del();
  await knex('daily_reports').del();
  await knex('customers').del();
  await knex('sales').del();

  // 営業マスタ
  await knex('sales').insert([
    {
      id: 1,
      name: '山田太郎',
      email: 'test-supervisor@example.com',
      password_hash: await hashPassword('password123'),
      is_supervisor: true,
      supervisor_id: null,
      department: '営業部',
      status: 'active',
    },
    {
      id: 2,
      name: '佐藤花子',
      email: 'test-sales@example.com',
      password_hash: await hashPassword('password123'),
      is_supervisor: false,
      supervisor_id: 1,
      department: '営業部',
      status: 'active',
    },
  ]);

  // 顧客マスタ
  await knex('customers').insert([
    {
      id: 1,
      customer_name: '株式会社ABC',
      address: '東京都千代田区〇〇1-2-3',
      phone: '03-1234-5678',
      assigned_sales_id: 2,
      industry: '製造業',
      status: 'active',
    },
    {
      id: 2,
      customer_name: '有限会社XYZ',
      address: '東京都港区〇〇4-5-6',
      phone: '03-8765-4321',
      assigned_sales_id: 2,
      industry: 'サービス業',
      status: 'active',
    },
  ]);
};
```

### ファクトリパターン

**factories/reportFactory.js**

```javascript
const { faker } = require('@faker-js/faker/locale/ja');

class ReportFactory {
  static createDraftReport(overrides = {}) {
    return {
      sales_id: 2,
      report_date: faker.date.recent().toISOString().split('T')[0],
      status: 'draft',
      problem: faker.lorem.sentence(),
      plan: faker.lorem.sentence(),
      ...overrides,
    };
  }

  static createSubmittedReport(overrides = {}) {
    return {
      ...this.createDraftReport(),
      status: 'submitted',
      submitted_at: faker.date.recent(),
      visits: [this.createVisitRecord()],
      ...overrides,
    };
  }

  static createVisitRecord(overrides = {}) {
    return {
      customer_id: 1,
      visit_content: faker.lorem.paragraph(),
      visit_time: '14:00',
      display_order: 1,
      ...overrides,
    };
  }
}

module.exports = ReportFactory;
```

---

## テスト実施スケジュール

### 開発フェーズ別テスト計画

| フェーズ   | テスト種別             | 実施タイミング        | 担当         |
| ---------- | ---------------------- | --------------------- | ------------ |
| 開発中     | 単体テスト             | コード作成時（TDD）   | 開発者       |
| 開発中     | 静的解析               | コミット時            | 開発者       |
| PR作成時   | 単体テスト、統合テスト | PR作成時（自動）      | CI/CD        |
| PR作成時   | コードカバレッジ       | PR作成時（自動）      | CI/CD        |
| マージ後   | E2Eテスト              | main マージ後（自動） | CI/CD        |
| リリース前 | 性能テスト             | ステージング環境      | QA担当       |
| リリース前 | セキュリティテスト     | ステージング環境      | QA担当       |
| リリース前 | 受入テスト             | ステージング環境      | ユーザー代表 |

### CI/CD パイプライン

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm audit
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

---

## 付録

### テストコマンド一覧

```json
{
  "scripts": {
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest run --coverage",
    "test:load": "k6 run tests/load/load-test.js",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### カバレッジレポート

目標カバレッジ: 80%以上

```bash
# カバレッジレポート生成
npm run test:coverage

# HTMLレポート確認
open coverage/index.html
```

### テストレポート

- 単体テスト: JUnit XML形式
- E2Eテスト: Playwright HTML Report
- カバレッジ: Codecov

---

## まとめ

本テスト仕様書に従い、以下を徹底すること：

✅ **TDD（テスト駆動開発）の実践**

- Red-Green-Refactorサイクルの遵守

✅ **品質基準の遵守**

- 意味のあるテストのみを作成
- ハードコーディング禁止
- 境界値・異常系のテスト必須

✅ **継続的テスト**

- CI/CDパイプラインでの自動テスト
- カバレッジ80%以上の維持

✅ **テストピラミッドの維持**

- 単体テスト > 統合テスト > E2Eテスト
