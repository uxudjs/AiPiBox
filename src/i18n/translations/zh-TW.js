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
    pleaseSelect: '請選擇'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '搜尋歷史對話...',
    recentConversations: '最近對話',
    multiSelect: '多選',
    cancelSelect: '取消選擇',
    clearAll: '清空全部',
    deleteSelected: '刪除已選',
    deleteConfirm: '確定要刪除已選的 {count} 條對話嗎？',
    noConversations: '暫無對話歷史',
    noMatches: '未找到符合的對話',
    newConversation: '新對話',
    deleteConversation: '確定要刪除這段對話嗎？',
    generating: '生成中...',
    unread: '未讀訊息',
    editTitle: '修改標題',
    saveTitle: '保存標題',
    cancelEdit: '取消修改'
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
      encryptionEnabled: '端到端加密已啟用',
      encryptionHint: '您的 API 金鑰和對話數據使用您的主密碼進行 AES-256 加密存儲。',
      cloudSync: '雲端同步',
      cloudSyncHint: '將配置和對話歷史加密同步至雲端服務器，實現多設備資料共享。同步的資料包括：提供商配置（API Key已加密）、對話歷史、模型預設、知識庫配置等。',
      cloudSyncRequiresProxy: '雲端同步需要先啟用代理服務',
      proxyOnline: '代理服務線上',
      proxyOffline: '代理服務離線 - 雲端同步已暫停',
      proxyNotAvailable: '代理伺服器不可用，請先啟動代理伺服器',
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
      enableCloudSync: '啟用雲端同步',
      autoSync: '自動同步',
      autoSyncHint: '資料變更時自動同步到雲端',
      syncApiUrl: '同步 API 位址',
      syncApiUrlHint: '雲端同步服務地址。當部署在Vercel/Netlify/Cloudflare默認域名時，系統自動檢測，無需填寫。僅在使用GitHub Pages或自定義域名時需要手動配置。',
      syncApiUrlPlaceholder: 'https://your-app.vercel.app',
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
      proxyMode: '啟用代理服務',
      proxyHint: '通過後端服務器代理所有AI API請求，解決CORS跨域限制，確保網路穩定性和請求連續性。所有AI請求（聊天、圖像生成、模型清單等）均通過代理服務器轉發，即使用戶端網路中斷，服務端長連接請求仍可繼續執行。',
      cloudProxyUrl: '雲端代理 URL',
      cloudProxyHint: '生產環境代理服務地址。當部署在Vercel（*.vercel.app）、Netlify（*.netlify.app）、Cloudflare Pages（*.pages.dev）默認域名時，系統自動檢測，無需填寫。僅在使用GitHub Pages或自定義域名時需要手動配置。',
      localProxyUrl: '本地代理 URL',
      localProxyHint: '本地開發環境代理服務地址，默認值：http://localhost:5000/api/proxy。需要先運行 npm run proxy 或 npm run dev:full 啟動本地代理服務。如未運行本地代理，可配置生產環境代理地址用於測試。',
      cloudSyncDepends: '雲端同步依賴於代理服務，停用後雲端同步也將停止'
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
    camera: {
      rotate: '旋轉',
      retake: '重拍',
      usePhoto: '使用照片'
    },
    newConversation: '建立新對話',
    cameraAccessError: '無法存取攝影機：',
    interrupted: 'AI 回應已被中斷',
    error: '出錯了: ',
    ocrNotConfigured: '當前模型不支援圖片處理，請在設定中配置OCR模型或選擇支援圖像識別的模型',
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
    deleteFile: '刪除檔案'
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
    kbDescription: '描述（建議）',
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
    unknown: '未知錯誤'
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
    passwordError: '密碼錯誤'
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
      neonpunk: '霸虹龐克',
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
    conversationSettingsDesc: '設置當前對話參數'
  },

  markdown: {
    preview: '實時預覽',
    hidePreview: '收起預覽',
    copy: '複製',
    copied: '已複製',
    publish: '一鍵發佈',
    published: '已發佈',
    generatingChart: '圖表生成中...'
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
    textFile: '文字檔案'
  },

  help: {
    title: '幫助說明',
    description: '了解如何部署和配置AiPiBox，以及各項功能的使用方法',
    footer: '如需更多幫助，請查閱專案文件或在GitHub上提交問題回饋',

    deployment: {
      title: '部署方式',
      platforms: {
        title: '支持的平台',
        content: 'AiPiBox支持多種部署平台，包括Vercel、Netlify、Cloudflare Pages、GitHub Pages以及本地開發環境。應用會自動偵測運行環境並使用相應的配置，無需手動介入。'
      },
      vercel: {
        title: 'Vercel部署',
        content: '使用域名特徵 *.vercel.app 自動識別。\n代理路徑：/api/ai-proxy（自動）\n同步路徑：/api/sync（自動）\n支持Serverless Functions，最長執行300秒。\n\n部署方式：\n1. 使用Vercel CLI：vercel --prod\n2. 通過Vercel網頁導入GitHub儲存庫\n\n無需配置雲端代理URL，系統自動檢測。'
      },
      netlify: {
        title: 'Netlify部署',
        content: '使用域名特徵 *.netlify.app 自動識別。\n代理路徑：/api/ai-proxy（自動）\n同步路徑：/api/sync（自動）\n支持Netlify Functions，最長執行300秒。\n\n部署方式：\n1. 使用Netlify CLI：netlify deploy --prod\n2. 通過Netlify網頁連接GitHub儲存庫\n\n無需配置雲端代理URL，系統自動檢測。'
      },
      cloudflare: {
        title: 'Cloudflare Pages部署',
        content: '使用域名特徵 *.pages.dev 自動識別。\n代理路徑：/functions/ai-proxy（自動）\n同步路徑：/functions/sync（自動）\n支持Cloudflare Workers，無執行時間限制。\n\n部署方式：\n1. 使用Wrangler CLI：wrangler pages deploy dist\n2. 通過Cloudflare Dashboard連接Git\n\n雲端同步需要配置KV命名空間（變量名：SYNC_DATA）。\n無需配置雲端代理URL，系統自動檢測。'
      },
      github: {
        title: 'GitHub Pages部署',
        content: '使用域名特徵 *.github.io 自動識別。\nGitHub Pages僅支持靜態檔案託管，無法運行後端函數。\n\n部署方式：\n專案包含自動部署工作流程，推送到main分支即可自動部署。\n\n重要配置：\n必須配置外部API服務才能使用AI功能。\n建議使用Vercel或Cloudflare免費套餐部署API服務。\n在設置中填寫雲端代理URL：https://your-api.vercel.app/api/ai-proxy'
      },
      local: {
        title: '本地開發',
        content: '使用域名特徵 localhost 或 127.0.0.1 自動識別。\n代理路徑：http://localhost:5000/api/proxy（自動）\n\n啟動方式：\n方式一（推薦）：npm run dev:full\n自動啟動代理伺服器和開發伺服器。\n\n方式二：分別啟動\n終端1：npm run proxy\n終端2：npm run dev\n\n方式三：使用外部API\n只運行 npm run dev\n在設置中配置生產環境的雲端代理URL。'
      }
    },

    proxy: {
      title: '代理配置',
      overview: {
        title: '代理功能概述',
        content: 'AI代理服務用於轉發所有AI API請求，解決瀏覽器CORS跨域限制，確保網路穩定性和請求連續性。所有AI請求（聊天、圖像生成、模型清單等）都通過代理伺服器進行，即使用戶端網路中斷，伺服端的長連接請求仍可繼續執行。'
      },
      cloudProxy: {
        title: '雲端代理URL',
        content: '用途：生產環境的代理服務地址\n\n何時需要填寫：\n1. 使用GitHub Pages部署時（必須）\n2. 使用自定義域名時（建議）\n3. 前後端分離部署時（必須）\n\n何時無需填寫：\n1. 部署到Vercel（*.vercel.app）\n2. 部署到Netlify（*.netlify.app）\n3. 部署到Cloudflare Pages（*.pages.dev）\n\n這些平台會自動檢測並使用相對路徑調用本平台的函數服務，無需額外配置。'
      },
      localProxy: {
        title: '本地代理URL',
        content: '用途：本地開發環境的代理服務地址\n默認值：http://localhost:5000/api/proxy\n\n使用場景：\n在本地開發時，如果運行了 npm run proxy 或 npm run dev:full，應用會自動使用此地址。如果未運行本地代理，可以在此配置生產環境的代理地址進行測試。\n\n通常情況下無需修改此項，保持默認值即可。'
      },
      autoDetect: {
        title: '環境自動偵測',
        content: '應用內置智能環境偵測機制，根據當前存取的域名自動選擇合適的代理配置：\n\n偵測逻輯：\n- *.vercel.app → 使用 /api/ai-proxy\n- *.netlify.app → 使用 /api/ai-proxy\n- *.pages.dev → 使用 /functions/ai-proxy\n- *.github.io → 使用配置的外部代理URL\n- localhost → 使用 http://localhost:5000/api/proxy\n- 自定義域名 → 使用配置的雲端代理URL\n\n這個過程完全自動，開發者無需關心底層實現細節。'
      }
    },

    sync: {
      title: '雲端同步',
      overview: {
        title: '雲端同步功能',
        content: '雲端同步功能允許您將對話歷史、配置設置等資料同步到雲端伺服器，實現多設備資料共享和備份。資料傳輸採用端到端加密，確保隱私安全。\n\n同步的資料包括：\n- 對話歷史記錄\n- 提供商配置（API Key已加密）\n- 預設模型配置\n- 對話設置和搜索設置\n- 知識庫配置'
      },
      setup: {
        title: '配置雲端同步',
        content: '啟用步驟：\n1. 確保已部署到支持後端函數的平台（Vercel/Netlify/Cloudflare）\n2. 配置資料庫連接（MySQL或PostgreSQL）\n3. 在設置 → 安全與資料中啟用雲端同步\n4. 設置同步密碼（用於資料加密和生成使用者ID）\n5. 點擊“立即同步”進行首次同步\n\n資料庫配置：\n需要在平台的環境變量中設置：\nDATABASE_URL=mysql://user:pass@host:3306/dbname\nDATABASE_TYPE=mysql'
      },
      platforms: {
        title: '不同平台的同步支持',
        content: 'Vercel/Netlify：\n支持MySQL和PostgreSQL資料庫\n需要在平台設置中配置資料庫連接\n\nCloudflare Pages：\n支持KV儲存和D1資料庫\n需要在Pages設置中繫定KV命名空間（變量名：SYNC_DATA）\n\nGitHub Pages：\n需要配置外部同步服務\n可使用其他平台部署的API服務\n\n本地開發：\n支持檔案儲存或連接遠端資料庫\n可用於測試同步功能'
      }
    },

    features: {
      title: '功能特性',
      aiProxy: {
        title: 'AI API代理',
        content: '技術實現：\n所有AI請求都通過雲端伺服器代理進行，而非用戶端瀏覽器直接發送。這確保了網路穩定性和請求連續性，即使用戶端網路中斷，伺服端的長連接請求仍可繼續。\n\n支持特性：\n- 串流回應傳輸（Server-Sent Events）\n- 請求佇列管理\n- 自動重試機制（最多3次）\n- 請求快取（模型清單快取1小時）\n- 逾時控制（最長300秒）\n- 敏感資訊遮罩（API Key自動隱藏）\n\n效能最佳化：\n- 智能快取減少重複請求\n- 請求追蹤便於除錯\n- 全球CDN加速'
      },
      imageGen: {
        title: '圖像生成',
        content: '圖像工廠功能支持文生圖和圖生圖兩種模式，通過AI代理服務調用各種圖像生成模型。\n\n功能特性：\n- 支持多種解析度（512x512至1024x1024）\n- 可調節采樣步數和CFG引導強度\n- 支持固定種子值實現可重現生成\n- 多種藝術風格預設\n- 圖像歷史記錄保存\n- 批量生成和管理\n\n所有圖像生成請求都通過雲端代理進行，確保生成過程的穩定性。固定種子的生成結果會被快取，避免重複計算。'
      },
      knowledge: {
        title: '知識庫管理',
        content: '知識庫功能允許您上傳文檔並在對話中引用，支持多種檔案格式：\n\n支持格式：\n- PDF文檔\n- Word文檔（.docx）\n- Excel表格（.xlsx）\n- PowerPoint簡報（.pptx）\n- 文字檔案（.txt, .md）\n- 程式碼檔案\n\n技術實現：\n文檔內容在本地解析後儲存在瀏覽器的IndexedDB中，對話時可選擇性地將文檔內容包含在上下文中發送給AI模型。\n\n如果啟用雲端同步，知識庫配置（不含檔案內容）會同步到雲端，方便多設備存取。'
      }
    }
  }
};
