import { ImpactFeedbackStyle } from 'expo-haptics'
import { isEmpty } from 'lodash'
import { AnimatePresence, MotiView } from 'moti'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, Platform } from 'react-native'
import { DropShadowView } from 'heroui-native'

import { isReasoningModel } from '@/config/models'
import { useAssistant } from '@/hooks/useAssistant'
import { useBottom } from '@/hooks/useBottom'
import { useMessageOperations, useTopicLoading } from '@/hooks/useMessageOperation'
import { loggerService } from '@/services/LoggerService'
import { sendMessage as _sendMessage, getUserMessage } from '@/services/MessagesService'
import { useAppDispatch } from '@/store'
import { Model, Topic } from '@/types/assistant'
import { FileMetadata } from '@/types/file'
import { MessageInputBaseParams } from '@/types/message'
import { haptic } from '@/utils/haptic'
import { FilePreview } from './FilePreview'
import { ToolButton } from './ToolButton'
import { ThinkButton } from './ThinkButton'
import { MentionButton } from './MentionButton'
import { ToolPreview } from './ToolPreview'
import { PauseButton } from './PauseButton'
import { SendButton } from './SendButton'
import YStack from '@/componentsV2/layout/YStack'
import XStack from '@/componentsV2/layout/XStack'
import TextField from '@/componentsV2/base/TextField'

const logger = loggerService.withContext('Message Input')

interface MessageInputProps {
  topic: Topic
}

export const MessageInput: React.FC<MessageInputProps> = ({ topic }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { assistant, isLoading, updateAssistant } = useAssistant(topic.assistantId)
  const bottomPad = useBottom()
  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [mentions, setMentions] = useState<Model[]>([])
  const isTopicLoading = useTopicLoading(topic)
  const { pauseMessages } = useMessageOperations(topic)

  const isReasoning = isReasoningModel(assistant?.model)

  // topic切换时渲染
  useEffect(() => {
    setMentions(assistant?.defaultModel ? [assistant?.defaultModel] : [])
  }, [topic.id])

  const sendMessage = async () => {
    if (isEmpty(text.trim()) || !assistant) {
      haptic(ImpactFeedbackStyle.Rigid)
      return
    }

    haptic(ImpactFeedbackStyle.Medium)

    setText('')
    setFiles([])
    Keyboard.dismiss()

    try {
      const baseUserMessage: MessageInputBaseParams = { assistant, topic, content: text }

      if (files.length > 0) {
        baseUserMessage.files = files
      }

      const { message, blocks } = getUserMessage(baseUserMessage)

      if (mentions.length > 0) {
        message.mentions = mentions
      }

      await _sendMessage(message, blocks, assistant, topic.id, dispatch)
    } catch (error) {
      logger.error('Error sending message:', error)
    }
  }

  const onPause = async () => {
    haptic(ImpactFeedbackStyle.Medium)

    try {
      await pauseMessages()
    } catch (error) {
      logger.error('Error pause message:', error)
    }
  }

  if (isLoading || !assistant) {
    return null
  }

  return (
    <DropShadowView
      className="px-5 py-2 rounded-2xl bg-surface-1"
      shadowSize="xl"
      iosShadowStyle={{
        shadowOffset: { width: 0, height: -4 }
      }}
      androidShadowStyle={{
        elevation: 10
      }}
      style={{
        paddingBottom: Platform.OS === 'android' ? bottomPad + 8 : bottomPad
      }}>
      <YStack className="gap-[10px]">
        {files.length > 0 && <FilePreview files={files} setFiles={setFiles} />}
        {/* message */}
        <XStack className="top-[5px]">
          <TextField className="w-full p-0">
            <TextField.Input
              className="h-24 p-0 border-none text-base text-text-primary dark:text-text-primary-dark"
              placeholder={t('inputs.placeholder')}
              value={text}
              onChangeText={setText}
              multiline
              numberOfLines={10}
              colors={{
                blurBackground: 'transparent',
                focusBackground: 'transparent',
                blurBorder: 'transparent',
                focusBorder: 'transparent'
              }}
            />
          </TextField>
        </XStack>
        {/* button */}
        <XStack className="justify-between items-center">
          <XStack className="flex-1 gap-[10px] items-center">
            <ToolButton
              mentions={mentions}
              files={files}
              setFiles={setFiles}
              assistant={assistant}
              updateAssistant={updateAssistant}
            />
            {isReasoning && <ThinkButton assistant={assistant} updateAssistant={updateAssistant} />}
            <MentionButton
              mentions={mentions}
              setMentions={setMentions}
              assistant={assistant}
              updateAssistant={updateAssistant}
            />
            <ToolPreview assistant={assistant} updateAssistant={updateAssistant} />
          </XStack>
          <XStack className="gap-5 items-center">
            <AnimatePresence exitBeforeEnter>
              {isTopicLoading ? (
                <MotiView
                  key="pause-button"
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'timing', duration: 200 }}>
                  <PauseButton onPause={onPause} />
                </MotiView>
              ) : (
                <MotiView
                  key="send-button"
                  from={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: 'timing', duration: 200 }}>
                  <SendButton onSend={sendMessage} disabled={!text} />
                </MotiView>
              )}
            </AnimatePresence>
          </XStack>
        </XStack>
      </YStack>
    </DropShadowView>
  )
}
