# 開発環境セットアップガイド

## 📋 概要

このガイドでは、営業日報システムの開発環境セットアップから、デプロイまでの手順を説明します。

## 🚀 クイックスタート

```bash
# 1. リポジトリをクローン
git clone <repository-url>
cd nippo

# 2. 依存関係をインストール
make install
# または
npm install

# 3. 環境変数を設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報を設定

# 4. データベースのセットアップ
make db-migrate
make db-seed

# 5. 開発サーバーを起動
make dev
# または
npm run dev
```

## 🛠️ セットアップ済みツール

### 1. **Linter & Formatter**
- ✅ ESLint（TypeScript + React + Next.js対応）
- ✅ Prettier（コードフォーマッター）
- ✅ lint-staged（ステージングされたファイルのみチェック）

### 2. **テストフレームワーク**
- ✅ Vitest（単体テスト・統合テスト）
- ✅ React Testing Library（コンポーネントテスト）
- ✅ Playwright（E2Eテスト）
- ✅ カバレッジ計測（v8）

### 3. **Git Hooks (Husky)**
- ✅ pre-commit: lint-staged実行
- ✅ pre-push: 型チェック＋単体テスト
- ✅ commit-msg: Conventional Commits検証

### 4. **データベース (Prisma)**
- ✅ Prisma ORM
- ✅ PostgreSQL対応
- ✅ マイグレーション管理
- ✅ シードデータ

### 5. **CI/CD (GitHub Actions)**
- ✅ Lint & Type Check
- ✅ 単体テスト＋カバレッジ
- ✅ E2Eテスト
- ✅ ビルド検証
- ✅ Cloud Run デプロイ

## 📦 利用可能なコマンド

### Makefileコマンド

```bash
make help              # 利用可能なコマンド一覧を表示
make install           # 依存関係をインストール
make dev               # 開発サーバー起動
make build             # 本番ビルド
make test              # 全テスト実行
make test-unit         # 単体テストのみ
make test-e2e          # E2Eテストのみ
make lint              # Lintチェック
make lint-fix          # Lint自動修正
make format            # コード整形
make db-migrate        # マイグレーション実行
make db-seed           # シードデータ投入
make db-studio         # Prisma Studio起動
make docker-build      # Dockerイメージビルド
make deploy-full       # Cloud Runにデプロイ
```

### npmコマンド

```bash
# 開発
npm run dev            # 開発サーバー起動
npm run build          # 本番ビルド
npm run start          # 本番サーバー起動

# コード品質
npm run lint           # ESLint実行
npm run lint:fix       # ESLint自動修正
npm run format         # Prettier実行
npm run type-check     # TypeScript型チェック

# テスト
npm run test           # Vitest実行
npm run test:watch     # Vitestウォッチモード
npm run test:coverage  # カバレッジ計測
npm run test:e2e       # Playwright E2Eテスト
npm run test:e2e:ui    # Playwright UIモード

# データベース
npm run db:generate    # Prisma Client生成
npm run db:migrate     # マイグレーション実行
npm run db:seed        # シードデータ投入
npm run db:studio      # Prisma Studio起動
npm run db:reset       # データベースリセット
```

## 🔧 Git Hooks

### pre-commit
コミット前に自動実行：
- ESLint（自動修正）
- Prettier（自動整形）
- Prisma Schema フォーマット

### pre-push
プッシュ前に自動実行：
- TypeScript型チェック
- 単体テスト

### commit-msg
コミットメッセージ検証（Conventional Commits）：
- ✅ `feat: 新機能追加`
- ✅ `fix: バグ修正`
- ✅ `docs: ドキュメント更新`
- ✅ `style: コードスタイル変更`
- ✅ `refactor: リファクタリング`
- ✅ `test: テスト追加・修正`
- ✅ `chore: その他の変更`

## 🐳 Docker

### ローカルでDockerビルド

```bash
# イメージビルド
make docker-build

# コンテナ実行
make docker-run
```

### マルチステージビルド
- **Stage 1**: 依存関係のインストール
- **Stage 2**: アプリケーションビルド
- **Stage 3**: 本番実行環境

## ☁️ Cloud Run デプロイ

### 事前準備

1. **Google Cloud プロジェクトの作成**
   ```bash
   gcloud projects create PROJECT_ID
   gcloud config set project PROJECT_ID
   ```

2. **必要なAPIの有効化**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable secretmanager.googleapis.com
   ```

3. **Secret Managerにシークレット登録**
   ```bash
   # データベースURL
   echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-

   # JWT Secret
   echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
   ```

4. **Workload Identity Federationの設定**
   - GitHub ActionsからGoogle Cloudへの認証設定
   - `WIF_PROVIDER` と `WIF_SERVICE_ACCOUNT` をGitHubシークレットに登録

### デプロイ手順

#### 方法1: Makefileを使用
```bash
# プロジェクトIDを設定
export PROJECT_ID=your-project-id

# ビルド＆デプロイ
make deploy-full
```

#### 方法2: GitHub Actionsで自動デプロイ
```bash
# mainブランチにプッシュすると自動デプロイ
git push origin main
```

#### 方法3: 手動デプロイ
```bash
# ビルド
gcloud builds submit --tag gcr.io/PROJECT_ID/nippo-system

# デプロイ
gcloud run deploy nippo-system \
  --image gcr.io/PROJECT_ID/nippo-system \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated
```

## 📊 CI/CDパイプライン

### プルリクエスト時
1. **Lint** - ESLint + Prettier
2. **Type Check** - TypeScript型チェック
3. **Unit Tests** - Vitest + カバレッジ
4. **E2E Tests** - Playwright
5. **Build** - Next.js ビルド検証

### mainブランチプッシュ時
上記の全チェック + Cloud Runへのデプロイ

## 🔐 環境変数

### 必須環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| DATABASE_URL | PostgreSQL接続URL | `postgresql://user:pass@host:5432/db` |
| JWT_SECRET | JWT署名用秘密鍵 | `your-secret-key` |
| NODE_ENV | 実行環境 | `development` / `production` |

### オプション環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| PORT | サーバーポート | `3000` |
| NEXT_PUBLIC_API_URL | APIベースURL | `http://localhost:3000/api/v1` |

## 📝 開発ワークフロー

### 1. 新機能開発
```bash
# 1. ブランチ作成
git checkout -b feat/new-feature

# 2. コード実装
# 3. テスト作成・実行
make test

# 4. コミット（Conventional Commits形式）
git add .
git commit -m "feat: 新機能の説明"

# 5. プッシュ（自動的にpre-push hookが実行される）
git push origin feat/new-feature

# 6. プルリクエスト作成
# GitHub上でPR作成 → CI自動実行
```

### 2. バグ修正
```bash
git checkout -b fix/bug-description
# 修正 → テスト → コミット
git commit -m "fix: バグの説明"
git push origin fix/bug-description
```

### 3. データベース変更
```bash
# 1. schema.prismaを編集
# 2. マイグレーション作成
make db-migrate
# マイグレーション名を入力（例: add_user_role）

# 3. コミット
git add prisma/
git commit -m "feat: データベーススキーマ変更"
```

## 🧪 テスト

### 単体テスト
```bash
# テスト実行
npm run test

# ウォッチモード
npm run test:watch

# カバレッジ
npm run test:coverage
```

### E2Eテスト
```bash
# ヘッドレスモード
npm run test:e2e

# UIモード
npm run test:e2e:ui
```

### テスト作成例
```typescript
// src/utils/dateUtils.test.ts
import { describe, test, expect } from 'vitest';
import { formatDate } from './dateUtils';

describe('formatDate', () => {
  test('日付をYYYY-MM-DD形式にフォーマットできる', () => {
    const date = new Date('2026-02-21');
    expect(formatDate(date)).toBe('2026-02-21');
  });
});
```

## 🚨 トラブルシューティング

### Huskyが動作しない
```bash
# .huskyディレクトリの権限確認
chmod +x .husky/*

# huskyの再インストール
npm run prepare
```

### Prisma Clientが見つからない
```bash
# Prisma Clientを再生成
npm run db:generate
```

### E2Eテストが失敗する
```bash
# Playwrightブラウザを再インストール
npx playwright install --with-deps
```

### Dockerビルドが失敗する
```bash
# キャッシュをクリアして再ビルド
docker build --no-cache -t nippo-system:latest .
```

## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
