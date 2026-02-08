// 繁體中文翻譯
export const zhTW = {
  common: {
    confirm: '確定',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    create: '建立',
    search: '搜尋',
    loading: '載入中...',
    success: '成功',
    error: '錯誤',
    warning: '警告',
    info: '資訊',
    reset: '重設',
    close: '關閉',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    select: '選擇',
    clear: '清除',
    apply: '套用',
    settings: '設定',
    help: '說明',
    language: '語言',
    unknown: '未知',
    recommend: '推薦',
    all: '全部',
    download: '下載',
    deleteConfirm: '確定要刪除嗎？',
    pleaseSelect: '請選擇',
    saveSuccess: '儲存成功',
    reload: '重新載入'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '搜尋歷史對話...',
    recentConversations: '最近對話',
    multiSelect: '多選',
    cancelSelect: '取消選擇',
    clearAll: '清空全部',
    deleteSelected: '刪除已選',
    deleteSelectedConfirm: '確定要刪除已選的 {count} 條對話嗎？',
    noConversations: '暫無對話歷史',
    noMatches: '未找到符合的對話',
    newConversation: '新對話',
    deleteConversation: '確定要刪除這段對話嗎？',
    generating: '生成中...',
    unread: '未讀訊息',
    editTitle: '修改標題',
    saveTitle: '保存標題',
    cancelEdit: '取消修改',
    clearAllConfirm: '確定要清空所有對話歷史嗎？此操作不可撤銷。'
  },

  settings: {
    title: '設定',
    tabs: {
      llm: '提供商與模型',
      presets: '預設模型',
      conversation: '對話設定',
      search: '聯網搜尋',
      knowledgeBase: '知識庫',
      general: '一般設定',
      security: '安全與密碼',
      proxy: '網路與代理',
      logs: '系統日誌',
      help: '幫助說明'
    },

    llm: {
      title: '模型提供商',
      addCustom: '新增自訂',
      notConfigured: '未設定',
      modelsCount: '{count} 個模型',
      apiKey: 'API 金鑰 (Masked)',
      apiKeyPlaceholder: 'sk-...',
      apiFormat: 'API 格式',
      apiEndpoint: 'API 端點 (Base URL)',
      serverRegion: '伺服器區域',
      customEndpoint: '自訂 API 端點',
      customEndpointHint: '留空使用所選區域的預設位址',
      fetchModels: '自動取得模型清單',
      testConnection: '測試連線',
      connectionSuccess: '連線成功！',
      connectionFailed: '連線失敗',
      fetchSuccess: '成功取得 {count} 個模型',
      fetchFailed: '取得失敗: {error}',
      fetchLargeConfirm: '偵測到 {count} 個模型，數量過多可能導致介面卡頓。\n\n建議在設定中只勾選常用模型。\n\n是否繼續載入所有模型？',
      modelManagement: '模型管理',
      searchModel: '搜尋模型...',
      newModel: '新建',
      editModel: '編輯模型',
      deleteModel: '刪除模型',
      deleteModelConfirm: '確定刪除模型 "{name}"？',
      selectToShow: '勾選以在對話介面顯示該模型，點擊圖示手動調整能力標識',
      backToList: '返回清單',
      configuration: '設定',
      customConfigHint: '自訂 API 地址和安全金鑰'
    },

    region: {
      china: '華北2（北京）',
      singapore: '新加坡',
      us: '美國（弗吉尼亞）'
    },

    presets: {
      title: '預設模型設定',
      chatModel: '預設聊天模型',
      namingModel: '自動命名模型',
      searchModel: '聯網搜尋模型',
      compressionModel: '對話壓縮模型',
      ocrModel: 'OCR模型',
      selectModel: '選擇模型...',
      clearSelection: '清除選擇（使用目前對話模型）',
      fallbackHint: '未設定時將自動使用目前對話模型作為{type}',
      noModels: '未偵測到可用模型',
      configureModels: '請在設定中設定並勾選所需模型',
      noKey: '未設定金鑰',
      selectProvider: '選擇模型提供商'
    },

    conversation: {
      newConversationPresets: '新對話的預設設定',
      conversationSettings: '對話設定',
      prompt: '提示',
      promptPlaceholder: '風格高效，淺白且簡明扼要。適時使用 emoji。不一味贊同，優先保證事實',
      resetToDefault: '重設為預設值',
      contextLimit: '上下文訊息數量上限',
      contextLimitHint: '限制 AI 可以存取的歷史訊息數量，設定為「無限制」將使用所有歷史訊息',
      unlimited: '無限制',
      notSet: '未設定',
      temperature: '溫度',
      topP: 'Top P',
      streaming: '串流輸出',
      display: '顯示',
      showWordCount: '顯示訊息的字數',
      showTokenCount: '顯示訊息的 token 消耗',
      showModelName: '顯示模型名稱',
      features: '功能',
      autoCollapseCode: '自動折疊程式碼區塊',
      autoGenerateTitle: '自動產生對話標題',
      spellCheck: '拼字檢查',
      markdownRender: 'Markdown 渲染',
      latexRender: 'LaTeX 渲染 ( 需要 Markdown )',
      mermaidRender: 'Mermaid 圖表渲染',
      autoPreviewArtifacts: '自動預覽產生內容(Artifacts)',
      autoPreviewHint: '自動渲染產生的內容（例如，帶有 CSS、JS、Tailwind 的 HTML）',
      pasteAsFile: '貼上長文字為檔案',
      pasteAsFileHint: '貼上長文字時將其作為檔案插入，以保持對話簡潔並減少權杖消耗。'
    },

    search: {
      title: '聯網搜尋',
      enableSearch: '啟用聯網搜尋',
      enableSearchHint: '允許 AI 透過搜尋引擎取得最新資訊',
      searchEngine: '搜尋引擎',
      selectEngine: '選擇搜尋引擎',
      tavilyHint: 'Tavily 是專為 AI 應用設計的搜尋 API，推薦使用。',
      tavilyLink: '取得 API Key: https://tavily.com',
      bingHint: '需要 Azure Bing Search API 金鑰。',
      bingLink: '取得 API Key: Azure Portal',
      googleHint: '需要 Google Custom Search API Key 和 Search Engine ID。',
      googleFormat: '格式範例: AIzaSyXXXX|0123456789abcdef',
      googleLink: '取得: Google Cloud Console',
      apiKeyRequired: '需要 API 金鑰',
      apiKeyRequiredHint: '請設定搜尋引擎 API 金鑰以啟用聯網搜尋功能。所有搜尋引擎都需要有效的 API 金鑰才能正常運作。'
    },

    general: {
      title: '介面與體驗',
      language: '語言 (Language)',
      selectLanguage: '選擇語言',
      theme: '主題 (Theme)',
      selectTheme: '選擇主題',
      systemTheme: '跟隨系統',
      lightTheme: '淺色模式',
      darkTheme: '深色模式'
    },

    security: {
      title: '安全與數據管理',
      encryptionEnabled: '端到端加密保護',
      encryptionHint: '使用 AES-256 加密儲存 API 金鑰、對話記錄及配置數據，僅在主密碼解鎖後可訪問。',
      cloudSync: '雲端同步服務',
      cloudSyncHint: '同步配置資訊、對話歷史、模型預設及知識庫索引至雲端，數據採用端到端加密。',
      syncServerOnline: '同步伺服器連線正常',
      syncServerOffline: '同步伺服器連線中斷',
      syncServerNotAvailable: '無法訪問同步服務，請確認同步介面位址配置無誤',
      persistence: '登錄狀態保持',
      persistenceHint: '設置自動退出登錄的時間，保護您的數據安全。',
      persistenceNone: '不保持 (關閉瀏覽器即退出)',
      persistence1d: '1 天',
      persistence5d: '5 天',
      persistence10d: '10 天',
      persistence30d: '30 天',
      selectDuration: '選擇保持時長',
      exportBackup: '匯出完整備份',
      importBackup: '匯入備份',
      signOut: '登出',
      signOutConfirm: '確定要登出嗎？',
      clearData: '清除本地和雲端數據',
      clearDataConfirm: '確定要清除所有本地和雲端數據嗎？此操作不可撤銷，包括對話歷史、API配置和雲端同步數據。',
      clearCloudDataFailedConfirm: '無法清除雲端數據。是否仍要清除本地數據並退出？',
      exportPassword: '請輸入備份加密密碼（建議8位以上）：',
      importPassword: '請輸入備份解密密碼：',
      exportSuccess: '備份匯出成功！檔案大小: {size} MB',
      exportFailed: '匯出失敗: {error}',
      importSuccess: '備份恢復成功！',
      importFailed: '解密失敗，密碼可能不正確: {error}',
      conversations: '對話',
      messages: '訊息',
      images: '圖片',
      knowledgeBases: '知識庫',
      reloadPrompt: '頁面將自動重載以應用更改...',
      
      // 雲端同步
      enableCloudSync: '開啟雲端同步',
      syncImages: '同步圖片數據',
      syncImagesHint: '開啟後將同步對話中的圖片數據。由於圖片較大，關閉此項可顯著節省雲端空間和同步流量。',
      syncImagesOffConfirm: '確定要關閉圖片同步嗎？關閉後雲端的圖片數據將被清理以節省空間。',
      autoSync: '自動實時同步',
      autoSyncHint: '偵測到本地數據變更後自動發起雲端同步',
      syncApiUrl: '同步服務介面位址',
      syncApiUrlHint: '留空則使用當前域名的預設路徑。僅在使用自定義域名或 GitHub Pages 等靜態託管時需要手動配置。',
      syncApiUrlPlaceholder: '留空則自動使用：域名 + /api/sync',
      syncNow: '立即同步',
      syncStatus: '同步狀態',
      syncStatusIdle: '就緒',
      syncStatusSyncing: '同步中...',
      syncStatusSuccess: '同步成功',
      syncStatusError: '同步失敗',
      lastSyncTime: '上次同步',
      neverSynced: '從未同步',
      syncSuccess: '同步成功！',
      syncFailed: '同步失敗: {error}',
      syncConflicts: '檢測到 {count} 個衝突',
      
      // 時間單位
      justNow: '剛剛',
      timeAgo: '{value} {unit}前',
      days: '天',
      hours: '小時',
      minutes: '分鐘',
      
      // 衝突解決
      conflictResolution: '衝突解決策略',
      conflictStrategyTimestamp: '時間戳優先（最新的優先）',
      conflictStrategyLocal: '本地優先',
      conflictStrategyRemote: '雲端優先',
      conflictStrategyManual: '手動選擇',
      conflictDetected: '檢測到資料衝突',
      conflictCount: '衝突數量',
      resolveConflict: '解決衝突',
      useLocal: '使用本地',
      useRemote: '使用雲端'
    },

    proxy: {
      title: '網路與代理',
      proxyMode: '啟用全局 API 代理',
      proxyHint: '透過服務端轉發 AI 請求，解決瀏覽器跨域限制，提升連線穩定性。支持後台持續生成及斷線後自動恢復。',
      cloudProxyUrl: '代理服務位址',
      cloudProxyHint: '留空則使用當前域名的預設路徑。僅在使用自定義域名或 GitHub Pages 等靜態託管時需要手動配置。',
      cloudSyncDepends: '雲端同步功能依賴代理服務，停用代理將導致同步失效'
    },

    footer: {
      saveAndApply: '儲存並套用'
    },

    logs: {
      title: '系統日誌',
      searchPlaceholder: '搜尋日誌...',
      clearLogs: '清空日誌',
      clearConfirm: '確定要清空所有日誌嗎？',
      exportLogs: '匯出 JSON',
      noLogs: '暫無日誌記錄',
      logDetails: '日誌詳情',
      copyLogs: '複製完整日誌',
      level: '級別',
      module: '模組',
      content: '內容',
      totalRecords: '共 {count} 條記錄',
      filteredRecords: '(已過濾 {count} 條)'
    }
  },

  conversationSettings: {
    title: '對話設定',
    loading: '載入中...',
    resetConfirm: '確定要重設為全域設定嗎？',
    saveSuccess: '設定已儲存！\n\n當您傳送第一條訊息時，這些設定將自動套用到新對話中。',
    resetToGlobal: '重設為全域設定',
    custom: '自訂',
    promptLabel: '提示 (Prompt)',
    messageLimit: '訊息數量上限',
    unlimited: '無限制',
    notSet: '未設定',
    temperature: '溫度',
    topP: 'Top P',
    cancel: '取消',
    saveSettings: '儲存設定',
    saveAndSend: '儲存並傳送'
  },

  inputArea: {
    placeholder: '輸入訊息...',
    placeholderQuestion: '在這裡輸入你的問題...',
    selectModel: '選擇模型',
    webSearch: '聯網搜尋',
    deepThinking: '深度思考',
    attachFile: '附加檔案',
    conversationSettings: '對話設定',
    knowledgeBase: '知識庫',
    send: '傳送',
    stop: '停止產生',
    interrupt: '中斷',
    generating: '產生中...',
    noModels: '未偵測到可用模型',
    configureModels: '請在設定中設定並勾選所需模型',
    noKey: '未設定金鑰',
    unnamedProvider: '未命名提供商',
    uploadFile: '上傳檔案',
    selectKB: '選擇知識庫',
    setSystemPrompt: '已設定系統提示詞',
    takePhoto: '拍照',
    manualSync: '同步',
    camera: {
      rotate: '旋轉',
      retake: '重拍',
      usePhoto: '使用照片'
    },
    newConversation: '新對話',
    cameraAccessError: '無法存取攝影機：',
    interrupted: 'AI 回應已被中斷',
    error: '出錯了: ',
    ocrNotConfigured: '未配置OCR模型，請在 設置-預設模型-OCR模型 中進行配置',
    notSet: '未設定',
    unlimited: '無限制',
    uploadDoc: '上傳文檔',
    compressConversation: '壓縮對話'
  },
  
  compression: {
    historySummary: '歷史消息總結',
    autoCompressed: '自動壓縮',
    tooFewMessages: '消息數量過少，無需壓縮',
    modelNotConfigured: '未配置壓縮模型，請在設置中配置',
    providerNotFound: '未找到壓縮模型提供商',
    success: '對話壓縮成功！',
    failed: '壓縮失敗',
    compressing: '正在壓縮...',
    autoCompression: '自動壓縮',
    autoCompressionHint: '當對話消息數量超過閥值時自動壓縮歷史消息',
    autoCompressionThreshold: '自動壓縮閥值',
    autoCompressionThresholdHint: '當對話消息數量超過此值時觸發自動壓縮（建議設置為 50-100）',
    messages: '條消息',
    newTopic: '新話題'
  },

  model: {
    capabilities: {
      title: '模型能力',
      thinking: '深度思考',
      multimodal: '多模態',
      tools: '工具呼叫',
      imageGen: '繪圖'
    },
    contextWindow: '上下文視窗 (Tokens)',
    maxOutput: '最大輸出 (Tokens)',
    maxThinking: '最大思考長度 (Tokens)',
    maxThinkingHint: '僅針對支援思考過程的模型生效',
    modelId: '模型 ID',
    modelIdHint: '用於 API呼叫的模型識別碼',
    displayName: '顯示名稱',
    displayNameHint: '在介面中顯示的模型名稱（從API獲取模型時優先使用API返回的顯示名稱，否則自動推斷）',
    modelIdPlaceholder: '例如: gpt-4o, claude-3-5-sonnet',
    displayNamePlaceholder: '例如: GPT-4 Omni, Claude 3.5 Sonnet',
    defaultUnlimited: '預設 (無限制)',
    fillRequired: '請填寫模型 ID 和顯示名稱',
    idExists: '模型 ID 已存在，請使用其他 ID',
    autoInferred: '已自動推斷',
    autoInfer: '自動推斷',
    autoInferHint: '根據模型ID重新推斷顯示名稱'
  },

  logs: {
    searchPlaceholder: '搜尋日誌...',
    level: {
      error: '錯誤',
      warn: '警告',
      info: '資訊',
      debug: '偵錯'
    },
    noLogs: '暫無日誌',
    exportLogs: '匯出日誌',
    clearLogs: '清空日誌',
    clearConfirm: '確定要清空所有日誌嗎？',
    filters: '篩選'
  },

  fileUpload: {
    title: '上傳檔案',
    dragHint: '拖放檔案到此處，或點擊選擇',
    uploading: '上傳中...',
    uploadSuccess: '上傳成功',
    uploadFailed: '上傳失敗',
    removeFile: '移除檔案',
    supportedFormats: '支援的格式',
    failed: '檔案上傳失敗: ',
    dropHint: '鬆開滑鼠上傳檔案',
    clickHint: '點擊上傳或拖曳檔案到此處',
    supportHint: '支援 PDF、Word、PowerPoint、Excel、文字檔案 (最大10MB)',
    parsing: '解析中',
    completed: '已解析',
    deleteFile: '刪除檔案',
    unsupportedType: '不支援的檔案類型'
  },

  knowledgeBase: {
    title: '知識庫',
    selectKB: '選擇知識庫',
    noKB: '還沒有知識庫',
    kbHint: '建立知識庫並上傳文件，以便在對話中引用',
    goToCreate: '前往建立知識庫',
    noMatches: '未找到符合的知識庫',
    documentsCount: '{count} 個文件',
    chunksCount: '{count} 個分塊',
    clearSelection: '清除選擇',
    manageKB: '管理知識庫',
    confirm: '確定',
    confirmSelection: '確認選擇',
    searchKB: '搜尋知識庫...',
    documents: '文件',
    addDocument: '新增文件',
    management: '知識庫管理',
    newKB: '新建知識庫',
    kbName: '知識庫名稱',
    kbNamePlaceholder: '例如：技術文檔庫',
    kbDescription: '描述（選填）',
    kbDescriptionPlaceholder: '簡單描述這個知識庫的用途...',
    retrievalSettings: '檢索設置',
    topK: '檢索文件數量 (Top-K)',
    threshold: '相似度閾值',
    maxTokens: '最大上下文Token數',
    noDocuments: '暫無文件，請上傳文件',
    deleteDocument: '刪除文件',
    usageTips: '使用提示',
    usageTip1: '在對話介面點擊書籍圖示選擇要使用的知識庫',
    usageTip2: '支援 PDF, Word, Excel, PPT, Markdown 和文字文件',
    usageTip3: '文件內容會在本地解析，不會上傳到外部伺服器',
    usageTip4: '大型文件會自動分塊並建立索引，以便快速檢索',
    deleteConfirm: '確定要刪除知識庫"{name}"嗎？此操作無法復原。',
    deleteDocConfirm: '確定刪除文件"{name}"？',
    uploadingStatus: '正在處理...',
    loadingParser: '載入解析器...',
    reading: '讀取中...',
    processing: '處理中...',
    supportFormats: '支援格式：'
  },

  error: {
    networkError: '網路錯誤，請檢查連線',
    apiError: 'API 呼叫失敗',
    invalidResponse: '無效的回應',
    timeout: '請求逾時',
    unauthorized: '未授權，請檢查 API 金鑰',
    unknown: '未知錯誤',
    saveFailed: '儲存失敗',
    clearDataConfirm: '此操作將清除所有本地數據（包括對話歷史、設定等），確定繼續嗎？'
  },

  message: {
    reasoning: '深思',
    copy: '複製',
    regenerate: '重新生成',
    edit: '編輯',
    quote: '引用',
    prevBranch: '上一個分支',
    nextBranch: '下一個分支',
    wordCount: '字',
    tokens: 'Tokens: 約',
    startConversation: '開始一段對話吧',
    thinking: '正在思考...',
    generating: '正在生成回覆...'
  },

  topBar: {
    incognitoConversation: '隱身對話',
    newConversation: '新對話',
    incognitoEnabled: '隱身模式已開啟',
    enableIncognito: '開啟隱身模式',
    incognitoActive: '隱身中',
    incognitoMode: '隱身模式'
  },

  auth: {
    welcomeBack: '歡迎回來',
    initSecurity: '初始化安全設定',
    unlockHint: '請輸入訪問密碼以解鎖您的 AI 工作站',
    setupHint: '請設置一個強密碼來加密您的數據',
    passwordPlaceholder: '訪問密碼',
    encryptionNote: '您的 API 金鑰和對話歷史將使用此密碼在本地進行 AES-256 加密存儲。開啟同步後，加密後的數據將同步至雲端。',
    unlock: '解鎖',
    start: '開始使用',
    passwordWeak: '密碼強度不足：需至少8位，包含大小寫字母、數字和特殊字符',
    passwordError: '密碼錯誤',
    pleaseLogin: '請先登錄'
  },

  ocr: {
    notSupported: '目前模型 {model} 不支援圖片輸入，將使用 OCR 處理圖片',
    contextHeader: '[圖片內容OCR識別結果]',
    contextIntro: '使用者上傳了圖片，由於目前模型不支援圖像輸入，系統已使用OCR技術對圖片進行文字識別和內容提取。以下是識別出的文本內容，請將其作為使用者輸入的一部分進行處理：',
    contextFooter: '註：以上內容由OCR自動提取，可能包含識別誤差。'
  },

  imageFactory: {
    title: '圖片工廠',
    textToImage: '文生圖',
    imageToImage: '圖生圖',
    generate: '立即生成',
    prompt: '提示詞',
    promptPlaceholder: '描述你想要生成的圖片內容...',
    negativePrompt: '反向提示詞',
    negativePromptPlaceholder: '不希望在圖片中出現的內容...',
    parameters: '參數調節',
    resolution: '解析度',
    steps: '採樣步數',
    cfgScale: '提示詞引導 (CFG)',
    seed: '種子值',
    random: '隨機',
    style: '風格',
    noStyle: '無風格',
    styles: {
      cinematic: '電影感',
      photographic: '攝影',
      anime: '動漫',
      'digital-art': '數位藝術',
      'fantasy-art': '幻想藝術',
      neonpunk: '霓虹龐克',
      '3d-model': '3D 模型'
    },
    gallery: '圖片庫',
    noHistory: '暫無生成的圖片',
    referenceImage: '參考圖片',
    uploadHint: '點擊或拖曳圖片上傳',
    selectModel: '選擇繪畫模型',
    noImageModels: '未檢測到支援繪畫的模型',
    clearAllConfirm: '確定要清空所有生成的圖片嗎？此操作不可撤銷。',
    deleteConfirm: '確定要刪除選中的 {count} 張圖片嗎？'
  },

  plusMenu: {
    title: '功能菜單',
    providers: '模型提供方',
    providersDesc: '配置AI服務提供商',
    presetModels: '預設模型',
    presetModelsDesc: '管理常用模型',
    webSearch: '聯網搜尋',
    webSearchDesc: '配置搜尋引擎',
    knowledgeBase: '知識庫',
    knowledgeBaseDesc: '管理文檔和知識',
    fileParser: '文件解析器',
    fileParserDesc: '上傳和解析文檔',
    conversationSettings: '對話設定',
    conversationSettingsDesc: '設置當前對話參數',
    contentNotFound: '內容未找到',
    pageNotExist: '該發佈頁面不存在或已被刪除。'
  },

  markdown: {
    preview: '實時預覽',
    hidePreview: '收起預覽',
    copy: '複製',
    copied: '已複製',
    publish: '一鍵發佈',
    published: '已發佈',
    generatingChart: '圖表生成中...',
    imageSyncDisabled: '未開啟圖片同步',
    renderError: '內容渲染出錯'
  },

  mermaid: {
    zoomIn: '放大',
    zoomOut: '縮小',
    reset: '重設',
    fullscreen: '全螢幕',
    exitFullscreen: '退出全螢幕',
    copyCode: '複製程式碼',
    downloadSVG: '下載SVG',
    downloadPNG: '下載PNG',
    viewCode: '檢視程式碼',
    hideCode: '隱藏程式碼',
    showCode: '顯示程式碼',
    dragHint: '拖曳移動，滾輪縮放'
  },

  document: {
    presentation: '簡報',
    textFile: '文字檔案',
    info: '文件資訊',
    fileName: '檔案名稱',
    type: '類型',
    pages: '頁數',
    sheets: '工作表',
    slides: '投影片數',
    size: '大小',
    contentTruncated: '內容已截斷，完整內容請查看原文件',
    fileSizeExceeded: '檔案大小超過限制 ({maxSize}MB)',
    unsupportedFileType: '不支援的檔案類型: {fileName}',
    pptxOnly: '僅支援 .pptx 格式的 PowerPoint 檔案，請將檔案另存為 .pptx 後重試。',
    readFailed: '讀取檔案失敗'
  },

  services: {
    sync: {
      checksumFailed: '資料完整性校驗失敗',
      versionIncompatible: '備份檔案版本不相容: {version}',
      validationFailed: '資料驗證失敗: {errors}'
    },
    search: {
      queryEmpty: '搜尋查詢不能為空',
      untitled: '無標題',
      noSnippet: '無摘要',
      unsupportedEngine: '不支援的搜尋引擎: {engine}'
    },
    database: {
      unsupportedType: '不支援的資料庫類型: {dbType}'
    }
  },

  app: {
    initFailed: '初始化失敗，請嘗試重新整理頁面',
    dbAccessError: '無法存取資料庫，請檢查瀏覽器設定',
    clearCache: '清除快取並重啟',
    supportHint: '如果問題持續出現，請嘗試清除瀏覽器快取或聯繫支援。',
    clearCacheConfirm: '確定要清除所有快取資料並重啟嗎？這將登出應用程式並重置本地設定。',
    unknownError: '未知錯誤',
    appError: '應用程式遇到錯誤',
    errorDetails: '錯誤詳情：',
    tryContinue: '嘗試繼續',
    clearData: '清除資料'
  },

  store: {
    chat: {
      titleGeneratorPrompt: '你是一個專業的對話命名助手。你的任務是閱讀用戶的輸入，並生成一個簡短、精準的標題（不超過10個字）。\n\n規則：\n1. 直接輸出標題，不要包含任何標點符號、引號或解釋性文字。\n2. 標題應概括對話的核心主題，並使用與用戶輸入相同的語言（如用戶輸入繁體中文，則輸出繁體中文標題）。\n3. 如果無法概括，請輸出「新對話」。',
      titleGeneratorUser: '用戶輸入：{message}\n\n請生成標題：',
      cannotCompressIncognito: '無法壓縮隱身模式對話',
      conversationIdRequired: '未指定對話ID',
      conversationEmpty: '對話為空，無需壓縮',
      cannotApplyCompressionIncognito: '無法應用壓縮到隱身模式對話',
      compressedMessageNotFound: '找不到最後一個被壓縮的訊息'
    },
    knowledgeBase: {
      untitled: '未命名知識庫'
    },
    file: {
      documentPrefix: '文件 {index}'
    }
  },

  crypto: {
    decryptFailed: '解密失敗：密碼錯誤或資料損壞'
  },

  validation: {
    checksumFailed: '校驗和計算失敗',
    invalidDataFormat: '資料格式無效',
    configMissing: '配置資料缺失或格式錯誤',
    providerConfigInvalid: '提供商配置格式錯誤',
    defaultModelsInvalid: '預設模型配置格式錯誤',
    conversationsInvalid: '對話資料格式錯誤',
    messagesInvalid: '訊息資料格式錯誤',
    imagesInvalid: '圖片歷史資料格式錯誤',
    publishedCodesInvalid: '已發佈代碼資料格式錯誤',
    knowledgeBasesInvalid: '知識庫資料格式錯誤',
    logsInvalid: '系統日誌資料格式錯誤',
    collectionFailed: '資料收集失敗: {error}',
    validationFailed: '資料驗證失敗: {errors}',
    restoreFailed: '資料恢復失敗: {error}'
  },

  help: {
    title: '幫助中心',
    description: '本文檔旨在為您提供詳盡的部署、配置及功能使用指南',
    footer: '若需深入了解技術細節，請參閱官方文件或通過 GitHub 提交回饋',

    deployment: {
      title: '多平台部署指南',
      platforms: {
        title: '環境自動識別',
        content: 'AiPiBox 能自動感知其運行環境，並針對 Vercel、Netlify 及 Cloudflare Pages 等平台套用最佳化配置。'
      },
      vercel: {
        title: 'Vercel 部署',
        content: '支援域名特徵：*.vercel.app\n代理入口：/api/ai-proxy（全自動）\n同步介面：/api/sync（全自動）\n平台特性：支援 Serverless Functions。部署時無需額外配置代理 URL。'
      },
      netlify: {
        title: 'Netlify 部署',
        content: '支援域名特徵：*.netlify.app\n代理入口：/api/ai-proxy（全自動）\n同步介面：/api/sync（全自動）\n平台特性：支援 Netlify Functions。推薦通過 GitHub 儲存庫直接關聯部署。'
      },
      cloudflare: {
        title: 'Cloudflare Pages 部署',
        content: '支援域名特徵：*.pages.dev\n代理入口：/api/ai-proxy（全自動）\n同步介面：/api/sync（全自動）\n平台特性：基於 Cloudflare Workers 運行，無請求時長限制。雲端同步需在 Dashboard 中繫定 KV 命名空間（變量名：SYNC_DATA）。'
      },
      github: {
        title: 'GitHub Pages 部署',
        content: '支援域名特徵：*.github.io\n核心局限：GitHub Pages 僅支援靜態託管，不支援運行後端邏輯。\n關鍵配置：必須在設定中手動指定生產環境的「雲端代理 URL」以啟用 AI 功能。'
      },
      local: {
        title: '本地開發偵錯',
        content: '識別特徵：localhost 或 127.0.0.1\n啟動方案：推薦使用 npm run dev:full 同時啟動前端與代理服務。若僅運行 npm run dev，需確保已正確配置遠端代理位址。'
      }
    },

    proxy: {
      title: '代理服務配置',
      overview: {
        title: '代理機制說明',
        content: 'AI 代理服務核心在於中轉用戶端請求，解決 CORS 跨域限制，並在複雜的網路環境下提供更可靠的長連線保持能力，確保串流輸出的連續性。'
      },
      cloudProxy: {
        title: '生產代理配置',
        content: '在 Vercel、Netlify 或 Cloudflare Pages 等原生環境下，系統會自動套用相對路徑，通常無需手動設置。僅當您進行跨域部署、使用自定義域名或 GitHub Pages 時，才需顯式配置此介面位址。'
      },
      localProxy: {
        title: '本地偵錯配置',
        content: '默認指向 http://localhost:5000/api/proxy。此設置主要用於開發階段，確保前端能正常訪問本地模擬的後端代理邏輯。'
      },
      autoDetect: {
        title: '智慧環境識別',
        content: '系統會根據當前 Hostname 動態切換代理策略：\n- 平台原生域名：自動關聯內部 Serverless 路由\n- 靜態託管域名：回退至手動配置的遠端代理介面\n- 開發環境：關聯 Vite 代理配置'
      }
    },

    sync: {
      title: '雲端同步機制',
      overview: {
        title: '同步功能綜述',
        content: '雲端同步允許將多維數據安全儲存至遠端資料庫。所有敏感數據均在用戶端完成端到端加密，即便在傳輸過程中，任何第三方（包括同步伺服器）也無法窺視您的數據內容。'
      },
      setup: {
        title: '啟用步驟指南',
        content: '1. 完成後端函數平台部署\n2. 配置 DATABASE_URL 及 DATABASE_TYPE 環境變量\n3. 在安全設定中開啟雲端同步並設置獨立同步密碼\n4. 執行首次手動同步以建立基準'
      },
      platforms: {
        title: '後端儲存支援',
        content: 'Vercel/Netlify：相容 MySQL 及 PostgreSQL 資料庫。\nCloudflare Pages：利用 KV 鍵值儲存實現輕量化數據同步。'
      }
    },

    features: {
      title: '核心功能解析',
      aiProxy: {
        title: '全自動 API 代理',
        content: '技術亮點：\n- 完整的 Server-Sent Events 串流傳輸支援\n- 自動指數退避重試機制\n- 全域請求快取以降低 API 消耗\n- 自動化 API Key 遮罩處理'
      },
      imageGen: {
        title: '多模式圖像生成',
        content: '整合文生圖與圖生圖模式。支援自定義解析度、採樣步數及 CFG 參數。系統通過代理服務下達指令，並快取固定種子的生成結果以提升效率。'
      },
      knowledge: {
        title: '本地化知識庫',
        content: '知識庫採用本地解析策略：\n- 相容 PDF, Word, Excel, PPT 及各類文字格式\n- 文檔內容完全在瀏覽器端索引，不上傳原始檔案\n- 啟用雲同步後，僅同步知識庫的元數據與索引結構'
      }
    }
  }
};