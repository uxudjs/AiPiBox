import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 类名合并工具函数
 * 结合clsx和twMerge，处理条件类名并解决Tailwind类名冲突
 * @param {...any} inputs - 类名输入（字符串、对象、数组等）
 * @returns {string} 合并后的类名字符串
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
