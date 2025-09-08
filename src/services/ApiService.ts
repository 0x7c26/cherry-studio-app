import { t } from 'i18next'
import { isEmpty, takeRight } from 'lodash'

import LegacyAiProvider from '@/aiCore'
import AiProvider from '@/aiCore'
import ModernAiProvider from '@/aiCore/index_new'
import { CompletionsParams } from '@/aiCore/legacy/middleware/schemas'
import { AiSdkMiddlewareConfig } from '@/aiCore/middleware/AiSdkMiddlewareBuilder'
import { buildStreamTextParams, convertMessagesToSdkMessages } from '@/aiCore/prepareParams'
import { isDedicatedImageGenerationModel, isEmbeddingModel } from '@/config/models'
import i18n from '@/i18n'
import { loggerService } from '@/services/LoggerService'
import { FetchChatCompletionParams, Model, Provider } from '@/types/assistant'
import { ChunkType } from '@/types/chunk'
import { SdkModel } from '@/types/sdk'
import { MCPTool } from '@/types/tool'
import { isPromptToolUse, isSupportedToolUse } from '@/utils/mcpTool'
import { filterMainTextMessages } from '@/utils/messageUtils/filters'

import AiProviderNew from '../aiCore/index_new'
import { createBlankAssistant, getAssistantById, getDefaultModel } from './AssistantService'
import { getAssistantProvider } from './ProviderService'
import { createStreamProcessor, StreamProcessorCallbacks } from './StreamProcessingService'
import { getTopicById, upsertTopics } from './TopicService'

const logger = loggerService.withContext('fetchChatCompletion')

export async function fetchChatCompletion({
  messages,
  prompt,
  assistant,
  options,
  onChunkReceived,
  topicId,
  uiMessages
}: FetchChatCompletionParams) {
  const AI = new AiProviderNew(assistant.model || getDefaultModel())
  const provider = AI.getActualProvider()

  const mcpTools: MCPTool[] = []

  console.log('fetchChatCompletion', assistant)

  if (prompt) {
    messages = [
      {
        role: 'user',
        content: prompt
      }
    ]
  }

  // 使用 transformParameters 模块构建参数
  const {
    params: aiSdkParams,
    modelId,
    capabilities
  } = await buildStreamTextParams(messages, assistant, provider, {
    mcpTools: mcpTools,
    webSearchProviderId: assistant.webSearchProviderId,
    requestOptions: options
  })

  logger.info('fetchChatCompletion', capabilities)

  const middlewareConfig: AiSdkMiddlewareConfig = {
    streamOutput: assistant.settings?.streamOutput ?? true,
    onChunk: onChunkReceived,
    model: assistant.model,
    enableReasoning: capabilities.enableReasoning,
    isPromptToolUse: isPromptToolUse(assistant),
    isSupportedToolUse: isSupportedToolUse(assistant),
    isImageGenerationEndpoint: isDedicatedImageGenerationModel(assistant.model || getDefaultModel()),
    enableWebSearch: capabilities.enableWebSearch,
    enableGenerateImage: capabilities.enableGenerateImage,
    mcpTools,
    uiMessages
  }

  // --- Call AI Completions ---
  onChunkReceived({ type: ChunkType.LLM_RESPONSE_CREATED })
  await AI.completions(modelId, aiSdkParams, {
    ...middlewareConfig,
    assistant,
    topicId,
    callType: 'chat',
    uiMessages
  })
}

export async function fetchModels(provider: Provider): Promise<SdkModel[]> {
  const AI = new AiProvider(provider)

  try {
    return await AI.models()
  } catch (error) {
    logger.error('fetchChatCompletion', error as Error)
    return []
  }
}

export function checkApiProvider(provider: Provider): void {
  if (
    provider.id !== 'ollama' &&
    provider.id !== 'lmstudio' &&
    provider.type !== 'vertexai' &&
    provider.id !== 'copilot'
  ) {
    if (!provider.apiKey) {
      throw new Error(i18n.t('message.error.enter.api.key'))
    }
  }

  if (!provider.apiHost && provider.type !== 'vertexai') {
    throw new Error(i18n.t('message.error.enter.api.host'))
  }

  if (isEmpty(provider.models)) {
    throw new Error(i18n.t('message.error.enter.model'))
  }
}

export async function checkApi(provider: Provider, model: Model): Promise<void> {
  checkApiProvider(provider)

  const ai = new LegacyAiProvider(provider)

  const assistant = createBlankAssistant()
  assistant.model = model

  try {
    if (isEmbeddingModel(model)) {
      await ai.getEmbeddingDimensions(model)
    } else {
      const params: CompletionsParams = {
        callType: 'check',
        messages: 'hi',
        assistant,
        streamOutput: true,
        shouldThrow: true
      }

      // Try streaming check first
      const result = await ai.completions(params)

      if (!result.getText()) {
        throw new Error('No response received')
      }
    }
  } catch (error: any) {
    if (error.message.includes('stream')) {
      const params: CompletionsParams = {
        callType: 'check',
        messages: 'hi',
        assistant,
        streamOutput: false,
        shouldThrow: true
      }
      const result = await ai.completions(params)

      if (!result.getText()) {
        throw new Error('No response received')
      }
    } else {
      throw error
    }
  }
}

export async function fetchTopicNaming(topicId: string) {
  logger.info('Fetching topic naming...')
  const topic = await getTopicById(topicId)

  if (!topic) {
    logger.error(`[fetchTopicNaming] Topic with ID ${topicId} not found.`)
    return
  }

  if (topic.name !== t('topics.new_topic')) {
    return
  }

  let callbacks: StreamProcessorCallbacks = {}

  callbacks = {
    onTextComplete: async finalText => {
      await upsertTopics([
        {
          ...topic,
          name: finalText
        }
      ])
    }
  }
  const streamProcessorCallbacks = createStreamProcessor(callbacks)
  const quickAssistant = await getAssistantById('quick')

  if (!quickAssistant.model) {
    return
  }

  const provider = await getAssistantProvider(quickAssistant)

  // 总结上下文总是取最后5条消息
  const contextMessages = takeRight(topic.messages, 5)

  // LLM对多条消息的总结有问题，用单条结构化的消息表示会话内容会更好
  const mainTextMessages = await filterMainTextMessages(contextMessages)

  const llmMessages = await convertMessagesToSdkMessages(mainTextMessages, quickAssistant.model)

  const AI = new ModernAiProvider(quickAssistant.model || getDefaultModel(), provider)
  const { params: aiSdkParams, modelId } = await buildStreamTextParams(llmMessages, quickAssistant, provider)

  const middlewareConfig: AiSdkMiddlewareConfig = {
    streamOutput: false,
    onChunk: streamProcessorCallbacks,
    model: quickAssistant.model,
    provider: provider,
    enableReasoning: false,
    isPromptToolUse: false,
    isSupportedToolUse: false,
    isImageGenerationEndpoint: false,
    enableWebSearch: false,
    enableGenerateImage: false,
    mcpTools: []
  }

  try {
    return (
      (
        await AI.completions(modelId, aiSdkParams, {
          ...middlewareConfig,
          assistant: quickAssistant,
          topicId,
          callType: 'summary'
        })
      ).getText() || ''
    )
  } catch (error: any) {
    logger.error('Error during translation:', error)
    return ''
  }
}
