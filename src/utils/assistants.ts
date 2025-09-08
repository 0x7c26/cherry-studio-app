import { loggerService } from '@/services/LoggerService'
import { Assistant } from '@/types/assistant'
const logger = loggerService.withContext('assistants')

export function groupByCategories(data: Assistant[]) {
  const groupedMap = new Map<string, Assistant[]>()
  data.forEach(item => {
    item.group?.forEach(category => {
      if (!groupedMap.has(category)) {
        groupedMap.set(category, [])
      }

      groupedMap.get(category)?.push(item)
    })
  })
  const result: Record<string, Assistant[]> = {}
  Array.from(groupedMap.entries()).forEach(([category, items]) => {
    result[category] = items
  })
  return result
}

/**
 * 将 topics 数组中的主题信息拼接到对应的 assistants 数组对象中。
 * 采用先构建查找表再合并的方式，效率较高。
 *
 * @param {Array<Object>} assistants - 助手数组，每个对象应包含一个唯一的 'id' 属性。
 * @param {Array<Object>} topics - 主题数组，每个对象应包含 'assistantId' 来关联助手，以及其他主题信息。
 * @returns {Array<Object>} 一个新的数组，其中每个 assistant 对象都包含了它关联的 topics 数组。
 */
export function getAssistantWithTopic(assistants, topics) {
  // 1. 输入验证：确保传入的是数组
  if (!Array.isArray(assistants) || !Array.isArray(topics)) {
    logger.error('getAssistantWithTopic 错误：assistants 和 topics 都必须是数组类型。')
    // 根据需求，可以选择抛出错误或者返回一个空数组
    return []
    // throw new Error("Both assistants and topics must be arrays.");
  }

  // 2. 构建 topics 的查找表 (Lookup Table)
  //    键 (key) 是 assistantId，值 (value) 是一个包含所有对应 topic 对象的数组。
  const topicsLookup = topics.reduce((acc, topic) => {
    // 确保 topic 对象和 assistantId 存在且有效
    if (topic && typeof topic === 'object' && topic.assistantId !== undefined && topic.assistantId !== null) {
      // 使用解构赋值：将 assistantId 提取出来，其余属性（如 id, topicName 等）放入 topicDetails
      const { assistantId, ...topicDetails } = topic

      // 如果 accumulator 中还没有这个 assistantId 的条目，则初始化一个空数组
      if (!acc[assistantId]) {
        acc[assistantId] = []
      }

      // 将当前 topic 的详细信息（不包含 assistantId）添加到对应的数组中
      acc[assistantId].push(topicDetails)
    }

    // 返回累加器，用于下一次迭代
    return acc
  }, {}) // 初始值是一个空对象 {}，用于构建查找表

  // 3. 遍历 assistants 数组，将查找表中的 topics 合并到每个 assistant 对象中
  const assistantsWithTopics = assistants.map(assistant => {
    // 确保 assistant 对象及其 id 属性是有效的
    if (assistant && typeof assistant === 'object' && assistant.id !== undefined && assistant.id !== null) {
      return {
        ...assistant, // 使用展开运算符复制当前 assistant 的所有属性
        // 从 topicsLookup 中获取当前 assistant.id 对应的 topics 数组。
        // 如果找不到，则默认为一个空数组 []，以确保结果结构一致。
        topics: topicsLookup[assistant.id] || []
      }
    }

    // 如果 assistant 对象无效（例如，没有 id），则原样返回，或者根据需求进行其他处理
    return assistant
  })

  // 4. 返回处理后的 assistants 数组
  return assistantsWithTopics
}

export const isToolUseModeFunction = (assistant: Assistant) => {
  return assistant.settings?.toolUseMode === 'function'
}
