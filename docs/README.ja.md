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
- **エンドツーエンド暗号化** - API キーと機密設定は Web Crypto API（ハードウェアレベル）を使用して暗号化されます。
- **オプションのクラウド同期** - クラウドデータベース（MySQL/PostgreSQL/Cloudflare KV）への暗号化バックアップをサポート。
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
- **多言語インターフェース** - 簡体字中国語、繁体字中国語、英語、日本語、韓国語をサポート。
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

# ワンコマンド起動（プロキシ + フロントエンドサーバー）
npm run dev:full

# http://localhost:3000 にアクセス
```

## 📦 デプロイ

AiPiBox は複数のデプロイ方法をサポートしており、環境を自動的に識別して API パスを構成します。

| プラットフォーム | コマンド | DB / 同期サポート | 推奨度 |
|------------------|----------|-------------------|--------|
| **Vercel** | `npm run deploy:vercel` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Netlify** | `npm run deploy:netlify` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | `npm run deploy:cf` | Cloudflare KV | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | `npm run build` | 外部プロキシが必要 | ⭐⭐⭐ |

### 1️⃣ Vercel / Netlify (推奨)
1. 本リポジトリをフォークし、プラットフォームに連携します。
2. 環境変数（任意）を設定：`DB_TYPE`, `DB_HOST`, `DB_PASSWORD` など（クラウド同期用）。
3. プラットフォームが `api/` ディレクトリ内の Serverless Functions を自動認識します。

### 2️⃣ Cloudflare Pages
1. [Cloudflare Dashboard](https://dash.cloudflare.com) で Pages プロジェクトを作成します。
2. 同期を有効にするため、`SYNC_DATA` という名前の **KV Namespace** をバインドします。
3. `npm run deploy:cf` を実行するか、Git 連携で自動デプロイします。

### 3️⃣ GitHub Pages
1. ビルドを実行：`npm run build`。
2. `dist` ディレクトリを `gh-pages` ブランチにアップロードします。
3. アプリの設定で **クラウドプロキシ URL** を手動で指定します（GitHub Pages はバックエンド実行をサポートしていないため）。

## 🛠️ 技術スタック

- **フレームワーク**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **状態管理**: [Zustand](https://github.com/pmndrs/zustand)
- **データベース**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **レンダリング**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **バックエンド**: Node.js (Vercel/Netlify) / Cloudflare Workers (Pages)

## 📁 プロジェクト構造

```
AiPiBox/
├── api/                # Vercel/Netlify Serverless API
├── functions/          # Cloudflare Pages Functions
├── proxy/              # ローカルプロキシサーバー
├── src/
│   ├── components/     # UI、会話、画像、ナレッジベースなどのコンポーネント
│   ├── services/       # AI サービス、同期、パーサー
│   ├── store/          # 状態管理
│   ├── db/             # IndexedDB 設定
│   └── i18n/           # 翻訳
├── tailwind.config.js  # スタイル設定
└── vite.config.js      # ビルド設定
```

## 🔒 セキュリティ

*   **マスターパスワード保護**：初回起動時にマスターパスワードを設定し、ローカルに保存されるすべての機密情報を暗号化します。
*   **エンドツーエンド暗号化**：クラウドに同期されるデータはクライアント側で AES-GCM を使用して暗号化されます。同期サーバーが内容を読み取ることはできません。

## 🤝 貢献とフィードバック

Pull Request や [Issue](https://github.com/uxudjs/AiPiBox/issues) をお待ちしています！

ライセンス：[MIT](./LICENSE)。すべての貢献者に感謝します！

---

**AI とのインテリジェントな会話体験をお楽しみください!** 🚀
