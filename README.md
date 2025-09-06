# 📸 Screenshot to Discord Bot

自動でWebページのスクリーンショットを撮影し、Discordに投稿するCloudflare Workerです。

## � 機能

- **自動スクリーンショット**: 指定したWebページの全画面スクリーンショットを撮影
- **Discord投稿**: 撮影したスクリーンショットを自動でDiscordチャンネルに投稿
- **スケジュール実行**: 毎週土曜日 15:00 JST に自動実行
- **画像読み込み待機**: 遅延読み込み画像も確実にキャプチャ
- **エラー通知**: 失敗時はDiscordにエラー通知

## 🛠️ 技術スタック

- **Cloudflare Workers**: サーバーレス実行環境
- **@cloudflare/playwright**: ブラウザ自動化・スクリーンショット撮影
- **TypeScript**: 型安全な開発
- **Discord Bot API**: メッセージ投稿

## ⚙️ 設定

### 環境変数

```bash
TARGET_URL=https://example.com          # スクリーンショット対象URL
DISCORD_BOT_TOKEN=your_bot_token        # Discord Bot トークン
DISCORD_CHANNEL_ID=your_channel_id      # 投稿先チャンネルID
```

### wrangler.toml

```toml
[browser]
binding = "BROWSER"

[triggers]
crons = ["0 6 * * 6"]  # 毎週土曜日 15:00 JST (06:00 UTC)
```

## 🚀 デプロイ

```bash
# 依存関係のインストール
npm install

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
