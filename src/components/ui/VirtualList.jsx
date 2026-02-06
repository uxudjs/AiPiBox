/**
 * 高性能虚拟列表组件 (Virtual Windowing)
 * 采用按需渲染策略，仅在内存中挂载可视区域内的 DOM 节点，适用于海量数据的长列表展示。
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { cn } from '../../utils/cn';

/**
 * 虚拟化列表组件
 * @param {object} props - 组件属性
 * @param {Array} props.items - 数据源数组
 * @param {Function} props.renderItem - 单项渲染函数
 * @param {number} props.itemHeight - 每项的固定高度（像素）
 * @param {number} props.containerHeight - 可视区域高度
 * @param {number} [props.overscan=5] - 预渲染的项数（缓冲区）
 * @param {HTMLElement} [props.scrollParent] - 外部滚动容器（可选）
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
  scrollParent = null 
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [parentHeight, setParentHeight] = useState(containerHeight);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const isMounted = useRef(false);

  /**
   * 监听外部滚动父容器的状态同步
   */
  useEffect(() => {
    if (!scrollParent || !containerRef.current) return;

    const updateFromParent = () => {
      if (!containerRef.current || !scrollParent) return;
      
      const listOffsetTop = containerRef.current.offsetTop;
      const parentScrollTop = scrollParent.scrollTop;
      
      requestAnimationFrame(() => {
        setScrollTop(Math.max(0, parentScrollTop - listOffsetTop));
        setParentHeight(scrollParent.clientHeight);
      });
      
      if (!isScrolling) setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 150);
    };

    scrollParent.addEventListener('scroll', updateFromParent);
    
    const resizeObserver = new ResizeObserver(updateFromParent);
    resizeObserver.observe(scrollParent);

    updateFromParent();
    
    return () => {
      scrollParent.removeEventListener('scroll', updateFromParent);
      resizeObserver.disconnect();
    };
  }, [scrollParent, isScrolling]);

  /**
   * 计算当前可视区域应当展示的元素及其偏移位置
   */
  const { visibleItems, offsetY, start } = useMemo(() => {
    const totalItems = items.length;
    if (totalItems === 0) return { visibleItems: [], offsetY: 0, start: 0 };

    const currentContainerHeight = scrollParent ? parentHeight : containerHeight;

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + currentContainerHeight) / itemHeight);

    const start = Math.max(0, startIndex - overscan);
    const end = Math.min(totalItems, endIndex + overscan);

    const offsetY = start * itemHeight;
    const visibleItems = items.slice(start, end);

    return { visibleItems, offsetY, start };
  }, [items, scrollTop, itemHeight, containerHeight, overscan, scrollParent, parentHeight]);

  const totalHeight = items.length * itemHeight;

  /**
   * 内部滚动事件处理，包含平滑更新与性能降频
   */
  const handleScroll = useCallback((e) => {
    const target = e.target;
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
    });
    
    if (!isScrolling) setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [isScrolling]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;
    
    if (!preserveScrollPosition && containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length, preserveScrollPosition]);

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
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            willChange: isScrolling ? 'transform' : 'auto' 
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = start + index;
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