# CLAUDE.md - AI Chatbot プロジェクト仕様書

## プロジェクト概要

スチームパンクの世界観を持つエンターテイメント向けAIチャットボット。
複数のスチームパンク系キャラクターと会話を楽しめるWebアプリケーション。

**プロジェクト名**: ai-chatbot

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (App Router) + TypeScript
- **スタイリング**: CSS Modules
- **デプロイ先**: Vercel

### バックエンド
- **AI API**: Anthropic Claude API（ストリーミング応答）
- **API Routes**: Next.js Route Handlers (`app/api/`)
- **データベース**: MongoDB Atlas（Mongoose使用）

### 主要パッケージ
- `@anthropic-ai/sdk` - Claude API クライアント
- `mongoose` - MongoDB ODM
- `ai` / `@ai-sdk/anthropic` - Vercel AI SDK（ストリーミング用）

## 機能一覧

### 1. チャット機能
- テキスト入力によるAIとの会話
- ストリーミング応答（リアルタイムに文字が流れる）
- Markdown対応の応答表示
- メッセージの送信中状態表示

### 2. キャラクター選択
- 複数のスチームパンク系キャラクターから選択可能
- 各キャラクターは固有の口調・性格・バックストーリーを持つ
- キャラクター選択画面でアバター・名前・説明を表示
- 会話中にキャラクターを切り替え可能

#### 初期キャラクター（3体）
1. **アーサー・コグウェル** - 天才発明家。好奇心旺盛で、歯車と蒸気機関の仕組みを何でも語りたがる老紳士。丁寧な言葉遣い。
2. **リヴェット** - 機械工の少女。腕利きの修理屋で、ぶっきらぼうだが面倒見が良い。カジュアルな口調。
3. **ネビュラ卿** - 空中都市の探検家。詩的な表現を好み、冒険譚を語るのが得意な貴族。大げさで演劇的な口調。

### 3. 会話履歴の保存
- MongoDB Atlasに会話履歴を保存
- 過去の会話一覧を表示（サイドバーまたは一覧画面）
- 会話の再開・続きから話せる
- 会話の削除
- ユーザー識別: ブラウザごとにランダムUUIDを生成しlocalStorageに保存（認証なし）

### 4. ユーザー管理
- 認証なし（ログイン不要）
- localStorage のUUIDでユーザーを識別
- UUIDに紐づく会話履歴をMongoDBから取得

## データモデル（MongoDB）

### conversations コレクション
```typescript
{
  _id: ObjectId,
  userId: string,          // localStorage UUID
  characterId: string,     // キャラクターID
  title: string,           // 会話タイトル（最初のメッセージから自動生成）
  messages: [
    {
      role: 'user' | 'assistant',
      content: string,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### characters（コード内定数として定義）
```typescript
{
  id: string,
  name: string,
  description: string,
  avatar: string,          // 画像パスまたはアイコン
  systemPrompt: string,    // Claude APIに渡すシステムプロンプト
  color: string            // テーマカラー（スチームパンク風の配色）
}
```

## ディレクトリ構成

```
ai-chatbot/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # ルートレイアウト
│   │   ├── page.tsx            # トップページ（キャラクター選択）
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx    # チャット画面
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts    # チャットAPI（ストリーミング）
│   │   │   └── conversations/
│   │   │       └── route.ts    # 会話CRUD API
│   │   ├── globals.css
│   │   └── providers.tsx
│   ├── components/
│   │   ├── ChatArea.tsx        # チャットメッセージ表示エリア
│   │   ├── ChatInput.tsx       # メッセージ入力フォーム
│   │   ├── ChatMessage.tsx     # 個別メッセージ表示
│   │   ├── CharacterSelect.tsx # キャラクター選択カード
│   │   ├── Sidebar.tsx         # 会話履歴サイドバー
│   │   └── *.module.css        # 各コンポーネントのスタイル
│   ├── lib/
│   │   ├── mongodb.ts          # MongoDB接続
│   │   ├── characters.ts       # キャラクター定数定義
│   │   └── userId.ts           # UUID生成・取得
│   ├── models/
│   │   └── Conversation.ts     # Mongooseモデル
│   └── types/
│       └── chat.ts             # 型定義
├── public/
│   └── avatars/                # キャラクターアバター画像
├── .env.local                  # 環境変数（APIキー、MongoDB URI）
├── next.config.ts
├── tsconfig.json
└── package.json
```

## デザイン仕様

### テーマ: スチームパンク

#### カラーパレット
- **背景**: ダークブラウン系 (`#1a1410`, `#2a2015`)
- **パネル背景**: 深いブロンズ (`#3d2e1e`, `#4a3828`)
- **アクセント**: 真鍮ゴールド (`#c8a86e`, `#d4a84b`)
- **テキスト**: アンティークホワイト (`#e8dcc8`, `#f0e6d2`)
- **ハイライト**: 蒸気ブルー (`#6b9dba`, `#8bb8d0`)
- **危険色**: コッパーレッド (`#c45a3c`)

#### UI要素
- **ボーダー**: 歯車やリベットを模した装飾的なボーダー
- **フォント**: セリフ系フォント（見出し）+ サンセリフ（本文）
- **ボタン**: 真鍮製のボタンを模したスタイル、ホバーで発光エフェクト
- **入力欄**: 銅板風のテクスチャ背景
- **スクロールバー**: カスタムスタイル（真鍮色）
- **メッセージ吹き出し**: 羊皮紙風のテクスチャ

#### レスポンシブ
- デスクトップ: サイドバー + チャットエリア
- モバイル（768px以下）: サイドバーはオーバーレイで表示

## API設計

### POST /api/chat
チャットメッセージ送信（ストリーミング応答）

```typescript
// Request
{
  messages: { role: string, content: string }[],
  characterId: string,
  conversationId?: string  // 既存会話の場合
}

// Response: ReadableStream (text/event-stream)
```

### GET /api/conversations?userId={uuid}
会話一覧取得

### POST /api/conversations
新規会話作成

### DELETE /api/conversations/{id}
会話削除

## 環境変数

```env
ANTHROPIC_API_KEY=sk-ant-...
MONGODB_URI=mongodb+srv://...
```

## ビルド・実行コマンド

```bash
npm run dev       # 開発サーバー起動
npm run build     # プロダクションビルド
npm run start     # プロダクション起動
npm run test      # Vitestユニットテスト
npm run test:e2e  # Playwright E2Eテスト
npm run lint      # ESLint
```

## テスト方針

### ユニットテスト（Vitest + Testing Library）
- コンポーネント: ChatMessage, CharacterSelect, ChatInput
- ユーティリティ: userId生成, キャラクター取得

### E2Eテスト（Playwright）
- キャラクター選択 → チャット画面遷移
- メッセージ送信 → 応答表示
- 会話履歴の表示・削除

## テストコード作成時の厳守事項

### テストコードの品質
- テストは必ず実装の機能を検証すること
- `expect(true).toBe(true)`のような意味のないアサーションは絶対に書かない
- 各テストは具体的な入力と期待される出力を検証すること
- モックは必要最小限に留め、実際の動作に近い形でテストすること

### ハードコーディングの禁止
- テストを通すためだけのハードコードは絶対禁止
- 本番コードに`if(testMode)`のような条件分岐を入れない
- テスト用の特別な値（マジックナンバー）を本番コードに埋め込まない
- 環境変数や設定ファイルを使用して、テスト環境と本番環境を適切に分離すること

### テスト実装の原則
- テストが失敗する状態から始めること（Red-Green-Refactor）
- 境界値、異常系、エラーケースも必ずテストに含めること
- カバレッジだけでなく、実際の品質を重視すること
- テストケース名は何をテストしているのか明確に記述すること

### 実装前の確認
- 機能の仕様を正しく理解してからテストを書くこと
- 不明な点があれば、仮の実装ではなく、ユーザに確認すること
