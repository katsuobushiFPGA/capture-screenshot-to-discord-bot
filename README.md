# Capture Screenshot & Send to Discord

TypeScript + Cloudflare Workers + Playwright プロジェクトで、指定したURLのスクリーンショットを取得し、Discordの特定のチャンネルに自動投稿します。

## 機能

- 🕛 **定期実行**: 毎日0時（UTC）に自動実行
- 🎭 **Playwright**: Cloudflare Browser Renderingを使用した確実なスクリーンショット
- 📸 **スクリーンショット取得**: 指定URLを1920x1080で撮影
- 📱 **Discord投稿**: スクリーンショットを指定チャンネルに投稿
- 🔄 **リトライ機能**: 失敗時に最大3回まで自動リトライ
- 🚨 **エラー通知**: 失敗時にDiscordにエラーメッセージを送信
- 🖱️ **手動実行**: `/trigger` エンドポイントでの手動実行も可能

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Cloudflare Browser Renderingの有効化

Cloudflare DashboardでBrowser Renderingを有効にする必要があります：
1. Cloudflareダッシュボードにログイン
2. 使用するアカウントでBrowser Renderingを有効化
3. 必要に応じて課金設定を確認

### 3. 環境変数の設定

⚠️ **セキュリティ注意**: 機密情報を含む設定ファイルは git にコミットしないでください。

1. `wrangler.local.toml` を作成（このファイルは .gitignore に含まれています）：

```toml
name = "capture-screenshot-sending-discord"
main = "src/index.ts"
compatibility_date = "2024-09-01"
compatibility_flags = ["nodejs_compat"]

[browser]
binding = "BROWSER"

[vars]
TARGET_URL = "https://example.com"          # スクリーンショット対象のURL
DISCORD_BOT_TOKEN = "your_bot_token_here"   # Discord Bot Token
DISCORD_CHANNEL_ID = "your_channel_id_here" # 投稿先チャンネルID

[triggers]
crons = ["0 0 * * *"]
```

2. または Cloudflare Dashboard で環境変数を設定

### 4. Discord Bot の設定

#### 4.1 Bot の作成とトークン取得
1. [Discord Developer Portal](https://discord.com/developers/applications) でアプリケーションを作成
2. 左サイドバーの **Bot** タブでBot Tokenを取得
3. Token を `DISCORD_BOT_TOKEN` に設定

#### 4.2 Bot のサーバー招待
1. 左サイドバーの **OAuth2** → **URL Generator** をクリック
2. **SCOPES** で以下を選択：
   - ☑️ `bot`
3. **BOT PERMISSIONS** で以下を選択：
   - ☑️ `Send Messages` - メッセージ送信
   - ☑️ `Attach Files` - ファイル添付
   - ☑️ `View Channel` - チャンネル表示
4. 生成されたURLでBotをサーバーに招待

#### 4.3 チャンネルID の取得
1. Discordで開発者モードを有効化
2. 対象チャンネルを右クリック → "IDをコピー"
3. コピーしたIDを `DISCORD_CHANNEL_ID` に設定

### 5. デプロイ

```bash
# 開発環境での確認
npm run dev

# 本番デプロイ
npm run deploy
```

## 使い方

### 自動実行
毎日0時（UTC）に自動でスクリーンショットが撮影され、Discordに投稿されます。

### 手動実行
デプロイ後、以下のURLにアクセスして手動実行できます：
```
https://your-worker-name.your-subdomain.workers.dev/trigger
```

## 利用可能なコマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run deploy   # 本番デプロイ
npm run preview  # プレビュー
npm run tail     # ログの監視
```

## カスタマイズ

### スクリーンショットサービスの変更
現在のコードではデモ用のスクリーンショットサービスを使用しています。本番環境では以下のようなサービスに変更することを推奨：

- [htmlcsstoimage.com](https://htmlcsstoimage.com/)
- [screenshotapi.net](https://screenshotapi.net/)
- [urlbox.io](https://urlbox.io/)

### 実行頻度の変更
`wrangler.toml` の `crons` 設定を変更：

```toml
# 毎時実行
crons = ["0 * * * *"]

# 毎週月曜日の9時
crons = ["0 9 * * MON"]
```

## トラブルシューティング

### よくあるエラー
1. **Discord API エラー**: Bot Token や Channel ID を確認
2. **スクリーンショット取得エラー**: 対象URLが正しいか、外部サービスの制限を確認
3. **権限エラー**: Botがチャンネルにメッセージとファイルを送信する権限があるか確認

### ログの確認
```bash
npm run tail
```

## ライセンス
MIT
