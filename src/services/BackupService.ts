import { Dispatch } from '@reduxjs/toolkit'
import { Directory, File, Paths } from 'expo-file-system'
import { unzip } from 'react-native-zip-archive'

import { DEFAULT_DOCUMENTS_STORAGE } from '@/constants/storage'
import { loggerService } from '@/services/LoggerService'
import { setAvatar, setUserName } from '@/store/settings'
import { Assistant } from '@/types/assistant'
import { ExportIndexedData, ExportReduxData, ImportIndexedData, ImportReduxData } from '@/types/databackup'
import { FileMetadata } from '@/types/file'
import { Message } from '@/types/message'

import { upsertAssistants } from '../../db/queries/assistants.queries'
import { upsertBlocks } from '../../db/queries/messageBlocks.queries'
import { upsertMessages } from '../../db/queries/messages.queries'
import { upsertProviders } from '../../db/queries/providers.queries'
import { upsertWebSearchProviders } from '../../db/queries/websearchProviders.queries'
import { upsertTopics } from './TopicService'
const logger = loggerService.withContext('Backup Service')

export type RestoreStepId = 'restore_settings' | 'restore_messages'

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error'

export type ProgressUpdate = {
  step: RestoreStepId
  status: StepStatus
  error?: string
}

type OnProgressCallback = (update: ProgressUpdate) => void

async function restoreIndexedDbData(data: ExportIndexedData, onProgress: OnProgressCallback, dispatch: Dispatch) {
  onProgress({ step: 'restore_messages', status: 'in_progress' })
  await upsertTopics(data.topics)
  await upsertBlocks(data.message_blocks)
  await upsertMessages(data.messages)

  if (data.settings) {
    const avatarSetting = data.settings.find(setting => setting.id === 'image://avatar')

    if (avatarSetting) {
      dispatch(setAvatar(avatarSetting.value))
    }
  }

  onProgress({ step: 'restore_messages', status: 'completed' })
}

async function restoreReduxData(data: ExportReduxData, onProgress: OnProgressCallback, dispatch: Dispatch) {
  onProgress({ step: 'restore_settings', status: 'in_progress' })
  await upsertProviders(data.llm.providers)
  const allSourceAssistants = [data.assistants.defaultAssistant, ...data.assistants.assistants]

  // default assistant为built_in, 其余为external
  const assistants = allSourceAssistants.map(
    (assistant, index) =>
      ({
        ...assistant,
        type: index === 0 ? 'system' : 'external'
      }) as Assistant
  )
  await upsertAssistants(assistants)
  await upsertWebSearchProviders(data.websearch.providers)
  await new Promise(resolve => setTimeout(resolve, 200)) // Delay between steps

  dispatch(setUserName(data.settings.userName))
  onProgress({ step: 'restore_settings', status: 'completed' })
}

export async function restore(
  backupFile: Omit<FileMetadata, 'md5'>,
  onProgress: OnProgressCallback,
  dispatch: Dispatch
) {
  if (!DEFAULT_DOCUMENTS_STORAGE.exists) {
    DEFAULT_DOCUMENTS_STORAGE.create({ intermediates: true, overwrite: true })
  }

  let unzipPath: string | undefined

  try {
    const dataDir = Paths.join(DEFAULT_DOCUMENTS_STORAGE, backupFile.name.replace('.zip', ''))
    unzipPath = await unzip(backupFile.path, dataDir)

    const dataFile = new File(unzipPath, 'data.json')

    const { reduxData, indexedData } = transformBackupData(dataFile.textSync())

    await restoreReduxData(reduxData, onProgress, dispatch)
    await restoreIndexedDbData(indexedData, onProgress, dispatch)
  } catch (error) {
    logger.error('restore error: ', error)
    throw error
  } finally {
    if (unzipPath) {
      try {
        new Directory(unzipPath).delete()
      } catch (cleanupError) {
        logger.error('Failed to cleanup temporary directory: ', cleanupError)
      }
    }
  }
}

function transformBackupData(data: string): { reduxData: ExportReduxData; indexedData: ExportIndexedData } {
  const orginalData = JSON.parse(data)
  const localStorage = orginalData.localStorage

  const persistDataString = localStorage['persist:cherry-studio']

  const rawReduxData = JSON.parse(persistDataString)

  const reduxData: ImportReduxData = {
    assistants: JSON.parse(rawReduxData.assistants),
    llm: JSON.parse(rawReduxData.llm),
    websearch: JSON.parse(rawReduxData.websearch),
    settings: JSON.parse(rawReduxData.settings)
  }

  const topicsFromRedux = reduxData.assistants.assistants.flatMap(a => a.topics)

  const indexedDb: ImportIndexedData = orginalData.indexedDB

  const allMessages = indexedDb.topics.flatMap(t => t.messages)

  const messagesByTopicId = allMessages.reduce<Record<string, Message[]>>((acc, message) => {
    const { topicId } = message

    if (!acc[topicId]) {
      acc[topicId] = []
    }

    acc[topicId].push(message)
    return acc
  }, {})

  // 4. 遍历 redux 中的 topics，并将分组后的 messages 附加到每个 topic 上
  const topicsWithMessages = topicsFromRedux.map(topic => {
    const correspondingMessages = messagesByTopicId[topic.id] || []

    return {
      ...topic,
      messages: correspondingMessages
    }
  })

  return {
    reduxData: reduxData,
    indexedData: {
      topics: topicsWithMessages,
      message_blocks: indexedDb.message_blocks,
      messages: allMessages,
      settings: indexedDb.settings
    }
  }
}
