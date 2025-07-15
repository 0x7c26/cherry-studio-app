import { isEmpty } from 'lodash'
import { AnimatePresence, MotiView } from 'moti'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from 'react-native'
import { TextArea, View, XStack, YStack } from 'tamagui'

import { isReasoningModel } from '@/config/models/reasoning'
import { useAssistant } from '@/hooks/useAssistant'
import { sendMessage as _sendMessage } from '@/services/MessagesService'
import { getUserMessage } from '@/services/MessagesService'
import { Assistant, Model, Topic } from '@/types/assistant'
import { FileType } from '@/types/file'
import { MessageInputBaseParams } from '@/types/message'
import { useIsDark } from '@/utils'

import { AddAssetsButton } from './AddAssetsButton'
import FilePreview from './FilePreview'
import { MentionButton } from './MentionButton'
import { SendButton } from './SendButton'
import { ThinkButton } from './ThinkButton'
import { VoiceButton } from './VoiceButton'
import { WebsearchButton } from './WebsearchButton'
interface MessageInputProps {
  topic: Topic
  updateAssistant: (assistant: Assistant) => Promise<void>
}

export const MessageInput: React.FC<MessageInputProps> = ({ topic, updateAssistant }) => {
  const { t } = useTranslation()
  const isDark = useIsDark()
  const { assistant, isLoading } = useAssistant(topic.assistantId)

  const [text, setText] = useState('')
  const [files, setFiles] = useState<FileType[]>([])
  const [mentions, setMentions] = useState<Model[]>([])

  const isReasoning = isReasoningModel(assistant?.model)

  const sendMessage = async () => {
    if (isEmpty(text.trim()) || !assistant) {
      return
    }

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

      await _sendMessage(message, blocks, assistant, topic.id)
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  if (isLoading || !assistant) {
    return null
  }

  return (
    <View>
      <YStack gap={10}>
        {files.length > 0 && <FilePreview files={files} setFiles={setFiles} />}
        {/* message */}
        <XStack>
          <TextArea
            placeholder={t('inputs.placeholder')}
            borderWidth={0}
            backgroundColor="$colorTransparent"
            flex={1}
            value={text}
            onChangeText={setText}
            lineHeight={22}
            color={isDark ? '$textSecondaryDark' : '$textSecondaryLight'}
          />
        </XStack>
        {/* button */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap={5} alignItems="center">
            <AddAssetsButton files={files} setFiles={setFiles} />
            <WebsearchButton />
            {isReasoning && (
              <ThinkButton
                reasoningEffort={assistant.settings?.reasoning_effort}
                onReasoningEffortChange={async value =>
                  await updateAssistant({
                    ...assistant,
                    settings: {
                      ...assistant.settings,
                      reasoning_effort: value
                    }
                  })
                }
              />
            )}
          </XStack>
          <XStack gap={5} alignItems="center">
            <MentionButton mentions={mentions} setMentions={setMentions} />
            <AnimatePresence exitBeforeEnter>
              {text ? (
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
              )}
            </AnimatePresence>
          </XStack>
        </XStack>
      </YStack>
    </View>
  )
}
