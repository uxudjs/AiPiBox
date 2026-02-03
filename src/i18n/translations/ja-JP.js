// 日本語翻訳
export const jaJP = {
  common: {
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    delete: '削除',
    edit: '編集',
    create: '作成',
    search: '検索',
    loading: '読み込み中...',
    success: '成功',
    error: 'エラー',
    warning: '警告',
    info: '情報',
    reset: 'リセット',
    close: '閉じる',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    submit: '送信',
    select: '選択',
    clear: 'クリア',
    apply: '適用',
    settings: '設定',
    help: 'ヘルプ',
    language: '言語',
    unknown: '不明',
    recommend: '推奨',
    all: 'すべて',
    download: 'ダウンロード',
    deleteConfirm: '削除してもよろしいですか？',
    pleaseSelect: '選択してください',
    saveSuccess: '保存成功'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '会話履歴を検索...',
    recentConversations: '最近の会話',
    multiSelect: '複数選択',
    cancelSelect: '選択解除',
    clearAll: 'すべてクリア',
    deleteSelected: '選択項目を削除',
    deleteConfirm: '選択した {count} 件の会話を削除しますか？',
    noConversations: '会話履歴がありません',
    noMatches: '一致する会話が見つかりません',
    newConversation: '新しいチャット',
    deleteConversation: 'この会話を削除しますか？',
    generating: '生成中...',
    unread: '未読メッセージ',
    editTitle: 'タイトルを編集',
    saveTitle: 'タイトルを保存',
    cancelEdit: '編集をキャンセル',
    clearAllConfirm: 'すべての会話履歴をクリアしてもよろしいですか？この操作は元に戻せません。'
  },

  settings: {
    title: '設定',
    tabs: {
      llm: 'プロバイダーとモデル',
      presets: 'モデルプリセット',
      conversation: '会話設定',
      search: 'Web検索',
      knowledgeBase: 'ナレッジベース',
      general: '一般設定',
      security: 'セキュリティとパスワード',
      proxy: 'ネットワークとプロキシ',
      logs: 'システムログ',
      help: 'ヘルプガイド',
      help: 'ヘルプガイド'
    },

    llm: {
      title: 'モデルプロバイダー',
      addCustom: 'カスタム追加',
      notConfigured: '未設定',
      modelsCount: '{count} モデル',
      apiKey: 'APIキー (マスク済み)',
      apiKeyPlaceholder: 'sk-...',
      apiFormat: 'APIフォーマット',
      apiEndpoint: 'APIエンドポイント (ベースURL)',
      fetchModels: 'モデルリストを自動取得',
      testConnection: '接続テスト',
      connectionSuccess: '接続成功！',
      connectionFailed: '接続失敗',
      fetchSuccess: '{count} モデルの取得に成功しました',
      fetchFailed: '取得失敗: {error}',
      fetchLargeConfirm: '{count} 個のモデルが検出されました。モデル数が多すぎるとインターフェースが重くなる可能性があります。\n\n設定でよく使うモデルのみを選択することをお勧めします。\n\nすべてのモデルを読み込みますか？',
      modelManagement: 'モデル管理',
      searchModel: 'モデルを検索...',
      newModel: '新規',
      editModel: 'モデルを編集',
      deleteModel: 'モデルを削除',
      deleteModelConfirm: 'モデル "{name}" を削除しますか？',
      selectToShow: 'チェックして会話画面に表示、アイコンをクリックして機能を調整',
      backToList: 'リストに戻る',
      configuration: '設定',
      customConfigHint: 'カスタムAPIアドレスとセキュリティキー'
    },

    presets: {
      title: 'デフォルトモデル設定',
      chatModel: 'デフォルトチャットモデル',
      namingModel: '自動命名モデル',
      searchModel: 'Web検索モデル',
      compressionModel: '会話圧縮モデル',
      ocrModel: 'OCRモデル',
      selectModel: 'モデルを選択...',
      clearSelection: '選択をクリア（現在の会話モデルを使用）',
      fallbackHint: '未設定の場合、自動的に現在の会話モデルを{type}として使用します',
      noModels: '利用可能なモデルが検出されません',
      configureModels: '設定でモデルを構成して選択してください',
      noKey: 'APIキーが未設定',
      selectProvider: 'モデルプロバイダーを選択'
    },

    conversation: {
      newConversationPresets: '新規会話のプリセット',
      conversationSettings: '会話設定',
      prompt: 'プロンプト',
      promptPlaceholder: '効率的で、明快かつ簡潔なスタイル。適切に絵文字を使用。盲目的に同意せず、事実を優先',
      resetToDefault: 'デフォルトにリセット',
      contextLimit: 'コンテキストメッセージ制限',
      contextLimitHint: 'AIがアクセスできる履歴メッセージ数を制限します。「無制限」に設定するとすべての履歴を使用します',
      unlimited: '無制限',
      notSet: '未設定',
      temperature: '温度',
      topP: 'Top P',
      streaming: 'ストリーム出力',
      display: '表示',
      showWordCount: '文字数を表示',
      showTokenCount: 'トークン消費を表示',
      showModelName: 'モデル名を表示',
      features: '機能',
      autoCollapseCode: 'コードブロックを自動折りたたみ',
      autoGenerateTitle: 'タイトルを自動生成',
      spellCheck: 'スペルチェック',
      markdownRender: 'Markdownレンダリング',
      latexRender: 'LaTeXレンダリング（Markdownが必要）',
      mermaidRender: 'Mermaidチャートレンダリング',
      autoPreviewArtifacts: 'Artifactsを自動プレビュー',
      autoPreviewHint: '生成されたコンテンツを自動的にレンダリング（例：CSS、JS、Tailwindを含むHTML）',
      pasteAsFile: '長文をファイルとして貼り付け',
      pasteAsFileHint: '長文を貼り付ける際、ファイルとして挿入し、会話を簡潔に保ち、トークン消費を削減します。'
    },

    search: {
      title: 'Web検索',
      enableSearch: 'Web検索を有効化',
      enableSearchHint: 'AIが検索エンジンを通じて最新情報を取得できるようにします',
      searchEngine: '検索エンジン',
      selectEngine: '検索エンジンを選択',
      tavilyHint: 'TavilyはAIアプリケーション向けに設計された検索APIです。推奨。',
      tavilyLink: 'APIキー取得: https://tavily.com',
      bingHint: 'Azure Bing Search APIキーが必要です。',
      bingLink: 'APIキー取得: Azureポータル',
      googleHint: 'Google Custom Search APIキーと検索エンジンIDが必要です。',
      googleFormat: 'フォーマット例: AIzaSyXXXX|0123456789abcdef',
      googleLink: '取得: Google Cloud Console',
      apiKeyRequired: 'APIキーが必要',
      apiKeyRequiredHint: 'Web検索機能を有効にするには、検索エンジンのAPIキーを設定してください。すべての検索エンジンで有効なAPIキーが必要です。'
    },

    general: {
      title: 'インターフェースと体験',
      language: '言語',
      selectLanguage: '言語を選択',
      theme: 'テーマ',
      selectTheme: 'テーマを選択',
      systemTheme: 'システムに従う',
      lightTheme: 'ライト',
      darkTheme: 'ダーク'
    },

    security: {
      title: 'セキュリティとデータ管理',
      encryptionEnabled: 'ローカルハードウェアレベル暗号化が有効',
      encryptionHint: 'キーはWeb Crypto APIとマスターパスワードを組み合わせて秘密鍵を生成します。データはIndexedDBに暗号文として保存されます。',
      cloudSync: 'クラウドデータ同期を有効化',
      cloudSyncHint: '設定と会話履歴を暗号化してクラウドサーバーに同期し、複数のデバイス間でデータを共有します。同期されるデータには、プロバイダー設定（API Keyは暗号化済み）、会話履歴、モデルプリセット、ナレッジベース設定などが含まれます。',
      syncServerOnline: '同期サービスオンライン',
      syncServerOffline: '同期サービスオフライン - 同期一時停止',
      syncServerNotAvailable: '同期サーバーが利用できません。同期APIアドレスを確認してください',
      persistence: '持続ログイン',
      selectDuration: 'ログイン期間を選択',
      persistenceNone: '無効（ブラウザを閉じるとログアウト）',
      persistence1d: '1日',
      persistence5d: '5日',
      persistence10d: '10日',
      persistence30d: '30日',
      persistenceHint: 'セキュリティのため、公共のデバイスでは「無効」を選択することをお勧めします。永続ログインは暗号化された資格情報をローカルに保存します。',
      exportBackup: '完全バックアップをエクスポート',
      importBackup: 'バックアップをインポート',
      signOut: 'ログアウト',
      signOutConfirm: 'ログアウトしてもよろしいですか？',
      clearData: 'ローカルとクラウドのデータを消去',
      clearDataConfirm: 'すべてのローカルおよびクラウドデータを消去してもよろしいですか？この操作は元に戻せません。会話履歴、API設定、クラウド同期データが含まれます。',
      clearCloudDataFailedConfirm: 'クラウドデータの消去に失敗しました。ローカルデータを消去してログアウトしますか？',
      exportPassword: 'バックアップ暗号化パスワードを入力してください（8文字以上推奨）：',
      importPassword: 'バックアップ復号化パスワードを入力してください：',
      exportSuccess: 'バックアップのエクスポートに成功しました！ファイルサイズ: {size} MB',
      exportFailed: 'エクスポートに失敗しました: {error}',
      importSuccess: 'バックアップの復元に成功しました！',
      importFailed: '復号化に失敗しました。パスワードが正しくない可能性があります: {error}',
      conversations: '会話',
      messages: 'メッセージ',
      images: '画像',
      knowledgeBases: 'ナレッジベース',
      reloadPrompt: 'ページがリロードされ、変更が適用されます...',
      
      // クラウド同期
      enableCloudSync: 'クラウド同期を有効にする',
      autoSync: '自動同期',
      autoSyncHint: 'データ変更時に自動的にクラウドに同期',
      syncApiUrl: '同期 API URL',
      syncApiUrlHint: 'クラウド同期サービスアドレス。Vercel/Netlify/Cloudflareのデフォルトドメインにデプロイする場合、システムが自動検出し、入力不要です。GitHub Pagesまたはカスタムドメインを使用する場合のみ手動設定が必要です。',
      syncApiUrlPlaceholder: 'https://your-app.vercel.app',
      syncNow: '今すぐ同期',
      syncStatus: '同期ステータス',
      syncStatusIdle: '準備完了',
      syncStatusSyncing: '同期中...',
      syncStatusSuccess: '同期成功',
      syncStatusError: '同期失敗',
      lastSyncTime: '最終同期',
      neverSynced: '未同期',
      syncSuccess: '同期に成功しました！',
      syncFailed: '同期に失敗しました: {error}',
      syncConflicts: '{count}件の競合を検出',
      
      // 時間単位
      justNow: 'たった今',
      timeAgo: '{value}{unit}前',
      days: '日',
      hours: '時間',
      minutes: '分',
      
      // 競合解決
      conflictResolution: '競合解決戦略',
      conflictStrategyTimestamp: 'タイムスタンプ優先（最新優先）',
      conflictStrategyLocal: 'ローカル優先',
      conflictStrategyRemote: 'リモート優先',
      conflictStrategyManual: '手動選択',
      conflictDetected: 'データ競合を検出',
      conflictCount: '競合数',
      resolveConflict: '競合を解決',
      useLocal: 'ローカルを使用',
      useRemote: 'リモートを使用'
    },

    proxy: {
      title: 'ネットワークとプロキシ',
      proxyMode: 'プロキシサービスを有効にする',
      proxyHint: 'すべてのAI APIリクエストをバックエンドサーバー経由でプロキシし、CORS制限を解決し、ネットワークの安定性とリクエストの継続性を確保します。すべてのAIリクエスト（チャット、画像生成、モデルリストなど）はプロキシサーバーを通じて転送され、クライアントのネットワークが切断されてもサーバー側の長時間実行リクエストは継続されます。',
      cloudProxyUrl: 'クラウドプロキシURL',
      cloudProxyHint: '本番環境のプロキシサービスアドレス。Vercel（*.vercel.app）、Netlify（*.netlify.app）、Cloudflare Pages（*.pages.dev）のデフォルトドメインにデプロイする場合、システムが自動検出し、入力不要です。GitHub Pagesまたはカスタムドメインを使用する場合のみ手動設定が必要です。\n\nローカル開発環境では自動的に http://localhost:5000/api/proxy を使用します。設定不要です。',
      cloudSyncDepends: 'クラウド同期はプロキシサービスに依存します。プロキシを無効にすると同期も停止します'
    },

    footer: {
      saveAndApply: '保存して適用'
    },

    logs: {
      title: 'システムログ',
      searchPlaceholder: 'ログを検索...',
      clearLogs: 'ログをクリア',
      clearConfirm: 'すべてのログをクリアしますか？',
      exportLogs: 'JSON エクスポート',
      noLogs: 'ログがありません',
      logDetails: 'ログ詳細',
      copyLogs: 'ログをコピー',
      level: 'レベル',
      module: 'モジュール',
      content: '内容',
      totalRecords: '合計 {count} 件',
      filteredRecords: '({count} 件をフィルタリング)'
    }
  },

  conversationSettings: {
    title: '会話設定',
    loading: '読み込み中...',
    resetConfirm: 'グローバル設定にリセットしますか？',
    saveSuccess: '設定が保存されました！\n\n最初のメッセージを送信すると、これらの設定が新しい会話に自動的に適用されます。',
    resetToGlobal: 'グローバルにリセット',
    custom: 'カスタム',
    promptLabel: 'プロンプト (Prompt)',
    messageLimit: 'メッセージ制限',
    unlimited: '無制限',
    notSet: '未設定',
    temperature: '温度',
    topP: 'Top P',
    cancel: 'キャンセル',
    saveSettings: '設定を保存',
    saveAndSend: '保存して送信'
  },

  inputArea: {
    placeholder: 'メッセージを入力...',
    placeholderQuestion: '質問をここに入力してください...',
    selectModel: 'モデルを選択',
    webSearch: 'Web検索',
    deepThinking: '深い思考',
    attachFile: 'ファイルを添付',
    conversationSettings: '会話設定',
    knowledgeBase: 'ナレッジベース',
    compressConversation: '会話を圧縮',
    send: '送信',
    stop: '停止',
    interrupt: '中断',
    generating: '生成中...',
    noModels: '利用可能なモデルが検出されません',
    configureModels: '設定でモデルを構成して選択してください',
    noKey: 'APIキーが未設定',
    unnamedProvider: '未命名プロバイダー',
    uploadFile: 'ファイルをアップロード',
    selectKB: 'ナレッジベースを選択',
    setSystemPrompt: 'システムプロンプト設定済み',
    takePhoto: '写真',
    camera: {
      rotate: '回転',
      retake: '撮り直し',
      usePhoto: '写真を使用'
    },
    newConversation: '新しい会話を作成',
    cameraAccessError: 'カメラにアクセスできません: ',
    interrupted: 'AIレスポンスが中断されました',
    error: 'エラー: ',
    ocrNotConfigured: '現在のモデルは画像入力に対応していません。設定でOCRモデルを構成するか、画像認識対応モデルを選択してください',
    notSet: '未設定',
    unlimited: '無制限',
    uploadDoc: 'ドキュメントをアップロード'
  },

  compression: {
    historySummary: '履歴要約',
    autoCompressed: '自動圧縮済み',
    tooFewMessages: 'メッセージが少なすぎるため圧縮不要',
    modelNotConfigured: '圧縮モデルが設定されていません。設定で構成してください',
    providerNotFound: '圧縮モデルプロバイダーが見つかりません',
    success: '会話の圧縮に成功しました！',
    failed: '圧縮に失敗しました',
    compressing: '圧縮中...',
    autoCompression: '自動圧縮',
    autoCompressionHint: 'メッセージ数がしきい値を超えた場合、履歴を自動的に圧縮します',
    autoCompressionThreshold: '自動圧縮しきい値',
    autoCompressionThresholdHint: 'メッセージ数がこの値を超えた場合に自動圧縮をトリガー（推奨：50-100）',
    messages: '件のメッセージ',
    newTopic: '新しいトピック'
  },

  model: {
    capabilities: {
      title: 'モデル機能',
      thinking: '深い思考',
      multimodal: 'マルチモーダル',
      tools: 'ツール呼び出し',
      imageGen: '画像生成'
    },
    contextWindow: 'コンテキストウィンドウ (トークン)',
    maxOutput: '最大出力 (トークン)',
    maxThinking: '最大思考長 (トークン)',
    maxThinkingHint: '思考プロセスをサポートするモデルのみ有効',
    modelId: 'モデルID',
    modelIdHint: 'API呼び出し用のモデル識別子',
    displayName: '表示名',
    displayNameHint: 'インターフェースに表示されるモデル名（モデル取得時にAPIから提供される表示名を優先し、それ以外は自動推定）',
    modelIdPlaceholder: '例: gpt-4o, claude-3-5-sonnet',
    displayNamePlaceholder: '例: GPT-4 Omni, Claude 3.5 Sonnet',
    defaultUnlimited: 'デフォルト（無制限）',
    fillRequired: 'モデルIDと表示名を入力してください',
    idExists: 'モデルIDがすでに存在します。別のIDを使用してください',
    autoInferred: '自動推定済み',
    autoInfer: '自動推定',
    autoInferHint: 'モデルIDに基づいて表示名を再推定'
  },

  logs: {
    searchPlaceholder: 'ログを検索...',
    level: {
      error: 'エラー',
      warn: '警告',
      info: '情報',
      debug: 'デバッグ'
    },
    noLogs: 'ログがありません',
    exportLogs: 'ログをエクスポート',
    clearLogs: 'ログをクリア',
    clearConfirm: 'すべてのログをクリアしますか？',
    filters: 'フィルター'
  },

  fileUpload: {
    title: 'ファイルをアップロード',
    dragHint: 'ファイルをここにドラッグ＆ドロップ、またはクリックして選択',
    uploading: 'アップロード中...',
    uploadSuccess: 'アップロード成功',
    uploadFailed: 'アップロード失敗',
    removeFile: 'ファイルを削除',
    supportedFormats: 'サポートされている形式',
    failed: 'アップロード失敗: ',
    dropHint: 'マウスを放してアップロード',
    clickHint: 'クリックしてアップロード、またはファイルをドラッグ＆ドロップ',
    supportHint: 'PDF、Word、PowerPoint、Excel、テキストファイル (最大10MB) をサポート',
    parsing: '解析中',
    completed: '解析完了',
    deleteFile: 'ファイルを削除'
  },

  knowledgeBase: {
    title: 'ナレッジベース',
    selectKB: 'ナレッジベースを選択',
    noKB: 'ナレッジベースがありません',
    kbHint: 'ナレッジベースを作成してドキュメントをアップロードすると、会話で引用できます',
    goToCreate: '作成ページへ',
    noMatches: '一致するナレッジベースが見つかりません',
    documentsCount: '{count} ドキュメント',
    chunksCount: '{count} チャンク',
    clearSelection: '選択をクリア',
    manageKB: '管理',
    confirm: 'OK',
    confirmSelection: '選択を確定',
    searchKB: 'ナレッジベースを検索...',
    documents: 'ドキュメント',
    addDocument: 'ドキュメントを追加',
    management: 'ナレッジベース管理',
    newKB: '新規ナレッジベース',
    kbName: 'ナレッジベース名',
    kbNamePlaceholder: '例：技術ドキュメント',
    kbDescription: '説明（任意）',
    kbDescriptionPlaceholder: 'このナレッジベースの用途を簡単に説明してください...',
    retrievalSettings: '検索設定',
    topK: '検索ドキュメント数 (Top-K)',
    threshold: '類似度しきい値',
    maxTokens: '最大コンテキストトークン数',
    noDocuments: 'ドキュメントがありません。アップロードしてください',
    deleteDocument: 'ドキュメントを削除',
    usageTips: '使い方のヒント',
    usageTip1: '会話インターフェースで本アイコンをクリックして使用するナレッジベースを選択します',
    usageTip2: 'PDF, Word, Excel, PPT, Markdown, テキストファイルをサポートしています',
    usageTip3: 'ファイル内容はローカルで解析され、外部サーバーにはアップロードされません',
    usageTip4: '大きなドキュメントは自動的にチャンク化され、高速な検索のためにインデックスされます',
    deleteConfirm: 'ナレッジベース "{name}" を削除してもよろしいですか？この操作は取り消せません。',
    deleteDocConfirm: 'ドキュメント "{name}" を削除してもよろしいですか？',
    uploadingStatus: '処理中...',
    loadingParser: 'パーサーを読み込み中...',
    reading: '読み取り中...',
    processing: '処理中...',
    supportFormats: 'サポート形式：'
  },

  error: {
    networkError: 'ネットワークエラー、接続を確認してください',
    apiError: 'API呼び出し失敗',
    invalidResponse: '無効な応答',
    timeout: 'リクエストタイムアウト',
    unauthorized: '未承認、APIキーを確認してください',
    unknown: '不明なエラー',
    saveFailed: '保存失敗',
    clearDataConfirm: 'この操作はすべてのローカルデータ（会話履歴、設定など）をクリアします。続けてもよろしいですか？'
  },

  message: {
    reasoning: '思考中',
    copy: 'コピー',
    regenerate: '再生成',
    edit: '編集',
    quote: '引用',
    prevBranch: '前のブランチ',
    nextBranch: '次のブランチ',
    wordCount: '文字',
    tokens: 'トークン: 約',
    startConversation: '会話を開始しましょう',
    thinking: '思考中...',
    generating: '回答を生成中...'
  },

  topBar: {
    incognitoConversation: 'シークレット会話',
    newConversation: '新規会話',
    incognitoEnabled: 'シークレットモードが有効です',
    enableIncognito: 'シークレットモードを有効にする',
    incognitoActive: 'シークレット中',
    incognitoMode: 'シークレットモード'
  },

  auth: {
    welcomeBack: 'おかえりなさい',
    initSecurity: 'セキュリティの初期設定',
    unlockHint: 'アクセスパスワードを入力して、AIワークステーションのロックを解除してください',
    setupHint: 'データを暗号化するための強力なパスワードを設定してください',
    passwordPlaceholder: 'アクセスパスワード',
    encryptionNote: 'APIキーと会話履歴はこのパスワードを使用してローカルでAES-256暗号化保存されます。同期を有効にすると、暗号化されたデータがクラウドに同期されます。',
    unlock: 'ロック解除',
    start: '利用開始',
    passwordWeak: 'パスワードの強度が不足しています：8文字以上で、英大文字・小文字、数字、特殊文字を含める必要があります',
    passwordError: 'パスワードが正しくありません',
    pleaseLogin: '先にログインしてください'
  },

  ocr: {
    notSupported: '現在のモデル {model} は画像入力に対応していないため、OCR で画像を処理します',
    contextHeader: '[OCRテキスト認識結果]',
    contextIntro: 'ユーザーが画像をアップロードしました。現在のモデルは画像入力に対応していないため、システムはOCR技術を使用して画像からテキストを抽出しました。以下は認識されたテキスト内容です。ユーザー入力の一部として処理してください：',
    contextFooter: '注意：上記の内容はOCRによって自動抽出されたもので、認識エラーが含まれる可能性があります。'
  },

  imageFactory: {
    title: '画像ファクトリー',
    textToImage: 'テキストから画像',
    imageToImage: '画像から画像',
    generate: '生成',
    prompt: 'プロンプト',
    promptPlaceholder: '生成したい画像を説明してください...',
    negativePrompt: 'ネガティブプロンプト',
    negativePromptPlaceholder: '画像に含めたくない内容...',
    parameters: 'パラメーター',
    resolution: '解像度',
    steps: 'サンプリングステップ',
    cfgScale: 'CFGスケール',
    seed: 'シード',
    random: 'ランダム',
    style: 'スタイル',
    noStyle: 'スタイルなし',
    styles: {
      cinematic: '映画風',
      photographic: '写真',
      anime: 'アニメ',
      'digital-art': 'デジタルアート',
      'fantasy-art': 'ファンタジーアート',
      neonpunk: 'ネオンパンク',
      '3d-model': '3Dモデル'
    },
    gallery: 'ギャラリー',
    noHistory: '生成された画像がありません',
    referenceImage: '参考画像',
    uploadHint: 'クリックまたはドラッグしてアップロード',
    selectModel: 'モデルを選択',
    noImageModels: '画像生成モデルが検出されません',
    clearAllConfirm: 'すべての生成画像をクリアしますか？この操作は元に戻せません。',
    deleteConfirm: '選択した {count} 枚の画像を削除しますか？'
  },

  plusMenu: {
    title: '機能メニュー',
    providers: 'プロバイダー',
    providersDesc: 'AIサービスプロバイダーを設定',
    presetModels: 'プリセットモデル',
    presetModelsDesc: 'よく使うモデルを管理',
    webSearch: 'Web検索',
    webSearchDesc: '検索エンジンを設定',
    knowledgeBase: 'ナレッジベース',
    knowledgeBaseDesc: 'ドキュメントと知識を管理',
    fileParser: 'ファイルパーサー',
    fileParserDesc: 'ドキュメントをアップロードして解析',
    conversationSettings: '会話設定',
    conversationSettingsDesc: '現在の会話パラメータを設定'
  },

  markdown: {
    preview: 'ライブプレビュー',
    hidePreview: 'プレビューを閉じる',
    copy: 'コピー',
    copied: 'コピー済み',
    publish: '公開',
    published: '公開済み',
    generatingChart: 'チャート生成中...'
  },

  mermaid: {
    zoomIn: '拡大',
    zoomOut: '縮小',
    reset: 'リセット',
    fullscreen: '全画面',
    exitFullscreen: '全画面を終了',
    copyCode: 'コードをコピー',
    downloadSVG: 'SVGをダウンロード',
    downloadPNG: 'PNGをダウンロード',
    viewCode: 'コードを表示',
    hideCode: 'コードを隠す',
    showCode: 'コードを表示',
    dragHint: 'ドラッグで移動、スクロールでズーム'
  },

  document: {
    presentation: 'プレゼンテーション',
    textFile: 'テキストファイル'
  },

  help: {
    title: 'ヘルプガイド',
    description: 'AiPiBoxのデプロイと設定方法、および各機能の使用方法を学ぶ',
    footer: 'さらなるヘルプが必要な場合は、プロジェクトドキュメントを参照するか、GitHubで問題を報告してください',

    deployment: {
      title: 'デプロイオプション',
      platforms: {
        title: 'サポートされるプラットフォーム',
        content: 'AiPiBoxはVercel、Netlify、Cloudflare Pages、GitHub Pages、ローカル開発環境を含む複数のデプロイプラットフォームをサポートしています。アプリケーションは実行環境を自動検出し、手動介入なしで適切な設定を使用します。'
      },
      vercel: {
        title: 'Vercelデプロイ',
        content: 'ドメインパターン *.vercel.app で自動検出。\nプロキシパス：/api/ai-proxy（自動）\n同期パス：/api/sync（自動）\nServerless Functionsをサポート、300秒の実行制限。\n\nデプロイ方法：\n1. Vercel CLIを使用：vercel --prod\n2. Vercelダッシュボード経由でGitHubリポジトリをインポート\n\nクラウドプロキシURLの設定不要、システムが自動検出します。'
      },
      netlify: {
        title: 'Netlifyデプロイ',
        content: 'ドメインパターン *.netlify.app で自動検出。\nプロキシパス：/api/ai-proxy（自動）\n同期パス：/api/sync（自動）\nNetlify Functionsをサポート、300秒の実行制限。\n\nデプロイ方法：\n1. Netlify CLIを使用：netlify deploy --prod\n2. Netlifyダッシュボード経由でGitHubリポジトリを接続\n\nクラウドプロキシURLの設定不要、システムが自動検出します。'
      },
      cloudflare: {
        title: 'Cloudflare Pagesデプロイ',
        content: 'ドメインパターン *.pages.dev で自動検出。\nプロキシパス：/functions/ai-proxy（自動）\n同期パス：/functions/sync（自動）\nCloudflare Workersをサポート、実行時間制限なし。\n\nデプロイ方法：\n1. Wrangler CLIを使用：wrangler pages deploy dist\n2. Cloudflare Dashboard経由でGitを接続\n\nクラウド同期にKVネームスペースバインディングが必要（変数名：SYNC_DATA）。\nクラウドプロキシURLの設定不要、システムが自動検出します。'
      },
      github: {
        title: 'GitHub Pagesデプロイ',
        content: 'ドメインパターン *.github.io で自動検出。\nGitHub Pagesは静的ファイルホスティングのみサポート、バックエンド関数を実行できません。\n\nデプロイ方法：\nプロジェクトには自動デプロイワークフローが含まれ、mainブランチにプッシュすると自動デプロイされます。\n\n重要な設定：\nAI機能を使用するには外部APIサービスを設定する必要があります。\nVercelまたはCloudflareの無料プランでAPIサービスをデプロイすることをお勧めします。\n設定でクラウドプロキシURLを入力：https://your-api.vercel.app/api/ai-proxy'
      },
      local: {
        title: 'ローカル開発',
        content: 'ドメインパターン localhost または 127.0.0.1 で自動検出。\nプロキシパス：http://localhost:5000/api/proxy（自動）\n\n起動方法：\n方法1（推奨）：npm run dev:full\nプロキシサーバーと開発サーバーを自動起動。\n\n方法2：個別に起動\nターミナル1：npm run proxy\nターミナル2：npm run dev\n\n方法3：外部APIを使用\nnpm run dev のみ実行\n設定で本番環境のクラウドプロキシURLを設定。'
      }
    },

    proxy: {
      title: 'プロキシ設定',
      overview: {
        title: 'プロキシ機能概要',
        content: 'AIプロキシサービスは、すべてのAI APIリクエストを転送し、ブラウザのCORS制限を解決し、ネットワークの安定性とリクエストの継続性を確保します。すべてのAIリクエスト（チャット、画像生成、モデルリストなど）はプロキシサーバーを通じて転送され、クライアントのネットワークが切断されてもサーバー側の長時間実行リクエストは継続されます。'
      },
      cloudProxy: {
        title: 'クラウドプロキシURL',
        content: '用途：本番環境のプロキシサービスアドレス\n\n入力が必要な場合：\n1. GitHub Pagesにデプロイする場合（必須）\n2. カスタムドメインを使用する場合（推奨）\n3. フロントエンドとバックエンドを分離してデプロイする場合（必須）\n\n入力不要な場合：\n1. Vercel（*.vercel.app）にデプロイ\n2. Netlify（*.netlify.app）にデプロイ\n3. Cloudflare Pages（*.pages.dev）にデプロイ\n\nこれらのプラットフォームは自動検出し、相対パスを使用してプラットフォーム関数を呼び出すため、追加設定は不要です。'
      },
      localProxy: {
        title: 'ローカルプロキシURL',
        content: '用途：ローカル開発環境のプロキシサービスアドレス\nデフォルト値：http://localhost:5000/api/proxy\n\n使用シナリオ：\nローカル開発中に npm run proxy または npm run dev:full を実行すると、アプリケーションは自動的にこのアドレスを使用します。ローカルプロキシを実行していない場合は、本番環境のプロキシアドレスを設定してテストできます。\n\n通常は変更不要、デフォルト値を保持してください。'
      },
      autoDetect: {
        title: '環境自動検出',
        content: 'アプリケーションにはインテリジェントな環境検出機構が組み込まれており、現在のドメインに基づいて適切なプロキシ設定を自動選択します：\n\n検出ロジック：\n- *.vercel.app → /api/ai-proxy を使用\n- *.netlify.app → /api/ai-proxy を使用\n- *.pages.dev → /functions/ai-proxy を使用\n- *.github.io → 設定された外部プロキシURLを使用\n- localhost → http://localhost:5000/api/proxy を使用\n- カスタムドメイン → 設定されたクラウドプロキシURLを使用\n\nこのプロセスは完全に自動であり、開発者は実装詳細を気にする必要がありません。'
      }
    },

    sync: {
      title: 'クラウド同期',
      overview: {
        title: 'クラウド同期機能',
        content: 'クラウド同期機能により、会話履歴、設定、その他のデータをクラウドサーバーに同期し、複数のデバイス間でデータを共有し、バックアップできます。データ伝送にはエンドツーエンド暗号化が使用され、プライバシーセキュリティが確保されます。\n\n同期されるデータには次のものが含まれます：\n- 会話履歴\n- プロバイダー設定（API Keyは暗号化済み）\n- モデルプリセット設定\n- 会話設定と検索設定\n- ナレッジベース設定'
      },
      setup: {
        title: 'クラウド同期の設定',
        content: '有効化手順：\n1. バックエンド関数をサポートするプラットフォーム（Vercel/Netlify/Cloudflare）にデプロイされていることを確認\n2. データベース接続を設定（MySQLまたはPostgreSQL）\n3. 設定 → セキュリティとデータでクラウド同期を有効化\n4. 同期パスワードを設定（データ暗号化とユーザーID生成に使用）\n5. 「今すぐ同期」をクリックして最初の同期を実行\n\nデータベース設定：\nプラットフォームの環境変数で設定：\nDATABASE_URL=mysql://user:pass@host:3306/dbname\nDATABASE_TYPE=mysql'
      },
      platforms: {
        title: '異なるプラットフォームでの同期サポート',
        content: 'Vercel/Netlify：\nMySQLとPostgreSQLデータベースをサポート\nプラットフォーム設定でデータベース接続を設定する必要があります\n\nCloudflare Pages：\nKVストレージとD1データベースをサポート\nPages設定でKVネームスペースをバインドする必要があります（変数名：SYNC_DATA）\n\nGitHub Pages：\n外部同期サービスの設定が必要\n他のプラットフォームにデプロイされたAPIサービスを使用できます\n\nローカル開発：\nファイルストレージまたはリモートデータベース接続をサポート\n同期機能のテストに使用できます'
      }
    },

    features: {
      title: '機能特性',
      aiProxy: {
        title: 'AI APIプロキシ',
        content: '技術実装：\nすべてのAIリクエストはクライアントブラウザが直接送信するのではなく、クラウドサーバープロキシ経由で送信されます。これによりネットワークの安定性とリクエストの継続性が確保されます。クライアントのネットワークが切断されても、サーバー側の長時間実行リクエストは継続されます。\n\nサポートされる機能：\n- ストリーミングレスポンス伝送（Server-Sent Events）\n- リクエストキュー管理\n- 自動再試行機構（最大3回）\n- リクエストキャッシュ（モデルリスト1時間キャッシュ）\n- タイムアウト制御（最大300秒）\n- 機密情報マスキング（API Key自動非表示）\n\nパフォーマンス最適化：\n- スマートキャッシュが重複リクエストを削減\n- デバッグ用リクエスト追跡\n- グローバルCDN加速'
      },
      imageGen: {
        title: '画像生成',
        content: '画像ファクトリー機能は、テキストから画像へ、画像から画像への両方のモードをサポートし、AIプロキシサービスを通じてさまざまな画像生成モデルを呼び出します。\n\n機能特性：\n- 複数の解像度（512x512から1024x1024）\n- 調整可能なサンプリングステップとCFGガイダンス強度\n- 再現可能な生成のための固定シード値\n- さまざまな芸術スタイルプリセット\n- 画像履歴の保存\n- バッチ生成と管理\n\nすべての画像生成リクエストはクラウドプロキシを通じて生成の安定性を確保します。固定シードの結果はキャッシュされ、余分な計算を回避します。'
      },
      knowledge: {
        title: 'ナレッジベース管理',
        content: 'ナレッジベース機能により、ドキュメントをアップロードして会話で参照でき、複数のファイル形式をサポートします：\n\nサポートされる形式：\n- PDFドキュメント\n- Wordドキュメント（.docx）\n- Excelスプレッドシート（.xlsx）\n- PowerPointプレゼンテーション（.pptx）\n- テキストファイル（.txt, .md）\n- コードファイル\n\n技術実装：\nドキュメントコンテンツはローカルで解析され、ブラウザーIndexedDBに保存されます。会話中に、ドキュメントコンテンツをコンテキストに含めてAIモデルに送信できます。\n\nクラウド同期が有効になっている場合、ナレッジベース設定（ファイルコンテンツを除く）がクラウドに同期され、複数のデバイスでアクセスできます。'
      }
    }
  }
};
