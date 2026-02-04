import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '../../utils/cn';

/**
 * 高性能虚拟列表组件 (Virtual Windowing)
 * 采用按需渲染策略，仅在内存中挂载可视区域内的 DOM 节点，适用于超长模型列表或日志展示
 */
const VirtualList = ({ 
  items = [], 
  renderItem, 
  itemHeight = 60, 
  containerHeight = 400,
  overscan = 5,
  className = '',
  emptyMessage = null,
  preserveScrollPosition = false,
  scrollParent = null // 外部滚动容器引用
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [parentHeight, setParentHeight] = useState(containerHeight);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const isMounted = useRef(false);

  // 监听外部滚动容器
  useEffect(() => {
    if (!scrollParent || !containerRef.current) return;

    const updateFromParent = () => {
      if (!containerRef.current || !scrollParent) return;
      
      // 获取列表相对于滚动容器顶部的距离
      const listOffsetTop = containerRef.current.offsetTop;
      const parentScrollTop = scrollParent.scrollTop;
      
      // 计算相对于列表顶部的滚动位置
      requestAnimationFrame(() => {
        setScrollTop(Math.max(0, parentScrollTop - listOffsetTop));
        setParentHeight(scrollParent.clientHeight);
      });
      
      if (!isScrolling) setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
    };

    scrollParent.addEventListener('scroll', updateFromParent);
    
    // 同时也监听父容器的大小变化
    const resizeObserver = new ResizeObserver(updateFromParent);
    resizeObserver.observe(scrollParent);

    updateFromParent(); // 初始对齐
    
    return () => {
      scrollParent.removeEventListener('scroll', updateFromParent);
      resizeObserver.disconnect();
    };
  }, [scrollParent, isScrolling]);

  // 计算可视区域内应该渲染的项
  const { visibleItems, offsetY, start } = useMemo(() => {
    const totalItems = items.length;
    if (totalItems === 0) return { visibleItems: [], offsetY: 0, start: 0 };

    // 使用外部父容器高度或指定的固定高度
    const currentContainerHeight = scrollParent ? parentHeight : containerHeight;

    // 计算可视区域的起始和结束索引
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + currentContainerHeight) / itemHeight);

    // 添加 overscan（上下多渲染几项，避免滚动时出现空白）
    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(totalItems, endIndex + overscan);

    // 计算偏移量（让虚拟项出现在正确的位置）
    const offsetY = start * itemHeight;
    const visibleItems = items.slice(start, end);

    return { visibleItems, offsetY, start };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  const totalHeight = items.length * itemHeight;

  /**
   * 滚动调度优化
   * 使用 requestAnimationFrame 降频同步滚动偏移量，避免阻塞 UI 线程
   */
  const handleScroll = useCallback((e) => {
    const target = e.target;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
    
    // 标记正在滚动状态
    if (!isScrolling) setIsScrolling(true);
    
    // 延迟重置滚动状态（用于优化渲染）
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isScrolling]);

  // 清理定时器
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 重置滚动位置（当 items 变化时，除非 preserveScrollPosition 为 true）
  useEffect(() => {
    if (!isMounted.current) return;
    
    if (!preserveScrollPosition && containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length, preserveScrollPosition]);

  // 空列表处理
  if (items.length === 0) {
    return (
      <div 
        ref={containerRef}
        className={cn(
          !scrollParent && "overflow-y-auto",
          className
        )}
        style={!scrollParent ? { height: containerHeight } : {}}
      >
        {emptyMessage || (
          <div className="flex items-center justify-center h-full min-h-[100px] text-sm text-muted-foreground">
            暂无数据
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        !scrollParent && "overflow-y-auto",
        className
      )}
      style={!scrollParent ? { height: containerHeight } : {}}
      onScroll={!scrollParent ? handleScroll : undefined}
    >
      {/* 外部容器：撑开总高度 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 内部容器：包含可见项，通过 transform 定位 */}
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            // 在滚动时使用 will-change 优化 GPU 合成，停止滚动后移除以节省内存
            willChange: isScrolling ? 'transform' : 'auto' 
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = start + index;
            // 使用 memoized wrapper 或确保 renderItem 是廉价的
            return (
              <div 
                key={item.key || item.id || actualIndex}
                style={{ height: itemHeight }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VirtualList);
