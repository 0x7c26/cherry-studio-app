import { SYSTEM_MODELS } from '@/config/models/default'
import {
  DEFAULT_CONTEXTCOUNT,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  MAX_CONTEXT_COUNT,
  UNLIMITED_CONTEXT_COUNT
} from '@/constants'
import i18n from '@/i18n'
import { loggerService } from '@/services/LoggerService'
import { Assistant, AssistantSettings, Topic } from '@/types/assistant'
import { uuid } from '@/utils'

import {
  deleteAssistantById as _deleteAssistantById,
  getAssistantById as _getAssistantById,
  getExternalAssistants as _getExternalAssistants,
  upsertAssistants
} from '../../db/queries/assistants.queries'
const logger = loggerService.withContext('Assistant Service')

export async function getDefaultAssistant(): Promise<Assistant> {
  return await getAssistantById('default')
}

export async function getAssistantById(assistantId: string): Promise<Assistant> {
  const assistant = await _getAssistantById(assistantId)

  if (!assistant) {
    logger.error(`Assistant with ID ${assistantId} not found`)
    throw new Error(`Assistant with ID ${assistantId} not found`)
  }

  return assistant
}

export function getDefaultTopic(assistantId: string): Topic {
  return {
    id: uuid(),
    assistantId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    name: i18n.t('chat.default.topic.name'),
    isNameManuallyEdited: false
  }
}

export function getDefaultModel() {
  // todo
  return SYSTEM_MODELS.cherryin[0]
}

export const getAssistantSettings = (assistant: Assistant): AssistantSettings => {
  const contextCount = assistant?.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT

  const getAssistantMaxTokens = () => {
    if (assistant.settings?.enableMaxTokens) {
      const maxTokens = assistant.settings.maxTokens

      if (typeof maxTokens === 'number') {
        return maxTokens > 0 ? maxTokens : DEFAULT_MAX_TOKENS
      }

      return DEFAULT_MAX_TOKENS
    }

    return undefined
  }

  return {
    contextCount: contextCount === MAX_CONTEXT_COUNT ? UNLIMITED_CONTEXT_COUNT : contextCount,
    temperature: assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE,
    enableTemperature: assistant?.settings?.enableTemperature ?? true,
    topP: assistant?.settings?.topP ?? 1,
    enableTopP: assistant?.settings?.enableTopP ?? true,
    enableMaxTokens: assistant?.settings?.enableMaxTokens ?? false,
    maxTokens: getAssistantMaxTokens(),
    streamOutput: assistant?.settings?.streamOutput ?? true,
    toolUseMode: assistant?.settings?.toolUseMode ?? 'prompt',
    defaultModel: assistant?.defaultModel ?? undefined,
    reasoning_effort: assistant?.settings?.reasoning_effort ?? undefined,
    customParameters: assistant?.settings?.customParameters ?? []
  }
}

export async function saveAssistant(assistant: Assistant): Promise<void> {
  try {
    await upsertAssistants([assistant])
  } catch (error) {
    logger.error('Error saving assistant:', error)
    throw new Error('Failed to save assistant')
  }
}

export async function createAssistant() {
  const newAssistant: Assistant = {
    id: uuid(),
    emoji: '⭐',
    name: i18n.t('settings.assistant.title'),
    prompt: '',
    topics: [],
    type: 'external'
  }

  await saveAssistant(newAssistant)
  return newAssistant
}

export function createBlankAssistant() {
  const blankAssistant: Assistant = {
    id: 'blank',
    name: 'Blank Assistant',
    prompt: '',
    topics: [],
    type: 'external'
  }
  return blankAssistant
}

export async function getExternalAssistants(): Promise<Assistant[]> {
  try {
    return await _getExternalAssistants()
  } catch (error) {
    logger.error('Failed to get starred assistants:', error)
    return []
  }
}

export async function deleteAssistantById(assistantId: string) {
  try {
    await _deleteAssistantById(assistantId)
  } catch (error) {
    logger.error('Failed to delete Assistant', error)
  }
}

export async function getRecentAssistants(): Promise<Assistant[]> {
  try {
    const starredAssistants = await getExternalAssistants()
    return starredAssistants.filter(assistant => assistant.topics.length > 0)
  } catch (error) {
    logger.error('Failed to get starred assistants:', error)
    return []
  }
}
