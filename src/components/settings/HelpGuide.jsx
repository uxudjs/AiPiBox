import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n';

/**
 * 帮助说明组件
 * 提供应用部署、配置和功能使用的详细说明
 */
const HelpGuide = () => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState(null);
  const sectionRefs = useRef({});

  // 切换章节展开/收起状态
  const toggleSection = (sectionId) => {
    // 如果点击的是已展开的章节，则收起；否则展开新章节并关闭其他章节
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  // 当展开新章节时，滚动到该章节位置
  useEffect(() => {
    if (expandedSection && sectionRefs.current[expandedSection]) {
      // 使用setTimeout确保DOM已更新
      setTimeout(() => {
        sectionRefs.current[expandedSection]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }, 100);
    }
  }, [expandedSection]);

  // 渲染可折叠的帮助部分
  const renderSection = (sectionId, titleKey, items) => {
    const isExpanded = expandedSection === sectionId;
    
    return (
      <div 
        key={sectionId} 
        ref={el => sectionRefs.current[sectionId] = el}
        className="border border-border rounded-lg overflow-hidden"
      >
        <button
          onClick={() => toggleSection(sectionId)}
          className="w-full px-4 py-3 flex items-center justify-between bg-accent hover:bg-accent/80 transition-colors"
        >
          <span className="font-medium text-foreground">{t(titleKey)}</span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
        
        {isExpanded && (
          <div className="p-4 space-y-4 bg-background animate-in fade-in slide-in-from-top-2 duration-200">
            {items.map((item, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">
                  {t(item.titleKey)}
                </h4>
                <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {t(item.contentKey)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* 页面标题和描述 */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t('help.title')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('help.description')}
        </p>
      </div>

      {/* 帮助内容各个部分 */}
      <div className="space-y-4">
        {/* 部署方式 */}
        {renderSection('deployment', 'help.deployment.title', [
          {
            titleKey: 'help.deployment.platforms.title',
            contentKey: 'help.deployment.platforms.content'
          },
          {
            titleKey: 'help.deployment.vercel.title',
            contentKey: 'help.deployment.vercel.content'
          },
          {
            titleKey: 'help.deployment.netlify.title',
            contentKey: 'help.deployment.netlify.content'
          },
          {
            titleKey: 'help.deployment.cloudflare.title',
            contentKey: 'help.deployment.cloudflare.content'
          },
          {
            titleKey: 'help.deployment.github.title',
            contentKey: 'help.deployment.github.content'
          },
          {
            titleKey: 'help.deployment.local.title',
            contentKey: 'help.deployment.local.content'
          }
        ])}

        {/* 代理配置 */}
        {renderSection('proxy', 'help.proxy.title', [
          {
            titleKey: 'help.proxy.overview.title',
            contentKey: 'help.proxy.overview.content'
          },
          {
            titleKey: 'help.proxy.cloudProxy.title',
            contentKey: 'help.proxy.cloudProxy.content'
          },
          {
            titleKey: 'help.proxy.localProxy.title',
            contentKey: 'help.proxy.localProxy.content'
          },
          {
            titleKey: 'help.proxy.autoDetect.title',
            contentKey: 'help.proxy.autoDetect.content'
          }
        ])}

        {/* 云端同步 */}
        {renderSection('sync', 'help.sync.title', [
          {
            titleKey: 'help.sync.overview.title',
            contentKey: 'help.sync.overview.content'
          },
          {
            titleKey: 'help.sync.setup.title',
            contentKey: 'help.sync.setup.content'
          },
          {
            titleKey: 'help.sync.platforms.title',
            contentKey: 'help.sync.platforms.content'
          }
        ])}

        {/* 功能特性 */}
        {renderSection('features', 'help.features.title', [
          {
            titleKey: 'help.features.aiProxy.title',
            contentKey: 'help.features.aiProxy.content'
          },
          {
            titleKey: 'help.features.imageGen.title',
            contentKey: 'help.features.imageGen.content'
          },
          {
            titleKey: 'help.features.knowledge.title',
            contentKey: 'help.features.knowledge.content'
          }
        ])}
      </div>

      {/* 页脚信息 */}
      <div className="pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground text-center">
          {t('help.footer')}
        </p>
      </div>
    </div>
  );
};

export default HelpGuide;
