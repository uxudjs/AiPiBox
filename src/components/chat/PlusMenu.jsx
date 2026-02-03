import React from 'react';
import { Grid3x3, Box, Globe, Settings as SettingsIcon, BookOpen, FileText, MessageSquare, X, Image } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useViewStore } from '../../store/useViewStore';
import { useTranslation } from '../../i18n';

/**
 * PlusMenu - 加号菜单组件
 * 整合多个功能入口的下拉菜单
 */
const PlusMenu = ({ onClose, onSelectOption }) => {
  const { t } = useTranslation();
  const menuOptions = [
    {
      id: 'image-factory',
      icon: Image,
      label: t('imageFactory.title'),
      description: t('imageFactory.promptPlaceholder'),
      highlight: true,
      onClick: () => {
        useViewStore.getState().setView('image-factory');
        onClose();
      }
    },
    {
      id: 'providers',
      icon: Grid3x3,
      label: t('plusMenu.providers'),
      description: t('plusMenu.providersDesc'),
      onClick: () => onSelectOption('providers')
    },
    {
      id: 'preset-models',
      icon: Box,
      label: t('plusMenu.presetModels'),
      description: t('plusMenu.presetModelsDesc'),
      onClick: () => onSelectOption('preset-models')
    },
    {
      id: 'web-search',
      icon: Globe,
      label: t('plusMenu.webSearch'),
      description: t('plusMenu.webSearchDesc'),
      onClick: () => onSelectOption('web-search')
    },
    {
      id: 'knowledge-base',
      icon: BookOpen,
      label: t('plusMenu.knowledgeBase'),
      description: t('plusMenu.knowledgeBaseDesc'),
      onClick: () => onSelectOption('knowledge-base')
    },
    {
      id: 'file-parser',
      icon: FileText,
      label: t('plusMenu.fileParser'),
      description: t('plusMenu.fileParserDesc'),
      highlight: true,
      onClick: () => onSelectOption('file-parser')
    },
    {
      id: 'conversation-settings',
      icon: MessageSquare,
      label: t('plusMenu.conversationSettings'),
      description: t('plusMenu.conversationSettingsDesc'),
      onClick: () => onSelectOption('conversation-settings')
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b bg-accent/20">
          <h3 className="text-lg font-bold">{t('plusMenu.title')}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 菜单选项 */}
        <div className="p-2 max-h-[70vh] overflow-y-auto">
          {menuOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.onClick}
              className={cn(
                "w-full flex items-start gap-4 p-4 rounded-2xl transition-all group",
                option.highlight 
                  ? "bg-primary/10 hover:bg-primary/20 border-2 border-primary/30" 
                  : "hover:bg-accent/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                option.highlight 
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/50 text-muted-foreground group-hover:text-foreground"
              )}>
                <option.icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-sm mb-1">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlusMenu;
