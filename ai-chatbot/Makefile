# Steampunk AI Chatbot - Makefile

# 初期化（依存パッケージインストール + Playwright ブラウザ）
init:
	npm install
	npx playwright install chromium

# 開発サーバー起動
dev:
	npm run dev

# プロダクションビルド
build:
	npm run build

# プロダクション起動
start:
	npm run start

# Vercel デプロイ
deploy:
	npx vercel --yes --prod

# テスト（ユニット）
test:
	npm run test

# テスト（E2E）
test-e2e:
	npm run test:e2e

# テスト（全て）
test-all: test test-e2e

# リント
lint:
	npm run lint

# クリーンビルド（.next 削除 → 再ビルド）
clean:
	rm -rf .next
	npm run build

.PHONY: init dev build start deploy test test-e2e test-all lint clean
