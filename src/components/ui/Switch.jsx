import React from 'react';
import { cn } from '../../utils/cn';

/**
 * 通用开关组件
 * @param {Object} props
 * @param {boolean} props.checked 是否选中
 * @param {function} props.onChange 切换回调 (e) => void
 * @param {boolean} props.disabled 是否禁用
 * @param {string} props.className 包装容器类名
 */
const Switch = ({ checked, onChange, disabled = false, className }) => {
  return (
    <label className={cn(
      "relative inline-flex items-center cursor-pointer select-none",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}>
      <input 
        type="checkbox" 
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer" 
      />
      <div className={cn(
        "w-11 h-6 bg-accent peer-focus:outline-none rounded-full peer",
        "peer-checked:after:translate-x-full peer-checked:after:border-white",
        "after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
        "peer-checked:bg-primary"
      )}></div>
    </label>
  );
};

export default Switch;
