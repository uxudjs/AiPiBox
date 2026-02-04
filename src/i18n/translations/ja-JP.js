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
      help: 'ヘルプセンター'
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
      encryptionEnabled: 'エンドツーエンドの暗号化保護',
      encryptionHint: 'API キー、会話記録、設定データを AES-256 で暗号化し、マスターパスワードでロック解除後にのみアクセス可能です。',
      cloudSync: 'クラウド同期サービス',
      cloudSyncHint: '設定、会話履歴、モデルプリセット、ナレッジベースインデックスをエンドツーエンド暗号化でクラウドに同期します。',
      syncServerOnline: '同期サーバー接続正常',
      syncServerOffline: '同期サーバー接続切断',
      syncServerNotAvailable: '同期サービスにアクセスできません。同期インターフェースアドレスの設定が正しいか確認してください',
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
      syncImages: '画像データの同期',
      syncImagesHint: '会話内の画像データを同期します。画像はサイズが大きいため、この項目をオフにすると、クラウド容量と同期トラフィックを大幅に節約できます。',
      syncImagesOffConfirm: '画像同期をオフにしてもよろしいですか？オフにすると、スペースを節約するためにクラウド上の画像データがクリーンアップされます。',
      autoSync: '自動リアルタイム同期',
      autoSyncHint: 'ローカルデータの変更を検出したときに自動的にクラウド同期を開始します',
      syncApiUrl: '同期サービスインターフェースアドレス',
      syncApiUrlHint: '空欄にすると現在のドメインのデフォルトパスを使用します。カスタムドメインや GitHub Pages などの静的ホスティングの場合のみ手動設定が必要です。',
      syncApiUrlPlaceholder: '空欄にすると自動使用：ドメイン + /api/sync',
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
      proxyMode: 'グローバル API プロキシを有効にする',
      proxyHint: 'サーバー経由で AI リクエストを転送し、ブラウザのクロスドメイン制限を回避して接続の安定性を向上させます。',
      cloudProxyUrl: 'プロキシサービス URL',
      cloudProxyHint: '空欄にすると現在のドメインのデフォルトパスを使用します。カスタムドメインや GitHub Pages などの静的ホスティングの場合のみ手動設定が必要です。',
      cloudSyncDepends: 'クラウド同期機能はプロキシサービスに依存します。プロキシを無効にすると同期が失敗します'
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
    manualSync: '同期',
    camera: {
      rotate: '回転',
      retake: '撮り直し',
      usePhoto: '写真を使用'
    },
    newConversation: '新規',
    cameraAccessError: 'カメラにアクセスできません: ',
    interrupted: 'AIレスポンスが中断されました',
    error: 'エラー: ',
    ocrNotConfigured: 'OCRモデルが設定されていません。「設定 - プリセットモデル - OCRモデル」で設定してください',
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
    failed: '会話の圧縮に失敗しました',
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
    deleteFile: 'ファイルを削除',
    unsupportedType: 'サポートされていないファイル形式'
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
    generatingChart: 'チャート生成中...',
    imageSyncDisabled: '画像同期が未有効'
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
    textFile: 'テキストファイル',
    info: 'ドキュメント情報',
    fileName: 'ファイル名',
    type: 'タイプ',
    pages: 'ページ数',
    sheets: 'シート',
    slides: 'スライド数',
    size: 'サイズ',
    contentTruncated: 'コンテンツが切り捨てられました。完全な内容は元のドキュメントをご覧ください',
    fileSizeExceeded: 'ファイルサイズが制限を超えています ({maxSize}MB)',
    unsupportedFileType: 'サポートされていないファイルタイプ: {fileName}',
    pptxOnly: '.pptx形式のPowerPointファイルのみサポートされています。ファイルを .pptx として保存してから再試行してください。',
    readFailed: 'ファイルの読み取りに失敗しました'
  },

  services: {
    sync: {
      checksumFailed: 'データ整合性チェックに失敗しました',
      versionIncompatible: 'バックアップファイルのバージョンが互換性がありません: {version}',
      validationFailed: 'データ検証に失敗しました: {errors}'
    },
    search: {
      queryEmpty: '検索クエリを空にすることはできません',
      untitled: 'タイトルなし',
      noSnippet: 'スニペットなし',
      unsupportedEngine: 'サポートされていない検索エンジン: {engine}'
    },
    database: {
      unsupportedType: 'サポートされていないデータベースタイプ: {dbType}'
    }
  },

  app: {
    initFailed: '初期化に失敗しました。ページを更新してみてください',
    dbAccessError: 'データベースにアクセスできません。ブラウザの設定を確認してください'
  },

  store: {
    chat: {
      titleGeneratorPrompt: 'あなたはプロの会話タイトル生成アシスタントです。ユーザーの入力を読み、短く正確なタイトル（10文字以内）を生成してください。\n\nルール：\n1. タイトルを直接出力し、句読点、引用符、または説明テキストを含めないでください。\n2. タイトルは会話の主要なトピックを要約する必要があります。\n3. 要約できない場合は「新しい会話」と出力してください。',
      titleGeneratorUser: 'ユーザー入力: {message}\n\nタイトルを生成してください：',
      cannotCompressIncognito: 'シークレットモードの会話を圧縮できません',
      conversationIdRequired: '会話IDが指定されていません',
      conversationEmpty: '会話が空です。圧縮は不要です',
      cannotApplyCompressionIncognito: 'シークレットモードの会話に圧縮を適用できません',
      compressedMessageNotFound: '最後に圧縮されたメッセージが見つかりません'
    },
    knowledgeBase: {
      untitled: '無題の知識ベース'
    },
    file: {
      documentPrefix: 'ドキュメント {index}'
    }
  },

  crypto: {
    decryptFailed: '解増に失敗しました：パスワードが間違っているか、データが破損しています'
  },

  validation: {
    checksumFailed: 'チェックサム計算に失敗しました',
    invalidDataFormat: '無効なデータ形式',
    configMissing: '設定データが欠落しているか、形式が無効です',
    providerConfigInvalid: 'プロバイダ設定の形式が無効です',
    defaultModelsInvalid: 'デフォルトモデル設定の形式が無効です',
    conversationsInvalid: '会話データの形式が無効です',
    messagesInvalid: 'メッセージデータの形式が無効です',
    imagesInvalid: '画像履歴データの形式が無効です',
    publishedCodesInvalid: '公開コードデータの形式が無効です',
    knowledgeBasesInvalid: '知識ベースデータの形式が無効です',
    logsInvalid: 'システムログデータの形式が無効です',
    collectionFailed: 'データ収集に失敗しました: {error}',
    validationFailed: 'データ検証に失敗しました: {errors}',
    restoreFailed: 'データ復元に失敗しました: {error}'
  },

  help: {
    title: 'ヘルプセンター',
    description: 'このドキュメントは、デプロイ、設定、および機能の使用に関する詳細なガイドを提供することを目的としています',
    footer: '技術的な詳細については、公式ドキュメントを参照するか、GitHub を通じてフィードバックを送信してください',

    deployment: {
      title: 'マルチプラットフォームデプロイガイド',
      platforms: {
        title: '環境の自動識別',
        content: 'AiPiBox は実行環境を自動的に感知し、Vercel、Netlify、および Cloudflare Pages などのプラットフォームに対して最適化された設定を適用します。'
      },
      vercel: {
        title: 'Vercel デプロイ',
        content: 'サポートされるドメイン特徴：*.vercel.app\nプロキシエントリ：/api/ai-proxy (全自動)\n同期インターフェース：/api/sync (全自動)\nプラットフォーム特性：Serverless Functions をサポート。デプロイ時に追加のプロキシ URL 設定は不要です。'
      },
      netlify: {
        title: 'Netlify デプロイ',
        content: 'サポートされるドメイン特徴：*.netlify.app\nプロキシエントリ：/api/ai-proxy (全自動)\n同期インターフェース：/api/sync (全自動)\nプラットフォーム特性：Netlify Functions をサポート。GitHub リポジトリから直接連携してデプロイすることをお勧めします。'
      },
      cloudflare: {
        title: 'Cloudflare Pages デプロイ',
        content: 'サポートされるドメイン特徴：*.pages.dev\nプロキシエントリ：/api/ai-proxy (全自動)\n同期インターフェース：/api/sync (全自動)\nプラットフォーム特性：Cloudflare Workers 上で動作し、リクエスト時間の制限はありません。クラウド同期には、ダッシュボードで KV ネームスペース (変数名: SYNC_DATA) をバインドする必要があります。'
      },
      github: {
        title: 'GitHub Pages デプロイ',
        content: 'サポートされるドメイン特徴：*.github.io\n核心的な制限：GitHub Pages は静いホスティングのみをサポートし、バックエンドロジックの実行はサポートしていません。\n重要な設定：AI 機能を有効にするには、設定で本番環境の「クラウドプロキシ URL」を手動で指定する必要があります。'
      },
      local: {
        title: 'ローカル開発とデバッグ',
        content: '識別特徴：localhost または 127.0.0.1\n起動プラン：npm run dev:full を使用して、フロントエンドとプロキシサービスを同時に起動することをお勧めします。npm run dev のみを実行する場合は、リモートプロキシアドレスが正しく設定されていることを確認してください。'
      }
    },

    proxy: {
      title: 'プロキシサービス設定',
      overview: {
        title: 'プロキシメカニズムの説明',
        content: 'AI プロキシサービスの核心は、クライアントリクエストを中継し、CORS クロスドメイン制限を解決し、複雑なネットワーク環境でより信頼性の高い長時間接続維持機能を提供して、ストリーミング出力の連続性を確保することにあります。'
      },
      cloudProxy: {
        title: '本番プロキシ設定',
        content: 'Vercel、Netlify、または Cloudflare Pages などのネイティブ環境では、システムは自動的に相対パスを採用するため、通常は手動設定は不要です。クロスドメインデプロイ、カスタムドメイン、または GitHub Pages を使用する場合にのみ、このインターフェースアドレスを明示的に設定する必要があります。'
      },
      localProxy: {
        title: 'ローカルデバッグ設定',
        content: 'デフォルトは http://localhost:5000/api/proxy です。この設定は主に開発段階で使用され、フロントエンドがローカルでシミュレートされたバックエンドプロキシロジックに正常にアクセスできるようにします。'
      },
      autoDetect: {
        title: 'インテリジェントな環境識別',
        content: 'システムは現在のホスト名に基づいてプロキシ戦略を動的に切り替えます：\n- プラットフォームネイティブドメイン：内部 Serverless ルートに自動的に関連付けられます\n- 静的ホスティングドメイン：手動で設定されたリモートプロキシインターフェースにフォールバックします\n- 開発環境：Vite プロキシ設定に関連付けられます'
      }
    },

    sync: {
      title: 'クラウド同期メカニズム',
      overview: {
        title: '同期機能の概要',
        content: 'クラウド同期により、多次元データをリモートデータベースに安全に保存できます。すべての機密データはクライアント側でエンドツーエンドで暗号化されるため、送信中に同期サーバーを含む第三者がデータの内容を覗き見ることはできません。'
      },
      setup: {
        title: '有効化手順ガイド',
        content: '1. バックエンド関数プラットフォームのデプロイを完了する\n2. DATABASE_URL および DATABASE_TYPE 環境変数を設定する\n3. セキュリティ設定でクラウド同期をオンにし、独自の同期パスワードを設定する\n4. 基準を確立するために初回の手動同期を実行する'
      },
      platforms: {
        title: 'バックエンドストレージのサポート',
        content: 'Vercel/Netlify：MySQL および PostgreSQL データベースと互換性があります。\nCloudflare Pages：KV キーバリューストレージを利用して軽量なデータ同期を実現します。'
      }
    },

    features: {
      title: 'コア機能の解析',
      aiProxy: {
        title: 'フルオート API プロキシ',
        content: '技術的なハイライト：\n- 完全な Server-Sent Events ストリーミング転送のサポート\n- 自動指数バックオフ再試行メカニズム\n- API 消費を抑えるためのグローバルリクエストキャッシュ\n- 自動化された API Key マスキング処理'
      },
      imageGen: {
        title: 'マルチモード画像生成',
        content: '文生図（テキストから画像）と図生図（画像から画像）モードを統合。カスタム解像度、サンプリングステップ、および CFG パラメータをサポート。システムはプロキシサービスを通じて指示を出し、効率を高めるために固定シードの生成結果をキャッシュします。'
      },
      knowledge: {
        title: 'ローカライズされたナレッジベース',
        content: 'ナレッジベースはローカル解析戦略を採用しています：\n- PDF、Word、Excel、PPT、および各種テキスト形式に対応\n- ドキュメントの内容は完全にブラウザ側でインデックスされ、元のファイルはアップロードされません\n- クラウド同期を有効にした後は、ナレッジベースのメタデータとインデックス構造のみが同期されます'
      }
    }
  }
};
