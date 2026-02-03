import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, ZoomOut, Maximize, Minimize, 
  Copy, Download, Check, Code, Image as ImageIcon, Loader2
} from 'lucide-react';
import { useTranslation } from '../../i18n';

// 初始化 Mermaid (如果尚未初始化)
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  // 抑制 Mermaid 默认的错误渲染行为，改由应用逻辑处理
  suppressErrorRendering: true,
});

const MermaidRenderer = ({ content, className = '', isGenerating = false }) => {
  const { t } = useTranslation();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(2); // 默认 200%
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  /**
   * 清理并优化 Mermaid 图表内容
   * 自动修复常见的语法错误，增强兼容性
   */
  const cleanMermaidContent = (text) => {
    let cleaned = text;

    // 1. 自动修复 subgraph 标题语法
    // 许多 AI 生成的代码中 subgraph 标题包含空格或 Emoji 却未加引号，这会导致解析失败
    // 将 subgraph Title 转换为 subgraph "Title"
    cleaned = cleaned.replace(/subgraph\s+([^\n"\[]+)(?=\n|$)/g, (match, title) => {
        const trimmedTitle = title.trim();
        // 如果标题已经包含特殊字符（非字母数字下划线中文）且没加引号，则包裹引号
        if (trimmedTitle && !trimmedTitle.startsWith('"') && /[^a-zA-Z0-9_\u4e00-\u9fa5]/.test(trimmedTitle)) {
            return `subgraph "${trimmedTitle}"`;
        }
        return match;
    });

    // 2. 优化样式语法兼容性
    // 修正：不再将 color 强制替换为 stroke，因为 color 控制文字颜色，stroke 控制边框颜色。
    // 如果需要同时设置边框，建议在 Mermaid 代码中显式指定。

    // 3. 移除可能导致严重解析错误的极其罕见的特殊字符，但保留绝大多数 Emoji
    // 之前是暴力删除所有 Emoji，现在改为保留，因为引号化已经解决了大部分问题
    
    // 4. 清理多余的空行
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  };

  useEffect(() => {
    if (!content || isGenerating) return;

    const renderChart = async () => {
      try {
        const cleaned = cleanMermaidContent(content);
        
        // 检测主题
        const isDark = document.documentElement.classList.contains('dark');
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          suppressErrorRendering: true, // 再次确保抑制原生报错
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        
        // 使用 try-catch 包装渲染过程
        const { svg } = await mermaid.render(id, cleaned);
        setSvg(svg);
        setError('');
        
        // 渲染完成后重置为 200%
        setScale(2);
        setPan({ x: 0, y: 0 });
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Rendering failed');
      }
    };

    renderChart();
  }, [content, isGenerating]);

  // 缩放处理
  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  // 拖拽处理
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 复制SVG代码
  const handleCopyCode = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 下载图片
  const handleDownload = async (format = 'svg') => {
    if (!svg) return;

    if (format === 'svg') {
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chart-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Convert SVG to PNG
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // High resolution
        
        // Find the SVG element within chartRef
        const svgElement = chartRef.current.querySelector('svg');
        let width = 0;
        let height = 0;

        if (svgElement) {
            // Try getBBox if available
            try {
                const bbox = svgElement.getBBox();
                width = bbox.width;
                height = bbox.height;
            } catch (e) {
                console.warn('Mermaid getBBox failed:', e);
            }
            
            // Fallback to viewBox
            if (!width || !height) {
                const viewBox = svgElement.getAttribute('viewBox');
                if (viewBox) {
                    const parts = viewBox.split(/\s+|,/);
                    if (parts.length === 4) {
                        width = parseFloat(parts[2]);
                        height = parseFloat(parts[3]);
                    }
                }
            }
        }
        
        // Fallback to image natural dimensions or defaults
        if (!width || !height) {
            width = img.width || 800;
            height = img.height || 600;
        }
        
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        // Fill white background for PNG
        ctx.fillStyle = '#ffffff';
        if (document.documentElement.classList.contains('dark')) {
           ctx.fillStyle = '#1e1e1e'; // Dark background for dark mode
        }
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `chart-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  // 切换全屏
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // 全屏切换时也重置为 200%
    setScale(2);
    setPan({ x: 0, y: 0 });
  };

  if (isGenerating) {
    return (
      <div className={`my-4 border border-border rounded-lg bg-card/50 overflow-hidden ${className}`}>
        <div className="flex items-center gap-2 p-3 bg-muted/30 border-b border-border text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>{t('markdown.generatingChart') || 'Generating chart...'}</span>
        </div>
        <pre className="p-4 text-xs font-mono overflow-x-auto text-black dark:text-gray-300">
          {content}
        </pre>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <div className="text-sm font-semibold text-destructive mb-2">Mermaid Error</div>
        <pre className="text-xs text-destructive/80 overflow-auto">{error}</pre>
        <button 
          onClick={() => setShowCode(!showCode)}
          className="mt-2 text-xs flex items-center gap-1 text-destructive/80 hover:text-destructive"
        >
          <Code className="w-3 h-3" />
          {showCode ? t('mermaid.hideCode') || 'Hide Code' : t('mermaid.showCode') || 'Show Code'}
        </button>
        {showCode && (
          <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto font-mono text-black dark:text-gray-300">
            {content}
          </pre>
        )}
      </div>
    );
  }

  if (!svg) return null;

  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-background flex flex-col"
    : `relative border border-border rounded-lg bg-card overflow-hidden ${className}`;

  const chartStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.1s ease-out',
    transformOrigin: 'center center'
  };

  return (
    <div className={containerClass}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-1">
          <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-accent text-foreground" title={t('mermaid.zoomOut')}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono w-12 text-center text-muted-foreground">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-accent text-foreground" title={t('mermaid.zoomIn')}>
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowCode(!showCode)} className={`p-1.5 rounded hover:bg-accent text-foreground ${showCode ? 'bg-accent' : ''}`} title={t('mermaid.viewCode') || 'View Code'}>
            <Code className="w-4 h-4" />
          </button>
          <button onClick={handleCopyCode} className="p-1.5 rounded hover:bg-accent text-foreground" title={t('mermaid.copyCode')}>
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button onClick={() => handleDownload('svg')} className="p-1.5 rounded hover:bg-accent text-foreground" title={t('mermaid.downloadSVG')}>
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => handleDownload('png')} className="p-1.5 rounded hover:bg-accent text-foreground" title={t('mermaid.downloadPNG') || 'Download PNG'}>
            <ImageIcon className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border mx-1" />
          <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-accent text-foreground" title={isFullscreen ? t('mermaid.exitFullscreen') || 'Exit Fullscreen' : t('mermaid.fullscreen')}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className={`overflow-hidden relative ${isFullscreen ? 'flex-1' : 'h-[400px]'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          if (isFullscreen || e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(s => Math.min(Math.max(s + delta, 0.5), 5));
          }
        }}
      >
        {showCode ? (
          <div className="absolute inset-0 overflow-auto p-4 bg-muted/30 font-mono text-sm text-black dark:text-gray-300">
            <pre>{content}</pre>
          </div>
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center p-4"
          >
             <div 
                dangerouslySetInnerHTML={{ __html: svg }} 
                style={chartStyle}
                className="select-none"
             />
             {/* Invisible element to measure SVG dimensions if needed */}
             <div ref={chartRef} style={{ visibility: 'hidden', position: 'absolute', top: '-9999px', left: '-9999px' }} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
      </div>
      
      {/* Help Tip */}
      <div className="px-3 py-1 bg-muted/30 text-[10px] text-muted-foreground border-t border-border flex justify-between">
         <span>{t('mermaid.dragHint') || 'Drag to pan, Scroll to zoom'}</span>
      </div>
    </div>
  );
};

export default MermaidRenderer;
