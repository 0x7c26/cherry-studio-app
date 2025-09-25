import React from 'react'
import { View } from 'react-native'
import { YStack } from '@/componentsV2'

import { useMessageBlocks } from '@/hooks/useMessageBlocks'
import { Assistant } from '@/types/assistant'
import { Message, MessageBlockType } from '@/types/message'

import MessageBlockRenderer from './blocks'
import MessageContextMenu from './MessageContextMenu'

interface Props {
  message: Message
  assistant?: Assistant
  isMultiModel?: boolean
}

const MessageContent: React.FC<Props> = ({ message, assistant, isMultiModel = false }) => {
  const isUser = message.role === 'user'
  const { processedBlocks } = useMessageBlocks(message.id)

  const mediaBlocks = processedBlocks.filter(
    block => block.type === MessageBlockType.IMAGE || block.type === MessageBlockType.FILE
  )
  const contentBlocks = processedBlocks.filter(
    block => block.type !== MessageBlockType.IMAGE && block.type !== MessageBlockType.FILE
  )

  if (isUser)
    return (
      <View className="w-full max-w-full items-end px-[14px] rounded-2xl">
        {mediaBlocks.length > 0 && <MessageBlockRenderer blocks={mediaBlocks} message={message} />}
        {mediaBlocks.length > 0 && <View className="h-2" />}
        <MessageContextMenu message={message} assistant={assistant}>
          {contentBlocks.length > 0 && (
            <YStack className="bg-green-10 border border-green-20 dark:bg-green-dark-10 dark:border-green-dark-20 px-5 rounded-l-xl rounded-tr-xl rounded-br-sm ">
              <MessageBlockRenderer blocks={contentBlocks} message={message} />
            </YStack>
          )}
        </MessageContextMenu>
      </View>
    )

  return (
    <MessageContextMenu message={message} assistant={assistant} isMultiModel={isMultiModel}>
      <View className="w-full max-w-full px-[14px] rounded-2xl">
        {mediaBlocks.length > 0 && <MessageBlockRenderer blocks={mediaBlocks} message={message} />}
        {contentBlocks.length > 0 && (
          <YStack
            className={`rounded-2xl  px-0 w-full max-w-full bg-transparent ${mediaBlocks.length > 0 ? 'mt-2' : ''}`}>
            <MessageBlockRenderer blocks={contentBlocks} message={message} />
          </YStack>
        )}
      </View>
    </MessageContextMenu>
  )
}

export default React.memo(MessageContent)
