import React from 'react';
import { cn } from '../../utils/cn';
import { useTranslation } from '../../i18n';

/**
 * CustomSelect - 统一的下拉菜单组件
 * 提供一致的外观、动画和交互行为
 * 
 * @param {Object} props
 * @param {string} props.value - 当前选中的值
 * @param {Function} props.onChange - 值变化时的回调函数  
 * @param {Array} props.options - 选项数组 [{value: string, label: string}]
 * @param {string} props.placeholder - 占位符文本
 * @param {string} props.className - 额外的样式类
 * @param {boolean} props.disabled - 是否禁用
 */
const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  className = '',
  disabled = false 
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.pleaseSelect');
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        // 基础样式
        'w-full px-4 py-2.5 rounded-xl text-sm',
        // 背景和边框
        'bg-accent/50 border border-border/50',
        // 聚焦状态
        'focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none',
        // 悬停状态
        'hover:bg-accent/70 transition-all duration-200',
        // 文本样式
        'text-foreground font-medium',
        // 禁用状态
        'disabled:opacity-50 disabled:cursor-not-allowed',
        // 光标样式
        'cursor-pointer',
        // 额外的样式
        className
      )}
    >
      {defaultPlaceholder && (
        <option value="" disabled>
          {defaultPlaceholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default CustomSelect;
