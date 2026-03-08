#!/bin/bash

# GitHub CLI (gh) がインストールされているか確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "インストール方法: https://cli.github.com/"
    exit 1
fi

# GitHubにログインしているか確認
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub にログインしていません"
    echo "以下のコマンドでログインしてください:"
    echo "  gh auth login"
    exit 1
fi

echo "🚀 GitHub Issuesを作成します..."
echo ""

# JSONファイルから各issueを作成
jq -c '.[]' issues.json | while read -r issue; do
    title=$(echo "$issue" | jq -r '.title')
    body=$(echo "$issue" | jq -r '.body')
    labels=$(echo "$issue" | jq -r '.labels | join(",")')
    
    echo "📝 Creating issue: $title"
    
    gh issue create \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        2>&1 | grep -E "^http" || echo "  ⚠️  Issue may already exist or failed to create"
    
    # Rate limitを避けるため少し待機
    sleep 1
done

echo ""
echo "✅ すべてのIssueの作成が完了しました！"
echo ""
echo "📊 作成されたIssueを確認:"
echo "  gh issue list"
echo ""
echo "または、GitHubのIssuesページを開く:"
echo "  gh issue list --web"
