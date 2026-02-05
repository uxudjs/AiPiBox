import React, { useState } from 'react';
import { Plus, Trash2, Upload, FileText, X, AlertCircle, Check, Loader2, FileType, Edit2, Save } from 'lucide-react';
import { useKnowledgeBaseStore } from '../../store/useKnowledgeBaseStore';
import { cn } from '../../utils/cn';
import { logger } from '../../services/logger';
import { parseDocument, formatDocumentForAI, SUPPORTED_TYPES } from '../../services/documentParser';
import { useTranslation } from '../../i18n';

/**
 * 知识库设置组件
 * 在设置面板中展示知识库管理界面
 */
const KnowledgeBaseSettings = ({ 
  retrievalSettings: controlledSettings, 
  onUpdateRetrievalSettings 
}) => {
  const { t } = useTranslation();
  const kbStore = useKnowledgeBaseStore();
  
  // 使用受控设置或从 store 获取
  const retrievalSettings = controlledSettings || kbStore.retrievalSettings;
  const updateRetrievalSettings = onUpdateRetrievalSettings || kbStore.updateRetrievalSettings;
  
  const {
    knowledgeBases,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    addDocument,
    deleteDocument,
    getKnowledgeBaseStats
  } = kbStore;
  
  const [expandedKB, setExpandedKB] = useState(null);
  const [newKBName, setNewKBName] = useState('');
  const [newKBDescription, setNewKBDescription] = useState('');
  const [showNewKBForm, setShowNewKBForm] = useState(false);
  const [uploadingTo, setUploadingTo] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({}); // { fileName: { status, progress, error } }

  // 编辑状态
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  /**
   * 创建新知识库
   */
  const handleCreateKB = () => {
    if (!newKBName.trim()) {
      alert(t('knowledgeBase.kbNamePlaceholder'));
      return;
    }
    
    createKnowledgeBase(newKBName.trim(), newKBDescription.trim());
    setNewKBName('');
    setNewKBDescription('');
    setShowNewKBForm(false);
  };

  /**
   * 处理文件上传
   * 支持多文件批量上传
   */
  const handleFileUpload = async (kbId, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    
    setUploadingTo(kbId);
    
    for (const file of files) {
      try {
        // 初始化进度
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { status: 'waiting', progress: 0 }
        }));

        // 解析文档
        const parsedDoc = await parseDocument(file, (progressEvent) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progressEvent
          }));
        });
        
        // 格式化内容
        const content = formatDocumentForAI(parsedDoc);
        
        // 添加到知识库
        await addDocument(kbId, {
          name: file.name,
          content: content,
          type: parsedDoc.fileType,
          size: file.size,
          metadata: parsedDoc.metadata
        });
        
        // 清除成功文件的进度
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[file.name];
          return next;
        });
        
      } catch (error) {
        logger.error('KnowledgeBaseSettings', 'File upload failed:', error);
        
        // 记录错误状态
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: { status: 'error', progress: 0, error: error.message }
        }));
        
        // 3秒后清除错误显示
        setTimeout(() => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[file.name];
            return next;
          });
        }, 3000);
      }
    }
    
    // 如果没有正在进行的任务，重置状态
    setUploadingTo(null);
    event.target.value = '';
  };

  /**
   * 开始编辑知识库
   */
  const handleStartEdit = (kb, e) => {
    e.stopPropagation();
    setEditingId(kb.id);
    setEditName(kb.name);
    setEditDescription(kb.description || '');
  };

  /**
   * 保存编辑
   */
  const handleSaveEdit = (e) => {
    e.stopPropagation();
    if (!editName.trim()) {
      alert(t('knowledgeBase.kbNamePlaceholder'));
      return;
    }
    updateKnowledgeBase(editingId, {
      name: editName.trim(),
      description: editDescription.trim()
    });
    setEditingId(null);
  };

  /**
   * 取消编辑
   */
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const getAllSupportedExtensions = () => {
    return Object.values(SUPPORTED_TYPES)
      .flatMap(type => type.extensions)
      .join(',');
  };

  /**
   * 获取文件图标
   */
  const getFileIcon = (fileType) => {
    // 简单的映射，或者使用 SUPPORTED_TYPES 中的 icon
    if (!fileType) return <FileText className="w-4 h-4" />;
    
    switch (fileType) {
      case 'PDF': return <span className="text-xs font-bold text-red-500">PDF</span>;
      case 'WORD': return <span className="text-xs font-bold text-blue-500">DOC</span>;
      case 'EXCEL': return <span className="text-xs font-bold text-green-500">XLS</span>;
      case 'POWERPOINT': return <span className="text-xs font-bold text-orange-500">PPT</span>;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">{t('knowledgeBase.management')}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t('knowledgeBase.kbHint')}
          </p>
        </div>
        <button
          onClick={() => setShowNewKBForm(!showNewKBForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('knowledgeBase.newKB')}
        </button>
      </div>

      {/* 新建知识库表单 */}
      {showNewKBForm && (
        <div className="p-4 bg-accent/20 rounded-xl border animate-in fade-in slide-in-from-top-2">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('knowledgeBase.kbName')}</label>
              <input
                type="text"
                value={newKBName}
                onChange={(e) => setNewKBName(e.target.value)}
                placeholder={t('knowledgeBase.kbNamePlaceholder')}
                className="w-full px-3 py-2 bg-background rounded-lg border focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('knowledgeBase.kbDescription')}</label>
              <textarea
                value={newKBDescription}
                onChange={(e) => setNewKBDescription(e.target.value)}
                placeholder={t('knowledgeBase.kbDescriptionPlaceholder')}
                className="w-full px-3 py-2 bg-background rounded-lg border focus:ring-2 focus:ring-primary text-sm resize-none"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowNewKBForm(false);
                  setNewKBName('');
                  setNewKBDescription('');
                }}
                className="px-3 py-1.5 text-sm bg-accent rounded-lg hover:bg-accent/80 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreateKB}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 检索设置 */}
      <div className="p-4 bg-card rounded-xl border">
        <h4 className="text-sm font-bold mb-3">{t('knowledgeBase.retrievalSettings')}</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t('knowledgeBase.topK')}: {retrievalSettings.topK}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={retrievalSettings.topK}
              onChange={(e) => updateRetrievalSettings({ topK: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t('knowledgeBase.threshold')}: {retrievalSettings.similarityThreshold}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={retrievalSettings.similarityThreshold}
              onChange={(e) => updateRetrievalSettings({ similarityThreshold: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {t('knowledgeBase.maxTokens')}: {retrievalSettings.maxTokens}
            </label>
            <input
              type="range"
              min="500"
              max="4000"
              step="500"
              value={retrievalSettings.maxTokens}
              onChange={(e) => updateRetrievalSettings({ maxTokens: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 知识库列表 */}
      <div className="space-y-3">
        {knowledgeBases.length === 0 ? (
          <div className="p-12 text-center bg-accent/10 rounded-xl border border-dashed">
            <div className="inline-flex p-4 bg-accent rounded-2xl mb-3">
              <FileText className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <p className="text-sm text-muted-foreground">{t('knowledgeBase.noKB')}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('knowledgeBase.kbHint')}
            </p>
          </div>
        ) : (
          knowledgeBases.map((kb) => {
            const stats = getKnowledgeBaseStats(kb.id);
            const isExpanded = expandedKB === kb.id;
            
            return (
              <div key={kb.id} className="bg-card rounded-xl border overflow-hidden">
                {/* 知识库头部 */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={() => setExpandedKB(isExpanded ? null : kb.id)}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    {editingId === kb.id ? (
                      <div className="space-y-2" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-background border rounded focus:ring-1 focus:ring-primary"
                          placeholder={t('knowledgeBase.kbNamePlaceholder')}
                          autoFocus
                        />
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-background border rounded focus:ring-1 focus:ring-primary resize-none"
                          placeholder={t('knowledgeBase.kbDescriptionPlaceholder')}
                          rows={2}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                          <h4 className="font-bold text-sm truncate">{kb.name}</h4>
                        </div>
                        {kb.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {kb.description}
                          </p>
                        )}
                      </>
                    )}
                    {stats && (
                      <div className="flex gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span>{t('knowledgeBase.documentsCount', { count: stats.totalDocuments })}</span>
                        <span>{t('knowledgeBase.chunksCount', { count: stats.totalChunks })}</span>
                        <span>{stats.formattedSize}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === kb.id ? (
                      <>
                        <button
                          onClick={handleSaveEdit}
                          className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                          title={t('common.save')}
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 hover:bg-accent rounded-lg transition-colors"
                          title={t('common.cancel')}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleStartEdit(kb, e)}
                          className="p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(t('knowledgeBase.deleteConfirm', { name: kb.name }))) {
                              deleteKnowledgeBase(kb.id);
                            }
                          }}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 展开的文档列表 */}
                {isExpanded && (
                  <div className="border-t bg-accent/5 p-4 animate-in fade-in slide-in-from-top-2">
                    {/* 上传进度显示 */}
                    {Object.keys(uploadProgress).length > 0 && (
                      <div className="mb-4 space-y-2">
                        {Object.entries(uploadProgress).map(([fileName, status]) => (
                          <div key={fileName} className="flex items-center justify-between p-2 bg-background/50 rounded-lg text-xs">
                            <span className="truncate max-w-[150px]">{fileName}</span>
                            <div className="flex items-center gap-2">
                              {status.status === 'error' ? (
                                <span className="text-destructive">{status.error}</span>
                              ) : (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                  <span className="text-muted-foreground">
                                    {status.status === 'loading_parser' && t('knowledgeBase.loadingParser')}
                                    {status.status === 'parsing' && t('fileUpload.parsing') + '...'}
                                    {status.status === 'reading' && t('knowledgeBase.reading')}
                                    {status.status === 'completed' && t('common.success')}
                                    {!['loading_parser', 'parsing', 'reading', 'completed'].includes(status.status) && t('knowledgeBase.processing')}
                                    {status.progress}%
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 上传按钮 */}
                    <div className="mb-3">
                      <label className={`inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg transition-colors text-sm ${uploadingTo === kb.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/20 cursor-pointer'}`}>
                        <Upload className="w-4 h-4" />
                        {uploadingTo === kb.id ? t('knowledgeBase.uploadingStatus') : t('fileUpload.title')}
                        <input
                          type="file"
                          multiple
                          accept={getAllSupportedExtensions()}
                          onChange={(e) => !uploadingTo && handleFileUpload(kb.id, e)}
                          disabled={!!uploadingTo}
                          className="hidden"
                        />
                      </label>
                      <div className="mt-2 text-[10px] text-muted-foreground flex flex-wrap gap-1">
                        {t('knowledgeBase.supportFormats')}
                        {Object.values(SUPPORTED_TYPES).map(type => (
                          <span key={type.icon} className="px-1.5 py-0.5 bg-accent/50 rounded">
                            {type.extensions.join(' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 文档列表 */}
                    {kb.documents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-muted-foreground bg-background/50 rounded-lg">
                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        {t('knowledgeBase.noDocuments')}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {kb.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-accent/20 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-6 h-6 flex items-center justify-center bg-accent/20 rounded">
                                {getFileIcon(doc.type)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  {t('knowledgeBase.chunksCount', { count: doc.chunks.length })} · {(doc.size / 1024).toFixed(1)} KB
                                  {doc.metadata && doc.metadata.pages && ` · ${doc.metadata.pages} 页`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(t('knowledgeBase.deleteDocConfirm', { name: doc.name }))) {
                                  deleteDocument(kb.id, doc.id);
                                }
                              }}
                              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-destructive rounded transition-all"
                              title={t('knowledgeBase.deleteDocument')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-500 mb-1">{t('knowledgeBase.usageTips')}</p>
            <ul className="text-xs text-blue-500/80 space-y-1">
              <li>• {t('knowledgeBase.usageTip1')}</li>
              <li>• {t('knowledgeBase.usageTip2')}</li>
              <li>• {t('knowledgeBase.usageTip3')}</li>
              <li>• {t('knowledgeBase.usageTip4')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseSettings;
