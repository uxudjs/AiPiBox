# 🤖 AiPiBox

<div align="center">

[![简体中文](https://img.shields.io/badge/lang-简体中文-red.svg)](../README.md)
[![English](https://img.shields.io/badge/lang-English-blue.svg)](./README.en.md)
[![日本語](https://img.shields.io/badge/lang-日本語-red.svg)](./README.ja.md)
[![繁體中文](https://img.shields.io/badge/lang-繁體中文-orange.svg)](./README.zh-TW.md)

</div>

강력하고 프라이버시를 중시하는 현대적인 AI 대화 어시스턴트 애플리케이션. 멀티 모델 통합, 지식 베이스 관리, 이미지 생성, 웹 게시 및 실시간 코드 미리보기를 지원합니다.

## ✨ 핵심 기능

### 🔐 프라이버시 및 보안
- **로컬 우선 저장** - 모든 데이터는 브라우저의 IndexedDB에 저장되며, 마스터 비밀번호로 암호화됩니다.
- **종단간 암호화** - API 키와 민감한 설정은 Web Crypto API(하드웨어 수준)를 사용하여 암호화됩니다.
- **선택적 클라우드 동기화** - 클라우드 데이터베이스(MySQL/PostgreSQL/Cloudflare KV)로의 암호화된 백업을 지원합니다.
- **서버 추적 없음** - 완전히 클라이언트 측에서 실행되어 사용자의 프라이버시를 보호합니다.

### 💬 스마트 대화
- **멀티 모델 지원** - OpenAI, Claude, Gemini, Azure, Groq, DeepSeek 등 주요 모델을 지원합니다.
- **사용자 정의 제공자** - OpenAI API와 호환되는 모든 서비스를 추가할 수 있습니다.
- **메시지 트리 구조** - 분기 대화를 지원하여 언제든지 다른 대화 경로를 탐색하고 되돌아갈 수 있습니다.
- **스트리밍 응답** - AI의 응답을 실시간으로 표시하며 생성 중단이 가능합니다.
- **자동 명명** - 대화 제목을 지능적으로 생성합니다.
- **컨텍스트 관리** - **대화 압축** 기능을 통해 대화 컨텍스트 길이를 스마트하게 제어합니다.

### 🎨 창작 및 강화
- **Artifacts 미리보기** - HTML/CSS/JS/Tailwind 코드 블록을 자동으로 렌더링하여 실시간 대화형 미리보기를 제공합니다.
- **원클릭 게시** - 대화 내용이나 코드 스니펫을 온라인 페이지로 게시하여 공유할 수 있습니다.
- **이미지 생성** - DALL-E 3/2, Stable Diffusion을 통합하여 텍스트로 이미지 생성, 이미지로 이미지 생성을 지원합니다.
- **웹 검색** - Tavily, Google, Bing 검색 엔진을 통합하여 실시간 정보를 가져옵니다.

### 📚 지식 베이스 및 처리
- **로컬 처리** - 문서(PDF/Word/Excel/PPT/TXT)는 브라우저 측에서 파싱되며 원본 파일은 업로드되지 않습니다.
- **시맨틱 검색** - 키워드 및 청크 기반의 지능형 검색으로 AI 답변을 강화합니다.
- **긴 텍스트 최적화** - 긴 텍스트를 붙여넣을 때 자동으로 파일 첨부로 변환하여 대화를 깔끔하게 유지합니다.
- **OCR 자동 폴백** - 모델이 멀티모달을 지원하지 않을 경우 자동으로 OCR을 활성화하여 이미지에서 텍스트를 추출합니다.

### 🎯 고급 기능
- **깊은 사고 모드** - AI 추론 체인(o1, DeepSeek 등 추론 모델 지원)을 활성화합니다.
- **시크릿 모드** - 흔적을 남기지 않고 로컬에 저장되지 않는 비공개 대화입니다.
- **다국어 인터페이스** - 한국어, 일본어, 영어, 간체 및 번체 중국어를 지원합니다.
- **풍부한 렌더링** - Markdown, LaTeX 수식, Mermaid 차트를 완벽하게 지원합니다.

## 🚀 빠른 시작

### 요구 사항
- Node.js >= 18.0
- npm >= 9.0

### 로컬 개발

```bash
# 프로젝트 클론
git clone https://github.com/uxudjs/AiPiBox.git
cd AiPiBox

# 의존성 설치
npm install

# 원커맨드 실행 (프록시 + 프론트엔드 서버)
npm run dev:full

# http://localhost:3000 접속
```

## 📦 배포

AiPiBox는 다양한 배포 방식을 지원하며, 실행 환경을 자동으로 감지하여 API 경로를 구성합니다.

| 플랫폼 | 명령어 | DB / 동기화 지원 | 추천도 |
|--------|-------|------------------|--------|
| **Vercel** | `npm run deploy:vercel` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Netlify** | `npm run deploy:netlify` | MySQL / PostgreSQL | ⭐⭐⭐⭐⭐ |
| **Cloudflare Pages** | `npm run deploy:cf` | Cloudflare KV | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | `npm run build` | 외부 프록시 필요 | ⭐⭐⭐ |

### 1️⃣ Vercel / Netlify (추천)
1. 이 저장소를 포크하고 플랫폼에 연결합니다.
2. 환경 변수(선택): `DB_TYPE`, `DB_HOST`, `DB_PASSWORD` 등 설정 (클라우드 동기화용).
3. 플랫폼이 `api/` 디렉토리 내의 Serverless Functions를 자동으로 인식합니다.

### 2️⃣ Cloudflare Pages
1. [Cloudflare Dashboard](https://dash.cloudflare.com)에서 Pages 프로젝트를 생성합니다.
2. 동기화를 위해 `SYNC_DATA`라는 이름의 **KV Namespace**를 바인딩합니다.
3. `npm run deploy:cf`를 실행하거나 Git 연동으로 자동 배포합니다.

### 3️⃣ GitHub Pages
1. 빌드 실행: `npm run build`.
2. `dist` 디렉토리를 `gh-pages` 브랜치에 업로드합니다.
3. 앱 설정에서 **클라우드 프록시 URL**을 수동으로 지정합니다 (GH Pages는 백엔드 실행을 지원하지 않음).

## 🛠️ 기술 스택

- **프레임워크**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **스타일링**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/)
- **상태 관리**: [Zustand](https://github.com/pmndrs/zustand)
- **데이터베이스**: [Dexie.js](https://dexie.org/) (IndexedDB)
- **렌더링**: [React Markdown](https://github.com/remarkjs/react-markdown) + [KaTeX](https://katex.org/) + [Mermaid](https://mermaid.js.org/)
- **백엔드**: Node.js (Vercel/Netlify) / Cloudflare Workers (Pages)

## 📁 프로젝트 구조

```
AiPiBox/
├── api/                # Vercel/Netlify Serverless API
├── functions/          # Cloudflare Pages Functions
├── proxy/              # 로컬 프록시 서버
├── src/
│   ├── components/     # UI, 대화, 이미지, 지식 베이스 등 컴포넌트
│   ├── services/       # AI 서비스, 동기화, 파서
│   ├── store/          # 상태 관리
│   ├── db/             # IndexedDB 설정
│   └── i18n/           # 번역
├── tailwind.config.js  # 스타일 설정
└── vite.config.js      # 빌드 설정
```

## 🔒 보안

*   **마스터 비밀번호 보호**: 처음 사용 시 마스터 비밀번호를 설정하여 로컬에 저장되는 모든 민감한 정보를 암호화합니다.
*   **종단간 암호화**: 클라우드로 동기화되는 데이터는 클라이언트 측에서 AES-GCM을 사용하여 암호화됩니다. 동기화 서버는 내용을 읽을 수 없습니다.

## 🤝 기여 및 피드백

Pull Request와 [Issue](https://github.com/uxudjs/AiPiBox/issues)를 환영합니다!

라이선스: [MIT](./LICENSE). 모든 기여해 주신 분들께 감사드립니다!

---

**AI와 함께 스마트한 대화 경험을 즐겨보세요!** 🚀
