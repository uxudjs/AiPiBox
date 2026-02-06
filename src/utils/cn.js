/**
 * 类名合并工具
 * 结合 clsx 和 tailwind-merge，处理条件类名并解决 Tailwind 类名冲突。
 */

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并类名
 * @param {...any} inputs - 类名输入
 * @returns {string} 合并后的类名字符串
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}