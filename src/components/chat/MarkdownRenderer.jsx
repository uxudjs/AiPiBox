import React, { useEffect, useState, useRef, Component } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { 
  Copy, Play, ExternalLink, Check, Info, Loader2
} from 'lucide-react';
import { db } from '../../db';
import { useTranslation } from '../../i18n';
import { logger } from '../../services/logger';
import ImagePreviewModal from '../ui/ImagePreviewModal';
import MermaidRenderer from './MermaidRenderer';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/atom-one-dark.css';

/**
 * 代码增强展示组件
 * 为 Markdown 中的代码块提供高亮显示、剪贴板复制及 Web 代码（HTML/JS/CSS）的实时预览与发布功能
 */
const CodeBlock = ({ language, value }) => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [publishedId, setPublishedId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const codeRef = useRef(null);
  const isWebCode = ['html', 'css', 'javascript', 'js'].includes(language?.toLowerCase());

  // 异步初始化代码高亮，避免阻塞主线程并支持代码分割
  useEffect(() => {
    if (codeRef.current && !showPreview) {
      const highlight = async () => {
        try {
          const { default: hljs } = await import('highlight.js');
          if (codeRef.current) {
            hljs.highlightElement(codeRef.current);
            setIsHighlighted(true);
          }
        } catch (err) {
          logger.error('MarkdownRenderer', 'Failed to load highlight.js', err);
        }
      };
      highlight();
    }
  }, [value, language, showPreview]);

  // 复制代码到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 发布代码到预览页面
  const publishCode = async () => {
    const id = Math.random().toString(36).slice(2, 10);
    await db.published.put({
      id,
      content: value,
      language: language?.toLowerCase() || 'html',
      timestamp: Date.now()
    });
    setPublishedId(id);
    window.open(`/publish/${id}`, '_blank');
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono font-semibold text-foreground">{language || 'text'}</span>
        <div className="flex items-center gap-2">
          {isWebCode && (
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors text-foreground"
            >
              <Play className="w-3.5 h-3.5" /> {showPreview ? t('markdown.hidePreview') : t('markdown.preview')}
            </button>
          )}
          <button 
            onClick={copyToClipboard} 
            className="text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors text-foreground"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('markdown.copied') : t('markdown.copy')}
          </button>
          {isWebCode && (
             <button 
               onClick={publishCode} 
               className="text-xs flex items-center gap-1.5 px-2 py-1 rounded hover:bg-accent transition-colors text-foreground"
             >
               {publishedId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <ExternalLink className="w-3.5 h-3.5" />}
               {publishedId ? t('markdown.published') : t('markdown.publish')}
             </button>
          )}
        </div>
      </div>
      
      {!showPreview ? (
        <pre className="p-4 overflow-x-auto bg-[#282c34] text-sm leading-6">
          <code ref={codeRef} className={`language-${language}`}>{value}</code>
        </pre>
      ) : (
        <div className="bg-white h-[400px]">
          <iframe
            srcDoc={language === 'html' ? value : `<html><head><style>${language === 'css' ? value : ''}</style></head><body><script>${language === 'js' || language === 'javascript' ? value : ''}</script></body></html>`}
            className="w-full h-full border-none"
            title="preview"
            sandbox="allow-scripts"
          />
        </div>
      )}
    </div>
  );
};

/**
 * UI 错误隔离组件
 * 捕获渲染层异常，通过降级 UI 展示原始文本而非导致白屏
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('MarkdownRenderer', 'Rendering error:', error, errorInfo);
  }

  // 渲染错误提示界面
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-lg">
          <p className="font-bold">内容渲染出错</p>
          <pre className="text-xs mt-2 overflow-auto max-h-40 bg-white p-2 rounded border border-red-100">
            {this.props.content}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Markdown 核心渲染组件
 * 整合 ReactMarkdown 及其生态插件，支持 GFM、LaTeX、Mermaid、自定义 HTML 解析等特性
 */
const MarkdownRendererContent = ({ content = '', isGenerating = false }) => {
  const { t } = useTranslation();
  const [previewImage, setPreviewImage] = useState(null);

  // 防御性检查：确保 content 有效
  if (content === null || content === undefined) {
    return null;
  }

  // 如果内容是数组（包含图片和文本），直接渲染对应组件
  if (Array.isArray(content)) {
    return (
      <div className="space-y-4">
        {content.map((part, index) => {
          if (part.type === 'image_url') {
            const isPlaceholder = !part.image_url?.url || part._sync_placeholder;
            
            if (isPlaceholder) {
              return (
                <div key={index} className="w-32 h-32 flex flex-col items-center justify-center gap-2 bg-muted rounded-lg border border-border/50 text-muted-foreground">
                  <ImageIcon className="w-6 h-6 opacity-20" />
                  <span className="text-[10px] px-2 text-center opacity-60">
                    {t('markdown.imageSyncDisabled')}
                  </span>
                </div>
              );
            }

            return (
              <React.Fragment key={index}>
                <img 
                  src={part.image_url.url} 
                  alt="user upload" 
                  className="w-32 h-32 object-cover rounded-lg border border-border shadow-sm cursor-pointer hover:opacity-90 transition-opacity" 
                  onClick={() => setPreviewImage(part.image_url.url)}
                />
                {previewImage === part.image_url.url && (
                  <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
                )}
              </React.Fragment>
            );
          }
          if (part.type === 'ocr_notice') {
            return (
              <div key={index} className="flex items-center gap-2 p-3 my-2 rounded-lg bg-blue-500/10 text-blue-500 text-sm border border-blue-500/20">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>
                   {t('ocr.notSupported', { model: part.chatModel })}
                </span>
              </div>
            );
          }
          if (part.type === 'text') {
            return <MarkdownRendererContent key={index} content={part.text} />;
          }
          if (typeof part === 'string') {
             return <MarkdownRendererContent key={index} content={part} />;
          }
          return null;
        })}
      </div>
    );
  }

  const safeContent = String(content || '');
  // 移除思考过程标签（<thinking>已由MessageList单独处理）
  const mainContent = safeContent.replace(/<thinking>[\s\S]*?<\/thinking>/, '').trim();

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none 
      prose-headings:font-bold prose-headings:text-foreground
      prose-p:text-foreground prose-p:leading-7
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-strong:text-foreground prose-strong:font-bold
      prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
      prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
      prose-ul:text-foreground prose-ol:text-foreground
      prose-li:text-foreground prose-li:marker:text-muted-foreground
      prose-table:text-foreground prose-th:text-foreground prose-td:text-foreground
      prose-hr:border-border
      prose-img:rounded-lg prose-img:shadow-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex, 
          rehypeRaw,
          [rehypeSanitize, {
            ...defaultSchema,
            attributes: {
              ...defaultSchema.attributes,
              code: [...(defaultSchema.attributes?.code || []), 'className'],
              span: [...(defaultSchema.attributes?.span || []), 'className', 'style'],
              div: [...(defaultSchema.attributes?.div || []), 'className', 'style'],
              iframe: ['srcDoc', 'className', 'style', 'title', 'sandbox', 'width', 'height']
            },
            tagNames: [...(defaultSchema.tagNames || []), 'iframe']
          }]
        ]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');
            
            if (language === 'mermaid') {
              return <MermaidRenderer content={value} isGenerating={isGenerating} />;
            }
            
            return !inline ? (
              <CodeBlock language={language} value={value} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0">{children}</p>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mt-4 mb-2 first:mt-0">{children}</h3>;
          },
          ul({ children }) {
            return <ul className="list-disc list-outside ml-6 my-4 space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-outside ml-6 my-4 space-y-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">{children}</blockquote>;
          },
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="min-w-full border-collapse border border-border">{children}</table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-muted">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-border">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="border-b border-border">{children}</tr>;
          },
          th({ children }) {
            return <th className="px-4 py-2 text-left font-semibold border border-border">{children}</th>;
          },
          td({ children }) {
            return <td className="px-4 py-2 border border-border">{children}</td>;
          },
          hr() {
            return <hr className="my-6 border-border" />;
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            return (
              <img 
                src={src} 
                alt={alt} 
                loading="lazy"
                className="rounded-lg shadow-md max-w-full h-auto max-h-[500px] my-2 cursor-pointer hover:opacity-90 transition-opacity" 
                onClick={() => setPreviewImage(src)}
              />
            );
          }
        }}
      >
        {mainContent}
      </ReactMarkdown>
      {previewImage && (
        <ImagePreviewModal src={previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
};

/**
 * Markdown 渲染入口（带性能优化）
 */
const MarkdownRenderer = React.memo((props) => {
  return (
    <ErrorBoundary content={props.content}>
      <MarkdownRendererContent {...props} />
    </ErrorBoundary>
  );
});

export default MarkdownRenderer;
