import { KB, MB } from '@/constants'

/**
 * 格式化文件大小，根据大小返回以 MB 或 KB 为单位的字符串。
 * @param {number} size 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(size: number): string {
  if (size >= MB) {
    return (size / MB).toFixed(1) + ' MB'
  }

  if (size >= KB) {
    return (size / KB).toFixed(0) + ' KB'
  }

  return (size / KB).toFixed(2) + ' KB'
}
