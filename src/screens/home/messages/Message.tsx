import React, { FC, memo } from 'react'

import { Assistant } from '@/types/assistant'
import { Message } from '@/types/message'

import MessageContent from './MessageContent'

interface MessageItemProps {
  message: Message
  assistant?: Assistant
  isMultiModel?: boolean
}

const MessageItem: FC<MessageItemProps> = ({ message, assistant, isMultiModel = false }) => {
  return <MessageContent message={message} assistant={assistant} isMultiModel={isMultiModel} />
}

export default memo(MessageItem)
