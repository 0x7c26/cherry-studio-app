import * as Clipboard from 'expo-clipboard'
import * as Speech from 'expo-speech'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { loggerService } from '@/services/LoggerService'
import { deleteMessageById, fetchTranslateThunk, regenerateAssistantMessage } from '@/services/MessagesService'
import { useAppDispatch } from '@/store'
import { Assistant } from '@/types/assistant'
import { Message } from '@/types/message'
import { filterMessages } from '@/utils/messageUtils/filters'
import { getMainTextContent } from '@/utils/messageUtils/find'
import { findTranslationBlocks } from '@/utils/messageUtils/find'

import { removeManyBlocks } from '../../db/queries/messageBlocks.queries'
import { upsertMessages } from '../../db/queries/messages.queries'

const logger = loggerService.withContext('useMessageActions')

type PlayState = 'idle' | 'playing'

interface UseMessageActionsProps {
  message: Message
  assistant?: Assistant
}

export const useMessageActions = ({ message, assistant }: UseMessageActionsProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [playState, setPlayState] = useState<PlayState>('idle')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isTranslated, setIsTranslated] = useState(false)

  useEffect(() => {
    const checkTranslation = async () => {
      if (!message) return

      try {
        const translationBlocks = await findTranslationBlocks(message)
        setIsTranslated(translationBlocks.length > 0)
      } catch (error) {
        logger.error('Error checking translation:', error)
        setIsTranslated(false)
      }
    }

    checkTranslation()
  }, [message])

  const handleCopy = async () => {
    try {
      const filteredMessages = await filterMessages([message])
      logger.info('Filtered Messages:', filteredMessages)
      const mainContent = await getMainTextContent(filteredMessages[0])
      await Clipboard.setStringAsync(mainContent)
    } catch (error) {
      logger.error('Error copying message:', error)
    }
  }

  const handleDelete = async () => {
    return new Promise<void>((resolve, reject) => {
      Alert.alert(t('message.delete_message'), t('message.delete_message_confirmation'), [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => reject(new Error('User cancelled'))
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMessageById(message.id)

              if (message.askId) {
                await deleteMessageById(message.askId)
              }

              logger.info('Message deleted successfully:', message.id)
              resolve()
            } catch (error) {
              logger.error('Error deleting message:', error)
              Alert.alert(t('common.error'), t('common.error_occurred'))
              reject(error)
            }
          }
        }
      ])
    })
  }

  const handleRegenerate = async () => {
    if (!assistant) {
      logger.warn('Cannot regenerate without assistant')
      return
    }

    try {
      await regenerateAssistantMessage(message, assistant, dispatch)
    } catch (error) {
      logger.error('Error regenerating message:', error)
    }
  }

  const handlePlay = async () => {
    try {
      if (playState === 'idle') {
        const filteredMessages = await filterMessages([message])
        const mainContent = await getMainTextContent(filteredMessages[0])
        Speech.speak(mainContent, { onDone: () => setPlayState('idle') })
        setPlayState('playing')
      } else if (playState === 'playing') {
        Speech.stop()
        setPlayState('idle')
      }
    } catch (error) {
      logger.error('Error controlling audio:', error)
      setPlayState('idle')
    }
  }

  const handleTranslate = async () => {
    if (!message) return

    try {
      if (isTranslating) return
      setIsTranslating(true)
      const messageId = message.id
      await fetchTranslateThunk(messageId, message)
      setIsTranslated(true)
    } catch (error) {
      logger.error('Error during translation:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes('Translate assistant model is not defined')) {
        Alert.alert(t('common.error_occurred'), t('error.translate_assistant_model_not_defined'))
      } else {
        Alert.alert(t('common.error_occurred'), errorMessage)
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDeleteTranslation = async () => {
    if (!message) return

    try {
      const translationBlocks = await findTranslationBlocks(message)
      await removeManyBlocks(translationBlocks.map(block => block.id))

      const updatedMessage = {
        ...message,
        blocks: message.blocks.filter(blockId => !translationBlocks.some(block => block.id === blockId))
      }
      await upsertMessages(updatedMessage)
      setIsTranslated(false)
    } catch (error) {
      logger.error('Error deleting translation:', error)
      throw error
    }
  }

  const getMessageContent = async () => {
    try {
      const filteredMessages = await filterMessages([message])
      return await getMainTextContent(filteredMessages[0])
    } catch (error) {
      logger.error('Error getting message content:', error)
      return ''
    }
  }

  return {
    playState,
    isTranslating,
    isTranslated,
    handleCopy,
    handleDelete,
    handleRegenerate,
    handlePlay,
    handleTranslate,
    handleDeleteTranslation,
    getMessageContent
  }
}
