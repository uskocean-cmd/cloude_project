# GitHub Issues作成ガイド

## 📋 概要

このディレクトリには、営業日報システムの開発に必要な詳細なIssueリストが含まれています。

## 📁 ファイル

- **ISSUES.md** - 全Issueのマークダウンリスト（153件）
- **issues.json** - Issue作成用のJSONデータ（主要Issue 17件）
- **create-github-issues.sh** - GitHubにIssueを自動作成するスクリプト

## 🚀 Issue作成手順

### 1. 前提条件

GitHub CLI (gh) をインストールしてください：

```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh
```

### 2. GitHub認証

```bash
gh auth login
```

対話形式で以下を選択：
- GitHub.com
- HTTPS
- Yes (Authenticate Git with your GitHub credentials)
- Login with a web browser

### 3. リポジトリの確認

現在のディレクトリがGitHubリポジトリに接続されていることを確認：

```bash
gh repo view
```

### 4. Issueの一括作成

```bash
./create-github-issues.sh
```

このスクリプトは `issues.json` からIssueを読み込み、GitHubに自動作成します。

## 📊 Issue構成

### フェーズ別の分類

**フェーズ1: プロジェクトセットアップ（4 Issues）**
- リポジトリ設定
- PostgreSQL環境構築
- Prismaマイグレーション
- シードデータ作成

**フェーズ2: 認証・認可（4 Issues）**
- JWT認証
- パスワードハッシュ化
- ログインAPI
- ログイン画面

**フェーズ3: マスタ管理（2 Issues）**
- 営業マスタAPI
- 営業マスタ画面

**フェーズ4: 日報機能（2 Issues）**
- 日報作成API
- 日報作成画面

**フェーズ5: 承認・コメント（2 Issues）**
- 承認API
- 承認画面

**フェーズ6: レポート（2 Issues）**
- 集計API
- レポート画面

**フェーズ8: E2Eテスト（1 Issue）**
- 日報作成フローのテスト

### ラベル分類

- **phase-1** ~ **phase-11**: 開発フェーズ
- **feature**: 新機能
- **backend**: バックエンド
- **frontend**: フロントエンド
- **api**: API実装
- **auth**: 認証・認可
- **database**: データベース
- **test**: テスト
- **infrastructure**: インフラ
- **analytics**: 分析・レポート

## 🔧 個別にIssueを作成する場合

### コマンドライン

```bash
gh issue create \
  --title "Issue のタイトル" \
  --body "Issue の説明" \
  --label "feature,backend"
```

### インタラクティブモード

```bash
gh issue create
```

### Web UI

```bash
gh issue list --web
```

## 📝 Issue管理のベストプラクティス

### 1. Issueの選択

プロジェクトボードまたはコマンドで確認：

```bash
# 全Issue一覧
gh issue list

# ラベル別
gh issue list --label "phase-1"
gh issue list --label "backend"

# 自分がアサインされているIssue
gh issue list --assignee "@me"
```

### 2. Issueの自分へのアサイン

```bash
gh issue develop 123 --checkout
```

または

```bash
gh issue edit 123 --add-assignee "@me"
```

### 3. ブランチ作成

```bash
# Issue番号を含むブランチ名
git checkout -b feat/123-login-api
```

### 4. Issueのクローズ

コミットメッセージで自動クローズ：

```bash
git commit -m "feat: ログインAPIの実装

fixes #123"
```

### 5. プルリクエスト作成

```bash
gh pr create --title "feat: ログインAPIの実装" --body "Closes #123"
```

## 🎯 開発ワークフロー例

```bash
# 1. Issue確認
gh issue list --label "phase-1"

# 2. Issue選択とブランチ作成
gh issue develop 4 --checkout
# または
git checkout -b feat/4-postgres-setup

# 3. 開発作業
# ... コード作成 ...

# 4. テスト実行
make test

# 5. コミット
git add .
git commit -m "feat: PostgreSQL環境のセットアップ

- docker-compose.ymlの作成
- PostgreSQL 15の設定
- ヘルスチェック追加

Closes #4"

# 6. プッシュ
git push origin feat/4-postgres-setup

# 7. PR作成
gh pr create --fill
```

## 📚 参考リンク

- [GitHub CLI ドキュメント](https://cli.github.com/manual/)
- [GitHub Issues ガイド](https://docs.github.com/ja/issues)
- [プロジェクトボード](https://docs.github.com/ja/issues/planning-and-tracking-with-projects)

## 🔍 トラブルシューティング

### gh コマンドが見つからない

```bash
# インストール確認
which gh

# パスを確認
echo $PATH
```

### 認証エラー

```bash
# 再認証
gh auth logout
gh auth login
```

### Issueが重複して作成される

既存のIssueを確認してから作成：

```bash
gh issue list --search "ログインAPI"
```

## 💡 Tips

### Issue番号の確認

```bash
# 最新のIssue
gh issue list --limit 5

# 特定のラベル
gh issue list --label "phase-1" --limit 10
```

### Issueの一括操作

```bash
# 特定のラベルのIssueをクローズ
gh issue list --label "phase-1" --json number -q '.[].number' | \
  xargs -I {} gh issue close {}
```

### Issueテンプレートの活用

`.github/ISSUE_TEMPLATE/` にテンプレートを配置すると、Issue作成時に選択できます。
