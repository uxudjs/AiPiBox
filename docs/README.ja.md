# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.en.md)
[![한국어](https://img.shields.io/badge/lang-한국어-blue.svg)](./README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)

</div>

多機能でプライバシー重視の現代的な AI 会話アシスタントアプリケーション。マルチモデル統合、ナレッジベース管理、画像生成、ウェブ公開、リアルタイムコードプレビューをサポート。

## ✨ 主な機能

### 🔐 プライバシーとセキュリティ
- **ローカル優先ストレージ** - すべてのデータはブラウザの IndexedDB に保存され、マスターパスワードで暗号化されます。
- **エンドツーエンド暗号化** - API キーと機密設定は Web Crypto API を使用して暗号化されます。
- **オプションのクラウド同期** - Cloudflare KV への暗号化バックアップをサポート。
- **サーバー追跡なし** - 完全にクライアント側で動作し、ユーザーのプライバシーを保護します。

### 💬 インテリジェントな会話
- **マルチモデルサポート** - OpenAI、Claude、Gemini、Azure、Groq、DeepSeek など、主要なモデルをサポート。
- **カスタムプロバイダー** - OpenAI API 互換の任意のサービスを追加可能。
- **メッセージツリー構造** - 分岐会話をサポートし、いつでも異なる会話パスを探索可能。
- **ストリーミング応答** - AI の応答をリアルタイムで表示し、生成の中断も可能。
- **自動命名** - 会話タイトルのインテリジェント生成。
- **コンテキスト管理** - **会話圧縮**機能により、会話コンテキストの長さをスマートに制御。

### 🎨 制作と強化
- **Artifacts プレビュー** - HTML/CSS/JS/Tailwind コードブロックを自動レンダリングし、リアルタイムでインタラクティブなプレビューが可能。
- **一键公開** - 会話内容やコードスニペットをオンラインページとして公開・共有。
- **画像生成** - DALL-E 3/2、Stable Diffusion を統合。文生図、図生図、パラメータ微調整をサポート。
- **ウェブ検索** - Tavily、Google、Bing 検索エンジンを統合し、リアルタイム情報を取得。

### 📚 ナレッジベースと処理
- **ローカル処理** - ドキュメント（PDF/Word/Excel/PPT/TXT）はブラウザ側で解析され、元のファイルはアップロードされません。
- **セマンティック検索** - キーワードとチャンクベースのインテリジェントな検索で AI の回答を強化。
- **長文貼り付けの最適化** - 長いテキストを貼り付ける際、自動的にファイル添付に変換して会話を整理。
- **OCR 自動フォールバック** - モデルがマルチモーダルをサポートしていない場合、自動的に OCR を使用して画像からテキストを抽出。

### 🎯 高度な機能
- **深い思考モード** - AI 推論チェーン（o1、DeepSeek などの推論モデル）を有効化。
- **シークレットモード** - 履歴を残さず、ローカルに保存されないプライベートな会話。
- **多言語インターフェース** - 日本語、英語、韓国語、簡体字および繁体字中国語をサポート。
- **リッチレンダリング** - Markdown、LaTeX 数式、Mermaid チャートを完全サポート。

## 🚀 クイックスタート

### 要件
- Node.js >= 18.0
- npm >= 9.0

### ローカル開発

```bash
# プロジェクトをクローン
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 依存関係をインストール
npm install

# ワンコマンド起動（ローカルプロキシ + フロントエンドサーバー）
npm run dev:full

# http://localhost:3000 にアクセス
```

## 📦 デプロイと設定

AiPiBox がサポートする本番デプロイは Cloudflare Pages のみです。**すべての機能を利用するには、以下の環境変数と KV バインディングを設定してください。**

### Cloudflare Pages

**環境変数：**

| 変数名 | 説明 | 推奨値 |
|--------|------|--------|
| `AUTH_SECRET` | API インターフェースを保護するための HMAC 署名用キー。 | 32文字のランダムな文字列 |
| `PROXY_RATE_LIMIT` | AI プロキシインターフェースの IP あたりの毎分最大リクエスト数。 | `60` |

**ステップ：**
1. [Cloudflare Dashboard](https://dash.cloudflare.com) で Pages プロジェクトを作成します。
2. **KV バインディング**：プロジェクト設定 -> Functions -> KV namespace bindings に移動し、以下のバインディングを追加します：
   - **Variable name**: `SYNC_DATA`
   - **KV namespace**: 作成した KV ネームスペースを選択します。
3. **環境変数**：同じ設定ページの "Environment variables" に `AUTH_SECRET` と `PROXY_RATE_LIMIT` を追加します。
4. **デプロイ**：`npm run deploy:cf` を実行するか、Git リポジトリを Cloudflare Pages に連携します。

## 🛠️ 技術スタック

- **フレームワーク**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **状態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **データベース**: [Dexie.js](https://dexie.org/) (ローカル IndexedDB)
- **レンダリング**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **バックエンド**: Cloudflare Pages Functions (Workers)

## 📁 プロジェクト構造

```
AiPiBox/
├── functions/          # Cloudflare Pages Functions (Workers)
├── proxy/              # ローカル開発用プロキシサーバー
├── src/
│   ├── components/     # UI、会話、画像、ナレッジベースなどのコンポーネント
│   ├── services/       # AI サービス、同期、パーサー
│   ├── store/          # Zustand 状態管理
│   ├── db/             # IndexedDB ローカル設定
│   └── i18n/           # 多言語翻訳
├── tailwind.config.js  # Tailwind CSS 設定
└── vite.config.js      # Vite ビルド設定
```

## 🔒 セキュリティ

*   **マスターパスワード保護**：初回起動時にマスターパスワードを設定し、ローカルに保存されるすべての機密情報を暗号化します。
*   **エンドツーエンド暗号化**：クラウドに同期されるデータはクライアント側で AES-GCM を使用して暗号化されます。同期サーバーが内容を読み取ることはできません。

## 🤝 貢献とフィードバック

Pull Request や [Issue](https://github.com/uxudjs/AiPiBox/issues) をお待ちしています！

ライセンス：[MIT](./LICENSE)。すべての貢献者に感謝します！

---

**AI とのインテリジェントな会話体験をお楽しみください!** 🚀
