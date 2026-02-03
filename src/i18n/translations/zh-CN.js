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
    pleaseSelect: '请选择'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '搜索历史对话...',
    recentConversations: '最近对话',
    multiSelect: '多选',
    cancelSelect: '取消选择',
    clearAll: '清空全部',
    deleteSelected: '删除选中',
    deleteConfirm: '确定要删除选中的 {count} 条对话吗？',
    noConversations: '暂无对话历史',
    noMatches: '未找到匹配对话',
    newConversation: '新对话',
    deleteConversation: '确定要删除这段对话吗？',
    generating: '正在生成...',
    unread: '未读消息',
    editTitle: '修改标题',
    saveTitle: '保存标题',
    cancelEdit: '取消修改'
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
      promptPlaceholder: '风格高效，浅白且简明扼要。适时的使用emoji。不一味的赞同，优先保证事实',
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
      encryptionEnabled: '端到端加密已启用',
      encryptionHint: '您的 API 密钥和对话数据使用您的主密码进行 AES-256 加密存储。',
      cloudSync: '云端同步',
      cloudSyncHint: '将配置和对话历史加密同步至云端服务器，实现多设备数据共享。同步的数据包括：提供商配置（API Key已加密）、对话历史、模型预设、知识库配置等。',
      cloudSyncRequiresProxy: '云同步需要先启用代理服务',
      proxyOnline: '代理服务在线',
      proxyOffline: '代理服务离线 - 云同步已暂停',
      proxyNotAvailable: '代理服务器不可用，请先启动代理服务器',
      
      // 云端同步新增
      enableCloudSync: '启用云端同步',
      autoSync: '自动同步',
      autoSyncHint: '数据变更时自动同步到云端',
      syncApiUrl: '同步 API 地址',
      syncApiUrlHint: '云端同步服务地址。当部署在Vercel/Netlify/Cloudflare默认域名时，系统自动检测，无需填写。仅在使用GitHub Pages或自定义域名时需要手动配置。',
      syncApiUrlPlaceholder: 'https://your-app.vercel.app',
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
      proxyMode: '启用代理服务',
      proxyHint: '通过后端服务器代理所有AI API请求，解决CORS跨域限制，确保网络稳定性和请求连续性。所有AI请求（聊天、图像生成、模型列表等）均通过代理服务器转发，即使客户端网络中断，服务端长连接请求仍可继续执行。',
      cloudProxyUrl: '云端代理 URL',
      cloudProxyHint: '生产环境代理服务地址。当部署在Vercel（*.vercel.app）、Netlify（*.netlify.app）、Cloudflare Pages（*.pages.dev）默认域名时，系统自动检测，无需填写。仅在使用GitHub Pages或自定义域名时需要手动配置。',
      localProxyUrl: '本地代理 URL',
      localProxyHint: '本地开发环境代理服务地址，默认值：http://localhost:5000/api/proxy。需要先运行 npm run proxy 或 npm run dev:full 启动本地代理服务。如未运行本地代理，可配置生产环境代理地址用于测试。',
      cloudSyncDepends: '云同步依赖于代理服务，禁用后云同步也将停止'
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
    camera: {
      rotate: '旋转',
      retake: '重拍',
      usePhoto: '使用照片'
    },
    newConversation: '创建新对话',
    cameraAccessError: '无法访问摄像头：',
    interrupted: 'AI响应已被中断',
    error: '出错了: ',
    ocrNotConfigured: '当前模型不支持图片处理，请在设置中配置OCR模型或选择支持图像识别的模型',
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
    deleteFile: '删除文件'
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
    unknown: '未知错误'
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
    passwordError: '密码错误'
  },

  ocr: {
    notSupported: '当前模型 {model} 不支持图片输入,将使用 OCR 处理图片',
    contextHeader: '[图片内容OCR识别结果]',
    contextIntro: '用户上传了图片,由于当前模型不支持图像输入,系统已使用OCR技术对图片进行文字识别和内容提取。以下是识别出的文本内容,请将其作为用户输入的一部分进行处理:',
    contextFooter: '注:以上内容由OCR自动提取,可能包含识别误差。'
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
    conversationSettingsDesc: '设置当前对话参数'
  },

  markdown: {
    preview: '实时预览',
    hidePreview: '收起预览',
    copy: '复制',
    copied: '已复制',
    publish: '一键发布',
    published: '已发布',
    generatingChart: '图表生成中...'
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
    textFile: '文本文件'
  },

  help: {
    title: '帮助说明',
    description: '了解如何部署和配置AiPiBox，以及各项功能的使用方法',
    footer: '如需更多帮助，请查阅项目文档或在GitHub上提交问题反馈',

    deployment: {
      title: '部署方式',
      platforms: {
        title: '支持的平台',
        content: 'AiPiBox支持多种部署平台，包括Vercel、Netlify、Cloudflare Pages、GitHub Pages以及本地开发环境。应用会自动检测运行环境并使用相应的配置，无需手动干预。'
      },
      vercel: {
        title: 'Vercel部署',
        content: '使用域名特征 *.vercel.app 自动识别。\n代理路径：/api/ai-proxy（自动）\n同步路径：/api/sync（自动）\n支持Serverless Functions，最长执行300秒。\n\n部署方式：\n1. 使用Vercel CLI：vercel --prod\n2. 通过Vercel网页导入GitHub仓库\n\n无需配置云端代理URL，系统自动检测。'
      },
      netlify: {
        title: 'Netlify部署',
        content: '使用域名特征 *.netlify.app 自动识别。\n代理路径：/api/ai-proxy（自动）\n同步路径：/api/sync（自动）\n支持Netlify Functions，最长执行300秒。\n\n部署方式：\n1. 使用Netlify CLI：netlify deploy --prod\n2. 通过Netlify网页连接GitHub仓库\n\n无需配置云端代理URL，系统自动检测。'
      },
      cloudflare: {
        title: 'Cloudflare Pages部署',
        content: '使用域名特征 *.pages.dev 自动识别。\n代理路径：/functions/ai-proxy（自动）\n同步路径：/functions/sync（自动）\n支持Cloudflare Workers，无执行时间限制。\n\n部署方式：\n1. 使用Wrangler CLI：wrangler pages deploy dist\n2. 通过Cloudflare Dashboard连接Git\n\n云端同步需要配置KV命名空间（变量名：SYNC_DATA）。\n无需配置云端代理URL，系统自动检测。'
      },
      github: {
        title: 'GitHub Pages部署',
        content: '使用域名特征 *.github.io 自动识别。\nGitHub Pages仅支持静态文件托管，无法运行后端函数。\n\n部署方式：\n项目包含自动部署工作流，推送到main分支即可自动部署。\n\n重要配置：\n必须配置外部API服务才能使用AI功能。\n建议使用Vercel或Cloudflare免费套餐部署API服务。\n在设置中填写云端代理URL：https://your-api.vercel.app/api/ai-proxy'
      },
      local: {
        title: '本地开发',
        content: '使用域名特征 localhost 或 127.0.0.1 自动识别。\n代理路径：http://localhost:5000/api/proxy（自动）\n\n启动方式：\n方式一（推荐）：npm run dev:full\n自动启动代理服务器和开发服务器。\n\n方式二：分别启动\n终端1：npm run proxy\n终端2：npm run dev\n\n方式三：使用外部API\n只运行 npm run dev\n在设置中配置生产环境的云端代理URL。'
      }
    },

    proxy: {
      title: '代理配置',
      overview: {
        title: '代理功能概述',
        content: 'AI代理服务用于转发所有AI API请求，解决浏览器CORS跨域限制，确保网络稳定性和请求连续性。所有AI请求（聊天、图像生成、模型列表等）都通过代理服务器进行，即使客户端网络中断，服务端的长连接请求仍可继续执行。'
      },
      cloudProxy: {
        title: '云端代理URL',
        content: '用途：生产环境的代理服务地址\n\n何时需要填写：\n1. 使用GitHub Pages部署时（必须）\n2. 使用自定义域名时（建议）\n3. 前后端分离部署时（必须）\n\n何时无需填写：\n1. 部署到Vercel（*.vercel.app）\n2. 部署到Netlify（*.netlify.app）\n3. 部署到Cloudflare Pages（*.pages.dev）\n\n这些平台会自动检测并使用相对路径调用本平台的函数服务，无需额外配置。'
      },
      localProxy: {
        title: '本地代理URL',
        content: '用途：本地开发环境的代理服务地址\n默认值：http://localhost:5000/api/proxy\n\n使用场景：\n在本地开发时，如果运行了 npm run proxy 或 npm run dev:full，应用会自动使用此地址。如果未运行本地代理，可以在此配置生产环境的代理地址进行测试。\n\n通常情况下无需修改此项，保持默认值即可。'
      },
      autoDetect: {
        title: '环境自动检测',
        content: '应用内置智能环境检测机制，根据当前访问的域名自动选择合适的代理配置：\n\n检测逻辑：\n- *.vercel.app → 使用 /api/ai-proxy\n- *.netlify.app → 使用 /api/ai-proxy\n- *.pages.dev → 使用 /functions/ai-proxy\n- *.github.io → 使用配置的外部代理URL\n- localhost → 使用 http://localhost:5000/api/proxy\n- 自定义域名 → 使用配置的云端代理URL\n\n这个过程完全自动，开发者无需关心底层实现细节。'
      }
    },

    sync: {
      title: '云端同步',
      overview: {
        title: '云端同步功能',
        content: '云端同步功能允许您将对话历史、配置设置等数据同步到云端服务器，实现多设备数据共享和备份。数据传输采用端到端加密，确保隐私安全。\n\n同步的数据包括：\n- 对话历史记录\n- 提供商配置（API Key已加密）\n- 预设模型配置\n- 对话设置和搜索设置\n- 知识库配置'
      },
      setup: {
        title: '配置云端同步',
        content: '启用步骤：\n1. 确保已部署到支持后端函数的平台（Vercel/Netlify/Cloudflare）\n2. 配置数据库连接（MySQL或PostgreSQL）\n3. 在设置 → 安全与数据中启用云端同步\n4. 设置同步密码（用于数据加密和生成用户ID）\n5. 点击“立即同步”进行首次同步\n\n数据库配置：\n需要在平台的环境变量中设置：\nDATABASE_URL=mysql://user:pass@host:3306/dbname\nDATABASE_TYPE=mysql'
      },
      platforms: {
        title: '不同平台的同步支持',
        content: 'Vercel/Netlify：\n支持MySQL和PostgreSQL数据库\n需要在平台设置中配置数据库连接\n\nCloudflare Pages：\n支持KV存储和D1数据库\n需要在Pages设置中绑定KV命名空间（变量名：SYNC_DATA）\n\nGitHub Pages：\n需要配置外部同步服务\n可使用其他平台部署的API服务\n\n本地开发：\n支持文件存储或连接远程数据库\n可用于测试同步功能'
      }
    },

    features: {
      title: '功能特性',
      aiProxy: {
        title: 'AI API代理',
        content: '技术实现：\n所有AI请求都通过云端服务器代理进行，而非客户端浏览器直接发送。这确保了网络稳定性和请求连续性，即使客户端网络中断，服务端的长连接请求仍可继续。\n\n支持特性：\n- 流式响应传输（Server-Sent Events）\n- 请求队列管理\n- 自动重试机制（最多3次）\n- 请求缓存（模型列表缓存1小时）\n- 超时控制（最长300秒）\n- 敏感信息遮罩（API Key自动隐藏）\n\n性能优化：\n- 智能缓存减少重复请求\n- 请求追踪便于调试\n- 全球CDN加速'
      },
      imageGen: {
        title: '图像生成',
        content: '图像工厂功能支持文生图和图生图两种模式，通过AI代理服务调用各种图像生成模型。\n\n功能特性：\n- 支持多种分辨率（512x512至1024x1024）\n- 可调节采样步数和CFG引导强度\n- 支持固定种子值实现可重现生成\n- 多种艺术风格预设\n- 图像历史记录保存\n- 批量生成和管理\n\n所有图像生成请求都通过云端代理进行，确保生成过程的稳定性。固定种子的生成结果会被缓存，避免重复计算。'
      },
      knowledge: {
        title: '知识库管理',
        content: '知识库功能允许您上传文档并在对话中引用，支持多种文件格式：\n\n支持格式：\n- PDF文档\n- Word文档（.docx）\n- Excel表格（.xlsx）\n- PowerPoint演示文稿（.pptx）\n- 文本文件（.txt, .md）\n- 代码文件\n\n技术实现：\n文档内容在本地解析后存储在浏览器的IndexedDB中，对话时可选择性地将文档内容包含在上下文中发送给AI模型。\n\n如果启用云端同步，知识库配置（不含文件内容）会同步到云端，方便多设备访问。'
      }
    }
  }
};
