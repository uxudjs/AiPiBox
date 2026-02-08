/**
 * Mermaid 流程图渲染组件
 * 支持流程图的实时渲染、缩放、拖拽平移、全屏查看、源码查看及导出为 PNG/SVG 功能。
 */

import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  ZoomIn, ZoomOut, Maximize, Minimize, 
  Copy, Download, Check, Code, Image as ImageIcon, Loader2
} from 'lucide-react';
import { useTranslation } from '../../i18n';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  suppressErrorRendering: true,
});

/**
 * Mermaid 渲染器组件
 * @param {object} props - 组件属性
 * @param {string} props.content - Mermaid 语法的图表描述文本
 * @param {boolean} [props.isGenerating=false] - 是否处于流式生成中
 */
const MermaidRenderer = ({ content, className = '', isGenerating = false }) => {
  const { t } = useTranslation();
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [scale, setScale] = useState(2);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  /**
   * 自动修复 Mermaid 语法中常见的 AI 生成错误
   * @param {string} text - 原始文本
   * @returns {string} 修复后的文本
   */
  const cleanMermaidContent = (text) => {
    let cleaned = text;

    cleaned = cleaned.replace(/subgraph\s+([^\n"\[]+)(?=\n|$)/g, (match, title) => {
        const trimmedTitle = title.trim();
        if (trimmedTitle && !trimmedTitle.startsWith('"') && /[^a-zA-Z0-9_\u4e00-\u9fa5]/.test(trimmedTitle)) {
            return `subgraph "${trimmedTitle}"`;
        }
        return match;
    });

    cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
    
    return cleaned;
  };

  useEffect(() => {
    if (!content || isGenerating) return;

    const renderChart = async () => {
      try {
        const cleaned = cleanMermaidContent(content);
        
        const isDark = document.documentElement.classList.contains('dark');
        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? 'dark' : 'default',
          securityLevel: 'loose',
          suppressErrorRendering: true,
        });

        const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        
        const { svg } = await mermaid.render(id, cleaned);
        setSvg(svg);
        setError('');
        
        setScale(2);
        setPan({ x: 0, y: 0 });
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Rendering failed');
      }
    };

    renderChart();
  }, [content, isGenerating]);

  // 使用原生非 passive 监听器来阻止页面滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // 阻止默认行为以防止页面滚动
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(s => Math.min(Math.max(s + delta, 0.5), 5));
    };

    // 显式指定 { passive: false }
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

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

  /**
   * 计算两点间的距离（用于捏合缩放）
   */
  const getTouchDistance = (touch1, touch2) => {
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2) {
      // 开始捏合缩放，停止平移
      setIsDragging(false);
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(dist);
    }
  };

  const handleTouchMove = (e) => {
    // 阻止默认行为以防止页面滚动
    if (e.cancelable) e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // 单指平移
      const touch = e.touches[0];
      const dx = touch.clientX - lastMousePos.x;
      const dy = touch.clientY - lastMousePos.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastMousePos({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 2 && lastTouchDistance !== null) {
      // 双指缩放
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const delta = dist - lastTouchDistance;
      // 根据距离变化调整缩放比例
      const zoomFactor = delta * 0.01;
      setScale(s => Math.min(Math.max(s + zoomFactor, 0.5), 5));
      setLastTouchDistance(dist);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * 将图表导出为指定格式文件
   * @param {string} format - 格式标识 (svg | png)
   */
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
      const img = new Image();
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2;
        
        const svgElement = chartRef.current.querySelector('svg');
        let width = 0;
        let height = 0;

        if (svgElement) {
            try {
                const bbox = svgElement.getBBox();
                width = bbox.width;
                height = bbox.height;
            } catch (e) {
                console.warn('Mermaid getBBox failed:', e);
            }
            
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
        
        if (!width || !height) {
            width = img.width || 800;
            height = img.height || 600;
        }
        
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);
        ctx.fillStyle = '#ffffff';
        if (document.documentElement.classList.contains('dark')) {
           ctx.fillStyle = '#1e1e1e';
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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
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

      <div 
        ref={containerRef}
        className={`overflow-hidden relative touch-none ${isFullscreen ? 'flex-1' : 'h-[400px]'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
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
             <div ref={chartRef} style={{ visibility: 'hidden', position: 'absolute', top: '-9999px', left: '-9999px' }} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
      </div>
      
      <div className="px-3 py-1 bg-muted/30 text-[10px] text-muted-foreground border-t border-border flex justify-between">
         <span>{t('mermaid.dragHint') || 'Drag to pan, Scroll to zoom'}</span>
      </div>
    </div>
  );
};

export default MermaidRenderer;