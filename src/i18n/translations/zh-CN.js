// 简体中文翻译
export const zhCN = {
  common: {
    confirm: '确定',
    cancel: '取消',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    create: '创建',
    search: '搜索',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    reset: '重置',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    submit: '提交',
    select: '选择',
    clear: '清除',
    apply: '应用',
    settings: '设置',
    help: '帮助',
    language: '语言',
    unknown: '未知',
    recommend: '推荐',
    all: '全部',
    download: '下载',
    deleteConfirm: '确定要删除吗？',
    pleaseSelect: '请选择',
    saveSuccess: '保存成功',
    reload: '重新加载'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '搜索历史对话...',
    recentConversations: '最近对话',
    multiSelect: '多选',
    cancelSelect: '取消选择',
    clearAll: '清空全部',
    deleteSelected: '删除选中',
    deleteSelectedConfirm: '确定要删除选中的 {count} 条对话吗？',
    noConversations: '暂无对话历史',
    noMatches: '未找到匹配对话',
    newConversation: '新对话',
    deleteConversation: '确定要删除这段对话吗？',
    generating: '正在生成...',
    unread: '未读消息',
    editTitle: '修改标题',
    saveTitle: '保存标题',
    cancelEdit: '取消修改',
    clearAllConfirm: '确定要清空所有对话历史吗？此操作不可撤销。'
  },

  imageFactory: {
    title: '图片工厂',
    textToImage: '文生图',
    imageToImage: '图生图',
    generate: '立即生成',
    prompt: '提示词',
    promptPlaceholder: '描述你想要生成的图片内容...',
    negativePrompt: '反向提示词',
    negativePromptPlaceholder: '不希望在图片中出现的内容...',
    parameters: '参数调节',
    resolution: '分辨率',
    steps: '采样步数',
    cfgScale: '提示词引导 (CFG)',
    seed: '种子值',
    random: '随机',
    style: '风格',
    noStyle: '无风格',
    styles: {
      cinematic: '电影感',
      photographic: '摄影',
      anime: '动漫',
      'digital-art': '数字艺术',
      'fantasy-art': '幻想艺术',
      neonpunk: '霓虹朋克',
      '3d-model': '3D 模型'
    },
    gallery: '图片库',
    noHistory: '暂无生成的图片',
    referenceImage: '参考图片',
    uploadHint: '点击或拖拽图片上传',
    selectModel: '选择绘画模型',
    noImageModels: '未检测到支持绘画的模型',
    clearAllConfirm: '确定要清空所有生成的图片吗？此操作不可撤销。',
    deleteConfirm: '确定要删除选中的 {count} 张图片吗？'
  },

  settings: {
    title: '设置',
    tabs: {
      llm: '提供商与模型',
      presets: '预设模型',
      conversation: '对话设置',
      search: '联网搜索',
      knowledgeBase: '知识库',
      general: '一般设置',
      security: '安全与密码',
      proxy: '网络与代理',
      logs: '系统日志',
      help: '帮助说明'
    },

    llm: {
      title: '模型提供商',
      addCustom: '添加自定义',
      notConfigured: '未配置',
      modelsCount: '{count} 个模型',
      apiKey: 'API 密钥 (Masked)',
      apiKeyPlaceholder: 'sk-...',
      apiFormat: 'API 格式',
      apiEndpoint: 'API 端点 (Base URL)',
      serverRegion: '服务器区域',
      customEndpoint: '自定义 API 端点',
      customEndpointHint: '留空使用所选区域的默认地址',
      fetchModels: '自动获取模型列表',
      testConnection: '测试连接',
      connectionSuccess: '连接成功！',
      connectionFailed: '连接失败',
      fetchSuccess: '成功获取 {count} 个模型',
      fetchFailed: '获取失败: {error}',
      fetchLargeConfirm: '检测到 {count} 个模型，数量过多可能导致界面卡顿。\n\n建议在设置中只勾选常用模型。\n\n是否继续加载所有模型？',
      modelManagement: '模型管理',
      searchModel: '搜索模型...',
      newModel: '新建',
      editModel: '编辑模型',
      deleteModel: '删除模型',
      deleteModelConfirm: '确定删除模型 "{name}"？',
      selectToShow: '勾选以在对话界面显示该模型，点击图标手动调整能力标识',
      backToList: '返回列表',
      configuration: '配置',
      customConfigHint: '自定义 API 地址和安全密钥'
    },

    region: {
      china: '华北2（北京）',
      singapore: '新加坡',
      us: '美国（弗吉尼亚）'
    },

    presets: {
      title: '默认模型设置',
      chatModel: '默认聊天模型',
      namingModel: '自动命名模型',
      searchModel: '联网搜索模型',
      compressionModel: '对话压缩模型',
      ocrModel: 'OCR模型',
      selectModel: '选择模型...',
      clearSelection: '清除选择（使用当前对话模型）',
      fallbackHint: '未配置时将自动使用当前对话模型作为{type}',
      noModels: '未检测到可用模型',
      configureModels: '请在设置中配置并勾选所需模型',
      noKey: '未配置密钥',
      selectProvider: '选择模型提供商'
    },

    conversation: {
      newConversationPresets: '新对话的预设设定',
      conversationSettings: '对话设定',
      prompt: '提示',
      promptPlaceholder: '回复需高效、简明、真实。适当使用emoji。',
      resetToDefault: '重置为预设值',
      contextLimit: '上下文消息数量上限',
      contextLimitHint: '限制 AI 可以访问的历史消息数量，设置为"无限制"将使用所有历史消息',
      unlimited: '无限制',
      notSet: '未设定',
      temperature: '温度',
      topP: 'Top P',
      streaming: '流式输出',
      display: '显示',
      showWordCount: '显示消息的字数',
      showTokenCount: '显示消息的 token 消耗',
      showModelName: '显示模型名称',
      features: '功能',
      autoCollapseCode: '自动折叠代码块',
      autoGenerateTitle: '自动生成对话标题',
      spellCheck: '拼写检查',
      markdownRender: 'Markdown 渲染',
      latexRender: 'LaTeX 渲染 ( 需要 Markdown )',
      mermaidRender: 'Mermaid 图表渲染',
      autoPreviewArtifacts: '自动预览生成内容(Artifacts)',
      autoPreviewHint: '自动渲染生成的内容（例如，带有 CSS、JS、Tailwind 的 HTML）',
      pasteAsFile: '粘贴长文本为文件',
      pasteAsFileHint: '粘贴长文本时将其作为文件插入，以保持对话简洁并减少令牌消耗。'
    },

    search: {
      title: '联网搜索',
      enableSearch: '启用联网搜索',
      enableSearchHint: '允许 AI 通过搜索引擎获取最新信息',
      searchEngine: '搜索引擎',
      selectEngine: '选择搜索引擎',
      tavilyHint: 'Tavily 是专为 AI 应用设计的搜索 API，推荐使用。',
      tavilyLink: '获取 API Key: https://tavily.com',
      bingHint: '需要 Azure Bing Search API 密钥。',
      bingLink: '获取 API Key: Azure Portal',
      googleHint: '需要 Google Custom Search API Key 和 Search Engine ID。',
      googleFormat: '格式示例: AIzaSyXXXX|0123456789abcdef',
      googleLink: '获取: Google Cloud Console',
      apiKeyRequired: '需要 API 密钥',
      apiKeyRequiredHint: '请配置搜索引擎 API 密钥以启用联网搜索功能。所有搜索引擎都需要有效的 API 密钥才能正常工作。'
    },

    general: {
      title: '界面与体验',
      language: '语言 (Language)',
      selectLanguage: '选择语言',
      theme: '主题 (Theme)',
      selectTheme: '选择主题',
      systemTheme: '跟随系统',
      lightTheme: '浅色模式',
      darkTheme: '深色模式'
    },

    security: {
      title: '安全与数据管理',
      encryptionEnabled: '端到端加密保护',
      encryptionHint: '使用 AES-256 加密存储 API 密钥、对话记录及配置数据，仅在主密码解锁后可访问。',
      cloudSync: '云端同步服务',
      cloudSyncHint: '同步配置信息、对话历史、模型预设及知识库索引至云端，数据采用端到端加密。',
      syncServerOnline: '同步服务器连接正常',
      syncServerOffline: '同步服务器连接中断',
      syncServerNotAvailable: '无法访问同步服务，请确认同步接口地址配置无误',
      
      // 云端同步新增
      enableCloudSync: '开启云端同步',
      syncImages: '同步图片数据',
      syncImagesHint: '开启后将同步对话中的图片数据。由于图片较大，关闭此项可显著节省云端空间和同步流量。',
      syncImagesOffConfirm: '确定要关闭图片同步吗？关闭后云端的图片数据将被清理以节省空间。',
      autoSync: '自动实时同步',
      autoSyncHint: '检测到本地数据变更后自动发起云端同步',
      syncApiUrl: '同步服务接口地址',
      syncApiUrlHint: '留空则使用当前域名的默认路径。仅在使用自定义域名或 GitHub Pages 等静态托管时需要手动配置。',
      syncApiUrlPlaceholder: '留空则自动使用：域名 + /api/sync',
      syncNow: '立即同步',
      syncStatus: '同步状态',
      syncStatusIdle: '就绪',
      syncStatusSyncing: '同步中...',
      syncStatusSuccess: '同步成功',
      syncStatusError: '同步失败',
      lastSyncTime: '上次同步',
      neverSynced: '从未同步',
      syncSuccess: '同步成功！',
      syncFailed: '同步失败: {error}',
      syncConflicts: '检测到 {count} 个冲突',
      
      // 时间单位
      justNow: '刚刚',
      timeAgo: '{value} {unit}前',
      days: '天',
      hours: '小时',
      minutes: '分钟',
      
      // 冲突解决
      conflictResolution: '冲突解决策略',
      conflictStrategyTimestamp: '时间戳优先（最新的优先）',
      conflictStrategyLocal: '本地优先',
      conflictStrategyRemote: '云端优先',
      conflictStrategyManual: '手动选择',
      conflictDetected: '检测到数据冲突',
      conflictCount: '冲突数量',
      resolveConflict: '解决冲突',
      useLocal: '使用本地',
      useRemote: '使用云端',
      
      persistence: '登录状态保持',
      persistenceHint: '设置自动退出登录的时间，保护您的数据安全。',
      persistenceNone: '不保持 (关闭浏览器即退出)',
      persistence1d: '1 天',
      persistence5d: '5 天',
      persistence10d: '10 天',
      persistence30d: '30 天',
      selectDuration: '选择保持时长',
      exportBackup: '导出完整备份',
      importBackup: '导入备份',
      signOut: '退出登录',
      signOutConfirm: '确定要退出登录吗？',
      clearData: '清除本地和云端数据',
      clearDataConfirm: '确定要清除所有本地和云端数据吗？此操作不可撤销，包括对话历史、API配置和云端同步数据。',
      clearCloudDataFailedConfirm: '无法清除云端数据。是否仍要清除本地数据并退出？',
      exportPassword: '请输入备份加密密码（建议8位以上）：',
      importPassword: '请输入备份解密密码：',
      exportSuccess: '备份导出成功！文件大小: {size} MB',
      exportFailed: '导出失败: {error}',
      importSuccess: '备份恢复成功！',
      importFailed: '解密失败，密码可能不正确: {error}',
      conversations: '对话',
      messages: '消息',
      images: '图片',
      knowledgeBases: '知识库',
      reloadPrompt: '页面将自动重载以应用更改...'
    },

    proxy: {
      title: '网络与代理',
      proxyMode: '启用全局 API 代理',
      proxyHint: '通过服务端转发 AI 请求，解决浏览器跨域限制，提升连接稳定性。支持后台持续生成及断线后自动恢复。',
      cloudProxyUrl: '代理服务地址',
      cloudProxyHint: '留空则使用当前域名的默认路径。仅在使用自定义域名或 GitHub Pages 等静态托管时需要手动配置。',
      cloudSyncDepends: '云端同步功能依赖代理服务，禁用代理将导致同步失效'
    },

    footer: {
      saveAndApply: '保存并应用'
    },

    logs: {
      title: '系统日志',
      searchPlaceholder: '搜索日志...',
      clearLogs: '清空日志',
      clearConfirm: '确定要清空所有日志吗？',
      exportLogs: '导出 JSON',
      noLogs: '暂无日志记录',
      logDetails: '日志详情',
      copyLogs: '复制完整日志',
      level: '级别',
      module: '模块',
      content: '内容',
      totalRecords: '共 {count} 条记录',
      filteredRecords: '(已过滤 {count} 条)'
    }
  },

  conversationSettings: {
    title: '对话设置',
    loading: '加载中...',
    resetConfirm: '确定要重置为全局设置吗？',
    saveSuccess: '设置已保存！\n\n当您发送第一条消息时，这些设置将自动应用到新对话中。',
    resetToGlobal: '重置为全局设置',
    custom: '自定义',
    promptLabel: '提示 (Prompt)',
    messageLimit: '消息数量上限',
    unlimited: '无限制',
    notSet: '未设定',
    temperature: '温度',
    topP: 'Top P',
    cancel: '取消',
    saveSettings: '保存设置',
    saveAndSend: '保存并发送'
  },

  inputArea: {
    placeholder: '输入消息...',
    placeholderQuestion: '在这里输入你的问题...',
    selectModel: '选择模型',
    webSearch: '联网搜索',
    deepThinking: '深度思考',
    attachFile: '附加文件',
    conversationSettings: '对话设置',
    knowledgeBase: '知识库',
    compressConversation: '压缩对话',
    send: '发送',
    stop: '停止生成',
    interrupt: '中断',
    generating: '生成中...',
    noModels: '未检测到可用模型',
    configureModels: '请在设置中配置并勾选所需模型',
    noKey: '未配置密钥',
    unnamedProvider: '未命名提供商',
    uploadFile: '上传文件',
    selectKB: '选择知识库',
    setSystemPrompt: '已设置系统提示词',
    takePhoto: '拍照',
    manualSync: '同步',
    camera: {
      rotate: '旋转',
      retake: '重拍',
      usePhoto: '使用照片'
    },
    newConversation: '新对话',
    cameraAccessError: '无法访问摄像头：',
    interrupted: 'AI响应已被中断',
    error: '出错了: ',
    ocrNotConfigured: '未配置OCR模型，请在 设置-预设模型-OCR模型 中进行配置',
    notSet: '未设定',
    unlimited: '无限制',
    uploadDoc: '上传文档'
  },

  compression: {
    historySummary: '历史消息总结',
    autoCompressed: '自动压缩',
    tooFewMessages: '消息数量太少，无需压缩',
    modelNotConfigured: '未配置压缩模型，请在设置中配置',
    providerNotFound: '未找到压缩模型提供商',
    success: '对话压缩成功！',
    failed: '压缩失败',
    compressing: '正在压缩...',
    autoCompression: '自动压缩',
    autoCompressionHint: '当对话消息数量超过阈值时自动压缩历史消息',
    autoCompressionThreshold: '自动压缩阈值',
    autoCompressionThresholdHint: '当对话消息数量超过此值时触发自动压缩（建议设置为 50-100）',
    messages: '条消息',
    newTopic: '新话题'
  },

  model: {
    capabilities: {
      title: '模型能力',
      thinking: '深度思考',
      multimodal: '多模态',
      tools: '工具调用',
      imageGen: '绘图'
    },
    contextWindow: '上下文窗口 (Tokens)',
    maxOutput: '最大输出 (Tokens)',
    maxThinking: '最大思考长度 (Tokens)',
    maxThinkingHint: '仅针对支持思考过程的模型生效',
    modelId: '模型 ID',
    modelIdHint: '用于 API调用的模型标识符',
    displayName: '显示名称',
    displayNameHint: '在界面中显示的模型名称（从API获取模型时优先使用API返回的显示名称，否则自动推断）',
    modelIdPlaceholder: '例如: gpt-4o, claude-3-5-sonnet',
    displayNamePlaceholder: '例如: GPT-4 Omni, Claude 3.5 Sonnet',
    defaultUnlimited: '默认 (无限制)',
    fillRequired: '请填写模型 ID 和显示名称',
    idExists: '模型 ID 已存在，请使用其他 ID',
    autoInferred: '已自动推断',
    autoInfer: '自动推断',
    autoInferHint: '根据模型ID重新推断显示名称'
  },

  logs: {
    searchPlaceholder: '搜索日志...',
    level: {
      error: '错误',
      warn: '警告',
      info: '信息',
      debug: '调试'
    },
    noLogs: '暂无日志',
    exportLogs: '导出日志',
    clearLogs: '清空日志',
    clearConfirm: '确定要清空所有日志吗？',
    filters: '筛选'
  },

  fileUpload: {
    title: '上传文件',
    dragHint: '拖放文件到此处，或点击选择',
    uploading: '上传中...',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    removeFile: '移除文件',
    supportedFormats: '支持的格式',
    failed: '文件上传失败: ',
    dropHint: '松开鼠标上传文件',
    clickHint: '点击上传或拖拽文件到此处',
    supportHint: '支持 PDF、Word、PowerPoint、Excel、文本文件 (最大10MB)',
    parsing: '解析中',
    completed: '已解析',
    deleteFile: '删除文件',
    unsupportedType: '不支持的文件类型'
  },

  knowledgeBase: {
    title: '知识库',
    selectKB: '选择知识库',
    noKB: '还没有知识库',
    kbHint: '创建知识库并上传文档，以便在对话中引用',
    goToCreate: '前往创建知识库',
    noMatches: '未找到匹配的知识库',
    documentsCount: '{count} 个文档',
    chunksCount: '{count} 个分块',
    clearSelection: '清除选择',
    manageKB: '管理知识库',
    confirm: '确定',
    confirmSelection: '确认选择',
    searchKB: '搜索知识库...',
    documents: '文档',
    addDocument: '添加文档',
    management: '知识库管理',
    newKB: '新建知识库',
    kbName: '知识库名称',
    kbNamePlaceholder: '例如：技术文档库',
    kbDescription: '描述（可选）',
    kbDescriptionPlaceholder: '简单描述这个知识库的用途...',
    retrievalSettings: '检索设置',
    topK: '检索文档数量 (Top-K)',
    threshold: '相似度阈值',
    maxTokens: '最大上下文Token数',
    noDocuments: '暂无文档，请上传文档',
    deleteDocument: '删除文档',
    usageTips: '使用提示',
    usageTip1: '在对话界面点击书籍图标选择要使用的知识库',
    usageTip2: '支持 PDF, Word, Excel, PPT, Markdown 和文本文件',
    usageTip3: '文件内容会在本地解析，不会上传到外部服务器',
    usageTip4: '大型文档会自动分块并建立索引，以便快速检索',
    deleteConfirm: '确定要删除知识库"{name}"吗？此操作不可撤销。',
    deleteDocConfirm: '确定删除文档"{name}"？',
    uploadingStatus: '正在处理...',
    loadingParser: '加载解析器...',
    reading: '读取中...',
    processing: '处理中...',
    supportFormats: '支持格式：'
  },

  error: {
    networkError: '网络错误，请检查连接',
    apiError: 'API 调用失败',
    invalidResponse: '无效的响应',
    timeout: '请求超时',
    unauthorized: '未授权，请检查 API 密钥',
    unknown: '未知错误',
    saveFailed: '保存失败',
    clearDataConfirm: '此操作将清除所有本地数据（包括对话历史、设置等），确定继续吗？'
  },

  message: {
    reasoning: '深思',
    copy: '复制',
    regenerate: '重新生成',
    edit: '编辑',
    quote: '引用',
    prevBranch: '上一个分支',
    nextBranch: '下一个分支',
    wordCount: '字',
    tokens: 'Tokens: 约',
    startConversation: '开始一段对话吧',
    thinking: '正在思考...',
    generating: '正在生成回复...'
  },

  topBar: {
    incognitoConversation: '隐身对话',
    newConversation: '新对话',
    incognitoEnabled: '隐身模式已开启',
    enableIncognito: '开启隐身模式',
    incognitoActive: '隐身中',
    incognitoMode: '隐身模式'
  },

  auth: {
    welcomeBack: '欢迎回来',
    initSecurity: '初始化安全设置',
    unlockHint: '请输入访问密码以解锁您的 AI 工作站',
    setupHint: '请设置一个强密码来加密您的数据',
    passwordPlaceholder: '访问密码',
    encryptionNote: '您的 API 密钥和对话历史将使用此密码在本地进行 AES-256 加密存储。开启同步后，加密后的数据将同步至云端。',
    unlock: '解锁',
    start: '开始使用',
    passwordWeak: '密码强度不足：需至少8位，包含大小写字母、数字和特殊字符',
    passwordError: '密码错误',
    pleaseLogin: '请先登录'
  },

  ocr: {
    notSupported: '当前模型 {model} 不支持图片输入,将使用 OCR 处理图片',
    contextHeader: '[图片OCR识别结果]',
    contextIntro: '[系统注：当前模型不支持图片，以下是OCR识别出的文本，请作为用户输入处理]',
    contextFooter: '注：内容由OCR提取，可能存在误差。'
  },

  plusMenu: {
    title: '功能菜单',
    providers: '模型提供方',
    providersDesc: '配置AI服务提供商',
    presetModels: '预设模型',
    presetModelsDesc: '管理常用模型',
    webSearch: '联网搜索',
    webSearchDesc: '配置搜索引擎',
    knowledgeBase: '知识库',
    knowledgeBaseDesc: '管理文档和知识',
    fileParser: '文件解析器',
    fileParserDesc: '上传和解析文档',
    conversationSettings: '对话设定',
    conversationSettingsDesc: '设置当前对话参数',
    contentNotFound: '内容未找到',
    pageNotExist: '该发布页面不存在或已被删除。'
  },

  markdown: {
    preview: '实时预览',
    hidePreview: '收起预览',
    copy: '复制',
    copied: '已复制',
    publish: '一键发布',
    published: '已发布',
    generatingChart: '图表生成中...',
    imageSyncDisabled: '未开启图片同步',
    renderError: '内容渲染出错'
  },

  mermaid: {
    zoomIn: '放大',
    zoomOut: '缩小',
    reset: '重置',
    fullscreen: '全屏',
    exitFullscreen: '退出全屏',
    copyCode: '复制代码',
    downloadSVG: '下载SVG',
    downloadPNG: '下载PNG',
    viewCode: '查看代码',
    hideCode: '隐藏代码',
    showCode: '显示代码',
    dragHint: '拖拽移动，滚轮缩放'
  },

  document: {
    presentation: '演示文稿',
    textFile: '文本文件',
    info: '文档信息',
    fileName: '文件名',
    type: '类型',
    pages: '页数',
    sheets: '工作表',
    slides: '幻灯片数',
    size: '大小',
    contentTruncated: '内容已截断，完整内容请查看原文档',
    fileSizeExceeded: '文件大小超过限制 ({maxSize}MB)',
    unsupportedFileType: '不支持的文件类型: {fileName}',
    pptxOnly: '仅支持 .pptx 格式的 PowerPoint 文件，请将文件另存为 .pptx 后重试。',
    readFailed: '读取文件失败'
  },

  services: {
    sync: {
      checksumFailed: '数据完整性校验失败',
      versionIncompatible: '备份文件版本不兼容: {version}',
      validationFailed: '数据验证失败: {errors}'
    },
    search: {
      queryEmpty: '搜索查询不能为空',
      untitled: '无标题',
      noSnippet: '无摘要',
      unsupportedEngine: '不支持的搜索引擎: {engine}'
    },
    database: {
      unsupportedType: '不支持的数据库类型: {dbType}'
    }
  },

  app: {
    initFailed: '初始化失败，请尝试刷新页面',
    dbAccessError: '无法访问数据库，请检查浏览器设置',
    clearCache: '清除缓存并重启',
    supportHint: '如果问题持续出现，请尝试清除浏览器缓存或联系支持。',
    clearCacheConfirm: '确定要清除所有缓存数据并重启吗？这将登出应用并重置本地设置。',
    unknownError: '未知错误',
    appError: '应用程序遇到错误',
    errorDetails: '错误详情：',
    tryContinue: '尝试继续',
    clearData: '清除数据'
  },

  store: {
    chat: {
      titleGeneratorPrompt: '阅读输入，生成简短精准标题(10字内)\n规则：\n1. 直接输出标题，无标点/解释性文字\n2. 概括核心主题，使用简体中文\n3. 无法概括则输出“新对话”',
      titleGeneratorUser: '输入：{message}\n标题：',
      cannotCompressIncognito: '无法压缩隐身模式对话',
      conversationIdRequired: '未指定对话ID',
      conversationEmpty: '对话为空，无需压缩',
      cannotApplyCompressionIncognito: '无法应用压缩到隐身模式对话',
      compressedMessageNotFound: '找不到最后一个被压缩的消息'
    },
    knowledgeBase: {
      untitled: '未命名知识库'
    },
    file: {
      documentPrefix: '文档 {index}'
    }
  },

  crypto: {
    decryptFailed: '解密失败：密码错误或数据损坏'
  },

  validation: {
    checksumFailed: '校验和计算失败',
    invalidDataFormat: '数据格式无效',
    configMissing: '配置数据缺失或格式错误',
    providerConfigInvalid: '提供商配置格式错误',
    defaultModelsInvalid: '默认模型配置格式错误',
    conversationsInvalid: '对话数据格式错误',
    messagesInvalid: '消息数据格式错误',
    imagesInvalid: '图片历史数据格式错误',
    publishedCodesInvalid: '已发布代码数据格式错误',
    knowledgeBasesInvalid: '知识库数据格式错误',
    logsInvalid: '系统日志数据格式错误',
    collectionFailed: '数据收集失败: {error}',
    validationFailed: '数据验证失败: {errors}',
    restoreFailed: '数据恢复失败: {error}'
  },

  help: {
    title: '帮助中心',
    description: '本文档旨在为您提供详尽的部署、配置及功能使用指南',
    footer: '若需深入了解技术细节，请参阅官方文档或通过 GitHub 提交反馈',

    deployment: {
      title: '多平台部署指南',
      platforms: {
        title: '环境自动识别',
        content: 'AiPiBox 能自动感知其运行环境，并针对 Vercel、Netlify 及 Cloudflare Pages 等平台应用最佳化配置。'
      },
      vercel: {
        title: 'Vercel 部署',
        content: '支持域名特征：*.vercel.app\n代理入口：/api/ai-proxy（全自动）\n同步接口：/api/sync（全自动）\n平台特性：支持 Serverless Functions。部署时无需额外配置代理 URL。'
      },
      netlify: {
        title: 'Netlify 部署',
        content: '支持域名特征：*.netlify.app\n代理入口：/api/ai-proxy（全自动）\n同步接口：/api/sync（全自动）\n平台特性：支持 Netlify Functions。推荐通过 GitHub 仓库直接关联部署。'
      },
      cloudflare: {
        title: 'Cloudflare Pages 部署',
        content: '支持域名特征：*.pages.dev\n代理入口：/api/ai-proxy（全自动）\n同步接口：/api/sync（全自动）\n平台特性：基于 Cloudflare Workers 运行，无请求时长限制。云端同步需在 Dashboard 中绑定 KV 命名空间（变量名：SYNC_DATA）。'
      },
      github: {
        title: 'GitHub Pages 部署',
        content: '支持域名特征：*.github.io\n核心局限：GitHub Pages 仅支持静态托管，不支持运行后端逻辑。\n关键配置：必须在设置中手动指定生产环境的“云端代理 URL”以启用 AI 功能。'
      },
      local: {
        title: '本地开发调试',
        content: '识别特征：localhost 或 127.0.0.1\n启动方案：推荐使用 npm run dev:full 同时启动前端与代理服务。若仅运行 npm run dev，需确保已正确配置远程代理地址。'
      }
    },

    proxy: {
      title: '代理服务配置',
      overview: {
        title: '代理机制说明',
        content: 'AI 代理服务核心在于中转客户端请求，解决 CORS 跨域限制，并在复杂的网络环境下提供更可靠的长连接保持能力，确保流式输出的连续性。'
      },
      cloudProxy: {
        title: '生产代理配置',
        content: '在 Vercel、Netlify 或 Cloudflare Pages 等原生环境下，系统会自动采用相对路径，通常无需手动设置。仅当您进行跨域部署、使用自定义域名或 GitHub Pages 时，才需显式配置此接口地址。'
      },
      localProxy: {
        title: '本地调试配置',
        content: '默认指向 http://localhost:5000/api/proxy。此设置主要用于开发阶段，确保前端能正常访问本地模拟的后端代理逻辑。'
      },
      autoDetect: {
        title: '智能环境识别',
        content: '系统会根据当前 Hostname 动态切换代理策略：\n- 平台原生域名：自动关联内部 Serverless 路由\n- 静态托管域名：回退至手动配置的远程代理接口\n- 开发环境：关联 Vite 代理配置'
      }
    },

    sync: {
      title: '云端同步机制',
      overview: {
        title: '同步功能综述',
        content: '云端同步允许将多维数据安全存储至远程数据库。所有敏感数据均在客户端完成端到端加密，即便在传输过程中，任何第三方（包括同步服务器）也无法窥视您的数据内容。'
      },
      setup: {
        title: '启用步骤指南',
        content: '1. 完成后端函数平台部署\n2. 配置 DATABASE_URL 及 DATABASE_TYPE 环境变量\n3. 在安全设置中开启云端同步并设置独立同步密码\n4. 执行首次手动同步以建立基准'
      },
      platforms: {
        title: '后端存储支持',
        content: 'Vercel/Netlify：兼容 MySQL 及 PostgreSQL 数据库。\nCloudflare Pages：利用 KV 键值存储实现轻量化数据同步。'
      }
    },

    features: {
      title: '核心功能解析',
      aiProxy: {
        title: '全自动 API 代理',
        content: '技术亮点：\n- 完整的 Server-Sent Events 流式传输支持\n- 自动指数退避重试机制\n- 全局请求缓存以降低 API 消耗\n- 自动化 API Key 遮罩处理'
      },
      imageGen: {
        title: '多模式图像生成',
        content: '集成文生图与图生图模式。支持自定义分辨率、采样步数及 CFG 参数。系统通过代理服务下发指令，并缓存固定种子的生成结果以提升效率。'
      },
      knowledge: {
        title: '本地化知识库',
        content: '知识库采用本地解析策略：\n- 兼容 PDF, Word, Excel, PPT 及各类文本格式\n- 文档内容完全在浏览器端索引，不上传原始文件\n- 启用云同步后，仅同步知识库的元数据与索引结构'
      }
    }
  }
};