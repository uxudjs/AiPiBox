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
      help: '도움말 센터'
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
      encryptionEnabled: '종단간 암호화 보호',
      encryptionHint: '시스템은 AES-256 표준을 사용하여 API 키, 대화 기록 및 구성 데이터를 로컬에 암호화하여 저장하며, 마스터 비밀번호로 잠금을 해제해야만 접근할 수 있습니다.',
      cloudSync: '클라우드 동기화 서비스',
      cloudSyncHint: '활성화 시 암호화된 구성, 대화 기록, 모델 프리셋 및 지식 베이스 인덱스가 클라우드에 동기화됩니다. 동기화 과정은 종단간 암호화를 사용하여 클라우드 데이터가 가로채어지더라도 원본 내용을 복호화할 수 없도록 보장합니다.',
      syncServerOnline: '동기화 서버 연결 정상',
      syncServerOffline: '동기화 서버 연결 끊김',
      syncServerNotAvailable: '동기화 서비스에 접근할 수 없습니다. 동기화 인터페이스 주소 설정이 올바른지 확인하십시오',
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
      autoSync: '자동 실시간 동기화',
      autoSyncHint: '로컬 데이터 변경 감지 시 자동으로 클라우드 동기화 시작',
      syncApiUrl: '동기화 서비스 인터페이스 주소',
      syncApiUrlHint: '클라우드 동기화 서비스의 API 엔트리 포인트를 지정합니다. Vercel 또는 Cloudflare와 같은 기본 환경에서는 비워둘 수 있으며, 시스템이 환경을 자동 식별하여 최적의 경로를 채택합니다.',
      syncApiUrlPlaceholder: '기본 경로 (권장)',
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
      proxyMode: '글로벌 API 프록시 활성화',
      proxyHint: '프록시 서비스는 브라우저의 교차 출처 리소스 공유(CORS) 제한을 우회하고 연결 안정성을 강화하도록 설계되었습니다. 활성화 시 모든 AI 요청은 서버 측 프록시를 통해 전달되어 불안정한 네트워크 환경에서도 장시간 연결 요청의 무결성과 성공률을 보장합니다.',
      cloudProxyUrl: '프로덕션 환경 프록시 주소',
      cloudProxyHint: '프로덕션 환경의 AI 프록시 서비스 인터페이스를 지정합니다. 시스템은 Vercel, Netlify 및 Cloudflare Pages의 기본 배포 경로를 자동으로 식별합니다. 사용자 정의 도메인이나 GitHub Pages를 사용하는 경우 반드시 수동으로 구성하십시오.',
      cloudSyncDepends: '클라우드 동기화 기능은 프록시 서비스에 의존하며, 프록시 비활성화 시 동기화가 실패합니다'
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
    ocrNotConfigured: 'OCR 모델이 설정되지 않았습니다. \'설정 - 프리셋 모델 - OCR 모델\'에서 설정해 주세요',
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
    title: '도움말 센터',
    description: '이 문서는 배포, 구성 및 기능 사용에 대한 자세한 가이드를 제공합니다',
    footer: '기술적인 세부 사항은 공식 문서를 참조하거나 GitHub를 통해 피드백을 제출하세요',

    deployment: {
      title: '다중 플랫폼 배포 가이드',
      platforms: {
        title: '환경 자동 식별',
        content: 'AiPiBox는 실행 환경을 자동으로 감지하고 Vercel, Netlify, Cloudflare Pages 등의 플랫폼에 최적화된 구성을 적용합니다.'
      },
      vercel: {
        title: 'Vercel 배포',
        content: '지원 도메인 특징: *.vercel.app\n프록시 엔트리: /api/ai-proxy (전자동)\n동기화 인터페이스: /api/sync (전자동)\n플랫폼 특성: Serverless Functions 지원. 배포 시 추가 프록시 URL 설정이 필요하지 않습니다.'
      },
      netlify: {
        title: 'Netlify 배포',
        content: '지원 도메인 특징: *.netlify.app\n프록시 엔트리: /api/ai-proxy (전자동)\n동기화 인터페이스: /api/sync (전자동)\n플랫폼 특성: Netlify Functions 지원. GitHub 리포지토리와 직접 연동하여 배포하는 것을 권장합니다.'
      },
      cloudflare: {
        title: 'Cloudflare Pages 배포',
        content: '지원 도메인 특징: *.pages.dev\n프록시 엔트리: /api/ai-proxy (전자동)\n동기화 인터페이스: /api/sync (전자동)\n플랫폼 특성: Cloudflare Workers 기반으로 실행되며 요청 시간 제한이 없습니다. 클라우드 동기화는 대시보드에서 KV 네임스페이스(변수명: SYNC_DATA) 바인딩이 필요합니다.'
      },
      github: {
        title: 'GitHub Pages 배포',
        content: '지원 도메인 특징: *.github.io\n핵심 제한: GitHub Pages는 정적 호스팅만 지원하며 백엔드 로직 실행을 지원하지 않습니다.\n주요 구성: AI 기능을 활성화하려면 설정에서 프로덕션 환경의 "클라우드 프록시 URL"을 수동으로 지정해야 합니다.'
      },
      local: {
        title: '로컬 개발 및 디버깅',
        content: '식별 특징: localhost 또는 127.0.0.1\n시작 방법: "npm run dev:full"을 사용하여 프론트엔드와 프록시 서비스를 동시에 시작하는 것을 권장합니다. "npm run dev"만 실행하는 경우 원격 프록시 주소가 올바르게 구성되었는지 확인하십시오.'
      }
    },

    proxy: {
      title: '프록시 서비스 설정',
      overview: {
        title: '프록시 메커니즘 설명',
        content: 'AI 프록시 서비스의 핵심은 클라이언트 요청을 중계하고 CORS 교차 출처 제한을 해결하며, 복잡한 네트워크 환경에서 더 안정적인 긴 연결 유지 기능을 제공하여 스트리밍 출력의 연속성을 보장하는 데 있습니다.'
      },
      cloudProxy: {
        title: '프로덕션 프록시 구성',
        content: 'Vercel, Netlify 또는 Cloudflare Pages와 같은 네이티브 환경에서는 시스템이 자동으로 상대 경로를 사용하므로 일반적으로 수동 설정이 필요하지 않습니다. 교차 도메인 배포, 사용자 정의 도메인 또는 GitHub Pages를 사용하는 경우에만 이 인터페이스 주소를 명시적으로 구성해야 합니다.'
      },
      localProxy: {
        title: '로컬 디버깅 설정',
        content: '기본값은 http://localhost:5000/api/proxy입니다. 이 설정은 주로 개발 단계에서 프론트엔드가 로컬에 시뮬레이션된 백엔드 프록시 로직에 정상적으로 접근할 수 있도록 하는 데 사용됩니다.'
      },
      autoDetect: {
        title: '지능형 환경 식별',
        content: '시스템은 현재 호스트명을 기반으로 프록시 전략을 동적으로 전환합니다:\n- 플랫폼 네이티브 도메인: 내부 Serverless 라우트에 자동 연결\n- 정적 호스팅 도메인: 수동 구성된 원격 프록시 인터페이스로 폴백\n- 개발 환경: Vite 프록시 설정에 연결'
      }
    },

    sync: {
      title: '클라우드 동기화 메커니즘',
      overview: {
        title: '동기화 기능 개요',
        content: '클라우드 동기화를 통해 다차원 데이터를 원격 데이터베이스에 안전하게 저장할 수 있습니다. 모든 민감한 데이터는 클라이언트 측에서 종단간 암호화되므로 전송 중에 동기화 서버를 포함한 제3자가 데이터 내용을 훔쳐볼 수 없습니다.'
      },
      setup: {
        title: '활성화 단계 가이드',
        content: '1. 배엔드 함수 플랫폼 배포 완료\n2. DATABASE_URL 및 DATABASE_TYPE 환경 변수 구성\n3. 보안 설정에서 클라우드 동기화를 켜고 고유한 동기화 비밀번호 설정\n4. 기준 수립을 위해 초기 수동 동기화 수행'
      },
      platforms: {
        title: '백엔드 스토리지 지원',
        content: 'Vercel/Netlify: MySQL 및 PostgreSQL 데이터베이스와 호환됩니다.\nCloudflare Pages: KV 키-값 스토리지를 활용하여 가벼운 데이터 동기화를 구현합니다.'
      }
    },

    features: {
      title: '핵심 기능 분석',
      aiProxy: {
        title: '풀오토 API 프록시',
        content: '기술적 특징:\n- 완전한 Server-Sent Events 스트리밍 전송 지원\n- 자동 지수 백오프 재시도 메커니즘\n- API 소비 절감을 위한 글로벌 요청 캐싱\n- 자동화된 API Key 마스킹 처리'
      },
      imageGen: {
        title: '멀티 모드 이미지 생성',
        content: '텍스트 투 이미지 및 이미지 투 이미지 모드 통합. 사용자 정의 해상도, 샘플링 단계 및 CFG 파라미터 지원. 시스템은 프록시 서비스를 통해 명령을 하달하며, 효율 향상을 위해 고정 시드의 생성 결과를 캐싱합니다.'
      },
      knowledge: {
        title: '로컬라이즈 지식 베이스',
        content: '지식 베이스는 로컬 파싱 전략을 채택합니다:\n- PDF, Word, Excel, PPT 및 각종 텍스트 형식 호환\n- 문서 내용은 브라우저 측에서 완전히 인덱싱되며 원본 파일은 업로드되지 않음\n- 클라우드 동기화 활성화 시 지식 베이스의 메타데이터와 인덱스 구조만 동기화됨'
      }
    }
  }
};
