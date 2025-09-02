import { FC, memo } from 'react'
import React from 'react'
import { View, YStack } from 'tamagui'

import { Assistant } from '@/types/assistant'
import { Message } from '@/types/message'

import MessageContent from './MessageContent'

interface MessageItemProps {
  message: Message
  assistant?: Assistant
}

const MessageItem: FC<MessageItemProps> = ({ message, assistant }) => {
  return (
    <View flex={1}>
      <YStack flex={1}>
        <MessageContent message={message} assistant={assistant} />
      </YStack>
    </View>
  )
}

export default memo(MessageItem)
