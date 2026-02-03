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
      encryptionEnabled: 'Local Hardware-level Encryption Enabled',
      encryptionHint: 'Your keys use Web Crypto API with master password to generate private keys. Data is stored as Ciphertext in IndexedDB.',
      cloudSync: 'Enable Cloud Data Sync',
      cloudSyncHint: 'Encrypt and sync configurations and conversation history to cloud servers for multi-device data sharing. Synced data includes: provider configurations (API Keys encrypted), conversation history, model presets, knowledge base configurations, etc.',
      syncServerOnline: 'Sync server online',
      syncServerOffline: 'Sync server offline - sync paused',
      syncServerNotAvailable: 'Sync server is not available, please check the sync API URL',
      
      // Cloud Sync
      enableCloudSync: 'Enable Cloud Sync',
      autoSync: 'Auto Sync',
      autoSyncHint: 'Automatically sync data to cloud when changed',
      syncApiUrl: 'Sync API URL',
      syncApiUrlHint: 'Cloud sync service address. Auto-detected when deployed on Vercel/Netlify/Cloudflare default domains, no manual configuration needed. Only required for GitHub Pages or custom domains.',
      syncApiUrlPlaceholder: 'https://your-app.vercel.app',
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
      proxyMode: 'Enable Proxy Service',
      proxyHint: 'Proxy all AI API requests through backend server, resolving CORS restrictions and ensuring network stability and request continuity. All AI requests (chat, image generation, model list, etc.) are forwarded through the proxy server. Even if client network disconnects, server-side long-running requests continue.',
      cloudProxyUrl: 'Cloud Proxy URL',
      cloudProxyHint: 'Production environment proxy service address. Auto-detected when deployed on Vercel (*.vercel.app), Netlify (*.netlify.app), Cloudflare Pages (*.pages.dev) default domains, no manual configuration needed. Only required for GitHub Pages or custom domains.\n\nLocal development automatically uses http://localhost:5000/api/proxy, no configuration needed.',
      cloudSyncDepends: 'Cloud sync depends on proxy service, disabling proxy will also stop sync'
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
    camera: {
      rotate: 'Rotate',
      retake: 'Retake',
      usePhoto: 'Use Photo'
    },
    newConversation: 'New Conversation',
    cameraAccessError: 'Cannot access camera: ',
    interrupted: 'AI response interrupted',
    error: 'Error: ',
    ocrNotConfigured: 'Current model does not support image input, please configure OCR model or choose a vision-supported model',
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
    deleteFile: 'Delete file'
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
    publish: 'Publish',
    published: 'Published',
    generatingChart: 'Generating Chart...'
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
    textFile: 'Text File'
  },

  help: {
    title: 'Help Guide',
    description: 'Learn how to deploy and configure AiPiBox, and how to use various features',
    footer: 'For more help, please refer to the project documentation or submit issues on GitHub',

    deployment: {
      title: 'Deployment Options',
      platforms: {
        title: 'Supported Platforms',
        content: 'AiPiBox supports multiple deployment platforms including Vercel, Netlify, Cloudflare Pages, GitHub Pages, and local development environments. The application automatically detects the runtime environment and uses the appropriate configuration without manual intervention.'
      },
      vercel: {
        title: 'Vercel Deployment',
        content: 'Auto-detected by domain pattern *.vercel.app.\nProxy path: /api/ai-proxy (automatic)\nSync path: /api/sync (automatic)\nSupports Serverless Functions with 300 seconds runtime limit.\n\nDeployment methods:\n1. Using Vercel CLI: vercel --prod\n2. Import GitHub repository via Vercel dashboard\n\nNo need to configure cloud proxy URL, system auto-detects.'
      },
      netlify: {
        title: 'Netlify Deployment',
        content: 'Auto-detected by domain pattern *.netlify.app.\nProxy path: /api/ai-proxy (automatic)\nSync path: /api/sync (automatic)\nSupports Netlify Functions with 300 seconds runtime limit.\n\nDeployment methods:\n1. Using Netlify CLI: netlify deploy --prod\n2. Connect GitHub repository via Netlify dashboard\n\nNo need to configure cloud proxy URL, system auto-detects.'
      },
      cloudflare: {
        title: 'Cloudflare Pages Deployment',
        content: 'Auto-detected by domain pattern *.pages.dev.\nProxy path: /functions/ai-proxy (automatic)\nSync path: /functions/sync (automatic)\nSupports Cloudflare Workers with no runtime limit.\n\nDeployment methods:\n1. Using Wrangler CLI: wrangler pages deploy dist\n2. Connect Git via Cloudflare Dashboard\n\nCloud sync requires KV namespace binding (variable name: SYNC_DATA).\nNo need to configure cloud proxy URL, system auto-detects.'
      },
      github: {
        title: 'GitHub Pages Deployment',
        content: 'Auto-detected by domain pattern *.github.io.\nGitHub Pages only supports static file hosting, cannot run backend functions.\n\nDeployment method:\nProject includes auto-deployment workflow, push to main branch to deploy automatically.\n\nImportant configuration:\nMust configure external API service to use AI features.\nRecommend using Vercel or Cloudflare free tier to deploy API service.\nFill in cloud proxy URL in settings: https://your-api.vercel.app/api/ai-proxy'
      },
      local: {
        title: 'Local Development',
        content: 'Auto-detected by domain localhost or 127.0.0.1.\nProxy path: http://localhost:5000/api/proxy (automatic)\n\nStartup methods:\nMethod 1 (recommended): npm run dev:full\nAutomatically starts proxy server and dev server.\n\nMethod 2: Start separately\nTerminal 1: npm run proxy\nTerminal 2: npm run dev\n\nMethod 3: Use external API\nRun npm run dev only\nConfigure production cloud proxy URL in settings.'
      }
    },

    proxy: {
      title: 'Proxy Configuration',
      overview: {
        title: 'Proxy Overview',
        content: 'AI proxy service forwards all AI API requests, resolves browser CORS restrictions, and ensures network stability and request continuity. All AI requests (chat, image generation, model list, etc.) go through the proxy server. Even if client network disconnects, server-side long-running requests continue.'
      },
      cloudProxy: {
        title: 'Cloud Proxy URL',
        content: 'Purpose: Production environment proxy service address\n\nWhen to fill in:\n1. When deploying to GitHub Pages (required)\n2. When using custom domain (recommended)\n3. When using separate frontend/backend deployment (required)\n\nWhen no need to fill in:\n1. Deploy to Vercel (*.vercel.app)\n2. Deploy to Netlify (*.netlify.app)\n3. Deploy to Cloudflare Pages (*.pages.dev)\n\nThese platforms auto-detect and use relative paths to call platform functions, no extra configuration needed.'
      },
      localProxy: {
        title: 'Local Proxy URL',
        content: 'Purpose: Local development environment proxy service address\nDefault value: http://localhost:5000/api/proxy\n\nUsage scenario:\nDuring local development, if running npm run proxy or npm run dev:full, the app will automatically use this address. If not running local proxy, you can configure production proxy address here for testing.\n\nUsually no need to modify, keep default value.'
      },
      autoDetect: {
        title: 'Auto Environment Detection',
        content: 'Application has built-in intelligent environment detection mechanism that automatically selects appropriate proxy configuration based on current domain:\n\nDetection logic:\n- *.vercel.app → uses /api/ai-proxy\n- *.netlify.app → uses /api/ai-proxy\n- *.pages.dev → uses /functions/ai-proxy\n- *.github.io → uses configured external proxy URL\n- localhost → uses http://localhost:5000/api/proxy\n- Custom domain → uses configured cloud proxy URL\n\nThis process is fully automatic, developers need not worry about implementation details.'
      }
    },

    sync: {
      title: 'Cloud Sync',
      overview: {
        title: 'Cloud Sync Feature',
        content: 'Cloud sync allows you to synchronize conversation history, configuration settings and other data to cloud servers, enabling multi-device data sharing and backup. Data transmission uses end-to-end encryption to ensure privacy security.\n\nSynced data includes:\n- Conversation history\n- Provider configurations (API Keys encrypted)\n- Model preset configurations\n- Conversation and search settings\n- Knowledge base configurations'
      },
      setup: {
        title: 'Configure Cloud Sync',
        content: 'Enable steps:\n1. Ensure deployed to platform supporting backend functions (Vercel/Netlify/Cloudflare)\n2. Configure database connection (MySQL or PostgreSQL)\n3. Enable cloud sync in Settings → Security & Data\n4. Set sync password (for data encryption and user ID generation)\n5. Click "Sync Now" for first sync\n\nDatabase configuration:\nSet in platform environment variables:\nDATABASE_URL=mysql://user:pass@host:3306/dbname\nDATABASE_TYPE=mysql'
      },
      platforms: {
        title: 'Sync Support on Different Platforms',
        content: 'Vercel/Netlify:\nSupports MySQL and PostgreSQL databases\nNeed to configure database connection in platform settings\n\nCloudflare Pages:\nSupports KV storage and D1 database\nNeed to bind KV namespace in Pages settings (variable name: SYNC_DATA)\n\nGitHub Pages:\nRequires external sync service configuration\nCan use API service deployed on other platforms\n\nLocal Development:\nSupports file storage or remote database connection\nCan be used for testing sync functionality'
      }
    },

    features: {
      title: 'Features',
      aiProxy: {
        title: 'AI API Proxy',
        content: 'Technical implementation:\nAll AI requests go through cloud server proxy instead of client browser direct sending. This ensures network stability and request continuity. Even if client network disconnects, server-side long-running requests continue.\n\nSupported features:\n- Streaming response transmission (Server-Sent Events)\n- Request queue management\n- Auto-retry mechanism (up to 3 times)\n- Request caching (model list cached for 1 hour)\n- Timeout control (max 300 seconds)\n- Sensitive information masking (API Keys auto-hidden)\n\nPerformance optimization:\n- Smart caching reduces duplicate requests\n- Request tracking for debugging\n- Global CDN acceleration'
      },
      imageGen: {
        title: 'Image Generation',
        content: 'Image Factory supports both text-to-image and image-to-image modes, calling various image generation models through AI proxy service.\n\nFeatures:\n- Multiple resolutions (512x512 to 1024x1024)\n- Adjustable sampling steps and CFG guidance strength\n- Fixed seed values for reproducible generation\n- Various artistic style presets\n- Image history saving\n- Batch generation and management\n\nAll image generation requests go through cloud proxy to ensure generation stability. Results with fixed seeds are cached to avoid redundant computation.'
      },
      knowledge: {
        title: 'Knowledge Base Management',
        content: 'Knowledge base feature allows you to upload documents and reference them in conversations, supporting multiple file formats:\n\nSupported formats:\n- PDF documents\n- Word documents (.docx)\n- Excel spreadsheets (.xlsx)\n- PowerPoint presentations (.pptx)\n- Text files (.txt, .md)\n- Code files\n\nTechnical implementation:\nDocument content is parsed locally and stored in browser IndexedDB. During conversations, document content can be selectively included in context sent to AI models.\n\nIf cloud sync is enabled, knowledge base configuration (excluding file content) syncs to cloud for multi-device access.'
      }
    }
  }
};
