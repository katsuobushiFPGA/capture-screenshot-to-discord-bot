# 📸 Screenshot to Discord Bot

自動でWebページのスクリーンショットを撮影し、Discordに投稿するCloudflare Workerです。

## 🚀 機能

- **自動スクリーンショット**: 指定したWebページの全画面スクリーンショットを撮影
- **Discord投稿**: 撮影したスクリーンショットを自動でDiscordチャンネルに投稿
- **スケジュール実行**: 毎週土曜日 15:00 JST に自動実行
- **画像読み込み待機**: 遅延読み込み画像も確実にキャプチャ
- **エラー通知**: 失敗時はDiscordにエラー通知

## 🛠️ 技術スタック

| 技術 | 用途 |
|------|------|
| **Cloudflare Workers** | サーバーレス実行環境 |
| **@cloudflare/playwright** | ブラウザ自動化・スクリーンショット撮影 |
| **TypeScript** | 言語 |
| **Discord Bot API** | メッセージ投稿 |

## ⚙️ 設定

### 設定ファイルの準備

1. `wrangler.toml`をコピーして`wrangler.local.toml`を作成
2. `wrangler.local.toml`に環境変数を設定

### 環境変数

`wrangler.local.toml`の`[vars]`セクションに以下を設定

```toml
[vars]
TARGET_URL = "https://example.com"          # スクリーンショット対象URL
DISCORD_BOT_TOKEN = "your_bot_token"        # Discord Bot トークン
DISCORD_CHANNEL_ID = "your_channel_id"      # 投稿先チャンネルID
```

## 🚀 デプロイ

```bash
# 依存関係のインストール
npm install

# 設定ファイルをコピーして環境変数を設定
cp wrangler.toml wrangler.local.toml
# wrangler.local.tomlを編集して環境変数を設定

# Cloudflareにログイン
npx wrangler login

# デプロイ
npx wrangler deploy --config wrangler.local.toml
```

## 📋 開発

```bash
# 開発サーバー起動
npm run dev

# ビルドテスト
npm run build

# ログ確認
npm run tail
```

## 🔧 カスタマイズ

- `src/index.ts` でスクリーンショット設定やエラーハンドリングを調整
- `wrangler.local.toml` でスケジュールや環境変数を変更
