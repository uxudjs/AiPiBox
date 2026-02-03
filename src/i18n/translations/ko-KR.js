// 한국어 번역
export const koKR = {
  common: {
    confirm: '확인',
    cancel: '취소',
    save: '저장',
    delete: '삭제',
    edit: '편집',
    create: '생성',
    search: '검색',
    loading: '로딩 중...',
    success: '성공',
    error: '오류',
    warning: '경고',
    info: '정보',
    reset: '재설정',
    close: '닫기',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    submit: '제출',
    select: '선택',
    clear: '지우기',
    apply: '적용',
    settings: '설정',
    help: '도움말',
    language: '언어',
    unknown: '알 수 없음',
    recommend: '추천',
    all: '전체',
    download: '다운로드',
    deleteConfirm: '삭제하시겠습니까?',
    pleaseSelect: '선택하세요',
    saveSuccess: '저장 성공'
  },

  sidebar: {
    title: 'AiPiBox',
    searchPlaceholder: '대화 검색...',
    recentConversations: '최근 대화',
    multiSelect: '다중 선택',
    cancelSelect: '선택 취소',
    clearAll: '모두 지우기',
    deleteSelected: '선택 항목 삭제',
    deleteConfirm: '선택한 {count}개의 대화를 삭제하시겠습니까?',
    noConversations: '대화 내역이 없습니다',
    noMatches: '일치하는 대화가 없습니다',
    newConversation: '새 대화',
    deleteConversation: '이 대화를 삭제하시겠습니까?',
    generating: '생성 중...',
    unread: '읽지 않은 메시지',
    editTitle: '제목 편집',
    saveTitle: '제목 저장',
    cancelEdit: '편집 취소',
    clearAllConfirm: '모든 대화 기록을 지우시겠습니까? 이 작업은 취소할 수 없습니다.'
  },

  settings: {
    title: '설정',
    tabs: {
      llm: '제공업체 및 모델',
      presets: '모델 프리셋',
      conversation: '대화 설정',
      search: '웹 검색',
      knowledgeBase: '지식 베이스',
      general: '일반 설정',
      security: '보안 및 비밀번호',
      proxy: '네트워크 및 프록시',
      logs: '시스템 로그',
      help: '도움말 가이드'
    },

    llm: {
      title: '모델 제공업체',
      addCustom: '사용자 정의 추가',
      notConfigured: '미설정',
      modelsCount: '{count}개 모델',
      apiKey: 'API 키 (마스킹)',
      apiKeyPlaceholder: 'sk-...',
      apiFormat: 'API 형식',
      apiEndpoint: 'API 엔드포인트 (기본 URL)',
      fetchModels: '모델 목록 자동 가져오기',
      testConnection: '연결 테스트',
      connectionSuccess: '연결 성공!',
      connectionFailed: '연결 실패',
      fetchSuccess: '{count}개 모델을 성공적으로 가져왔습니다',
      fetchFailed: '가져오기 실패: {error}',
      fetchLargeConfirm: '{count}개의 모델이 감지되었습니다. 모델 수가 너무 많으면 인터페이스가 느려질 수 있습니다.\n\n설정에서 자주 사용하는 모델만 선택하는 것이 좋습니다.\n\n모든 모델을 로드하시겠습니까?',
      modelManagement: '모델 관리',
      searchModel: '모델 검색...',
      newModel: '신규',
      editModel: '모델 편집',
      deleteModel: '모델 삭제',
      deleteModelConfirm: '모델 "{name}"을(를) 삭제하시겠습니까?',
      selectToShow: '체크하여 대화 화면에 표시, 아이콘을 클릭하여 기능 조정',
      backToList: '목록으로 돌아가기',
      configuration: '구성',
      customConfigHint: '사용자 정의 API 주소 및 보안 키'
    },

    presets: {
      title: '기본 모델 설정',
      chatModel: '기본 채팅 모델',
      namingModel: '자동 명명 모델',
      searchModel: '웹 검색 모델',
      compressionModel: '대화 압축 모델',
      ocrModel: 'OCR 모델',
      selectModel: '모델 선택...',
      clearSelection: '선택 해제 (현재 대화 모델 사용)',
      fallbackHint: '미설정 시 현재 대화 모델을 {type}로 자동 사용합니다',
      noModels: '사용 가능한 모델이 감지되지 않았습니다',
      configureModels: '설정에서 모델을 구성하고 선택하세요',
      noKey: 'API 키가 미설정됨',
      selectProvider: '모델 제공업체 선택'
    },

    conversation: {
      newConversationPresets: '새 대화 프리셋',
      conversationSettings: '대화 설정',
      prompt: '프롬프트',
      promptPlaceholder: '효율적이고 명확하며 간결한 스타일. 적절히 이모지 사용. 맹목적으로 동의하지 않고 사실을 우선',
      resetToDefault: '기본값으로 재설정',
      contextLimit: '컨텍스트 메시지 제한',
      contextLimitHint: 'AI가 접근할 수 있는 이전 메시지 수를 제한합니다. "무제한"으로 설정하면 모든 기록을 사용합니다',
      unlimited: '무제한',
      notSet: '미설정',
      temperature: '온도',
      topP: 'Top P',
      streaming: '스트림 출력',
      display: '표시',
      showWordCount: '글자 수 표시',
      showTokenCount: '토큰 사용량 표시',
      showModelName: '모델 이름 표시',
      features: '기능',
      autoCollapseCode: '코드 블록 자동 접기',
      autoGenerateTitle: '제목 자동 생성',
      spellCheck: '맞춤법 검사',
      markdownRender: 'Markdown 렌더링',
      latexRender: 'LaTeX 렌더링 (Markdown 필요)',
      mermaidRender: 'Mermaid 차트 렌더링',
      autoPreviewArtifacts: 'Artifacts 자동 미리보기',
      autoPreviewHint: '생성된 콘텐츠를 자동으로 렌더링 (예: CSS, JS, Tailwind가 포함된 HTML)',
      pasteAsFile: '긴 텍스트를 파일로 붙여넣기',
      pasteAsFileHint: '긴 텍스트를 붙여넣을 때 파일로 삽입하여 대화를 간결하게 유지하고 토큰 소비를 줄입니다.'
    },

    search: {
      title: '웹 검색',
      enableSearch: '웹 검색 활성화',
      enableSearchHint: 'AI가 검색 엔진을 통해 최신 정보를 얻을 수 있도록 허용',
      searchEngine: '검색 엔진',
      selectEngine: '검색 엔진 선택',
      tavilyHint: 'Tavily는 AI 애플리케이션용으로 설계된 검색 API입니다. 권장됩니다.',
      tavilyLink: 'API 키 받기: https://tavily.com',
      bingHint: 'Azure Bing Search API 키가 필요합니다.',
      bingLink: 'API 키 받기: Azure Portal',
      googleHint: 'Google Custom Search API 키와 검색 엔진 ID가 필요합니다.',
      googleFormat: '형식 예: AIzaSyXXXX|0123456789abcdef',
      googleLink: '받기: Google Cloud Console',
      apiKeyRequired: 'API 키 필요',
      apiKeyRequiredHint: '웹 검색 기능을 활성화하려면 검색 엔진 API 키를 설정하세요. 모든 검색 엔진은 유효한 API 키가 필요합니다.'
    },

    general: {
      title: '인터페이스 및 환경',
      language: '언어',
      selectLanguage: '언어 선택',
      theme: '테마',
      selectTheme: '테마 선택',
      systemTheme: '시스템 따라가기',
      lightTheme: '라이트',
      darkTheme: '다크'
    },

    security: {
      title: '보안 및 데이터 관리',
      encryptionEnabled: '로컬 하드웨어 수준 암호화 활성화됨',
      encryptionHint: '키는 Web Crypto API와 마스터 비밀번호를 결합하여 개인 키를 생성합니다. 데이터는 IndexedDB에 암호문으로 저장됩니다.',
      cloudSync: '클라우드 데이터 동기화 활성화',
      cloudSyncHint: '구성 및 대화 기록을 암호화하여 클라우드 서버에 동기화하여 다중 장치 데이터 공유를 구현합니다. 동기화되는 데이터에는 공급자 구성(API Key 암호화됨), 대화 기록, 모델 프리셋, 지식 베이스 구성 등이 포함됩니다.',
      syncServerOnline: '동기화 서비스 온라인',
      syncServerOffline: '동기화 서비스 오프라인 - 동기화 일시 중지',
      syncServerNotAvailable: '동기화 서버를 사용할 수 없습니다. 동기화 API 주소를 확인하십시오',
      persistence: '영구 로그인',
      selectDuration: '로그인 기간 선택',
      persistenceNone: '비활성화 (브라우저 닫으면 로그아웃)',
      persistence1d: '1일',
      persistence5d: '5일',
      persistence10d: '10일',
      persistence30d: '30일',
      persistenceHint: '보안을 위해 공용 장치에서는 "비활성화"를 선택하는 것이 좋습니다. 영구 로그인은 암호화된 자격 증명을 로컬에 저장합니다.',
      exportBackup: '전체 백업 내보내기',
      importBackup: '백업 가져오기',
      signOut: '로그아웃',
      signOutConfirm: '로그아웃하시겠습니까？',
      clearData: '로컬 및 클라우드 데이터 삭제',
      clearDataConfirm: '모든 로컬 및 클라우드 데이터를 삭제하시겠습니까? 이 작업은 취소할 수 없으며 대화 기록, API 구성 및 클라우드 동기화 데이터가 포함됩니다.',
      clearCloudDataFailedConfirm: '클라우드 데이터 삭제에 실패했습니다. 로컬 데이터를 삭제하고 로그아웃하시겠습니까?',
      exportPassword: '백업 암호화 비밀번호를 입력하세요(8자 이상 권장):',
      importPassword: '백업 복호화 비밀번호를 입력하세요:',
      exportSuccess: '백업 내보내기 성공! 파일 크기: {size} MB',
      exportFailed: '내보내기 실패: {error}',
      importSuccess: '백업 복원 성공!',
      importFailed: '복호화 실패, 비밀번호가 올바르지 않을 수 있습니다: {error}',
      conversations: '대화',
      messages: '메시지',
      images: '이미지',
      knowledgeBases: '지식 베이스',
      reloadPrompt: '페이지가 자동으로 다시 로드되어 변경 사항이 적용됩니다...',
      
      // 클라우드 동기화
      enableCloudSync: '클라우드 동기화 활성화',
      autoSync: '자동 동기화',
      autoSyncHint: '데이터 변경 시 자동으로 클라우드에 동기화',
      syncApiUrl: '동기화 API URL',
      syncApiUrlHint: '클라우드 동기화 서비스 주소. Vercel/Netlify/Cloudflare 기본 도메인에 배포할 때 시스템이 자동으로 감지하므로 수동 구성이 필요하지 않습니다. GitHub Pages 또는 사용자 지정 도메인을 사용하는 경우에만 필요합니다.',
      syncApiUrlPlaceholder: 'https://your-app.vercel.app',
      syncNow: '지금 동기화',
      syncStatus: '동기화 상태',
      syncStatusIdle: '준비됨',
      syncStatusSyncing: '동기화 중...',
      syncStatusSuccess: '동기화 성공',
      syncStatusError: '동기화 실패',
      lastSyncTime: '마지막 동기화',
      neverSynced: '동기화 안됨',
      syncSuccess: '동기화에 성공했습니다!',
      syncFailed: '동기화 실패: {error}',
      syncConflicts: '{count}개의 충돌 감지',
      
      // 시간 단위
      justNow: '방금',
      timeAgo: '{value}{unit} 전',
      days: '일',
      hours: '시간',
      minutes: '분',
      
      // 충돌 해결
      conflictResolution: '충돌 해결 전략',
      conflictStrategyTimestamp: '타임스탬프 우선(최신 우선)',
      conflictStrategyLocal: '로컬 우선',
      conflictStrategyRemote: '원격 우선',
      conflictStrategyManual: '수동 선택',
      conflictDetected: '데이터 충돌 감지',
      conflictCount: '충돌 수',
      resolveConflict: '충돌 해결',
      useLocal: '로컬 사용',
      useRemote: '원격 사용'
    },

    proxy: {
      title: '네트워크 및 프록시',
      proxyMode: '프록시 서비스 활성화',
      proxyHint: '백엔드 서버를 통해 모든 AI API 요청을 프록시하여 CORS 제한을 해결하고 네트워크 안정성과 요청 연속성을 보장합니다. 모든 AI 요청(채팅, 이미지 생성, 모델 목록 등)은 프록시 서버를 통해 전달되며, 클라이언트 네트워크가 끊어져도 서버 측 장시간 실행 요청은 계속됩니다.',
      cloudProxyUrl: '클라우드 프록시 URL',
      cloudProxyHint: '프로덕션 환경 프록시 서비스 주소. Vercel(*.vercel.app), Netlify(*.netlify.app), Cloudflare Pages(*.pages.dev) 기본 도메인에 배포할 때 시스템이 자동으로 감지하므로 입력할 필요가 없습니다. GitHub Pages 또는 사용자 지정 도메인을 사용하는 경우에만 수동 구성이 필요합니다.\n\n로컬 개발 환경에서는 자동으로 http://localhost:5000/api/proxy를 사용합니다. 구성이 필요하지 않습니다.',
      cloudSyncDepends: '클라우드 동기화는 프록시 서비스에 의존합니다. 프록시를 비활성화하면 동기화도 중지됩니다'
    },

    footer: {
      saveAndApply: '저장 및 적용'
    },

    logs: {
      title: '시스템 로그',
      searchPlaceholder: '로그 검색...',
      clearLogs: '로그 지우기',
      clearConfirm: '모든 로그를 지우시겠습니까?',
      exportLogs: 'JSON 내보내기',
      noLogs: '로그가 없습니다',
      logDetails: '로그 상세',
      copyLogs: '로그 복사',
      level: '레벨',
      module: '모듈',
      content: '내용',
      totalRecords: '총 {count}개 기록',
      filteredRecords: '({count}개 필터링됨)'
    }
  },

  conversationSettings: {
    title: '대화 설정',
    loading: '로딩 중...',
    resetConfirm: '전역 설정으로 재설정하시겠습니까?',
    saveSuccess: '설정이 저장되었습니다!\n\n첫 번째 메시지를 보내면 이 설정이 새 대화에 자동으로 적용됩니다.',
    resetToGlobal: '전역으로 재설정',
    custom: '사용자 정의',
    promptLabel: '프롬프트 (Prompt)',
    messageLimit: '메시지 제한',
    unlimited: '무제한',
    notSet: '미설정',
    temperature: '온도',
    topP: 'Top P',
    cancel: '취소',
    saveSettings: '설정 저장',
    saveAndSend: '저장 및 전송'
  },

  inputArea: {
    placeholder: '메시지 입력...',
    placeholderQuestion: '여기에 질문을 입력하세요...',
    selectModel: '모델 선택',
    webSearch: '웹 검색',
    deepThinking: '심층 사고',
    attachFile: '파일 첨부',
    conversationSettings: '대화 설정',
    knowledgeBase: '지식 베이스',
    compressConversation: '대화 압축',
    send: '전송',
    stop: '중지',
    interrupt: '중단',
    generating: '생성 중...',
    noModels: '사용 가능한 모델이 감지되지 않았습니다',
    configureModels: '설정에서 모델을 구성하고 선택하세요',
    noKey: 'API 키가 미설정됨',
    unnamedProvider: '이름 없는 제공업체',
    uploadFile: '파일 업로드',
    selectKB: '지식 베이스 선택',
    setSystemPrompt: '시스템 프롬프트 설정됨',
    takePhoto: '사진',
    camera: {
      rotate: '회전',
      retake: '다시 찍기',
      usePhoto: '사진 사용'
    },
    newConversation: '새 대화 생성',
    cameraAccessError: '카메라에 접근할 수 없습니다: ',
    interrupted: 'AI 응답이 중단되었습니다',
    error: '오류: ',
    ocrNotConfigured: '현재 모델은 이미지 입력을 지원하지 않습니다. 설정에서 OCR 모델을 구성하거나 비전 지원 모델을 선택하세요',
    notSet: '미설정',
    unlimited: '무제한',
    uploadDoc: '문서 업로드'
  },

  compression: {
    historySummary: '기록 요약',
    autoCompressed: '자동 압축됨',
    tooFewMessages: '메시지가 너무 적어 압축할 필요가 없습니다',
    modelNotConfigured: '압축 모델이 구성되지 않았습니다. 설정에서 구성하세요',
    providerNotFound: '압축 모델 제공자를 찾을 수 없습니다',
    success: '대화 압축 성공!',
    failed: '압축 실패',
    compressing: '압축 중...',
    autoCompression: '자동 압축',
    autoCompressionHint: '메시지 수가 임계값을 초과할 때 자동으로 기록을 압축합니다',
    autoCompressionThreshold: '자동 압축 임계값',
    autoCompressionThresholdHint: '메시지 수가 이 값을 초과하면 자동 압축이 트리거됩니다 (권장: 50-100)',
    messages: '개 메시지',
    newTopic: '새 주제'
  },

  model: {
    capabilities: {
      title: '모델 기능',
      thinking: '심층 사고',
      multimodal: '멀티모달',
      tools: '도구 호출',
      imageGen: '이미지 생성'
    },
    contextWindow: '컨텍스트 윈도우 (토큰)',
    maxOutput: '최대 출력 (토큰)',
    maxThinking: '최대 사고 길이 (토큰)',
    maxThinkingHint: '사고 프로세스를 지원하는 모델에만 적용',
    modelId: '모델 ID',
    modelIdHint: 'API 호출용 모델 식별자',
    displayName: '표시 이름',
    displayNameHint: '인터페이스에 표시되는 모델 이름 (모델 가져오기 시 API에서 제공하는 표시 이름을 우선하며, 그렇지 않으면 자동 추론)',
    modelIdPlaceholder: '예: gpt-4o, claude-3-5-sonnet',
    displayNamePlaceholder: '예: GPT-4 Omni, Claude 3.5 Sonnet',
    defaultUnlimited: '기본값 (무제한)',
    fillRequired: '모델 ID와 표시 이름을 입력하세요',
    idExists: '모델 ID가 이미 존재합니다. 다른 ID를 사용하세요',
    autoInferred: '자동 추론 완료',
    autoInfer: '자동 추론',
    autoInferHint: '모델 ID를 기반으로 표시 이름 재추론'
  },

  logs: {
    searchPlaceholder: '로그 검색...',
    level: {
      error: '오류',
      warn: '경고',
      info: '정보',
      debug: '디버그'
    },
    noLogs: '로그가 없습니다',
    exportLogs: '로그 내보내기',
    clearLogs: '로그 지우기',
    clearConfirm: '모든 로그를 지우시겠습니까?',
    filters: '필터'
  },

  fileUpload: {
    title: '파일 업로드',
    dragHint: '여기에 파일을 드래그 앤 드롭하거나 클릭하여 선택',
    uploading: '업로드 중...',
    uploadSuccess: '업로드 성공',
    uploadFailed: '업로드 실패',
    removeFile: '파일 제거',
    supportedFormats: '지원 형식',
    failed: '파일 업로드 실패: ',
    dropHint: '마우스를 놓아 파일 업로드',
    clickHint: '파일을 클릭하거나 여기로 드래그하여 업로드',
    supportHint: 'PDF, Word, PowerPoint, Excel, 텍스트 파일 (최대 10MB) 지원',
    parsing: '분석 중',
    completed: '분석 완료',
    deleteFile: '파일 삭제'
  },

  knowledgeBase: {
    title: '지식 베이스',
    selectKB: '지식 베이스 선택',
    noKB: '지식 베이스가 없습니다',
    kbHint: '지식 베이스를 생성하고 문서를 업로드하면 대화에서 참조할 수 있습니다',
    goToCreate: '생성하러 가기',
    noMatches: '일치하는 지식 베이스가 없습니다',
    documentsCount: '{count}개 문서',
    chunksCount: '{count}개 청크',
    clearSelection: '선택 해제',
    manageKB: '지식 베이스 관리',
    confirm: '확인',
    confirmSelection: '선택 확인',
    searchKB: '지식 베이스 검색...',
    documents: '문서',
    addDocument: '문서 추가',
    management: '지식 베이스 관리',
    newKB: '새 지식 베이스',
    kbName: '지식 베이스 이름',
    kbNamePlaceholder: '예: 기술 문서 보관소',
    kbDescription: '설명(선택 사항)',
    kbDescriptionPlaceholder: '이 지식 베이스의 용도를 간단히 설명해 주세요...',
    retrievalSettings: '검색 설정',
    topK: '검색 문서 수 (Top-K)',
    threshold: '유사성 임계값',
    maxTokens: '최대 컨텍스트 토큰 수',
    noDocuments: '문서가 없습니다. 문서를 업로드해 주세요',
    deleteDocument: '문서 삭제',
    usageTips: '사용 팁',
    usageTip1: '대화 인터페이스에서 책 아이콘을 클릭하여 사용할 지식 베이스를 선택하세요',
    usageTip2: 'PDF, Word, Excel, PPT, Markdown 및 텍스트 파일을 지원합니다',
    usageTip3: '파일 내용은 로컬에서 분석되며 외부 서버로 업로드되지 않습니다',
    usageTip4: '큰 문서는 자동으로 청크로 나뉘고 빠른 검색을 위해 색인화됩니다',
    deleteConfirm: '지식 베이스 "{name}"을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    deleteDocConfirm: '문서 "{name}"을(를) 삭제하시겠습니까?',
    uploadingStatus: '처리 중...',
    loadingParser: '파서 로드 중...',
    reading: '읽는 중...',
    processing: '처리 중...',
    supportFormats: '지원 형식:'
  },

  error: {
    networkError: '네트워크 오류, 연결을 확인하세요',
    apiError: 'API 호출 실패',
    invalidResponse: '잘못된 응답',
    timeout: '요청 시간 초과',
    unauthorized: '권한 없음, API 키를 확인하세요',
    unknown: '알 수 없는 오류',
    saveFailed: '저장 실패',
    clearDataConfirm: '이 작업은 모든 로컬 데이터（대화 기록, 설정 등）를 삭제합니다. 계속하시겠습니까?'
  },

  message: {
    reasoning: '심층 사고',
    copy: '복사',
    regenerate: '재생성',
    edit: '편집',
    quote: '인용',
    prevBranch: '이전 브랜치',
    nextBranch: '다음 브랜치',
    wordCount: '자',
    tokens: '토큰: 약',
    startConversation: '대화를 시작해 보세요',
    thinking: '생각 중...',
    generating: '답변 생성 중...'
  },

  topBar: {
    incognitoConversation: '시크릿 대화',
    newConversation: '새 대화',
    incognitoEnabled: '시크릿 모드가 활성화되었습니다',
    enableIncognito: '시크릿 모드 활성화',
    incognitoActive: '시크릿 모드',
    incognitoMode: '시크릿 모드'
  },

  auth: {
    welcomeBack: '다시 오신 것을 환영합니다',
    initSecurity: '보안 초기 설정',
    unlockHint: 'AI 워크스테이션 잠금을 해제하려면 액세스 비밀번호를 입력하세요',
    setupHint: '데이터 암호화를 위한 강력한 비밀번호를 설정하세요',
    passwordPlaceholder: '액세스 비밀번호',
    encryptionNote: 'API 키와 대화 기록은 이 비밀번호를 사용하여 로컬에서 AES-256 암호화되어 저장됩니다. 동기화가 활성화되면 암호화된 데이터가 클라우드로 동기화됩니다.',
    unlock: '잠금 해제',
    start: '시작하기',
    passwordWeak: '비밀번호 강도가 부족합니다: 최소 8자 이상, 대소문자, 숫자 및 특수문자를 포함해야 합니다',
    passwordError: '비밀번호가 올바르지 않습니다',
    pleaseLogin: '먼저 로그인하세요'
  },

  ocr: {
    notSupported: '현재 모델 {model} 은(는) 이미지 입력을 지원하지 않으므로 OCR로 이미지를 처리합니다',
    contextHeader: '[OCR 텍스트 인식 결과]',
    contextIntro: '사용자가 이미지를 업로드했습니다. 현재 모델이 이미지 입력을 지원하지 않으므로 시스템이 OCR 기술을 사용하여 이미지에서 텍스트를 추출했습니다. 다음은 인식된 텍스트 내용입니다. 사용자 입력의 일부로 처리하십시오:',
    contextFooter: '참고: 위 내용은 OCR에 의해 자동으로 추출되었으며 인식 오류가 포함될 수 있습니다.'
  },

  imageFactory: {
    title: '이미지 팩토리',
    textToImage: '텍스트에서 이미지',
    imageToImage: '이미지에서 이미지',
    generate: '생성',
    prompt: '프롬프트',
    promptPlaceholder: '생성하려는 이미지를 설명하세요...',
    negativePrompt: '네거티브 프롬프트',
    negativePromptPlaceholder: '이미지에 포함하고 싶지 않은 내용...',
    parameters: '매개변수',
    resolution: '해상도',
    steps: '샘플링 단계',
    cfgScale: 'CFG 스케일',
    seed: '시드',
    random: '랜덤',
    style: '스타일',
    noStyle: '스타일 없음',
    styles: {
      cinematic: '영화적',
      photographic: '사진',
      anime: '애니메이션',
      'digital-art': '디지털 아트',
      'fantasy-art': '판타지 아트',
      neonpunk: '네온펑크',
      '3d-model': '3D 모델'
    },
    gallery: '갤러리',
    noHistory: '생성된 이미지가 없습니다',
    referenceImage: '참조 이미지',
    uploadHint: '클릭 또는 드래그하여 업로드',
    selectModel: '모델 선택',
    noImageModels: '이미지 생성 모델이 감지되지 않았습니다',
    clearAllConfirm: '모든 생성된 이미지를 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    deleteConfirm: '선택한 {count}개의 이미지를 삭제하시겠습니까?'
  },

  plusMenu: {
    title: '기능 메뉴',
    providers: '프로바이더',
    providersDesc: 'AI 서비스 프로바이더 구성',
    presetModels: '프리셋 모델',
    presetModelsDesc: '자주 사용하는 모델 관리',
    webSearch: '웹 검색',
    webSearchDesc: '검색 엔진 구성',
    knowledgeBase: '지식 베이스',
    knowledgeBaseDesc: '문서와 지식 관리',
    fileParser: '파일 파서',
    fileParserDesc: '문서 업로드 및 분석',
    conversationSettings: '대화 설정',
    conversationSettingsDesc: '현재 대화 매개변수 설정'
  },

  markdown: {
    preview: '라이브 미리보기',
    hidePreview: '미리보기 숨기기',
    copy: '복사',
    copied: '복사됨',
    publish: '게시',
    published: '게시됨',
    generatingChart: '차트 생성 중...'
  },

  mermaid: {
    zoomIn: '확대',
    zoomOut: '축소',
    reset: '초기화',
    fullscreen: '전체 화면',
    exitFullscreen: '전체 화면 종료',
    copyCode: '코드 복사',
    downloadSVG: 'SVG 다운로드',
    downloadPNG: 'PNG 다운로드',
    viewCode: '코드 보기',
    hideCode: '코드 숨기기',
    showCode: '코드 보기',
    dragHint: '드래그하여 이동, 스크롤하여 확대/축소'
  },

  document: {
    presentation: '프레젠테이션',
    textFile: '텍스트 파일'
  },

  help: {
    title: '도움말 가이드',
    description: 'AiPiBox를 배포하고 구성하는 방법과 다양한 기능을 사용하는 방법을 알아보세요',
    footer: '더 많은 도움이 필요하면 프로젝트 문서를 참조하거나 GitHub에서 문제를 제출하세요',

    deployment: {
      title: '배포 옵션',
      platforms: {
        title: '지원되는 플랫폼',
        content: 'AiPiBox는 Vercel, Netlify, Cloudflare Pages, GitHub Pages 및 로컬 개발 환경을 포함한 여러 배포 플랫폼을 지원합니다. 애플리케이션은 런타임 환경을 자동으로 감지하고 수동 개입 없이 적절한 구성을 사용합니다.'
      },
      vercel: {
        title: 'Vercel 배포',
        content: '도메인 패턴 *.vercel.app으로 자동 식별.\\n프록시 경로: /api/ai-proxy(자동)\\n동기화 경로: /api/sync(자동)\\nServerless Functions 지원, 최대 300초 실행.\\n\\n배포 방법:\\n1. Vercel CLI 사용: vercel --prod\\n2. Vercel 대시보드를 통해 GitHub 리포지토리 가져오기\\n\\n클라우드 프록시 URL을 구성할 필요가 없으며, 시스템이 자동으로 감지합니다.'
      },
      netlify: {
        title: 'Netlify 배포',
        content: '도메인 패턴 *.netlify.app으로 자동 식별.\\n프록시 경로: /api/ai-proxy(자동)\\n동기화 경로: /api/sync(자동)\\nNetlify Functions 지원, 최대 300초 실행.\\n\\n배포 방법:\\n1. Netlify CLI 사용: netlify deploy --prod\\n2. Netlify 대시보드를 통해 GitHub 리포지토리 연결\\n\\n클라우드 프록시 URL을 구성할 필요가 없으며, 시스템이 자동으로 감지합니다.'
      },
      cloudflare: {
        title: 'Cloudflare Pages 배포',
        content: '도메인 패턴 *.pages.dev로 자동 식별.\\n프록시 경로: /functions/ai-proxy(자동)\\n동기화 경로: /functions/sync(자동)\\nCloudflare Workers 지원, 실행 시간 제한 없음.\\n\\n배포 방법:\\n1. Wrangler CLI 사용: wrangler pages deploy dist\\n2. Cloudflare 대시보드를 통해 Git 연결\\n\\n클라우드 동기화에는 KV 네임스페이스 바인딩이 필요합니다(변수 이름: SYNC_DATA).\\n클라우드 프록시 URL을 구성할 필요가 없으며, 시스템이 자동으로 감지합니다.'
      },
      github: {
        title: 'GitHub Pages 배포',
        content: '도메인 패턴 *.github.io로 자동 식별.\\nGitHub Pages는 정적 파일 호스팅만 지원하며 백엔드 함수를 실행할 수 없습니다.\\n\\n배포 방법:\\n프로젝트에 자동 배포 워크플로우가 포함되어 있으며 main 브랜치에 푸시하면 자동으로 배포됩니다.\\n\\n중요한 구성:\\nAI 기능을 사용하려면 외부 API 서비스를 구성해야 합니다.\\nVercel 또는 Cloudflare 무료 플랜을 사용하여 API 서비스를 배포하는 것이 좋습니다.\\n설정에서 클라우드 프록시 URL을 입력하세요: https://your-api.vercel.app/api/ai-proxy'
      },
      local: {
        title: '로컬 개발',
        content: '도메인 localhost 또는 127.0.0.1로 자동 식별.\\n프록시 경로: http://localhost:5000/api/proxy(자동)\\n\\n시작 방법:\\n방법 1(권장): npm run dev:full\\n프록시 서버와 개발 서버를 자동으로 시작합니다.\\n\\n방법 2: 별도로 시작\\n터미널 1: npm run proxy\\n터미널 2: npm run dev\\n\\n방법 3: 외부 API 사용\\nnpm run dev만 실행\\n설정에서 프로덕션 클라우드 프록시 URL을 구성합니다.'
      }
    },

    proxy: {
      title: '프록시 구성',
      overview: {
        title: '프록시 개요',
        content: 'AI 프록시 서비스는 모든 AI API 요청을 전달하여 브라우저 CORS 제한을 해결하고 네트워크 안정성과 요청 연속성을 보장합니다. 모든 AI 요청(채팅, 이미지 생성, 모델 목록 등)은 프록시 서버를 통해 진행됩니다. 클라이언트 네트워크가 끊어져도 서버 측 장시간 실행 요청은 계속됩니다.'
      },
      cloudProxy: {
        title: '클라우드 프록시 URL',
        content: '목적: 프로덕션 환경 프록시 서비스 주소\\n\\n언제 입력해야 합니까:\\n1. GitHub Pages에 배포할 때(필수)\\n2. 사용자 지정 도메인을 사용할 때(권장)\\n3. 프론트엔드/백엔드 분리 배포일 때(필수)\\n\\n언제 입력하지 않아도 되나요:\\n1. Vercel에 배포(*.vercel.app)\\n2. Netlify에 배포(*.netlify.app)\\n3. Cloudflare Pages에 배포(*.pages.dev)\\n\\n이러한 플랫폼은 자동으로 감지하고 상대 경로를 사용하여 플랫폼 함수를 호출하므로 추가 구성이 필요하지 않습니다.'
      },
      localProxy: {
        title: '로컬 프록시 URL',
        content: '목적: 로컬 개발 환경 프록시 서비스 주소\\n기본값: http://localhost:5000/api/proxy\\n\\n사용 시나리오:\\n로컬 개발 중에 npm run proxy 또는 npm run dev:full을 실행하면 애플리케이션이 자동으로 이 주소를 사용합니다. 로컬 프록시를 실행하지 않은 경우 여기에서 프로덕션 프록시 주소를 구성하여 테스트할 수 있습니다.\\n\\n일반적으로 이 항목을 수정할 필요가 없으며 기본값을 유지하면 됩니다.'
      },
      autoDetect: {
        title: '환경 자동 감지',
        content: '애플리케이션에는 현재 액세스 중인 도메인을 기반으로 적절한 프록시 구성을 자동으로 선택하는 지능형 환경 감지 메커니즘이 내장되어 있습니다:\\n\\n감지 논리:\\n- *.vercel.app → /api/ai-proxy 사용\\n- *.netlify.app → /api/ai-proxy 사용\\n- *.pages.dev → /functions/ai-proxy 사용\\n- *.github.io → 구성된 외부 프록시 URL 사용\\n- localhost → http://localhost:5000/api/proxy 사용\\n- 사용자 지정 도메인 → 구성된 클라우드 프록시 URL 사용\\n\\n이 프로세스는 완전히 자동이므로 개발자는 기본 구현 세부 사항에 대해 걱정할 필요가 없습니다.'
      }
    },

    sync: {
      title: '클라우드 동기화',
      overview: {
        title: '클라우드 동기화 기능',
        content: '클라우드 동기화를 통해 대화 기록, 구성 설정 및 기타 데이터를 클라우드 서버에 동기화하여 다중 장치 데이터 공유 및 백업을 실현할 수 있습니다. 데이터 전송에는 종단 간 암호화가 사용되어 개인 정보 보호를 보장합니다.\\n\\n동기화되는 데이터에는 다음이 포함됩니다:\\n- 대화 기록\\n- 공급자 구성(API Key 암호화됨)\\n- 모델 프리셋 구성\\n- 대화 설정 및 검색 설정\\n- 지식 베이스 구성'
      },
      setup: {
        title: '클라우드 동기화 구성',
        content: '활성화 단계:\\n1. 백엔드 함수를 지원하는 플랫폼(Vercel/Netlify/Cloudflare)에 배포됨 확인\\n2. 데이터베이스 연결 구성(MySQL 또는 PostgreSQL)\\n3. 설정 → 보안 및 데이터에서 클라우드 동기화 활성화\\n4. 동기화 비밀번호 설정(데이터 암호화 및 사용자 ID 생성용)\\n5. \"지금 동기화\"를 클릭하여 처음 동기화 수행\\n\\n데이터베이스 구성:\\n플랫폼 환경 변수에서 설정:\\nDATABASE_URL=mysql://user:pass@host:3306/dbname\\nDATABASE_TYPE=mysql'
      },
      platforms: {
        title: '다양한 플랫폼의 동기화 지원',
        content: 'Vercel/Netlify:\\nMySQL 및 PostgreSQL 데이터베이스 지원\\n플랫폼 설정에서 데이터베이스 연결을 구성해야 합니다\\n\\nCloudflare Pages:\\nKV 스토리지 및 D1 데이터베이스 지원\\nPages 설정에서 KV 네임스페이스를 바인드해야 합니다(변수 이름: SYNC_DATA)\\n\\nGitHub Pages:\\n외부 동기화 서비스 구성 필요\\n다른 플랫폼에 배포된 API 서비스를 사용할 수 있습니다\\n\\n로컬 개발:\\n파일 스토리지 또는 원격 데이터베이스 연결 지원\\n동기화 기능 테스트에 사용할 수 있습니다'
      }
    },

    features: {
      title: '기능 특성',
      aiProxy: {
        title: 'AI API 프록시',
        content: '기술 구현:\\n모든 AI 요청은 클라이언트 브라우저가 직접 전송하는 대신 클라우드 서버 프록시를 통해 진행됩니다. 이는 네트워크 안정성과 요청 연속성을 보장합니다. 클라이언트 네트워크가 끊어져도 서버 측 장시간 실행 요청은 계속됩니다.\\n\\n지원되는 기능:\\n- 스트리밍 응답 전송(Server-Sent Events)\\n- 요청 큐 관리\\n- 자동 재시도 메커니즘(최대 3회)\\n- 요청 캠싱(모델 목록 1시간 캠싱)\\n- 타임아웃 제어(최대 300초)\\n- 민감한 정보 마스킹(API Key 자동 숨김)\\n\\n성능 최적화:\\n- 스마트 캠싱으로 중복 요청 감소\\n- 디버깅을 위한 요청 추적\\n- 글로벌 CDN 가속화'
      },
      imageGen: {
        title: '이미지 생성',
        content: '이미지 팩토리 기능은 텍스트에서 이미지로, 이미지에서 이미지로 모두 지원하며 AI 프록시 서비스를 통해 다양한 이미지 생성 모델을 호출합니다.\\n\\n기능 특성:\\n- 다양한 해상도(512x512부터 1024x1024까지)\\n- 조정 가능한 샘플링 단계 및 CFG 가이던스 강도\\n- 재현 가능한 생성을 위한 고정 시드 값\\n- 다양한 예술 스타일 프리셋\\n- 이미지 기록 저장\\n- 배치 생성 및 관리\\n\\n모든 이미지 생성 요청은 클라우드 프록시를 통해 생성 안정성을 보장합니다. 고정 시드의 결과는 캠싱되어 중복 계산을 피합니다.'
      },
      knowledge: {
        title: '지식 베이스 관리',
        content: '지식 베이스 기능을 사용하면 문서를 업로드하고 대화에서 참조할 수 있으며 여러 파일 형식을 지원합니다:\\n\\n지원되는 형식:\\n- PDF 문서\\n- Word 문서(.docx)\\n- Excel 스프레드시트(.xlsx)\\n- PowerPoint 프레젠테이션(.pptx)\\n- 텍스트 파일(.txt, .md)\\n- 코드 파일\\n\\n기술 구현:\\n문서 콘텐츠는 로컬에서 구문 분석되어 브라우저 IndexedDB에 저장됩니다. 대화 중에 문서 콘텐츠를 선택적으로 컨텍스트에 포함하여 AI 모델에 보낼 수 있습니다.\\n\\n클라우드 동기화가 활성화된 경우 지식 베이스 구성(파일 콘텐츠 제외)이 클라우드에 동기화되어 여러 장치에서 액세스할 수 있습니다.'
      }
    }
  }
};
