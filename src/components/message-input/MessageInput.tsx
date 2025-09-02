import { LinearGradient } from '@tamagui/linear-gradient'
import { ImpactFeedbackStyle } from 'expo-haptics'
import { isEmpty } from 'lodash'
import { AnimatePresence, MotiView } from 'moti'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { styled, TextArea, XStack, YStack } from 'tamagui'

import { isReasoningModel } from '@/config/models/reasoning'
import { useAssistant } from '@/hooks/useAssistant'
import { useMessageOperations, useTopicLoading } from '@/hooks/useMessageOperation'
import { useTheme } from '@/hooks/useTheme'
import { loggerService } from '@/services/LoggerService'
import { sendMessage as _sendMessage } from '@/services/MessagesService'
import { getUserMessage } from '@/services/MessagesService'
import { useAppDispatch } from '@/store'
import { Model, Topic } from '@/types/assistant'
import { FileType } from '@/types/file'
import { MessageInputBaseParams } from '@/types/message'
import { haptic } from '@/utils/haptic'

import FilePreview from './FilePreview'
import { MentionButton } from './MentionButton'
import { PauseButton } from './PauseButton'
import { SendButton } from './SendButton'
import { ThinkButton } from './ThinkButton'
import { ToolButton } from './ToolButton'
import ToolPreview from './ToolPreview'
const logger = loggerService.withContext('Message Input')

interface MessageInputProps {
  topic: Topic
}

export const MessageInput: React.FC<MessageInputProps> = ({ topic }) => {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const dispatch = useAppDispatch()
  const { assistant, isLoading, updateAssistant } = useAssistant(topic.assistantId)

  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileType[]>([])
  const [mentions, setMentions] = useState<Model[]>([])
  const isTopicLoading = useTopicLoading(topic)
  const { pauseMessages } = useMessageOperations(topic)

  const isReasoning = isReasoningModel(assistant?.model)

  useEffect(() => {
    if (!assistant || !assistant?.model) return
    setMentions([assistant?.model])
  }, [assistant])

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
    <LinearGradient
      marginHorizontal={14}
      padding={1}
      borderRadius={20}
      colors={
        text
          ? isDark
            ? ['#acf3a633', '#acf3a6ff', '#acf3a633']
            : ['#8de59e4d', '#81df94ff', '#8de59e4d']
          : isDark
            ? ['#acf3a633', '#acf3a633']
            : ['#8de59e4d', '#8de59e4d']
      }
      start={[0, 0]}
      end={[1, 1]}>
      <InputContent>
        <YStack gap={10}>
          {files.length > 0 && <FilePreview files={files} setFiles={setFiles} />}
          {/* message */}
          <XStack>
            <TextArea
              placeholder={t('inputs.placeholder')}
              borderWidth={0}
              backgroundColor="$colorTransparent"
              p={0}
              flex={1}
              value={text}
              onChangeText={setText}
              lineHeight={22}
              color="$textSecondaryLight"
            />
          </XStack>
          {/* button */}
          <XStack justifyContent="space-between" alignItems="center" minHeight={30}>
            <XStack gap={10} alignItems="center">
              <ToolButton files={files} setFiles={setFiles} assistant={assistant} updateAssistant={updateAssistant} />
              {isReasoning && <ThinkButton assistant={assistant} updateAssistant={updateAssistant} />}
              <MentionButton mentions={mentions} setMentions={setMentions} />
              <ToolPreview assistant={assistant} updateAssistant={updateAssistant} />
            </XStack>
            <XStack gap={10} alignItems="center">
              <AnimatePresence exitBeforeEnter>
                {text && !isTopicLoading && (
                  <MotiView
                    key="send-button"
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'timing', duration: 200 }}>
                    <SendButton onSend={sendMessage} />
                  </MotiView>
                )}
                {isTopicLoading && (
                  <MotiView
                    key="pause-button"
                    from={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'timing', duration: 200 }}>
                    <PauseButton onPause={onPause} />
                  </MotiView>
                )}
                {/*{text ? (
                    <MotiView
                      key="send-button"
                      from={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'timing', duration: 100 }}>
                      <SendButton onSend={sendMessage} />
                    </MotiView>
                  ) : (
                    <MotiView
                      key="voice-button"
                      from={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: 'timing', duration: 100 }}>
                      <VoiceButton />
                    </MotiView>
                  )}*/}
              </AnimatePresence>
            </XStack>
          </XStack>
        </YStack>
      </InputContent>
    </LinearGradient>
  )
}

const InputContent = styled(YStack, {
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 20,
  backgroundColor: '$backgroundPrimary'
})
