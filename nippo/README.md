# 営業日報システム (nippo-system)

営業担当者が日々の訪問記録・課題・計画を報告し、上長が確認・承認するWebアプリケーションです。

## 技術スタック

| カテゴリ | 技術 |
| ------ | ---- |
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| データベース | PostgreSQL 15 |
| ORM | Prisma 5 |
| テスト (Unit/Integration) | Vitest + Testing Library |
| テスト (E2E) | Playwright |
| Linter | ESLint + Prettier |
| Git フック | Husky + lint-staged |
| コンテナ | Docker / Docker Compose |
| デプロイ | Google Cloud Run |
| CI/CD | GitHub Actions |

## 前提条件

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker / Docker Compose
- PostgreSQL 15（Dockerを使用する場合は不要）

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/uskocean-cmd/cloude_project.git
cd cloude_project/nippo
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集してデータベース接続情報を設定してください：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nippo_dev"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
```

### 4. データベースの起動（Docker Compose）

```bash
docker-compose up -d
```

### 5. データベースのマイグレーション

```bash
npm run db:migrate
```

### 6. シードデータの投入

```bash
npm run db:seed
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint チェック
npm run lint

# Lint 自動修正
npm run lint:fix

# コードフォーマット
npm run format

# ユニット/統合テスト
npm run test

# テスト（ウォッチモード）
npm run test:watch

# テスト（カバレッジ付き）
npm run test:coverage

# E2E テスト
npm run test:e2e

# E2E テスト（UI モード）
npm run test:e2e:ui
```

## データベースコマンド

```bash
# マイグレーション作成・実行
npm run db:migrate

# スキーマをDBに反映（開発時）
npm run db:push

# シードデータ投入
npm run db:seed

# Prisma Studio（GUIでDB確認）
npm run db:studio

# DB リセット
npm run db:reset

# Prisma Client 再生成
npm run db:generate
```

## デプロイ

Google Cloud Run へのデプロイは Makefile にまとめられています：

```bash
# Docker イメージビルド
make build

# GCR へプッシュ
make push

# Cloud Run へデプロイ
make deploy

# 全て実行（ビルド→プッシュ→デプロイ）
make deploy-full
```

詳細は [README_SETUP.md](README_SETUP.md) を参照してください。

## プロジェクト構造

```text
nippo/
├── prisma/
│   ├── schema.prisma       # データベーススキーマ
│   ├── seed.ts             # シードデータ
│   └── migrations/         # マイグレーション履歴
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes
│   │   └── (pages)/        # ページコンポーネント
│   ├── components/         # 共通コンポーネント
│   └── lib/                # ユーティリティ・設定
│       ├── prisma.ts       # Prisma Client シングルトン
│       └── auth/           # 認証ユーティリティ
├── tests/
│   └── e2e/                # E2E テスト
├── .github/
│   └── workflows/          # CI/CD ワークフロー
├── Dockerfile              # マルチステージビルド
├── Makefile                # デプロイコマンド集
└── docker-compose.yml      # ローカル開発環境
```

## ブランチ戦略

| ブランチ | 用途 |
| ------- | ---- |
| `master` | 本番環境（保護済み） |
| `develop` | 開発ブランチ |
| `feature/issue-*` | 機能開発（Issue番号付き） |
| `fix/issue-*` | バグ修正 |

### コミットメッセージ規約

[Conventional Commits](https://www.conventionalcommits.org/) 形式を使用してください：

```text
feat: 新機能追加
fix: バグ修正
docs: ドキュメントのみの変更
style: コードの動作に影響しない変更
refactor: バグ修正・機能追加以外のコード変更
test: テストの追加・修正
chore: ビルドプロセスや補助ツールの変更
```

## 主要機能

1. **日報管理** - 訪問記録・課題（Problem）・計画（Plan）の記録
2. **承認フロー** - 下書き → 提出 → 承認の3段階管理
3. **検索・閲覧** - 日付・ステータス・顧客での絞り込み
4. **レポート** - 集計グラフ・CSV/Excelエクスポート
5. **マスタ管理** - 営業マスタ・顧客マスタの CRUD

## ドキュメント

| ドキュメント | 内容 |
| ---------- | ---- |
| [要件定義書](requirements.md) | システム要件・機能定義 |
| [ER図](er-diagram.md) | データベース設計 |
| [画面設計書](screen-design.md) | 画面レイアウト・仕様 |
| [API仕様書](api-specification.md) | REST API エンドポイント一覧 |
| [テスト仕様書](test-specification.md) | テスト戦略・ケース |
| [Prisma セットアップ](README_PRISMA.md) | DB 設定詳細 |
| [開発環境セットアップ](README_SETUP.md) | CI/CD・デプロイ詳細 |
| [Issue 管理](README_ISSUES.md) | GitHub Issues 運用ガイド |

## ライセンス

Private - All rights reserved.
