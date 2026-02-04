// English Translation
export const enUS = {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    reset: 'Reset',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    select: 'Select',
    clear: 'Clear',
    apply: 'Apply',
    settings: 'Settings',
    help: 'Help',
    language: 'Language',
    unknown: 'Unknown',
    recommend: 'Recommend',
    all: 'All',
    download: 'Download',
    deleteConfirm: 'Are you sure you want to delete?',
    pleaseSelect: 'Please select',
    saveSuccess: 'Saved successfully'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: 'Search conversations...',
    recentConversations: 'Recent Conversations',
    multiSelect: 'Multi-select',
    cancelSelect: 'Cancel Selection',
    clearAll: 'Clear All',
    deleteSelected: 'Delete Selected',
    deleteConfirm: 'Delete {count} selected conversations?',
    noConversations: 'No conversations yet',
    noMatches: 'No matching conversations',
    newConversation: 'New Chat',
    deleteConversation: 'Delete this conversation?',
    generating: 'Generating...',
    unread: 'Unread Messages',
    editTitle: 'Edit Title',
    saveTitle: 'Save Title',
    cancelEdit: 'Cancel Edit',
    clearAllConfirm: 'Are you sure you want to clear all conversation history? This action cannot be undone.'
  },

  imageFactory: {
    title: 'Image Factory',
    textToImage: 'Text to Image',
    imageToImage: 'Image to Image',
    generate: 'Generate',
    prompt: 'Prompt',
    promptPlaceholder: 'Describe the image you want to generate...',
    negativePrompt: 'Negative Prompt',
    negativePromptPlaceholder: 'Content you don\'t want to see in the image...',
    parameters: 'Parameters',
    resolution: 'Resolution',
    steps: 'Sampling Steps',
    cfgScale: 'CFG Scale',
    seed: 'Seed',
    random: 'Random',
    style: 'Style',
    noStyle: 'No Style',
    styles: {
      cinematic: 'Cinematic',
      photographic: 'Photographic',
      anime: 'Anime',
      'digital-art': 'Digital Art',
      'fantasy-art': 'Fantasy Art',
      neonpunk: 'Neonpunk',
      '3d-model': '3D Model'
    },
    gallery: 'Gallery',
    noHistory: 'No generated images yet',
    referenceImage: 'Reference Image',
    uploadHint: 'Click or drag to upload',
    selectModel: 'Select Model',
    noImageModels: 'No image generation models detected',
    clearAllConfirm: 'Are you sure you want to clear all generated images? This action cannot be undone.',
    deleteConfirm: 'Are you sure you want to delete the selected {count} images?'
  },

  settings: {
    title: 'Settings',
    tabs: {
      llm: 'Providers & Models',
      presets: 'Model Presets',
      conversation: 'Conversation',
      search: 'Web Search',
      knowledgeBase: 'Knowledge Base',
      general: 'General',
      security: 'Security & Password',
      proxy: 'Network & Proxy',
      logs: 'System Logs',
      help: 'Help Guide'
    },

    llm: {
      title: 'Model Providers',
      addCustom: 'Add Custom',
      notConfigured: 'Not Configured',
      modelsCount: '{count} models',
      apiKey: 'API Key (Masked)',
      apiKeyPlaceholder: 'sk-...',
      apiFormat: 'API Format',
      apiEndpoint: 'API Endpoint (Base URL)',
      fetchModels: 'Auto-fetch Model List',
      testConnection: 'Test Connection',
      connectionSuccess: 'Connection successful!',
      connectionFailed: 'Connection failed',
      fetchSuccess: 'Successfully fetched {count} models',
      fetchFailed: 'Fetch failed: {error}',
      fetchLargeConfirm: 'Detected {count} models. Too many models may cause interface lag.\n\nIt is recommended to only select frequently used models in settings.\n\nContinue loading all models?',
      modelManagement: 'Model Management',
      searchModel: 'Search models...',
      newModel: 'New',
      editModel: 'Edit Model',
      deleteModel: 'Delete Model',
      deleteModelConfirm: 'Delete model "{name}"?',
      selectToShow: 'Check to show in conversation interface, click icons to adjust capabilities',
      backToList: 'Back to List',
      configuration: 'Configuration',
      customConfigHint: 'Custom API URL and Security Key'
    },

    presets: {
      title: 'Default Model Settings',
      chatModel: 'Default Chat Model',
      namingModel: 'Auto-naming Model',
      searchModel: 'Web Search Model',
      compressionModel: 'Conversation Compression Model',
      ocrModel: 'OCR Model',
      selectModel: 'Select model...',
      clearSelection: 'Clear Selection (Use Current Conversation Model)',
      fallbackHint: 'Will automatically use current conversation model for {type} when not configured',
      noModels: 'No available models detected',
      configureModels: 'Please configure and select models in settings',
      noKey: 'No API key configured',
      selectProvider: 'Select Model Provider'
    },

    conversation: {
      newConversationPresets: 'New Conversation Presets',
      conversationSettings: 'Conversation Settings',
      prompt: 'Prompt',
      promptPlaceholder: 'Be efficient, clear and concise. Use emojis when appropriate. Prioritize facts over agreement',
      resetToDefault: 'Reset to Default',
      contextLimit: 'Context Message Limit',
      contextLimitHint: 'Limit the number of historical messages AI can access. Set to "Unlimited" to use all history.',
      unlimited: 'Unlimited',
      notSet: 'Not Set',
      temperature: 'Temperature',
      topP: 'Top P',
      streaming: 'Stream Output',
      display: 'Display',
      showWordCount: 'Show Word Count',
      showTokenCount: 'Show Token Usage',
      showModelName: 'Show Model Name',
      features: 'Features',
      autoCollapseCode: 'Auto-collapse Code Blocks',
      autoGenerateTitle: 'Auto-generate Titles',
      spellCheck: 'Spell Check',
      markdownRender: 'Markdown Rendering',
      latexRender: 'LaTeX Rendering (Requires Markdown)',
      mermaidRender: 'Mermaid Chart Rendering',
      autoPreviewArtifacts: 'Auto-preview Artifacts',
      autoPreviewHint: 'Automatically render generated content (e.g., HTML with CSS, JS, Tailwind)',
      pasteAsFile: 'Paste Long Text as File',
      pasteAsFileHint: 'When pasting long text, insert it as a file to keep conversations concise and reduce token consumption.'
    },

    search: {
      title: 'Web Search',
      enableSearch: 'Enable Web Search',
      enableSearchHint: 'Allow AI to access latest information through search engines',
      searchEngine: 'Search Engine',
      selectEngine: 'Select Search Engine',
      tavilyHint: 'Tavily is a search API designed for AI applications, recommended.',
      tavilyLink: 'Get API Key: https://tavily.com',
      bingHint: 'Requires Azure Bing Search API key.',
      bingLink: 'Get API Key: Azure Portal',
      googleHint: 'Requires Google Custom Search API Key and Search Engine ID.',
      googleFormat: 'Format example: AIzaSyXXXX|0123456789abcdef',
      googleLink: 'Get: Google Cloud Console',
      apiKeyRequired: 'API Key Required',
      apiKeyRequiredHint: 'Please configure search engine API key to enable web search. All search engines require a valid API key.'
    },

    general: {
      title: 'Interface & Experience',
      language: 'Language',
      selectLanguage: 'Select Language',
      theme: 'Theme',
      selectTheme: 'Select Theme',
      systemTheme: 'System',
      lightTheme: 'Light',
      darkTheme: 'Dark'
    },

    security: {
      title: 'Security & Data Management',
      encryptionEnabled: 'End-to-End Encryption Protected',
      encryptionHint: 'API keys, conversation records, and configuration data are encrypted with AES-256, accessible only after unlocking with your master password.',
      cloudSync: 'Cloud Sync Service',
      cloudSyncHint: 'Sync configuration, conversation history, model presets, and knowledge base indices to the cloud with end-to-end encryption.',
      syncServerOnline: 'Sync server connection normal',
      syncServerOffline: 'Sync server connection interrupted',
      syncServerNotAvailable: 'Sync service unavailable, please verify the sync API URL configuration',
      
      // Cloud Sync
      enableCloudSync: 'Enable Cloud Sync',
      syncImages: 'Sync Image Data',
      syncImagesHint: 'Synchronize images in conversations. Disabling this can save significant cloud storage and bandwidth.',
      syncImagesOffConfirm: 'Are you sure you want to turn off image sync? Image data in the cloud will be cleaned up to save space.',
      syncImagesOffConfirm: 'Are you sure you want to turn off image sync? Image data in the cloud will be cleaned up to save space.',
      autoSync: 'Automatic Real-time Sync',
      autoSyncHint: 'Automatically initiate cloud sync when local data changes are detected',
      syncApiUrl: 'Sync Service API URL',
      syncApiUrlHint: 'Leave blank to use the default path of current domain. Manual configuration is only needed for custom domains or static hosting like GitHub Pages.',
      syncApiUrlPlaceholder: 'Leave blank to auto-use: domain + /api/sync',
      syncNow: 'Sync Now',
      syncStatus: 'Sync Status',
      syncStatusIdle: 'Ready',
      syncStatusSyncing: 'Syncing...',
      syncStatusSuccess: 'Sync Successful',
      syncStatusError: 'Sync Failed',
      lastSyncTime: 'Last Sync',
      neverSynced: 'Never Synced',
      syncSuccess: 'Sync successful!',
      syncFailed: 'Sync failed: {error}',
      syncConflicts: '{count} conflicts detected',
      
      // Time Units
      justNow: 'Just now',
      timeAgo: '{value} {unit} ago',
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      
      // Conflict Resolution
      conflictResolution: 'Conflict Resolution Strategy',
      conflictStrategyTimestamp: 'Timestamp Priority (Newest Wins)',
      conflictStrategyLocal: 'Local Priority',
      conflictStrategyRemote: 'Remote Priority',
      conflictStrategyManual: 'Manual Selection',
      conflictDetected: 'Data Conflict Detected',
      conflictCount: 'Conflict Count',
      resolveConflict: 'Resolve Conflict',
      useLocal: 'Use Local',
      useRemote: 'Use Remote',
      
      persistence: 'Persistent Login',
      selectDuration: 'Select Login Duration',
      persistenceNone: 'Disabled (Logout on browser close)',
      persistence1d: '1 Day',
      persistence5d: '5 Days',
      persistence10d: '10 Days',
      persistence30d: '30 Days',
      persistenceHint: 'For security, "Disabled" is recommended on public devices. Persistent login stores encrypted credentials locally.',
      exportBackup: 'Export Full Backup',
      importBackup: 'Import Backup',
      signOut: 'Sign Out',
      signOutConfirm: 'Are you sure you want to sign out?',
      clearData: 'Clear Local and Cloud Data',
      clearDataConfirm: 'Are you sure you want to clear all local and cloud data? This action cannot be undone, including conversation history, API configuration, and cloud-synced data.',
      clearCloudDataFailedConfirm: 'Failed to clear cloud data. Do you still want to clear local data and logout?',
      exportPassword: 'Enter backup encryption password (8+ chars recommended):',
      importPassword: 'Enter backup decryption password:',
      exportSuccess: 'Backup exported successfully! File size: {size} MB',
      exportFailed: 'Export failed: {error}',
      importSuccess: 'Backup restored successfully!',
      importFailed: 'Decryption failed, password may be incorrect: {error}',
      conversations: 'Conversations',
      messages: 'Messages',
      images: 'Images',
      knowledgeBases: 'Knowledge Bases',
      reloadPrompt: 'Page will reload to apply changes...'
    },

    proxy: {
      title: 'Network & Proxy',
      proxyMode: 'Enable Global API Proxy',
      proxyHint: 'Forward AI requests through the server to bypass browser cross-origin restrictions and improve connection stability.',
      cloudProxyUrl: 'Proxy Service URL',
      cloudProxyHint: 'Leave blank to use the default path of current domain. Manual configuration is only needed for custom domains or static hosting like GitHub Pages.',
      cloudSyncDepends: 'Cloud sync functionality depends on the proxy service; disabling the proxy will cause sync to fail'
    },

    footer: {
      saveAndApply: 'Save & Apply'
    },

    logs: {
      title: 'System Logs',
      searchPlaceholder: 'Search logs...',
      clearLogs: 'Clear Logs',
      clearConfirm: 'Clear all logs?',
      exportLogs: 'Export JSON',
      noLogs: 'No logs recorded',
      logDetails: 'Log Details',
      copyLogs: 'Copy Full Logs',
      level: 'Level',
      module: 'Module',
      content: 'Content',
      totalRecords: 'Total {count} records',
      filteredRecords: '(Filtered {count} records)'
    }
  },

  conversationSettings: {
    title: 'Conversation Settings',
    loading: 'Loading...',
    resetConfirm: 'Reset to global settings?',
    saveSuccess: 'Settings saved!\n\nThese settings will be automatically applied to the new conversation when you send the first message.',
    resetToGlobal: 'Reset to Global',
    custom: 'Custom',
    promptLabel: 'Prompt',
    messageLimit: 'Message Limit',
    unlimited: 'Unlimited',
    notSet: 'Not Set',
    temperature: 'Temperature',
    topP: 'Top P',
    cancel: 'Cancel',
    saveSettings: 'Save Settings',
    saveAndSend: 'Save & Send'
  },

  inputArea: {
    placeholder: 'Type a message...',
    placeholderQuestion: 'Type your question here...',
    selectModel: 'Select Model',
    webSearch: 'Web Search',
    deepThinking: 'Deep Thinking',
    attachFile: 'Attach File',
    conversationSettings: 'Conversation Settings',
    knowledgeBase: 'Knowledge Base',
    compressConversation: 'Compress Conversation',
    send: 'Send',
    stop: 'Stop',
    interrupt: 'Interrupt',
    generating: 'Generating...',
    noModels: 'No models detected',
    configureModels: 'Please configure and select models in settings',
    noKey: 'No API key',
    unnamedProvider: 'Unnamed Provider',
    uploadFile: 'Upload File',
    selectKB: 'Select Knowledge Base',
    setSystemPrompt: 'System prompt set',
    takePhoto: 'Photo',
    manualSync: 'Sync',
    camera: {
      rotate: 'Rotate',
      retake: 'Retake',
      usePhoto: 'Use Photo'
    },
    newConversation: 'New',
    cameraAccessError: 'Cannot access camera: ',
    interrupted: 'AI response interrupted',
    error: 'Error: ',
    ocrNotConfigured: 'OCR model not configured, please configure it in Settings - Model Presets - OCR Model',
    notSet: 'Not Set',
    unlimited: 'Unlimited',
    uploadDoc: 'Upload Document'
  },

  compression: {
    historySummary: 'History Summary',
    autoCompressed: 'Auto-compressed',
    tooFewMessages: 'Too few messages to compress',
    modelNotConfigured: 'Compression model not configured, please set it in settings',
    providerNotFound: 'Compression model provider not found',
    success: 'Conversation compressed successfully!',
    failed: 'Compression failed',
    compressing: 'Compressing...',
    autoCompression: 'Auto-compression',
    autoCompressionHint: 'Automatically compress history when message count exceeds threshold',
    autoCompressionThreshold: 'Auto-compression Threshold',
    autoCompressionThresholdHint: 'Trigger auto-compression when message count exceeds this value (recommended: 50-100)',
    messages: 'messages',
    newTopic: 'New Topic'
  },

  model: {
    capabilities: {
      title: 'Model Capabilities',
      thinking: 'Deep Thinking',
      multimodal: 'Multimodal',
      tools: 'Tool Calling',
      imageGen: 'Image Generation'
    },
    contextWindow: 'Context Window (Tokens)',
    maxOutput: 'Max Output (Tokens)',
    maxThinking: 'Max Thinking Length (Tokens)',
    maxThinkingHint: 'Only effective for models supporting thinking process',
    modelId: 'Model ID',
    modelIdHint: 'Model identifier for API calls',
    displayName: 'Display Name',
    displayNameHint: 'Model name shown in interface (prioritizes API-provided display name when fetching models, otherwise auto-inferred)',
    modelIdPlaceholder: 'e.g., gpt-4o, claude-3-5-sonnet',
    displayNamePlaceholder: 'e.g., GPT-4 Omni, Claude 3.5 Sonnet',
    defaultUnlimited: 'Default (Unlimited)',
    fillRequired: 'Please fill in Model ID and Display Name',
    idExists: 'Model ID already exists, please use another ID',
    autoInferred: 'Auto-inferred',
    autoInfer: 'Auto Infer',
    autoInferHint: 'Re-infer display name based on Model ID'
  },

  logs: {
    searchPlaceholder: 'Search logs...',
    level: {
      error: 'Error',
      warn: 'Warning',
      info: 'Info',
      debug: 'Debug'
    },
    noLogs: 'No logs',
    exportLogs: 'Export Logs',
    clearLogs: 'Clear Logs',
    clearConfirm: 'Clear all logs?',
    filters: 'Filters'
  },

  fileUpload: {
    title: 'Upload Files',
    dragHint: 'Drag and drop files here, or click to select',
    uploading: 'Uploading...',
    uploadSuccess: 'Upload successful',
    uploadFailed: 'Upload failed',
    removeFile: 'Remove file',
    supportedFormats: 'Supported formats',
    failed: 'File upload failed: ',
    dropHint: 'Drop to upload',
    clickHint: 'Click or drag to upload',
    supportHint: 'Supports PDF, Word, PPT, Excel, Text (Max 10MB)',
    parsing: 'Parsing',
    completed: 'Parsed',
    deleteFile: 'Delete file',
    unsupportedType: 'Unsupported file type'
  },

  knowledgeBase: {
    title: 'Knowledge Base',
    selectKB: 'Select Knowledge Base',
    noKB: 'No knowledge bases yet',
    kbHint: 'Create a knowledge base and upload documents to reference in conversations',
    goToCreate: 'Go to create knowledge base',
    noMatches: 'No matching knowledge bases',
    documentsCount: '{count} documents',
    chunksCount: '{count} chunks',
    clearSelection: 'Clear Selection',
    manageKB: 'Manage KB',
    confirm: 'Confirm',
    confirmSelection: 'Confirm Selection',
    searchKB: 'Search knowledge base...',
    documents: 'Documents',
    addDocument: 'Add Document',
    management: 'KB Management',
    newKB: 'New Knowledge Base',
    kbName: 'KB Name',
    kbNamePlaceholder: 'e.g., Technical Docs',
    kbDescription: 'Description (Optional)',
    kbDescriptionPlaceholder: 'Briefly describe the purpose...',
    retrievalSettings: 'Retrieval Settings',
    topK: 'Top-K Documents',
    threshold: 'Similarity Threshold',
    maxTokens: 'Max Context Tokens',
    noDocuments: 'No documents yet, please upload',
    deleteDocument: 'Delete Document',
    usageTips: 'Usage Tips',
    usageTip1: 'Click the book icon in the chat to select a knowledge base',
    usageTip2: 'Supports PDF, Word, Excel, PPT, Markdown and Text files',
    usageTip3: 'Content is parsed locally and not uploaded to external servers',
    usageTip4: 'Large documents are automatically chunked and indexed',
    deleteConfirm: 'Delete knowledge base "{name}"? This cannot be undone.',
    deleteDocConfirm: 'Delete document "{name}"?',
    uploadingStatus: 'Processing...',
    loadingParser: 'Loading parser...',
    reading: 'Reading...',
    processing: 'Processing...',
    supportFormats: 'Supported formats:'
  },

  error: {
    networkError: 'Network error, please check connection',
    apiError: 'API call failed',
    invalidResponse: 'Invalid response',
    timeout: 'Request timeout',
    unauthorized: 'Unauthorized, please check API key',
    unknown: 'Unknown error',
    saveFailed: 'Save failed',
    clearDataConfirm: 'This action will clear all local data (including conversation history, settings, etc.). Are you sure you want to continue?'
  },

  message: {
    reasoning: 'Reasoning',
    copy: 'Copy',
    regenerate: 'Regenerate',
    edit: 'Edit',
    quote: 'Quote',
    prevBranch: 'Previous Branch',
    nextBranch: 'Next Branch',
    wordCount: 'words',
    tokens: 'Tokens: approx.',
    startConversation: 'Start a conversation',
    thinking: 'Thinking...',
    generating: 'Generating...'
  },

  topBar: {
    incognitoConversation: 'Incognito Conversation',
    newConversation: 'New Conversation',
    incognitoEnabled: 'Incognito mode enabled',
    enableIncognito: 'Enable incognito mode',
    incognitoActive: 'Incognito',
    incognitoMode: 'Incognito Mode'
  },

  auth: {
    welcomeBack: 'Welcome Back',
    initSecurity: 'Initialize Security',
    unlockHint: 'Enter your access password to unlock your AI workstation',
    setupHint: 'Set a strong password to encrypt your data',
    passwordPlaceholder: 'Access Password',
    encryptionNote: 'Your API keys and history will be encrypted locally with AES-256 using this password. When sync is enabled, the encrypted data will be synced to the cloud.',
    unlock: 'Unlock',
    start: 'Start Using',
    passwordWeak: 'Password too weak: minimum 8 characters, including upper/lowercase letters, numbers and special characters',
    passwordError: 'Incorrect password',
    pleaseLogin: 'Please log in first'
  },

  ocr: {
    notSupported: 'Current model {model} does not support image input, will use OCR to process image',
    contextHeader: '[OCR Text Recognition Result]',
    contextIntro: 'User uploaded an image. Since the current model does not support image input, the system has used OCR technology to extract text from the image. Below is the recognized text content, please process it as part of the user\'s input:',
    contextFooter: 'Note: The above content was automatically extracted by OCR and may contain recognition errors.'
  },

  plusMenu: {
    title: 'Feature Menu',
    providers: 'Providers',
    providersDesc: 'Configure AI service providers',
    presetModels: 'Preset Models',
    presetModelsDesc: 'Manage frequently used models',
    webSearch: 'Web Search',
    webSearchDesc: 'Configure search engines',
    knowledgeBase: 'Knowledge Base',
    knowledgeBaseDesc: 'Manage documents and knowledge',
    fileParser: 'File Parser',
    fileParserDesc: 'Upload and parse documents',
    conversationSettings: 'Conversation Settings',
    conversationSettingsDesc: 'Set current conversation parameters'
  },

  markdown: {
    preview: 'Live Preview',
    hidePreview: 'Hide Preview',
    copy: 'Copy',
    copied: 'Copied',
    publish: 'One-click Publish',
    published: 'Published',
    generatingChart: 'Generating chart...',
    imageSyncDisabled: 'Image sync not enabled'
  },

  mermaid: {
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    reset: 'Reset',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    copyCode: 'Copy Code',
    downloadSVG: 'Download SVG',
    downloadPNG: 'Download PNG',
    viewCode: 'View Code',
    hideCode: 'Hide Code',
    showCode: 'Show Code',
    dragHint: 'Drag to pan, Scroll to zoom'
  },

  document: {
    presentation: 'Presentation',
    textFile: 'Text File',
    info: 'Document Information',
    fileName: 'File Name',
    type: 'Type',
    pages: 'Pages',
    sheets: 'Sheets',
    slides: 'Slides',
    size: 'Size',
    contentTruncated: 'Content truncated, please view the original document for complete content',
    fileSizeExceeded: 'File size exceeds limit ({maxSize}MB)',
    unsupportedFileType: 'Unsupported file type: {fileName}',
    pptxOnly: 'Only .pptx format PowerPoint files are supported. Please save the file as .pptx and try again.',
    readFailed: 'Failed to read file'
  },

  services: {
    sync: {
      checksumFailed: 'Data integrity check failed',
      versionIncompatible: 'Backup file version incompatible: {version}',
      validationFailed: 'Data validation failed: {errors}'
    },
    search: {
      queryEmpty: 'Search query cannot be empty',
      untitled: 'Untitled',
      noSnippet: 'No snippet',
      unsupportedEngine: 'Unsupported search engine: {engine}'
    },
    database: {
      unsupportedType: 'Unsupported database type: {dbType}'
    }
  },

  app: {
    initFailed: 'Initialization failed, please try refreshing the page',
    dbAccessError: 'Unable to access database, please check browser settings'
  },

  store: {
    chat: {
      titleGeneratorPrompt: 'You are a professional conversation naming assistant. Your task is to read user input and generate a short, accurate title (no more than 10 words).\n\nRules:\n1. Output the title directly without any punctuation, quotes, or explanatory text.\n2. The title should summarize the core topic of the conversation.\n3. If you cannot summarize, output "New Conversation".',
      titleGeneratorUser: 'User input: {message}\n\nPlease generate a title:',
      cannotCompressIncognito: 'Cannot compress incognito mode conversation',
      conversationIdRequired: 'Conversation ID not specified',
      conversationEmpty: 'Conversation is empty, no compression needed',
      cannotApplyCompressionIncognito: 'Cannot apply compression to incognito mode conversation',
      compressedMessageNotFound: 'Cannot find the last compressed message'
    },
    knowledgeBase: {
      untitled: 'Untitled Knowledge Base'
    },
    file: {
      documentPrefix: 'Document {index}'
    }
  },

  crypto: {
    decryptFailed: 'Decryption failed: incorrect password or corrupted data'
  },

  validation: {
    checksumFailed: 'Checksum calculation failed',
    invalidDataFormat: 'Invalid data format',
    configMissing: 'Configuration data missing or invalid format',
    providerConfigInvalid: 'Provider configuration format invalid',
    defaultModelsInvalid: 'Default models configuration format invalid',
    conversationsInvalid: 'Conversations data format invalid',
    messagesInvalid: 'Messages data format invalid',
    imagesInvalid: 'Images history data format invalid',
    publishedCodesInvalid: 'Published codes data format invalid',
    knowledgeBasesInvalid: 'Knowledge bases data format invalid',
    logsInvalid: 'System logs data format invalid',
    collectionFailed: 'Data collection failed: {error}',
    validationFailed: 'Data validation failed: {errors}',
    restoreFailed: 'Data restore failed: {error}'
  },

  help: {
    title: 'Help Center',
    description: 'This documentation provides detailed guides on deployment, configuration, and feature usage.',
    footer: 'For further technical details, please refer to the official documentation or submit feedback via GitHub.',

    deployment: {
      title: 'Multi-platform Deployment',
      platforms: {
        title: 'Environment Auto-recognition',
        content: 'AiPiBox automatically senses its runtime environment and applies optimized configurations for platforms like Vercel, Netlify, and Cloudflare Pages.'
      },
      vercel: {
        title: 'Vercel Deployment',
        content: 'Supported domain: *.vercel.app\nProxy Entry: /api/ai-proxy (Automatic)\nSync Interface: /api/sync (Automatic)\nPlatform Features: Supports Serverless Functions. No extra proxy URL configuration needed.'
      },
      netlify: {
        title: 'Netlify Deployment',
        content: 'Supported domain: *.netlify.app\nProxy Entry: /api/ai-proxy (Automatic)\nSync Interface: /api/sync (Automatic)\nPlatform Features: Supports Netlify Functions. Recommended to deploy via direct GitHub repository link.'
      },
      cloudflare: {
        title: 'Cloudflare Pages Deployment',
        content: 'Supported domain: *.pages.dev\nProxy Entry: /api/ai-proxy (Automatic)\nSync Interface: /api/sync (Automatic)\nPlatform Features: Runs on Cloudflare Workers with no request duration limits. Cloud sync requires binding a KV namespace (Variable name: SYNC_DATA) in the Dashboard.'
      },
      github: {
        title: 'GitHub Pages Deployment',
        content: 'Supported domain: *.github.io\nCore Limitation: GitHub Pages supports static hosting only and cannot run backend logic.\nCritical Configuration: You must manually specify a production "Cloud Proxy URL" in settings to enable AI features.'
      },
      local: {
        title: 'Local Development & Debugging',
        content: 'Recognition traits: localhost or 127.0.0.1\nStartup Plan: Use "npm run dev:full" to start both the frontend and proxy services. If running only "npm run dev", ensure the remote proxy address is correctly configured.'
      }
    },

    proxy: {
      title: 'Proxy Service Configuration',
      overview: {
        title: 'Proxy Mechanism',
        content: 'The core of the AI proxy service is to relay client requests, bypass CORS restrictions, and provide reliable long-connection maintenance in complex network environments, ensuring continuous streaming output.'
      },
      cloudProxy: {
        title: 'Production Proxy Configuration',
        content: 'In native environments like Vercel, Netlify, or Cloudflare Pages, the system automatically uses relative paths, so manual setup is usually unnecessary. Manual configuration is only required for cross-domain deployments, custom domains, or GitHub Pages.'
      },
      localProxy: {
        title: 'Local Debugging Configuration',
        content: 'Defaults to http://localhost:5000/api/proxy. This setting is primarily for the development phase, ensuring the frontend can access locally simulated backend proxy logic.'
      },
      autoDetect: {
        title: 'Intelligent Environment Recognition',
        content: 'The system dynamically switches proxy strategies based on the current Hostname:\n- Native platform domains: Automatically links to internal Serverless routes\n- Static hosting domains: Falls back to manually configured remote proxy interfaces\n- Development environment: Links to Vite proxy configuration'
      }
    },

    sync: {
      title: 'Cloud Sync Mechanism',
      overview: {
        title: 'Cloud Sync Overview',
        content: 'Cloud sync allows secure storage of multi-dimensional data in remote databases. All sensitive data is end-to-end encrypted on the client side, ensuring no third party (including the sync server) can peek at your data content during transmission.'
      },
      setup: {
        title: 'Enabling Steps',
        content: '1. Complete backend function platform deployment.\n2. Configure DATABASE_URL and DATABASE_TYPE environment variables.\n3. Enable cloud sync in security settings and set a unique sync password.\n4. Perform an initial manual sync to establish a baseline.'
      },
      platforms: {
        title: 'Backend Storage Support',
        content: 'Vercel/Netlify: Compatible with MySQL and PostgreSQL databases.\nCloudflare Pages: Leverages KV storage for lightweight data synchronization.'
      }
    },

    features: {
      title: 'Core Features',
      aiProxy: {
        title: 'Fully Automated API Proxy',
        content: 'Technical Highlights:\n- Full Server-Sent Events (SSE) streaming support\n- Automatic exponential backoff retry mechanism\n- Global request caching to reduce API consumption\n- Automated API Key masking'
      },
      imageGen: {
        title: 'Multi-mode Image Generation',
        content: 'Integrates text-to-image and image-to-image modes. Supports custom resolution, sampling steps, and CFG parameters. The system issues commands via the proxy service and caches results for fixed seeds to improve efficiency.'
      },
      knowledge: {
        title: 'Localized Knowledge Base',
        content: 'The knowledge base uses a local parsing strategy:\n- Compatible with PDF, Word, Excel, PPT, and various text formats.\n- Document content is indexed entirely in the browser; original files are not uploaded.\n- When cloud sync is enabled, only knowledge base metadata and index structures are synchronized.'
      }
    }
  }
};
