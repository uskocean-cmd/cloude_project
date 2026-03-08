# Prisma データベースセットアップガイド

## 📋 概要

このプロジェクトでは、Prisma ORMを使用してPostgreSQLデータベースを管理しています。

## 🗂️ ファイル構成

```
nippo/
├── prisma/
│   ├── schema.prisma  # データベーススキーマ定義
│   └── seed.ts        # 初期データ投入スクリプト
├── src/
│   └── lib/
│       └── prisma.ts  # Prisma Clientシングルトン
├── .env               # 環境変数（Git管理外）
└── .env.example       # 環境変数のテンプレート
```

## 🚀 セットアップ手順

### 1. PostgreSQLのインストール

#### Windowsの場合
```bash
# PostgreSQLの公式サイトからインストーラーをダウンロード
# https://www.postgresql.org/download/windows/
```

#### Dockerを使用する場合（推奨）
```bash
docker run --name nippo-postgres \
  -e POSTGRES_USER=nippo_user \
  -e POSTGRES_PASSWORD=nippo_password \
  -e POSTGRES_DB=nippo_db \
  -p 5432:5432 \
  -d postgres:15
```

### 2. 環境変数の設定

`.env.example`を`.env`にコピーして、データベース接続情報を設定：

```bash
cp .env.example .env
```

`.env`ファイルを編集：
```env
DATABASE_URL="postgresql://nippo_user:nippo_password@localhost:5432/nippo_db?schema=public"
```

### 3. Prisma依存関係のインストール

```bash
npm install
```

### 4. Prisma Clientの生成

```bash
npm run db:generate
```

### 5. データベースのマイグレーション

#### 開発環境
```bash
# マイグレーションファイルを作成して実行
npm run db:migrate

# または、スキーマをそのままプッシュ（マイグレーション履歴なし）
npm run db:push
```

#### 本番環境
```bash
npm run db:migrate:deploy
```

### 6. 初期データの投入

```bash
npm run db:seed
```

## 📊 作成されるテーブル

### 1. sales（営業マスタ）
- 営業担当者と上長の情報
- 自己参照による上長-部下の階層構造

### 2. customers（顧客マスタ）
- 顧客の基本情報
- 担当営業との関連付け

### 3. daily_reports（日報）
- 営業日報の本体
- ステータス管理（draft/submitted/approved/rejected）
- Problem（課題）とPlan（予定）

### 4. visit_records（訪問記録）
- 日報に紐づく個別の顧客訪問記録
- ON DELETE CASCADEで日報削除時に自動削除

### 5. supervisor_comments（上長コメント）
- 上長からのフィードバック
- コメント種別（problem/plan/general）
- ON DELETE CASCADEで日報削除時に自動削除

## 🔧 便利なコマンド

### データベース操作

```bash
# Prisma Clientの再生成
npm run db:generate

# スキーマをデータベースにプッシュ（開発用）
npm run db:push

# マイグレーションの作成と実行
npm run db:migrate

# 本番環境へのマイグレーション適用
npm run db:migrate:deploy

# シードデータの投入
npm run db:seed

# Prisma Studio（GUIツール）の起動
npm run db:studio

# データベースのリセット（全データ削除）
npm run db:reset
```

### Prisma Studio

ブラウザベースのデータベースGUIツール：

```bash
npm run db:studio
```

`http://localhost:5555` でアクセス可能

## 💾 スキーマ変更の手順

1. `prisma/schema.prisma`を編集
2. マイグレーションを作成：
   ```bash
   npm run db:migrate
   ```
3. マイグレーション名を入力（例: "add_user_role_field"）
4. Prisma Clientが自動的に再生成される

## 🔍 Prisma Clientの使用例

```typescript
import { prisma } from '@/lib/prisma';

// 日報の作成
const report = await prisma.dailyReport.create({
  data: {
    salesId: 1,
    reportDate: new Date(),
    status: 'draft',
    problem: '新規顧客の開拓方法について',
    plan: 'ABC社との契約条件の詰め',
    visitRecords: {
      create: [
        {
          customerId: 1,
          visitContent: '新商品の提案',
          visitTime: '14:00',
          displayOrder: 1,
        },
      ],
    },
  },
  include: {
    visitRecords: true,
  },
});

// 日報の検索
const reports = await prisma.dailyReport.findMany({
  where: {
    salesId: 1,
    reportDate: {
      gte: new Date('2026-02-01'),
      lte: new Date('2026-02-28'),
    },
  },
  include: {
    visitRecords: {
      include: {
        customer: true,
      },
    },
    comments: true,
  },
  orderBy: {
    reportDate: 'desc',
  },
});

// トランザクション
await prisma.$transaction(async (tx) => {
  const report = await tx.dailyReport.update({
    where: { id: 1 },
    data: { status: 'submitted', submittedAt: new Date() },
  });

  await tx.supervisorComment.create({
    data: {
      reportId: report.id,
      supervisorId: 2,
      commentType: 'general',
      commentText: '良い活動ができていますね',
    },
  });
});
```

## 🔐 セキュリティ

- `.env`ファイルは**絶対にGitにコミットしない**
- `.gitignore`に`.env`が含まれていることを確認
- 本番環境では強力なパスワードとJWT秘密鍵を使用
- パスワードは必ずbcryptなどでハッシュ化

## 📚 参考リンク

- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
