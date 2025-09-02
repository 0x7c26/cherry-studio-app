import { Client } from '@notionhq/client'
import { markdownToBlocks } from '@tryfabric/martian'
import DOMPurify from 'dompurify'
import i18n, { t } from 'i18next'
import { appendBlocks } from 'notion-helper'
import { Alert } from 'react-native'

import { getProviderLabel } from '@/i18n/label'
import { loggerService } from '@/services/LoggerService'
import store from '@/store'
import { setExportState } from '@/store/runtime'
import { Topic } from '@/types/assistant'
import { Message } from '@/types/message'
import { convertMathFormula, markdownToPlainText } from '@/utils/markdown'
import { getCitationContent, getMainTextContent, getThinkingContent } from '@/utils/messageUtils/find'

import { getDataBackupProvider } from '../../db/queries/backup.queries'
import { getMessagesByTopicId } from '../../db/queries/messages.queries'

const logger = loggerService.withContext('Utils:export')

// 全局的导出状态获取函数
const getExportState = () => store.getState().runtime.export.isExporting

const setExportingState = (isExporting: boolean) => {
  store.dispatch(setExportState({ isExporting }))
}

// FIXME 需要编写设置页
const {
  excludeCitationsInExport,
  forceDollarMathInMarkdown,
  markdownExportPath,
  showModelNameInMarkdown,
  showModelProviderInMarkdown,
  standardizeCitationsInExport
} = useMarkdownSettings

/**
 * 安全地处理思维链内容，保留安全的 HTML 标签如 <br>，移除危险内容
 *
 * 支持的标签：
 * - 结构：br, p, div, span, h1-h6, blockquote
 * - 格式：strong, b, em, i, u, s, del, mark, small, sup, sub
 * - 列表：ul, ol, li
 * - 代码：code, pre, kbd, var, samp
 * - 表格：table, thead, tbody, tfoot, tr, td, th
 *
 * @param content 原始思维链内容
 * @returns 安全处理后的内容
 */
const sanitizeReasoningContent = (content: string): string => {
  // 先处理换行符转换为 <br>
  const contentWithBr = content.replace(/\n/g, '<br>')

  // 使用 DOMPurify 清理内容，保留常用的安全标签和属性
  return DOMPurify.sanitize(contentWithBr, {
    ALLOWED_TAGS: [
      // 换行和基础结构
      'br',
      'p',
      'div',
      'span',
      // 文本格式化
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'del',
      'mark',
      'small',
      // 上标下标（数学公式、引用等）
      'sup',
      'sub',
      // 标题
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      // 引用
      'blockquote',
      // 列表
      'ul',
      'ol',
      'li',
      // 代码相关
      'code',
      'pre',
      'kbd',
      'var',
      'samp',
      // 表格（AI输出中可能包含表格）
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'td',
      'th',
      // 分隔线
      'hr'
    ],
    ALLOWED_ATTR: [
      // 安全的通用属性
      'class',
      'title',
      'lang',
      'dir',
      // code 标签的语言属性
      'data-language',
      // 表格属性
      'colspan',
      'rowspan',
      // 列表属性
      'start',
      'type'
    ],
    KEEP_CONTENT: true, // 保留被移除标签的文本内容
    RETURN_DOM: false,
    SANITIZE_DOM: true,
    // 允许的协议（预留，虽然目前没有允许链接标签）
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i
  })
}

const getRoleText = (role: string, modelName?: string, providerId?: string) => {
  if (role === 'user') {
    return '🧑‍💻 User'
  } else if (role === 'system') {
    return '🤖 System'
  } else {
    let assistantText = '🤖 '

    if (showModelNameInMarkdown && modelName) {
      assistantText += `${modelName}`

      if (showModelProviderInMarkdown && providerId) {
        const providerDisplayName = getProviderLabel(providerId) ?? providerId
        assistantText += ` | ${providerDisplayName}`
        return assistantText
      }

      return assistantText
    } else if (showModelProviderInMarkdown && providerId) {
      const providerDisplayName = getProviderLabel(providerId) ?? providerId
      assistantText += `Assistant | ${providerDisplayName}`
      return assistantText
    }

    return assistantText + 'Assistant'
  }
}

/**
 * 处理文本中的引用标记
 * @param content 原始文本内容
 * @param mode 处理模式：'remove' 移除引用，'normalize' 标准化为Markdown格式
 * @returns 处理后的文本
 */
export const processCitations = (content: string, mode: 'remove' | 'normalize' = 'remove'): string => {
  // 使用正则表达式匹配Markdown代码块
  const codeBlockRegex = /(```[a-zA-Z]*\n[\s\S]*?\n```)/g
  const parts = content.split(codeBlockRegex)

  const processedParts = parts.map((part, index) => {
    // 如果是代码块(奇数索引),则原样返回
    if (index % 2 === 1) {
      return part
    }

    let result = part

    if (mode === 'remove') {
      // 移除各种形式的引用标记
      result = result
        .replace(/\[<sup[^>]*data-citation[^>]*>\d+<\/sup>\]\([^)]*\)/g, '')
        .replace(/\[<sup[^>]*>\d+<\/sup>\]\([^)]*\)/g, '')
        .replace(/<sup[^>]*data-citation[^>]*>\d+<\/sup>/g, '')
        .replace(/\[(\d+)\](?!\()/g, '')
    } else if (mode === 'normalize') {
      // 标准化引用格式为Markdown脚注格式
      result = result
        // 将 [<sup data-citation='...'>数字</sup>](链接) 转换为 [^数字]
        .replace(/\[<sup[^>]*data-citation[^>]*>(\d+)<\/sup>\]\([^)]*\)/g, '[^$1]')
        // 将 [<sup>数字</sup>](链接) 转换为 [^数字]
        .replace(/\[<sup[^>]*>(\d+)<\/sup>\]\([^)]*\)/g, '[^$1]')
        // 将独立的 <sup data-citation='...'>数字</sup> 转换为 [^数字]
        .replace(/<sup[^>]*data-citation[^>]*>(\d+)<\/sup>/g, '[^$1]')
        // 将 [数字] 转换为 [^数字]（但要小心不要转换其他方括号内容）
        .replace(/\[(\d+)\](?!\()/g, '[^$1]')
    }

    // 按行处理，保留Markdown结构
    const lines = result.split('\n')
    const processedLines = lines.map(line => {
      // 如果是引用块或其他特殊格式，不要修改空格
      if (line.match(/^>|^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|^\s{4,}/)) {
        return line.replace(/[ ]+/g, ' ').replace(/[ ]+$/g, '')
      }

      // 普通文本行，清理多余空格但保留基本格式
      return line.replace(/[ ]+/g, ' ').trim()
    })

    return processedLines.join('\n')
  })

  return processedParts.join('').trim()
}

/**
 * 标准化引用内容为Markdown脚注格式
 * @param citations 引用列表
 * @returns Markdown脚注格式的引用内容
 */
const formatCitationsAsFootnotes = (citations: string): string => {
  if (!citations.trim()) return ''

  // 将引用列表转换为脚注格式
  const lines = citations.split('\n\n')
  const footnotes = lines.map(line => {
    const match = line.match(/^\[(\d+)\]\s*(.+)/)

    if (match) {
      const [, num, content] = match
      return `[^${num}]: ${content}`
    }

    return line
  })

  return footnotes.join('\n\n')
}

const createBaseMarkdown = async (
  message: Message,
  includeReasoning: boolean = false,
  excludeCitations: boolean = false,
  normalizeCitations: boolean = true
): Promise<{ titleSection: string; reasoningSection: string; contentSection: string; citation: string }> => {
  const roleText = getRoleText(message.role, message.model?.name, message.model?.provider)
  const titleSection = `## ${roleText}`
  let reasoningSection = ''

  if (includeReasoning) {
    let reasoningContent = await getThinkingContent(message)

    if (reasoningContent) {
      if (reasoningContent.startsWith('<think>\n')) {
        reasoningContent = reasoningContent.substring(8)
      } else if (reasoningContent.startsWith('<think>')) {
        reasoningContent = reasoningContent.substring(7)
      }

      // 使用 DOMPurify 安全地处理思维链内容
      reasoningContent = sanitizeReasoningContent(reasoningContent)

      if (forceDollarMathInMarkdown) {
        reasoningContent = convertMathFormula(reasoningContent)
      }

      reasoningSection = `<div style="border: 2px solid #dddddd; border-radius: 10px;">
  <details style="padding: 5px;">
    <summary>${i18n.t('common.reasoning_content')}</summary>
    ${reasoningContent}
  </details>
</div>
`
    }
  }

  const content = await getMainTextContent(message)
  let citation = excludeCitations ? '' : await getCitationContent(message)

  let processedContent = forceDollarMathInMarkdown ? convertMathFormula(content) : content

  // 处理引用标记
  if (excludeCitations) {
    processedContent = processCitations(processedContent, 'remove')
  } else if (normalizeCitations) {
    processedContent = processCitations(processedContent, 'normalize')
    citation = formatCitationsAsFootnotes(citation)
  }

  return { titleSection, reasoningSection, contentSection: processedContent, citation }
}

export const messageToMarkdown = async (message: Message, excludeCitations?: boolean): Promise<string> => {
  const shouldExcludeCitations = excludeCitations ?? excludeCitationsInExport
  const { titleSection, contentSection, citation } = await createBaseMarkdown(
    message,
    false,
    shouldExcludeCitations,
    standardizeCitationsInExport
  )
  return [titleSection, '', contentSection, citation].join('\n')
}

export const messageToMarkdownWithReasoning = async (message: Message, excludeCitations?: boolean): Promise<string> => {
  const shouldExcludeCitations = excludeCitations ?? excludeCitationsInExport
  const { titleSection, reasoningSection, contentSection, citation } = await createBaseMarkdown(
    message,
    true,
    shouldExcludeCitations,
    standardizeCitationsInExport
  )
  return [titleSection, '', reasoningSection, contentSection, citation].join('\n')
}

export const messagesToMarkdown = async (
  messages: Message[],
  exportReasoning?: boolean,
  excludeCitations?: boolean
): Promise<string> => {
  const markdownPromises = messages.map(message =>
    exportReasoning
      ? messageToMarkdownWithReasoning(message, excludeCitations)
      : messageToMarkdown(message, excludeCitations)
  )
  const markdownStrings = await Promise.all(markdownPromises)
  return markdownStrings.join('\n---\n')
}

const formatMessageAsPlainText = async (message: Message): Promise<string> => {
  const roleText = message.role === 'user' ? 'User:' : 'Assistant:'
  const content = await getMainTextContent(message)
  const plainTextContent = markdownToPlainText(content).trim()
  return `${roleText}\n${plainTextContent}`
}

export const messageToPlainText = async (message: Message): Promise<string> => {
  const content = await getMainTextContent(message)
  return markdownToPlainText(content).trim()
}

const messagesToPlainText = async (messages: Message[]): Promise<string> => {
  const plainTextPromises = messages.map(formatMessageAsPlainText)
  const plainTextStrings = await Promise.all(plainTextPromises)
  return plainTextStrings.join('\n\n')
}

export const topicToMarkdown = async (
  topic: Topic,
  exportReasoning?: boolean,
  excludeCitations?: boolean
): Promise<string> => {
  const topicName = `# ${topic.name}`

  const messages = await getMessagesByTopicId(topic.id)

  if (messages && messages.length > 0) {
    return topicName + '\n\n' + messagesToMarkdown(messages, exportReasoning, excludeCitations)
  }

  return topicName
}

export const topicToPlainText = async (topic: Topic): Promise<string> => {
  const topicName = markdownToPlainText(topic.name).trim()

  const topicMessages = await getMessagesByTopicId(topic.id)

  if (topicMessages && topicMessages.length > 0) {
    return topicName + '\n\n' + messagesToPlainText(topicMessages)
  }

  return topicName
}

// export const exportTopicAsMarkdown = async (
//   topic: Topic,
//   exportReasoning?: boolean,
//   excludeCitations?: boolean
// ): Promise<void> => {
//   if (getExportState()) {
//     Alert.alert(t('message.warn.export.exporting'))
//     return
//   }
//
//   setExportingState(true)
//
//   if (!markdownExportPath) {
//     try {
//       const fileName = removeSpecialCharactersForFileName(topic.name) + '.md'
//       const markdown = await topicToMarkdown(topic, exportReasoning, excludeCitations)
//       // const result = await window.api.file.save(fileName, markdown) FIXME file的读写
//
//       if (result) {
//         Alert.alert(t('message.success.markdown.export.specified'))
//       }
//     } catch (error: any) {
//       Alert.alert(t('message.error.markdown.export.specified'))
//       logger.error('Failed to export topic as markdown:', error)
//     } finally {
//       setExportingState(false)
//     }
//   } else {
//     try {
//       const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss')
//       const fileName = removeSpecialCharactersForFileName(topic.name) + ` ${timestamp}.md`
//       const markdown = await topicToMarkdown(topic, exportReasoning, excludeCitations)
//       await window.api.file.write(markdownExportPath + '/' + fileName, markdown)
//       Alert.alert(t('message.success.markdown.export.preconf'))
//     } catch (error: any) {
//       Alert.alert(t('message.error.markdown.export.preconf'))
//       logger.error('Failed to export topic as markdown:', error)
//     } finally {
//       setExportingState(false)
//     }
//   }
// }
//
// export const exportMessageAsMarkdown = async (
//   message: Message,
//   exportReasoning?: boolean,
//   excludeCitations?: boolean
// ): Promise<void> => {
//   if (getExportState()) {
//     Alert.alert(t('message.warn.export.exporting'))
//     return
//   }
//
//   setExportingState(true)
//
//   if (!markdownExportPath) {
//     try {
//       const title = await getMessageTitle(message)
//       const fileName = removeSpecialCharactersForFileName(title) + '.md'
//       const markdown = exportReasoning
//         ? await messageToMarkdownWithReasoning(message, excludeCitations)
//         : await messageToMarkdown(message, excludeCitations)
//       // const result = await window.api.file.save(fileName, markdown) FIXME file的读写
//
//       if (result) {
//         Alert.alert(t('message.success.markdown.export.specified'))
//       }
//     } catch (error: any) {
//       Alert.alert(t('message.error.markdown.export.specified'))
//       logger.error('Failed to export message as markdown:', error)
//     } finally {
//       setExportingState(false)
//     }
//   } else {
//     try {
//       const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss')
//       const title = await getMessageTitle(message)
//       const fileName = removeSpecialCharactersForFileName(title) + ` ${timestamp}.md`
//       const markdown = exportReasoning
//         ? await messageToMarkdownWithReasoning(message, excludeCitations)
//         : await messageToMarkdown(message, excludeCitations)
//       // await window.api.file.write(markdownExportPath + '/' + fileName, markdown) FIXME file的读写
//       Alert.alert(t('message.success.markdown.export.preconf'))
//     } catch (error: any) {
//       Alert.alert(t('message.error.markdown.export.preconf'))
//       logger.error('Failed to export message as markdown:', error)
//     } finally {
//       setExportingState(false)
//     }
//   }
// }

const convertMarkdownToNotionBlocks = async (markdown: string): Promise<any[]> => {
  return markdownToBlocks(markdown)
}

const convertThinkingToNotionBlocks = async (thinkingContent: string): Promise<any[]> => {
  if (!thinkingContent.trim()) {
    return []
  }

  try {
    // 预处理思维链内容：将HTML的<br>标签转换为真正的换行符
    const processedContent = thinkingContent.replace(/<br\s*\/?>/g, '\n')

    // 使用 markdownToBlocks 处理思维链内容
    const childrenBlocks = markdownToBlocks(processedContent)

    return [
      {
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🤔 ' + i18n.t('common.reasoning_content')
              },
              annotations: {
                bold: true
              }
            }
          ],
          children: childrenBlocks
        }
      }
    ]
  } catch (error) {
    logger.error('failed to process reasoning content:', error as Error)
    // 发生错误时，回退到简单的段落处理
    return [
      {
        object: 'block',
        type: 'toggle',
        toggle: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🤔 ' + i18n.t('common.reasoning_content')
              },
              annotations: {
                bold: true
              }
            }
          ],
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content:
                        thinkingContent.length > 1800
                          ? thinkingContent.substring(0, 1800) + '...\n' + i18n.t('export.notion.reasoning_truncated')
                          : thinkingContent
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}

const executeNotionExport = async (title: string, allBlocks: any[]): Promise<boolean> => {
  if (getExportState()) {
    Alert.alert(t('message.warn.export.exporting'))
    return false
  }

  const provider = await getDataBackupProvider('notion')

  if (!provider || !provider.notionApiKey || !provider.notionDatabaseID) {
    Alert.alert(t('message.error.notion.no_api_key'))
    return false
  }

  if (allBlocks.length === 0) {
    Alert.alert(t('message.error.notion.export'))
    return false
  }

  setExportingState(true)

  // 限制标题长度
  if (title.length > 32) {
    title = title.slice(0, 29) + '...'
  }

  try {
    const notion = new Client({ auth: provider.notionApiKey })

    const response = await notion.pages.create({
      parent: { database_id: provider.notionDatabaseID },
      properties: {
        [provider.notionPageNameKey || 'Name']: {
          title: [{ text: { content: title } }]
        }
      }
    })

    await appendBlocks({
      block_id: response.id,
      children: allBlocks,
      client: notion
    })

    Alert.alert(t('message.success.notion.export'))
    return true
  } catch (error: any) {
    logger.error('Notion export failed:', error)
    Alert.alert(t('message.error.notion.export'))
    return false
  } finally {
    setExportingState(false)
  }
}

export const exportMessageToNotion = async (title: string, content: string, message?: Message): Promise<boolean> => {
  const provider = await getDataBackupProvider('notion')

  if (!provider) {
    Alert.alert(t('message.error.notion.no_api_key'))
    return false
  }

  const notionBlocks = await convertMarkdownToNotionBlocks(content)

  if (provider.notionExportReasoning && message) {
    const thinkingContent = await getThinkingContent(message)

    if (thinkingContent) {
      const thinkingBlocks = await convertThinkingToNotionBlocks(thinkingContent)

      if (notionBlocks.length > 0) {
        notionBlocks.splice(1, 0, ...thinkingBlocks)
      } else {
        notionBlocks.push(...thinkingBlocks)
      }
    }
  }

  return executeNotionExport(title, notionBlocks)
}

export const exportTopicToNotion = async (topic: Topic): Promise<boolean> => {
  const provider = await getDataBackupProvider('notion')

  if (!provider) {
    Alert.alert(t('message.error.notion.no_api_key'))
    return false
  }

  const topicMessages = await getMessagesByTopicId(topic.id)

  // 创建话题标题块
  const titleBlocks = await convertMarkdownToNotionBlocks(`# ${topic.name}`)

  // 为每个消息创建blocks
  const allBlocks: any[] = [...titleBlocks]

  for (const message of topicMessages) {
    // 将单个消息转换为markdown
    const messageMarkdown = await messageToMarkdown(message, excludeCitationsInExport)
    const messageBlocks = await convertMarkdownToNotionBlocks(messageMarkdown)

    if (provider.notionExportReasoning) {
      const thinkingContent = await getThinkingContent(message)

      if (thinkingContent) {
        const thinkingBlocks = await convertThinkingToNotionBlocks(thinkingContent)

        if (messageBlocks.length > 0) {
          messageBlocks.splice(1, 0, ...thinkingBlocks)
        } else {
          messageBlocks.push(...thinkingBlocks)
        }
      }
    }

    allBlocks.push(...messageBlocks)
  }

  return executeNotionExport(topic.name, allBlocks)
}
