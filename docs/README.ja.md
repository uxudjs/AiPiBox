# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.en.md)
[![한국어](https://img.shields.io/badge/lang-한국어-green.svg)](./README.ko.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)

</div>

多機能でプライバシー重視の現代的なAI会話アシスタントアプリケーション。マルチモデル、多言語、ナレッジベース管理、画像生成をサポート。

## ✨ 主な機能

### 🔐 プライバシーとセキュリティ
- **ローカル優先ストレージ** - すべてのデータはブラウザのIndexedDBに保存
- **エンドツーエンド暗号化** - APIキーと機密設定のハードウェアレベル暗号化
- **オプションのクラウド同期** - クラウドデータベースへの暗号化バックアップ
- **サーバー追跡なし** - 完全にクライアント側で動作し、ユーザーのプライバシーを保護

### 💬 インテリジェントな会話
- **マルチモデルサポート** - OpenAI、Claude、Geminiなど主流のAIモデル
- **カスタムプロバイダー** - OpenAI API互換の任意のサービスをサポート
- **コンテキスト管理** - 会話コンテキストの長さをスマートに制御
- **ストリーミング応答** - AIの応答をリアルタイムで表示
- **会話グループ** - 時間とタグで会話履歴を整理
- **自動命名** - 会話タイトルのインテリジェント生成

### 🌍 国際化
- **多言語インターフェース** - 簡体字中国語、繁体字中国語、英語、日本語、韓国語
- **AI言語制御** - 指定された言語でAIに応答するよう自動指示
- **ローカライズされた体験** - 完全なインターフェース翻訳と統一された用語

### 📚 ナレッジベース
- **ドキュメント解析** - PDF、Word、Excel、PowerPointをサポート
- **ベクトル検索** - キーワードベースのインテリジェントなドキュメント検索
- **会話統合** - ナレッジベースコンテンツのシームレスな参照
- **バッチ管理** - 効率的なドキュメントのアップロードと整理

### 🎨 画像生成
- **テキストから画像** - テキスト説明から画像を生成
- **画像から画像** - 参考画像に基づいてバリエーションを生成
- **モデル切り替え** - DALL-E、Stable Diffusionなどをサポート
- **パラメータ制御** - サイズ、品質、スタイルなどの細かい調整
- **履歴管理** - 生成された画像の保存と管理

## 🚀 クイックスタート

### 要件
- Node.js >= 18.0
- npm >= 9.0
- モダンブラウザ（Chrome、Firefox、Edge、Safari）

### ローカル開発

```bash
# プロジェクトをクローン
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev

# http://localhost:3000 にアクセス
```

## 📦 デプロイメント

AiPiBoxは複数のデプロイ方法をサポートしており、すべてのコア機能がすべてのプラットフォームで動作します。

### プラットフォーム比較

| プラットフォーム | AIプロキシ | クラウド同期 | 画像生成 | 自動デプロイ | コスト | 評価 |
|----------|----------|------------|-----------|-------------|------|--------|
| Vercel | ✅ | ✅ | ✅ | ✅ | 無料 | ⭐⭐⭐⭐⭐ |
| Netlify | ✅ | ✅ | ✅ | ✅ | 無料 | ⭐⭐⭐⭐⭐ |
| Cloudflare Pages | ✅ | ✅ | ✅ | ✅ | 無料 | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⚠️* | ⚠️* | ✅ | ✅ | 無料 | ⭐⭐⭐ |
| ローカル開発 | ✅ | ✅ | ✅ | - | - | ⭐⭐⭐⭐ |

*GitHub Pagesは外部APIサービスの設定が必要

### 1️⃣ Vercel（推奨）

**利点**: シンプルなデプロイ、強力なパフォーマンス、自動HTTPS、グローバルCDN

#### 方法1: CLIデプロイ（最速）

```bash
# 1. Vercel CLIをインストール
npm install -g vercel

# 2. Vercelにログイン
vercel login

# 3. プロジェクトディレクトリからデプロイ
vercel --prod

# またはショートカットを使用
npm run deploy:vercel
```

#### 方法2: Webインターフェース（初心者向け）

1. **このリポジトリをフォーク**
2. [vercel.com](https://vercel.com) にアクセスしてログイン
3. **"Add New Project"** をクリック
4. インポートしたGitHubリポジトリを選択
5. **フレームワークプリセット**: `Vite`を選択
6. **ビルド設定**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
7. **"Deploy"** をクリック

#### 環境変数（オプション）

クラウド同期機能を有効にする場合:

```
DATABASE_TYPE=mysql
DATABASE_URL=mysql://user:password@host:3306/aipibox
```

---

### 2️⃣ Netlify

#### CLIデプロイ

```bash
# Netlify CLIをインストール
npm install -g netlify-cli

# ログイン
netlify login

# プロジェクトを初期化（初回のみ）
netlify init

# 本番環境にデプロイ
netlify deploy --prod
```

#### Webインターフェース

1. [netlify.com](https://netlify.com) にアクセス
2. **"Add new site"** → **"Import an existing project"**
3. GitHubを選択して認証
4. AiPiBoxリポジトリを選択
5. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **"Deploy site"** をクリック

---

### 3️⃣ Cloudflare Pages

#### CLIデプロイ

```bash
# Wrangler CLIをインストール
npm install -g wrangler

# Cloudflareにログイン
wrangler login

# プロジェクトをビルド
npm run build

# Cloudflare Pagesにデプロイ
wrangler pages deploy dist --project-name=aipibox
```

#### Webインターフェース

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にアクセス
2. **Workers & Pages** を選択
3. **"Create application"** → **"Pages"** → **"Connect to Git"**
4. GitHubを選択
5. ビルド設定:
   - Build command: `npm run build`
   - Build output directory: `/dist`
6. **"Save and Deploy"** をクリック

---

### 4️⃣ GitHub Pages

**注意**: GitHub Pagesは静的ファイルのみをホストでき、バックエンドAPIを実行できません。外部プロキシサービスの設定が必要です。

#### 自動デプロイ（事前設定済み）

1. **このリポジトリをフォーク**
2. リポジトリ **Settings** → **Pages**
3. **Source** を `GitHub Actions` に設定
4. Actionsの完了を待つ
5. `https://<username>.github.io/AiPiBox/` にアクセス

#### 外部APIサービスの設定

**推奨: Vercel無料プランを使用**

1. Vercelでこのプロジェクトをデプロイ（API用のみ）
2. Vercelデプロイメントスを取得: `https://aipibox-api.vercel.app`
3. GitHub Pagesアプリで:
   - **設定** → **ネットワークとプロキシ**
   - **クラウドプロキシURL**: `https://aipibox-api.vercel.app/api/ai-proxy`
   - **保存して適用**

---

### 5️⃣ ローカル開発

#### 完全な環境セットアップ

```bash
# プロジェクトをクローン
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 依存関係をインストール
npm install

# ワンコマンドで起動（プロキシ + 開発サーバー）
npm run dev:full

# または個別に起動:
# ターミナル1: プロキシサーバーを起動
npm run proxy

# ターミナル2: フロントエンド開発サーバーを起動
npm run dev
```

`http://localhost:3000` にアクセスして使用。

#### 環境の自動検出

アプリは自動的にローカル環境を検出し、以下を使用します:
- プロキシアドレス: `http://localhost:5000/api/proxy`
- 同期アドレス: `http://localhost:5000/api/sync`

手動設定は不要です！

---

### 🔧 デプロイ後の設定

デプロイ方法に関係なく、初回アクセス時に必要な設定:

1. **アクセスパスワードを設定**: ローカルデータの暗号化用
2. **APIキーを設定**:
   - **設定** → **プロバイダーとモデル**
   - OpenAI、Claudeなどのサービスのc APIキーを追加
   - **接続をテスト**で検証
   - **保存して適用**
3. **言語を選択**: 設定 → 一般 → 言語

🎉 これで使用を開始できます！

---

### 📚 詳細なドキュメント

- [📖 完全なデプロイガイド](../DEPLOYMENT_GUIDE.md)
- [🌐 クラウドプロキシ設定](../CLOUD_PROXY_SETUP.md)
- [💾 クラウド同期設定](../CLOUD_SYNC_SETUP.md)

## 🛠️ 技術スタック

- **React 18** - UIフレームワーク
- **Vite** - 高速ビルドツール
- **Tailwind CSS** - CSSフレームワーク
- **Zustand** - 状態管理
- **Dexie.js** - IndexedDBラッパー

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています - 詳細は[LICENSE](https://github.com/uxudjs/AiPiBox/blob/main/LICENSE)ファイルをご覧ください

## 📞 連絡先

- プロジェクトホームページ: [https://github.com/uxudjs/AiPiBox](https://github.com/uxudjs/AiPiBox)
- Issue Tracker: [https://github.com/uxudjs/AiPiBox/issues](https://github.com/uxudjs/AiPiBox/issues)
- ディスカッション: [https://github.com/uxudjs/AiPiBox/discussions](https://github.com/uxudjs/AiPiBox/discussions)

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=uxudjs/AiPiBox&type=Date)](https://star-history.com/#uxudjs/AiPiBox&Date)

---

**AIとのインテリジェントな会話体験をお楽しみください！** 🚀
